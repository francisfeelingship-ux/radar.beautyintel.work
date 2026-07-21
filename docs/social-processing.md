# Social signal processing

Future social-signal summaries use `scripts/summarize_social_signals.py` rather than manual full-record reading.

## Boundary

The script streams one mapped DOCX and stops at `Source Evidence Cards`. It sends DeepSeek only these fields from aggregate `Summary` rows:

- platform tag
- insight category
- aggregate summary
- usefulness label
- evidence count

It never sends source cards, original excerpts, creator identities, post titles, or URLs. Output is rejected if it contains source-level markers or fails the fixed `beauty-radar-media-v1` schema.

## Usage

```powershell
# Inspect the sanitized packet without calling the API
python scripts\summarize_social_signals.py `
  --product-id olaplex-curl-hydrating-system `
  --dry-run

# Call DeepSeek V4 Pro and write a reviewable result
python scripts\summarize_social_signals.py `
  --product-id olaplex-curl-hydrating-system `
  --output qa\social\olaplex-curl.json
```

Required environment variable: `DEEPSEEK_API_KEY`.

The default model is `deepseek-v4-pro`. Override it only when required:

```powershell
$env:DEEPSEEK_MODEL = "deepseek-v4-flash"
```

Generated JSON is a review artifact. It is not automatically merged into `data/products.json`.
