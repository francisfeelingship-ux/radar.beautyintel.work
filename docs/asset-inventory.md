# Beauty Radar asset inventory

Inventory date: 2026-07-21  
Workspace scanned: `C:\Users\ERAZER\Desktop\Deployment\Radar Component`  
Publication rule: publish only when directory name, radar-record title, and visible product identity agree. Ambiguous files are excluded rather than guessed.

## Summary

- 12 product groups are safe to publish: the approved Eucerin v2 group plus 11 directory-scoped radar groups.
- 61 candidate product/editorial images and 11 DOCX radar records were inspected outside the v2 prototype.
- Every published group has a product-identifying visual. Medicube has a dedicated 180 x 180 product image; the remaining new groups use a clearly product-identifying approved editorial cover as the bubble source.
- No JSON, JSONL, CSV, or Markdown radar records were found outside the v2 prototype and repository documentation.
- No cross-directory image assignment is used.

## Product groups

### Eucerin - Oil Control Sun Protection SPF50+

- Mapping basis: approved v2 prototype code, rendered QA states, and `assets/product-bubble.webp`.
- Bubble image: `beauty_radar_product_cloud_v2/beauty_radar_product_cloud_v2/assets/product-bubble.webp`.
- Editorial cards: `card-1.webp` through `card-5.webp`.
- Radar record: curated public copy embedded in the approved v2 prototype; no separate DOCX found.
- Missing assets: none for the approved prototype scope.
- Ambiguous assets: none.
- Excluded: `product-panel.webp` and `cover-summer.webp` because they belong to the discarded side-panel/cover presentation, not the spatial product-cloud gallery.
- Safe to publish: yes.

### Biossance - Squalane + Copper Peptide Rapid Plumping Serum 50ml

- Directory: `biossance_squalane_and_copper_peptide_rapid_plumping_serum`.
- Radar record: `biossance_squalane_and_copper_peptide_rapid_plumping_serum.docx`.
- Bubble source: `ChatGPT Image 2026年6月17日 19_38_19 (1).png`.
- Published editorial cards: the four-image set timestamped `19_38_19`, `19_38_20`, and `19_38_40`.
- Missing assets: no isolated transparent product cutout; the approved cover card is used without altering packaging.
- Ambiguous assets: the later `19_38_46` / `19_38_47` images appear to be alternate exports of the same four-card sequence.
- Excluded: all four later alternate exports; `19_38_47 (4)` is byte-identical to `19_38_40`.
- Safe to publish: yes, using the earlier internally consistent set only.

### CeraVe - Hydrating Hyaluronic Acid Water Gel 48ml

- Directory: `cerave_hydrating_hyaluronic_acid_water_gel_for_plumping_hydration_with_ceramides_hyaluronic_acid_niacinamide_48ml`.
- Radar record: same normalized product name with `.docx` extension.
- Bubble source: `ChatGPT Image 2026年6月7日 20_54_43 (1).png`.
- Editorial cards: all five PNG files in the directory.
- Missing assets: no isolated product cutout.
- Ambiguous assets: none; visible packaging, CeraVe name, and radar title agree.
- Excluded: none.
- Safe to publish: yes.

### Dermalogica - Futurecode Booster 30ml

- Directory: `dermalogica_futurecode_booster_damage-correcting_longevity_serum_30ml`.
- Radar record: same normalized product name with `.docx` extension.
- Bubble source: `ChatGPT Image 2026年6月23日 15_58_41.png`.
- Editorial cards: all five PNG files in the directory.
- Missing assets: no isolated product cutout.
- Ambiguous assets: none; visible Dermalogica Futurecode packaging and record title agree.
- Excluded: none.
- Safe to publish: yes.

### Elizabeth Arden - Eight Hour Cream Ultimate Repair Moisturizer 50ml

- Directory: `elizabeth_arden_eight_hour_cream_ultimate_repair_moisturizer_50ml`.
- Radar record: same normalized product name with `.docx` extension.
- Bubble source: `ChatGPT Image 2026年6月7日 20_30_46.png`.
- Editorial cards: all four PNG files in the directory.
- Missing assets: no isolated product cutout.
- Ambiguous assets: none; visible Eight Hour packaging and record title agree.
- Excluded: none.
- Safe to publish: yes.

### Estee Lauder - Re-Nutriv Ultimate Diamond Transformative Brilliance Serum

