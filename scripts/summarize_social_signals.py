#!/usr/bin/env python3
"""Create a fixed-format public media summary from one mapped radar DOCX.

The script deliberately extracts only aggregate rows from the SOCIAL MEDIA ECHO
section. Source evidence cards, excerpts, creator names, and URLs are never sent
to the model.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import urllib.error
import urllib.request
import zipfile
from pathlib import Path
from typing import Any, Iterator
from xml.etree import ElementTree as ET


SCHEMA_VERSION = "beauty-radar-media-v1"
DEFAULT_MODEL = "deepseek-v4-pro"
DEFAULT_API_URL = "https://api.deepseek.com/chat/completions"
WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
PARAGRAPH_TAG = f"{{{WORD_NS}}}p"
TEXT_TAG = f"{{{WORD_NS}}}t"
PLATFORM_TAGS = {
    "YOUTUBE": "YouTube",
    "REDDIT": "Reddit",
    "X": "X",
    "BILIBILI": "Bilibili",
    "XIAOHONGSHU": "小红书",
    "ZHIHU": "知乎",
}
PUBLIC_PLATFORMS = set(PLATFORM_TAGS.values())
SIGNAL_LEVELS = {"有限", "中等", "较强"}
TOP_LEVEL_KEYS = {
    "schemaVersion",
    "productId",
    "model",
    "media",
    "needsReview",
    "reviewNotes",
}
MEDIA_KEYS = {
    "platform",
    "signal",
    "topics",
    "doubts",
    "misconceptions",
    "scenarios",
    "summary",
}
FORBIDDEN_PUBLIC_PATTERNS = (
    re.compile(r"https?://", re.I),
    re.compile(r"\bwww\.", re.I),
    re.compile(r"\b(?:by|creator|author)\s*:", re.I),
    re.compile(r"Supporting Sources", re.I),
    re.compile(r"Representative Excerpts", re.I),
)


class ProcessingError(RuntimeError):
    """Raised when source extraction, API output, or validation is unsafe."""


def iter_docx_paragraphs(docx_path: Path) -> Iterator[str]:
    """Stream paragraphs from document.xml without materializing the DOCX text."""
    try:
        with zipfile.ZipFile(docx_path) as archive:
            with archive.open("word/document.xml") as document_xml:
                for _event, element in ET.iterparse(document_xml, events=("end",)):
                    if element.tag != PARAGRAPH_TAG:
                        continue
                    text = "".join(
                        node.text or "" for node in element.iter(TEXT_TAG)
                    ).strip()
                    element.clear()
                    if text:
                        yield text
    except (OSError, KeyError, zipfile.BadZipFile, ET.ParseError) as exc:
        raise ProcessingError(f"Unable to read DOCX: {docx_path}") from exc


def extract_aggregate_evidence(docx_path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    """Return only aggregate summary rows before Source Evidence Cards."""
    in_social_section = False
    current_category = ""
    rows: list[dict[str, Any]] = []
    notes: list[str] = []

    for paragraph in iter_docx_paragraphs(docx_path):
        if not in_social_section:
            if re.search(r"\bSOCIAL MEDIA ECHO\b", paragraph, re.I):
                in_social_section = True
            continue

        if paragraph.strip().lower().startswith("source evidence cards:"):
            break

        if paragraph.endswith(":") and not paragraph.startswith("Summary:"):
            current_category = paragraph[:-1].strip()
            continue

        if not paragraph.startswith("Summary:"):
            continue

        summary_match = re.search(
            r"^Summary:\s*(.*?)\s*Usefulness:\s*(.*?)(?:\s*\|\s*Evidence Count:\s*(\d+))?(?=\s{2,}|Representative Excerpts:|Supporting Sources:|$)",
            paragraph,
            re.S,
        )
        if not summary_match:
            notes.append(f"unparsed_summary_row:{len(rows) + 1}")
            continue

        platform_codes = sorted(
            {
                match.group(1)
                for match in re.finditer(
                    r"\[(YOUTUBE|REDDIT|X|BILIBILI|XIAOHONGSHU|ZHIHU)\]",
                    paragraph,
                )
            }
        )
        if not platform_codes:
            notes.append(f"missing_platform_tag:{len(rows) + 1}")

        rows.append(
            {
                "category": current_category or "UNCLASSIFIED",
                "summary": summary_match.group(1).strip(),
                "usefulness": summary_match.group(2).strip(),
                "evidenceCount": int(summary_match.group(3) or 0),
                "platforms": [PLATFORM_TAGS[code] for code in platform_codes],
            }
        )

    if not in_social_section:
        notes.append("no_social_media_echo_section")
    elif not rows:
        notes.append("no_aggregate_social_rows")

    return rows, notes


def load_product_mapping(mapping_path: Path, product_id: str) -> dict[str, Any]:
    try:
        mapping = json.loads(mapping_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ProcessingError(f"Unable to read mapping: {mapping_path}") from exc

    matches = [item for item in mapping.get("products", []) if item.get("id") == product_id]
    if len(matches) != 1:
        raise ProcessingError(
            f"Expected exactly one mapping for product ID {product_id!r}; found {len(matches)}"
        )
    product = matches[0]
    record = product.get("radarRecord") or {}
    if record.get("status") != "matched" or not record.get("path"):
        raise ProcessingError(f"Product {product_id!r} has no matched radar DOCX")
    return product


def resolve_docx(product: dict[str, Any], source_root: Path) -> Path:
    path = (
        source_root
        / str(product.get("sourceDirectory", ""))
        / str((product.get("radarRecord") or {}).get("path", ""))
    ).resolve()
    root = source_root.resolve()
    if root not in path.parents or not path.is_file() or path.suffix.lower() != ".docx":
        raise ProcessingError(f"Mapped DOCX is unavailable or outside source root: {path}")
    return path


def build_messages(product: dict[str, Any], evidence: list[dict[str, Any]]) -> list[dict[str, str]]:
    system_prompt = """You are the Beauty Radar public social-signal editor.
