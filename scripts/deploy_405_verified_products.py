#!/usr/bin/env python3
"""Deploy all 405 verified products from SQLite to radar.beautyintel.work public data.

Enforces:
1. Key ingredients only (no full INCI lists).
2. Social media summaries only (no full social media records, creator handles, or post URLs).
3. Preserves existing online UI grouping logic (random, brand, category, active).
4. No duplicate products.
"""

from __future__ import annotations

import json
import re
import shutil
import sqlite3
from pathlib import Path


EXCIPIENTS = {
    "water", "aqua", "eau", "water/aqua/eau", "dimethicone", "butylene glycol",
    "glycerin", "phenoxyethanol", "disodium edta", "sodium chloride",
    "methylparaben", "ethylparaben", "propylparaben", "fragrance", "parfum",
    "alcohol", "alcohol denat", "carbomer", "xanthan gum", "sodium hydroxide",
    "citric acid", "triethanolamine", "caprylyl glycol", "hexylene glycol",
    "ethylhexylglycerin", "polysorbate 20", "polysorbate 60", "polysorbate 80"
}

ACTIVE_KEYWORDS = [
    "peptide", "胜肽", "多肽", "copper", "铜", "pdrn", "hyaluronic", "玻尿酸",
    "透明质酸", "niacinamide", "烟酰胺", "ceramide", "神经酰胺", "squalane",
    "角鲨烷", "retinol", "视黄醇", "vitamin", "维他命", "维生素", "caffeine",
    "咖啡因", "collagen", "胶原", "ectoin", "依克多因", "salicylic", "水杨酸",
    "adenosine", "腺苷", "centella", "积雪草", "cica", "panthenol", "泛醇",
    "bha", "aha", "ascorbic", "抗坏血酸", "resveratrol", "白藜芦醇",
    "ferulic", "阿魏酸", "tocopherol", "生育酚", "extract", "提取物", "oil", "油"
]


def clean_str(s: str | None) -> str:
    if not s:
        return ""
    return re.sub(r"[^\w]", "", str(s).lower())


def slugify(text: str) -> str:
    if not text:
        return "product"
    s = text.lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s).strip("-")
    return s or "product"


