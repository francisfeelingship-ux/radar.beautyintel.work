# radar.beautyintel.work

Public Beauty Radar product cloud for [radar.beautyintel.work](https://radar.beautyintel.work).

The site is a Vite-powered static experience. Product bubbles live in one deterministic spatial world; technology, selected ingredient systems, aggregated media conclusions, and editorial cards expand locally around the active product.

## Local development

```powershell
pnpm install
pnpm run check:data
pnpm run dev
```

## Production build

```powershell
pnpm run build
```

The deployable output is written to `dist/`.

## Content structure

- `public/data/products.json` - sanitized public product manifest and stored layout coordinates.
- `public/data/products-overlay.json` - reviewed incremental products merged into the public manifest at load time.
- `public/assets/products/` - reviewed, optimized public product and editorial imagery.
- `docs/asset-inventory.md` - publishable, excluded, missing, and ambiguous source assets.
- `docs/product-mapping.json` - reproducible source-to-product mapping.
- `docs/implementation-plan.md` - layout, interaction, responsive, and evidence-boundary plan.
- `docs/social-processing.md` - bounded DeepSeek V4 workflow and fixed public-media schema.
- `design-qa.md` - desktop/mobile visual and interaction verification.

Source DOCX records, full INCI lists, creator identities, original posts, excerpts, and source links are intentionally excluded from the public build.