Return one JSON object only. Use only the supplied aggregate evidence rows.
Never infer a platform, claim, sentiment, creator, post, quotation, URL, or source identity.
Write concise Simplified Chinese public copy. Group rows by explicitly named platform.
If a row has no platform, do not publish it and add a review note.
Use signal labels only from: 有限, 中等, 较强. They describe evidence amount and repetition,
not population-level sentiment. Preserve doubts and evidence boundaries.
Do not expose full INCI lists or convert mechanism discussion into clinical proof.

The exact output shape is:
{
  "schemaVersion": "beauty-radar-media-v1",
  "productId": "the supplied product ID",
  "model": "deepseek-v4-pro",
  "media": [{
    "platform": "YouTube|Reddit|X|Bilibili|小红书|知乎",
    "signal": "有限|中等|较强",
    "topics": ["1-4 concise strings"],
    "doubts": ["0-3 concise strings"],
    "misconceptions": ["0-3 concise strings"],
    "scenarios": ["0-3 concise strings"],
    "summary": "one concise aggregated conclusion"
  }],
  "needsReview": false,
  "reviewNotes": []
}
Do not add keys."""
    packet = {
        "product": {
            "id": product["id"],
            "brand": product.get("brand", ""),
            "name": product.get("productName", ""),
        },
        "aggregateEvidence": evidence,
    }
    return [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": "Summarize this sanitized evidence packet as JSON:\n"
            + json.dumps(packet, ensure_ascii=False, separators=(",", ":")),
        },
    ]


def call_deepseek(
    messages: list[dict[str, str]], model: str, api_url: str, timeout: int
) -> dict[str, Any]:
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        raise ProcessingError("DEEPSEEK_API_KEY is not set")

    payload = {
        "model": model,
        "messages": messages,
        "thinking": {"type": "disabled"},
        "temperature": 0.1,
        "max_tokens": 2500,
        "response_format": {"type": "json_object"},
        "stream": False,
    }
    request = urllib.request.Request(
        api_url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            envelope = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read(600).decode("utf-8", errors="replace")
        raise ProcessingError(f"DeepSeek HTTP {exc.code}: {detail}") from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise ProcessingError(f"DeepSeek request failed: {exc}") from exc

    try:
        choice = envelope["choices"][0]
        if choice.get("finish_reason") != "stop":
            raise ProcessingError(
                f"DeepSeek did not finish cleanly: {choice.get('finish_reason')!r}"
            )
        return json.loads(choice["message"]["content"])
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise ProcessingError("DeepSeek returned an invalid completion envelope") from exc


def _validate_string_list(value: Any, field: str, maximum: int) -> None:
    if not isinstance(value, list) or len(value) > maximum:
        raise ProcessingError(f"{field} must be a list with at most {maximum} items")
    for item in value:
        if not isinstance(item, str) or not item.strip() or len(item) > 120:
            raise ProcessingError(f"{field} contains an invalid string")


def validate_result(
    result: dict[str, Any],
    product_id: str,
    model: str,
    allowed_platforms: set[str],
) -> None:
    if not isinstance(result, dict) or set(result) != TOP_LEVEL_KEYS:
        raise ProcessingError("Result does not match the fixed top-level schema")
    if result["schemaVersion"] != SCHEMA_VERSION or result["productId"] != product_id:
        raise ProcessingError("Result schema version or product ID does not match")
    if result["model"] != model:
        raise ProcessingError("Result model name does not match the requested model")
    if not isinstance(result["needsReview"], bool):
        raise ProcessingError("needsReview must be a boolean")
    _validate_string_list(result["reviewNotes"], "reviewNotes", 8)
    if not isinstance(result["media"], list) or len(result["media"]) > 6:
        raise ProcessingError("media must be a list with at most six platforms")

    seen_platforms: set[str] = set()
    for index, media in enumerate(result["media"]):
        if not isinstance(media, dict) or set(media) != MEDIA_KEYS:
            raise ProcessingError(f"media[{index}] does not match the fixed schema")
        platform = media["platform"]
        if platform not in PUBLIC_PLATFORMS or platform in seen_platforms:
            raise ProcessingError(f"media[{index}] has an invalid or duplicate platform")
        if platform not in allowed_platforms:
            raise ProcessingError(f"media[{index}] inferred a platform absent from the evidence")
        seen_platforms.add(platform)
        if media["signal"] not in SIGNAL_LEVELS:
            raise ProcessingError(f"media[{index}] has an invalid signal label")
        _validate_string_list(media["topics"], f"media[{index}].topics", 4)
        _validate_string_list(media["doubts"], f"media[{index}].doubts", 3)
        _validate_string_list(media["misconceptions"], f"media[{index}].misconceptions", 3)
        _validate_string_list(media["scenarios"], f"media[{index}].scenarios", 3)
        if (
            not isinstance(media["summary"], str)
            or not media["summary"].strip()
            or len(media["summary"]) > 240
        ):
            raise ProcessingError(f"media[{index}].summary is required")

    serialized = json.dumps(result, ensure_ascii=False)
    for pattern in FORBIDDEN_PUBLIC_PATTERNS:
        if pattern.search(serialized):
            raise ProcessingError("Result contains prohibited source-level content")


def empty_result(product_id: str, model: str, notes: list[str]) -> dict[str, Any]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "productId": product_id,
        "model": model,
        "media": [],
        "needsReview": bool(notes and notes != ["no_social_media_echo_section"]),
        "reviewNotes": notes,
    }


def write_json_atomic(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", delete=False, dir=path.parent, suffix=".tmp"
    ) as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
        temporary = Path(handle.name)
    temporary.replace(path)


def parse_args() -> argparse.Namespace:
    repo_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(
        description="Summarize one product's aggregate social evidence with DeepSeek V4."
    )
    parser.add_argument("--product-id", required=True)
    parser.add_argument(
        "--mapping", type=Path, default=repo_root / "docs" / "product-mapping.json"
    )
    parser.add_argument("--source-root", type=Path, default=repo_root.parent / "Processed")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--model", default=os.environ.get("DEEPSEEK_MODEL", DEFAULT_MODEL))
    parser.add_argument("--api-url", default=os.environ.get("DEEPSEEK_API_URL", DEFAULT_API_URL))
    parser.add_argument("--timeout", type=int, default=90)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Extract and print the sanitized aggregate evidence packet without an API call.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        product = load_product_mapping(args.mapping.resolve(), args.product_id)
        docx_path = resolve_docx(product, args.source_root)
        evidence, extraction_notes = extract_aggregate_evidence(docx_path)

        if args.dry_run:
            preview = {
                "productId": args.product_id,
                "model": args.model,
                "source": docx_path.name,
                "aggregateRows": evidence,
                "notes": extraction_notes,
            }
            print(json.dumps(preview, ensure_ascii=False, indent=2))
            return 0

        if not evidence:
            result = empty_result(args.product_id, args.model, extraction_notes)
        else:
            result = call_deepseek(
                build_messages(product, evidence), args.model, args.api_url, args.timeout
            )
            result["model"] = args.model
            if extraction_notes:
                result["needsReview"] = True
                result["reviewNotes"] = list(
                    dict.fromkeys([*result.get("reviewNotes", []), *extraction_notes])
                )

        allowed_platforms = {
            platform for row in evidence for platform in row.get("platforms", [])
        }
        validate_result(result, args.product_id, args.model, allowed_platforms)
        if args.output:
            write_json_atomic(args.output.resolve(), result)
            print(f"Wrote {args.output.resolve()}")
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except ProcessingError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