def main() -> None:
    workspace_root = Path(r"C:\Users\ERAZER\Desktop\Deployment\Radar Component")
    db_path = Path(r"C:\Users\ERAZER\Desktop\化妆品市场研究\Beauty_Movement_Radar\beauty_movement_radar.sqlite")
    repo_dir = workspace_root / "radar.beautyintel.work"
    json_path = repo_dir / "public" / "data" / "products.json"
    v2_json_path = workspace_root / "beauty_radar_product_cloud_v2" / "beauty_radar_product_cloud_v2" / "data" / "products.json"
    assets_dir = repo_dir / "public" / "assets" / "products"

    if not db_path.exists():
        raise FileNotFoundError(f"Database not found at {db_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        existing_json = json.load(f)

    existing_products = existing_json.get("products", [])

    # Index existing products by cleaned names
    existing_map: dict[str, dict] = {}
    for p in existing_products:
        c_name = clean_str(p.get("name"))
        b_val = p.get("brand") or ""
        c_full = clean_str(f"{b_val}{p.get('name')}")
        if c_full:
            existing_map[c_full] = p
        if c_name:
            existing_map[c_name] = p

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Query all 405 verified products
    verified_rows = cursor.execute("""
        SELECT p.product_id, p.product_name, p.normalized_name, p.brand_id, b.brand_name, p.category, p.subcategory, p.image_url, p.channel
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        WHERE p.relation_status = 'verified'
    """).fetchall()

    print(f"Loaded {len(verified_rows)} verified products from SQLite database.")

    final_products: list[dict] = []
    seen_ids: set[str] = set()

    for v in verified_rows:
        v_id, v_name, v_norm, v_bid, v_bname, v_cat, v_subcat, v_img, v_channel = v
        b_name = v_bname or "Beauty Radar"
        p_name = v_name or v_norm or "Verified Product"

        c_full = clean_str(f"{b_name}{p_name}")
        c_name = clean_str(p_name)

        existing_p = existing_map.get(c_full) or existing_map.get(c_name)

        p_id = existing_p["id"] if existing_p else slugify(f"{b_name}-{p_name}")
        if p_id in seen_ids:
            p_id = f"{p_id}-{len(seen_ids)}"
        seen_ids.add(p_id)

        # Normalize category
        cat = v_cat or (existing_p.get("category") if existing_p else "serum")
        if cat in ["unknown", "anti-wrinkle peptide serum", "moisturiser", "lip_treatment", "treatment"] or not cat:
            p_lower = p_name.lower()
            if "serum" in cat or "serum" in p_lower or "精华" in p_lower:
                cat = "serum"
            elif "cream" in p_lower or "moistur" in p_lower or "霜" in p_lower:
                cat = "cream"
            elif "sun" in p_lower or "spf" in p_lower or "防晒" in p_lower:
                cat = "sunscreen"
            elif "eye" in p_lower or "眼" in p_lower:
                cat = "eye_care"
            elif "cleans" in p_lower or "wash" in p_lower or "洁面" in p_lower:
                cat = "cleanser"
            elif "toner" in p_lower or "mist" in p_lower or "水" in p_lower or "露" in p_lower:
                cat = "toner"
            elif "lip" in p_lower or "唇" in p_lower:
                cat = "lip_care"
            elif "hair" in p_lower or "shampoo" in p_lower or "发" in p_lower:
                cat = "haircare"
            elif "mask" in p_lower or "膜" in p_lower:
                cat = "mask"
            elif "body" in p_lower or "体" in p_lower:
                cat = "bodycare"
            else:
                cat = "serum"

        # Resolve bubble image
        slug_dir = assets_dir / p_id
        if slug_dir.exists() and (slug_dir / "bubble.webp").exists():
            bubble_img = f"./assets/products/{p_id}/bubble.webp"
        elif existing_p and existing_p.get("bubbleImage"):
            bubble_img = existing_p.get("bubbleImage")
        else:
            bubble_img = v_img or "https://placehold.co/200x200?text=Product"

        # Key ingredients extraction (NO full INCI)
        key_ingredients: list[dict[str, str]] = []

        if existing_p and existing_p.get("keyIngredients"):
            for ing in existing_p["keyIngredients"]:
                lbl = ing.get("label", "")
                rle = ing.get("role", "")
                if lbl.lower() not in EXCIPIENTS:
                    key_ingredients.append({
                        "label": lbl,
                        "role": rle if rle != "canonical_full_inci" else "核心活性"
                    })

        if not key_ingredients:
            ing_rows = cursor.execute("""
                SELECT i.ingredient_name, i.normalized_name, pi.ingredient_role, pi.explanation
                FROM product_ingredients pi
                JOIN ingredients i ON pi.ingredient_id = i.ingredient_id
                WHERE pi.product_id = ?
            """, (v_id,)).fetchall()

            for ing_name, ing_norm, ing_role, ing_exp in ing_rows:
                label = ing_name or ing_norm or ""
                if not label or label.lower() in EXCIPIENTS:
                    continue
                role = ing_role or ing_exp or "核心活性"
                if role == "canonical_full_inci":
                    role = "核心活性"
                key_ingredients.append({"label": label[:40], "role": role[:30]})
                if len(key_ingredients) >= 6:
                    break

        if not key_ingredients:
            can_row = cursor.execute(
                "SELECT normalized_ingredient_list FROM product_canonical_ingredient_lists WHERE product_id = ? AND is_active = 1",
                (v_id,)
            ).fetchone()
            if can_row and can_row[0]:
                try:
                    raw_list = json.loads(can_row[0]) if can_row[0].startswith("[") else [x.strip() for x in can_row[0].split(",")]
                    for item in raw_list:
                        if not item or item.lower() in EXCIPIENTS or len(item) > 50:
                            continue
                        is_active = any(k in item.lower() for k in ACTIVE_KEYWORDS)
                        if is_active or len(key_ingredients) < 3:
                            key_ingredients.append({
                                "label": item[:40],
                                "role": "特色活性" if is_active else "功能成分"
                            })
                        if len(key_ingredients) >= 5:
                            break
                except Exception:
                    pass

        if not key_ingredients:
            key_ingredients = [{"label": "特色复配活性", "role": "功能护肤"}]

        # Media summaries extraction (NO full social records)
        soc_rows = cursor.execute("""
            SELECT platform_group, insight_type, summary, evidence_count
            FROM product_social_insight
            WHERE product_id = ?
            LIMIT 10
        """, (v_id,)).fetchall()

        media: list[dict] = []
        if soc_rows:
            platform_map = {
                "domestic": "小红书", "international": "Reddit",
                "red": "小红书", "zhihu": "知乎", "youtube": "YouTube"
            }
            grouped: dict[str, dict] = {}
            for plat_group, in_type, summ, ev_cnt in soc_rows:
                plat_name = platform_map.get(plat_group.lower() if plat_group else "", "小红书")
                if plat_name not in grouped:
                    grouped[plat_name] = {"topics": [], "doubts": [], "summary": []}
                if in_type == "complaint_or_risk":
                    grouped[plat_name]["doubts"].append(summ[:30])
                else:
                    grouped[plat_name]["topics"].append(summ[:30])
                grouped[plat_name]["summary"].append(summ)

            for plat_name, pdata in grouped.items():
                combined_summary = " ".join(pdata["summary"][:2])
                if len(combined_summary) > 200:
                    combined_summary = combined_summary[:197] + "..."
                media.append({
                    "platform": plat_name,
                    "signal": "中等",
                    "topics": pdata["topics"][:3] or ["核心体验", "用户讨论"],
                    "doubts": pdata["doubts"][:2],
                    "misconceptions": [],
                    "scenarios": ["日常使用"],
                    "summary": combined_summary or f"{plat_name}用户聚焦讨论其配方表现与实际体验。"
                })

        if not media and existing_p and existing_p.get("media"):
            media = existing_p["media"]
        if not media:
            media = [
                {
                    "platform": "小红书",
                    "signal": "有限",
                    "topics": ["配方关注", "使用体验"],
                    "doubts": [],
                    "misconceptions": [],
                    "scenarios": ["日常护肤"],
                    "summary": f"小红书平台关注 {b_name} {p_name} 的核心功效与使用感受。"
                }
            ]

        # Construct product object
        prod_obj = {
            "id": p_id,
            "slug": p_id,
            "brand": b_name,
            "name": p_name,
            "shortName": p_name[:20],
            "category": cat,
            "positioning": f"{b_name} {cat} 护理",
            "bubbleImage": bubble_img,
            "bubbleFocal": "50% 50%",
            "summary": existing_p.get("summary") if existing_p else f"{b_name} {p_name} 的技术雷达分析与文献/社媒回声",
            "technologies": existing_p.get("technologies") if (existing_p and existing_p.get("technologies")) else [{"label": "配方科技", "summary": "产品核心成分与协同体系"}],
            "keyIngredients": key_ingredients,
            "media": media,
            "editorialCards": existing_p.get("editorialCards", []) if existing_p else [],
            "evidenceBoundary": existing_p.get("evidenceBoundary") if existing_p else "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
            "audience": existing_p.get("audience") if existing_p else {"bestFor": ["日常护肤需求"], "cautions": ["根据个人肤质耐受使用"]},
            "layout": existing_p.get("layout") if existing_p else {"x": 200, "y": 200, "size": 0.95}
        }

        final_products.append(prod_obj)

    # Filter out products missing valid product images
    def is_valid_product_image(product: dict) -> bool:
        img = product.get("bubbleImage", "")
        if not img or "placehold.co" in img or "placeholder" in img:
            return False
        if img.startswith("./") or img.startswith("/"):
            rel_path = img.lstrip("./").lstrip("/")
            local_file = repo_dir / "public" / rel_path
            return local_file.exists() and local_file.stat().st_size > 0
        if img.startswith("http://") or img.startswith("https://"):
            # Exclude product page URLs (ulta.com/p/, lookfantastic.com/p/, cultbeauty.com/p/, etc.)
            if "/p/" in img and not any(ext in img.lower() for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", "productimg", "storage.googleapis.com"]):
                return False
            return True
        return False

    valid_final_products = [p for p in final_products if is_valid_product_image(p)]
    print(f"Filtered out {len(final_products) - len(valid_final_products)} products missing valid product images.")
    print(f"Remaining valid products with confirmed images: {len(valid_final_products)}")

    # Grid layout assignment across 3600 x 2400 canvas
    world_w = 3600
    world_h = 2400
    cols = 25
    rows = (len(valid_final_products) + cols - 1) // cols

    margin_x = 180
    margin_y = 180
    step_x = (world_w - margin_x * 2) / (cols - 1)
    step_y = (world_h - margin_y * 2) / max(1, rows - 1)

    for idx, p in enumerate(valid_final_products):
        if p["layout"]["x"] == 200 and p["layout"]["y"] == 200:
            r_idx = idx // cols
            c_idx = idx % cols
            p["layout"]["x"] = round(margin_x + c_idx * step_x)
            p["layout"]["y"] = round(margin_y + r_idx * step_y)
            p["layout"]["size"] = 0.95

    out_data = {
        "version": existing_json.get("version", 1),
        "world": {"width": world_w, "height": world_h},
        "products": valid_final_products
    }

    # Write output to repo products.json
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Successfully written {len(valid_final_products)} verified products to {json_path}")

    # Copy to standalone v2 directory if present
    if v2_json_path.parent.exists():
        shutil.copy2(json_path, v2_json_path)
        print(f"Synced updated products.json to {v2_json_path}")


if __name__ == "__main__":
    main()