- Directory: `estée_lauder_re-nutriv_ultimate_diamond_transformative_brilliance_serum`.
- Radar record: same normalized product name with `.docx` extension.
- Bubble source: `ChatGPT Image 2026年6月14日 17_11_08 (1).png`.
- Published editorial cards: the six timestamped `17_11_08` through `17_11_10`.
- Missing assets: no isolated product cutout.
- Ambiguous assets: `f90b4e31-8157-4302-a357-4e49d92c611a.png` visibly belongs to the product but has an opaque filename and uncertain sequence role.
- Excluded: the UUID-named image pending review.
- Safe to publish: yes, using the named six-card set.

### Gisou - Honey Gloss Collagen Drops Hair Oil 20ml

- Directory: `GiSou Hair Honey`.
- Radar record: `gisou_honey_gloss_collagen_drops_hair_oil_20ml.docx`.
- Bubble source: `ChatGPT Image 2026年7月16日 17_00_00.png`.
- Editorial cards: all five PNG files in the directory.
- Missing assets: no isolated product cutout.
- Ambiguous assets: none; visible Gisou packaging and radar title agree.
- Excluded: none.
- Safe to publish: yes.

### L'Oreal Paris - Revitalift Filler Glass Skin Liquid Cream 50ml

- Directory: `l'oréal_paris_revitalift_filler_glass_skin_liquid_cream_face_moisturiser,_50ml`.
- Radar record: same normalized product name with `.docx` extension.
- Bubble source: `ChatGPT Image 2026年6月12日 09_27_02 (1).png`.
- Published editorial cards: the five timestamped `09_27_02` / `09_27_03` images.
- Missing assets: no isolated product cutout.
- Ambiguous assets: `071d443f-b89c-4a07-96fb-4dcb1fa0def4.png` visibly belongs to the product but has an opaque filename and uncertain sequence role.
- Excluded: the UUID-named image pending review.
- Safe to publish: yes, using the named five-card set.

### Medicube - PDRN Pink Peptide Eye Serum 30ml

- Directory: `medicube_pdrn_pink_peptide_eye_serum_30ml`.
- Radar record: same normalized product name with `.docx` extension.
- Bubble image: `product_image.png` (dedicated 180 x 180 product image).
- Editorial cards: all five timestamped PNG files.
- Missing assets: none.
- Ambiguous assets: none; directory, record, packaging, and dedicated product image agree.
- Excluded: none.
- Safe to publish: yes.

### Olaplex - Curl Hydrating Shampoo and Conditioner

- Directory: `OLAPLEX_CURL`.
- Radar record: `olaplex_curl_hydrating_curl_shampoo_and_conditioner.docx`.
- Bubble source: `01.png`.
- Editorial cards: `01.png` through `05.png`.
- Missing assets: no isolated product cutout.
- Ambiguous assets: none; visible Olaplex Curl packaging and record title agree.
- Excluded: none.
- Safe to publish: yes.

### The Ordinary - Caffeine 3% + EGCG / Escin 1% Energizing Face Serum 30ml

- Directory: `the_ordinary_caffeine_3_escin_1_energizing_face_serum_30ml`.
- Radar record: same normalized product name with `.docx` extension.
- Bubble source: `ChatGPT Image 2026年6月22日 09_45_44 (1).png`.
- Editorial cards: all six PNG files in the directory.
- Missing assets: no isolated product cutout.
- Ambiguous assets: none; visible The Ordinary packaging and radar title agree.
- Excluded: none.
- Safe to publish: yes.

### L'Occitane - Almond Shower Oil 250ml

- Directory: `欧舒丹沐浴油`.
- Radar record: `l'occitane_almond_(amande)_shower_oil_250ml.docx`.
- Bubble source: `ChatGPT Image 2026年7月16日 17_33_14 (1).png`.
- Editorial cards: all five PNG files in the directory.
- Missing assets: no isolated product cutout.
- Ambiguous assets: none; visible L'Occitane almond shower oil packaging and record title agree.
- Excluded: none.
- Safe to publish: yes.

## Publication boundary

- DOCX files are source records only and are not copied into the public site.
- Original social posts, creator names, post titles, excerpts, and source URLs are not published.
- Full INCI lists are not published.
- Product-specific claims are summarized conservatively, and evidence limits remain visible in the public manifest.
- Files marked ambiguous remain `needs_review` in `product-mapping.json` and are not copied into public assets.
