#!/usr/bin/env python3
"""Static HTML, asset, accessibility, contrast, and responsive grid checks."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
HTML_FILES = sorted(ROOT.glob("*.html"))
CSS_FILES = sorted((ROOT / "styles").glob("*.css"))


def hex_to_rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))


def rel_lum(rgb):
    return sum(
        w * (c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4)
        for w, c in zip((0.2126, 0.7152, 0.0722), rgb)
    )


def contrast_ratio(c1: str, c2: str) -> float:
    l1, l2 = rel_lum(hex_to_rgb(c1)), rel_lum(hex_to_rgb(c2))
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)


def main() -> None:
    assert len(HTML_FILES) >= 18, f"Expected >= 18 HTML pages, found {len(HTML_FILES)}"

    required_footer = ["privacy.html", "terms.html", "shipping.html", "returns.html", "help.html"]
    for f in HTML_FILES:
        txt = f.read_text(encoding="utf-8")
        refs = re.findall(
            r'(?:src|href)="(assets/[^"]+|styles/[^"]+|src/[^"]+|(?:[a-z-]+\.html)[^"]*)"',
            txt,
        )
        missing = [r for r in refs if not (ROOT / r.split("#")[0].split("?")[0]).is_file()]
        assert not missing, f"Missing refs in {f.name}: {missing}"

        hash_links = re.findall(r'href="#([^"]+)"', txt)
        missing_anchors = [h for h in hash_links if f'id="{h}"' not in txt]
        assert not missing_anchors, f"Missing anchors in {f.name}: {missing_anchors}"

        imgs = re.findall(r"<img[^>]+>", txt)
        bad_alts = [im for im in imgs if 'alt=""' in im or "alt=" not in im]
        assert not bad_alts, f"Image missing alt in {f.name}: {bad_alts}"

        for req in required_footer:
            assert f'href="{req}"' in txt, f"Footer missing {req} in {f.name}"

    all_css = "\n".join(c.read_text(encoding="utf-8") for c in CSS_FILES)
    assert "prefers-reduced-motion" in all_css, "Missing prefers-reduced-motion"
    assert ":focus-visible" in all_css, "Missing :focus-visible"
    assert "caret-color: transparent" in all_css, "Missing caret-color guard"
    assert "repeat(2, minmax(0, 1fr))" in all_css, "Missing 2-column mobile grid rules"

    for name, fg in [
        ("text-primary", "#f3ede4"),
        ("text-secondary", "#b8aea4"),
        ("text-muted", "#998f86"),
        ("gold", "#c9a97e"),
        ("error", "#e49aa9"),
    ]:
        for bg_name, bg in [("primary", "#0b0a0c"), ("card", "#151316")]:
            cr = contrast_ratio(fg, bg)
            assert cr >= 4.5, f"Contrast too low for {name} on {bg_name}: {cr:.2f}:1"

    for rel in ["checkout.html", "src/components/checkout.js", "src/services/paymentAdapter.js", "src/state/store.js"]:
        txt = (ROOT / rel).read_text(encoding="utf-8").lower()
        for bad in ["cc-number", "cc-csc", "cardnumber"]:
            assert bad not in txt, f"Disallowed raw card pattern {bad} in {rel}"

    print(f"verify.py passed across {len(HTML_FILES)} HTML pages and {len(CSS_FILES)} CSS files.")


if __name__ == "__main__":
    main()
