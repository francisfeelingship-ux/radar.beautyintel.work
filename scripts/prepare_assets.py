"""Build the public, optimized image set from the reviewed workspace mapping."""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image


WORKSPACE = Path(r"C:\Users\ERAZER\Desktop\Deployment\Radar Component")
REPO = WORKSPACE / "radar.beautyintel.work"
OUTPUT = REPO / "assets" / "products"


GROUPS = {
    "eucerin-oil-control": {
        "source": WORKSPACE / "beauty_radar_product_cloud_v2" / "beauty_radar_product_cloud_v2" / "assets",
        "bubble": "product-bubble.webp",
        "cards": [f"card-{index}.webp" for index in range(1, 6)],
    },
    "biossance-copper-peptide": {
        "source": WORKSPACE / "biossance_squalane_and_copper_peptide_rapid_plumping_serum",
        "bubble": "ChatGPT Image 2026年6月17日 19_38_19 (1).png",
        "cards": [
            "ChatGPT Image 2026年6月17日 19_38_19 (1).png",
            "ChatGPT Image 2026年6月17日 19_38_20 (2).png",
            "ChatGPT Image 2026年6月17日 19_38_20 (3).png",
            "ChatGPT Image 2026年6月17日 19_38_40.png",
        ],
    },
    "cerave-water-gel": {
        "source": WORKSPACE / "cerave_hydrating_hyaluronic_acid_water_gel_for_plumping_hydration_with_ceramides_hyaluronic_acid_niacinamide_48ml",
        "bubble": "ChatGPT Image 2026年6月7日 20_54_43 (1).png",
        "cards": [
            "ChatGPT Image 2026年6月7日 20_54_43 (1).png",
            "ChatGPT Image 2026年6月7日 20_54_44 (2).png",
            "ChatGPT Image 2026年6月7日 20_54_44 (3).png",
            "ChatGPT Image 2026年6月7日 20_54_44 (4).png",
            "ChatGPT Image 2026年6月7日 20_54_45 (5).png",
        ],
    },
    "dermalogica-futurecode": {
        "source": WORKSPACE / "dermalogica_futurecode_booster_damage-correcting_longevity_serum_30ml",
        "bubble": "ChatGPT Image 2026年6月23日 15_58_41.png",
        "cards": [
            "ChatGPT Image 2026年6月23日 15_54_19 (2).png",
            "ChatGPT Image 2026年6月23日 15_54_21 (3).png",
            "ChatGPT Image 2026年6月23日 15_54_22 (4).png",
            "ChatGPT Image 2026年6月23日 15_54_23 (5).png",
            "ChatGPT Image 2026年6月23日 15_58_41.png",
        ],
    },
    "elizabeth-arden-eight-hour": {
        "source": WORKSPACE / "elizabeth_arden_eight_hour_cream_ultimate_repair_moisturizer_50ml",
        "bubble": "ChatGPT Image 2026年6月7日 20_30_46.png",
        "cards": [
            "ChatGPT Image 2026年6月7日 20_29_57 (2).png",
            "ChatGPT Image 2026年6月7日 20_29_57 (3).png",
            "ChatGPT Image 2026年6月7日 20_30_00 (6).png",
            "ChatGPT Image 2026年6月7日 20_30_46.png",
        ],
    },
    "estee-lauder-renutriv": {
        "source": WORKSPACE / "estée_lauder_re-nutriv_ultimate_diamond_transformative_brilliance_serum",
        "bubble": "ChatGPT Image 2026年6月14日 17_11_08 (1).png",
        "cards": [
            "ChatGPT Image 2026年6月14日 17_11_08 (1).png",
            "ChatGPT Image 2026年6月14日 17_11_09 (2).png",
            "ChatGPT Image 2026年6月14日 17_11_09 (3).png",
            "ChatGPT Image 2026年6月14日 17_11_10 (4).png",
            "ChatGPT Image 2026年6月14日 17_11_10 (5).png",
            "ChatGPT Image 2026年6月14日 17_11_10 (6).png",
        ],
    },
    "gisou-honey-gloss": {
        "source": WORKSPACE / "GiSou Hair Honey",
        "bubble": "ChatGPT Image 2026年7月16日 17_00_00.png",
        "cards": [
            "ChatGPT Image 2026年7月16日 16_58_30 (2).png",
            "ChatGPT Image 2026年7月16日 16_58_31 (3).png",
            "ChatGPT Image 2026年7月16日 16_58_31 (4).png",
            "ChatGPT Image 2026年7月16日 16_58_32 (5).png",
            "ChatGPT Image 2026年7月16日 17_00_00.png",
        ],
    },
    "loreal-glass-skin": {
        "source": WORKSPACE / "l'oréal_paris_revitalift_filler_glass_skin_liquid_cream_face_moisturiser,_50ml",
        "bubble": "ChatGPT Image 2026年6月12日 09_27_02 (1).png",
        "cards": [
            "ChatGPT Image 2026年6月12日 09_27_02 (1).png",
            "ChatGPT Image 2026年6月12日 09_27_03 (2).png",
            "ChatGPT Image 2026年6月12日 09_27_03 (3).png",
            "ChatGPT Image 2026年6月12日 09_27_03 (4).png",
            "ChatGPT Image 2026年6月12日 09_27_03 (5).png",
        ],
    },
    "medicube-pdrn-eye": {
        "source": WORKSPACE / "medicube_pdrn_pink_peptide_eye_serum_30ml",
        "bubble": "product_image.png",
        "cards": [
            "ChatGPT Image 2026年6月23日 18_42_56 (1).png",
            "ChatGPT Image 2026年6月23日 18_42_56 (2).png",
            "ChatGPT Image 2026年6月23日 18_42_57 (3).png",
            "ChatGPT Image 2026年6月23日 18_42_57 (4).png",
            "ChatGPT Image 2026年6月23日 18_42_57 (5).png",
        ],
    },
    "olaplex-curl": {
        "source": WORKSPACE / "OLAPLEX_CURL",
        "bubble": "01.png",
        "cards": ["01.png", "02.png", "03.png", "04.png", "05.png"],
    },
    "the-ordinary-caffeine": {
        "source": WORKSPACE / "the_ordinary_caffeine_3_escin_1_energizing_face_serum_30ml",
        "bubble": "ChatGPT Image 2026年6月22日 09_45_44 (1).png",
        "cards": [
            "ChatGPT Image 2026年6月22日 09_45_44 (1).png",
            "ChatGPT Image 2026年6月22日 09_45_47 (2).png",
            "ChatGPT Image 2026年6月22日 09_45_47 (3).png",
            "ChatGPT Image 2026年6月22日 09_45_48 (4).png",
            "ChatGPT Image 2026年6月22日 09_45_49 (5).png",
            "ChatGPT Image 2026年6月22日 09_45_49 (6).png",
        ],
    },
    "loccitane-almond": {
        "source": WORKSPACE / "欧舒丹沐浴油",
        "bubble": "ChatGPT Image 2026年7月16日 17_33_14 (1).png",
        "cards": [
            "ChatGPT Image 2026年7月16日 17_26_18.png",
            "ChatGPT Image 2026年7月16日 17_26_30.png",
            "ChatGPT Image 2026年7月16日 17_26_35.png",
            "ChatGPT Image 2026年7月16日 17_33_14 (1).png",
            "ChatGPT Image 2026年7月16日 17_33_14 (2).png",
        ],
    },
}


def convert(source: Path, destination: Path, max_width: int, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image.load()
        if image.width > max_width:
            height = round(image.height * max_width / image.width)
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.save(destination, "WEBP", quality=quality, method=6)


def main() -> None:
    written = 0
    for slug, group in GROUPS.items():
        source_dir = Path(group["source"])
        target_dir = OUTPUT / slug
        bubble_source = source_dir / str(group["bubble"])
        if not bubble_source.exists():
            raise FileNotFoundError(bubble_source)
        convert(bubble_source, target_dir / "bubble.webp", max_width=720, quality=86)
        written += 1
        for index, filename in enumerate(group["cards"], start=1):
            source = source_dir / filename
            if not source.exists():
                raise FileNotFoundError(source)
            convert(source, target_dir / "cards" / f"{index:02d}.webp", max_width=1200, quality=84)
            written += 1
    print(f"Prepared {written} optimized public images across {len(GROUPS)} product groups.")


if __name__ == "__main__":
    main()
