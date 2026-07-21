# Beauty Radar product cloud implementation plan

## Goal

Turn the approved dark v2 prototype into a data-driven, product-agnostic spatial cloud that can hold dozens of products now and scale toward hundreds without changing the core interaction language.

## Architecture

1. Keep the public site static and dependency-light: semantic HTML, CSS, and browser JavaScript.
2. Store all publishable product copy and stable layout coordinates in a sanitized `data/products.json` manifest.
3. Copy only approved assets into per-product folders under `assets/products/`; convert large PNG editorial cards to visually equivalent WebP files for delivery.
4. Render one DOM bubble per product inside a transformable world. Keep the header, intro copy, view controls, and help text outside that transform.
5. Apply pan and zoom as a single world transform with pointer-centered wheel zoom, two-pointer pinch zoom, drag-to-pan, bounds-aware fit, and deterministic reset.
6. Generate first-level category nodes and second-level detail nodes only for the active product. The active product keeps its stored coordinates; nearby bubbles may receive temporary visual de-emphasis, never permanent coordinate changes.
7. Draw connections in a dedicated SVG layer inside the world so lines remain spatially attached under pan and zoom.

## Deterministic layout

- Use stored `layout.x`, `layout.y`, and `layout.size` values in a 2400 x 1600 world.
- Place the initial 12 products on a reproducible staggered constellation with generous minimum separation.
- `Fit all` computes the primary-bubble bounding box at runtime and derives the scale/translation needed to fit it with viewport padding.
- Future ingestion can add semantic clusters while retaining stable coordinates in the manifest.

## Interaction model

- Click/tap a product to activate it; only one product is active.
- Click/tap empty canvas or press Escape to collapse.
- Clicking another product switches the expansion.
- Category nodes: `技术`, `关键成分`, `媒体`, `完整解读`.
- Technology/ingredient/media nodes open concise, nearby floating explanations.
- Media nodes contain aggregated platform-level conclusions only.
- Editorial thumbnails stay around the selected product and open a dark centered lightbox with previous, next, count, caption, close, and keyboard controls.
- Search filters by brand, name, category, positioning, technology, and ingredient labels; `/` focuses search.

## Responsive and legibility rules

- Desktop is the primary canvas.
- At lower zoom, hide long product labels and secondary decoration while keeping imagery recognizable.
- Expanded detail nodes enforce a legibility floor by automatically raising the active view scale when needed.
- On mobile, use one-finger pan, pinch zoom, large touch targets, and a wider/partial radial arc for expansions.
- Prevent document overflow and suppress page scrolling only while the cloud gesture is active.
- Keep zoom controls reachable at 390 x 844 and keep the lightbox within the device frame.

## Public-data boundary

- Publish curated technology systems and selected ingredients only, never full INCI.
- Publish platform-level summaries, signal strength, themes, recurring doubts, misconceptions, and use scenarios only.
- Do not include original post text, creator names, post titles, or source links.
- Carry an `evidenceBoundary` field for every product.
- Exclude all `needs_review` assets from the build.

## Verification gate

- Validate JSON and confirm every referenced asset exists.
- Test wheel zoom, pointer-centered zoom, drag pan, pinch handling, product switching, empty-space collapse, Escape behavior, category expansion, media summaries, and lightbox navigation.
- Capture and inspect desktop closed/open/detail/lightbox states at 1440 x 900.
- Capture and inspect mobile closed/open/lightbox states at 390 x 844.
- Compare the rendered implementation against the approved v2 screenshots for typography, spacing, palette, image treatment, copy, and overall density.
- Record the final comparison in `design-qa.md`; handoff only when no P0/P1/P2 findings remain.
