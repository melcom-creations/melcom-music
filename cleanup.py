from __future__ import annotations

import re
from pathlib import Path

from build import render_album_years, render_music_years

ROOT_DIR = Path(".")
SRC_DIR = ROOT_DIR / "src"
COMPONENTS_DIR = ROOT_DIR / "components"

HEADER_RE = re.compile(r"<header>.*?</header>\s*", re.S)
NAV_RE = re.compile(r"<nav>.*?</nav>\s*", re.S)
SIDEBAR_RE = re.compile(r"<aside class=\"sidebar\">.*?</aside>\s*", re.S)
FOOTER_RE = re.compile(r"<footer>.*?</footer>\s*<script src=\"js/main\.js\" defer></script>\s*", re.S)

EXCLUDE = {
    "404.html",
}

ALBUMS_PLACEHOLDER = "                    <!-- INCLUDE_ALBUMS_YEARS -->"
MUSIC_PLACEHOLDER = "                    <!-- INCLUDE_MUSIC_YEARS -->"


def nav_target_for(page_name: str) -> str:
    page_name = page_name.lower()

    if page_name == "index.html":
        return "home"
    if page_name.startswith("music") or page_name.startswith("albums"):
        return "music"
    if page_name.startswith("creation"):
        return "creations"
    if page_name == "links.html":
        return "links"
    if page_name == "aboutme.html":
        return "about"
    if page_name == "contact.html":
        return "contact"

    return "none"


def cleanup_content(content: str, page_name: str) -> str:
    page_name = page_name.lower()

    if page_name.startswith("albums"):
        year_block = render_album_years(page_name)
        content = re.sub(
            r"\s*" + re.escape(year_block),
            ALBUMS_PLACEHOLDER,
            content,
            count=1,
        )

    if page_name.startswith("music"):
        year_block = render_music_years(page_name)
        content = re.sub(
            r"\s*" + re.escape(year_block),
            MUSIC_PLACEHOLDER,
            content,
            count=1,
        )

    content = HEADER_RE.sub("<!-- INCLUDE_HEADER -->\n", content, count=1)
    content = NAV_RE.sub(
        f"<!-- INCLUDE_NAV: {nav_target_for(page_name)} -->\n",
        content,
        count=1,
    )
    content = SIDEBAR_RE.sub("<!-- INCLUDE_SIDEBAR -->\n", content, count=1)
    content = FOOTER_RE.sub("<!-- INCLUDE_FOOTER -->\n", content, count=1)
    return content


def iter_generated_html():
    for path in ROOT_DIR.rglob("*.html"):
        if path.name in EXCLUDE:
            continue
        try:
            relative = path.relative_to(ROOT_DIR)
        except ValueError:
            continue
        if relative.parts and relative.parts[0] in {"src", "components"}:
            continue
        yield path


def main() -> None:
    SRC_DIR.mkdir(exist_ok=True)

    generated_files = list(iter_generated_html())
    for html_file in generated_files:
        content = html_file.read_text(encoding="utf-8")
        cleaned = cleanup_content(content, html_file.name)

        target = SRC_DIR / html_file.relative_to(ROOT_DIR)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(cleaned, encoding="utf-8")

        html_file.unlink()
        print(f"Created: {target}")

    print("Finished. Source files recreated in /src")


if __name__ == "__main__":
    main()
