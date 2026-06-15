from __future__ import annotations

import re
from pathlib import Path

ROOT_DIR = Path(".")
SRC_DIR = ROOT_DIR / "src"

HEADER_RE = re.compile(r"<header>.*?</header>\s*", re.S)
NAV_RE = re.compile(r"<nav>.*?</nav>\s*", re.S)
SIDEBAR_RE = re.compile(r"<aside class=\"sidebar\">.*?</aside>\s*", re.S)
FOOTER_RE = re.compile(r"<footer>.*?</footer>\s*<script src=\"js/main\.js\" defer></script>\s*", re.S)

EXCLUDE = {
    "404.html",
}

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
    content = HEADER_RE.sub("<!-- INCLUDE_HEADER -->\n", content, count=1)
    content = NAV_RE.sub(
        f"<!-- INCLUDE_NAV: {nav_target_for(page_name)} -->\n",
        content,
        count=1,
    )
    content = SIDEBAR_RE.sub("<!-- INCLUDE_SIDEBAR -->\n", content, count=1)
    content = FOOTER_RE.sub("<!-- INCLUDE_FOOTER -->\n", content, count=1)
    return content

def iter_root_html():
    for path in ROOT_DIR.glob("*.html"):
        if path.name in EXCLUDE:
            continue
        yield path

def main():
    SRC_DIR.mkdir(exist_ok=True)

    for html_file in iter_root_html():
        content = html_file.read_text(encoding="utf-8")

        cleaned = cleanup_content(content, html_file.name)

        target = SRC_DIR / html_file.name
        target.write_text(cleaned, encoding="utf-8")

        print(f"Created: {target}")

    print("Finished. Source files recreated in /src")

if __name__ == "__main__":
    main()
