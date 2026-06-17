from __future__ import annotations

import re
from pathlib import Path

ROOT_DIR = Path(".")
SRC_DIR = ROOT_DIR / "src"
COMPONENTS_DIR = ROOT_DIR / "components"

PLACEHOLDER_RE = re.compile(r"<!--\s*INCLUDE_([A-Z0-9_-]+)(?::\s*([A-Za-z0-9_-]+))?\s*-->")
NAV_ACTIVE_RE = re.compile(r"\[ACTIVE_([A-Z0-9_-]+)\]")

MUSIC_YEAR_GROUPS = (
    ("2025", "2024", "2023", "2022", "2021"),
    ("2020", "2019", "2018", "2017", "2016", "2015", "2014"),
)
MUSIC_YEAR_SEQUENCE = tuple(year for group in MUSIC_YEAR_GROUPS for year in group)
MUSIC_YEAR_SET = set(MUSIC_YEAR_SEQUENCE)

ALBUM_YEAR_SEQUENCE = ("2025", "2020", "2016", "1999", "1998", "1997")
ALBUM_YEAR_SET = set(ALBUM_YEAR_SEQUENCE)


def load_component(name: str) -> str:
    component_path = COMPONENTS_DIR / f"{name}.html"
    if not component_path.exists():
        raise FileNotFoundError(f"Missing component: {component_path}")
    return component_path.read_text(encoding="utf-8")


def nav_active_page(page_name: str) -> str:
    page_name = page_name.lower()
    if page_name == "index.html":
        return "HOME"
    if page_name.startswith("music") or page_name.startswith("albums"):
        return "MUSIC"
    if page_name.startswith("creation"):
        return "CREATIONS"
    if page_name == "links.html":
        return "LINKS"
    if page_name == "aboutme.html":
        return "ABOUT"
    if page_name == "contact.html":
        return "CONTACT"
    return "NONE"


def render_navigation(page_name: str) -> str:
    nav = load_component("nav")
    active_page = nav_active_page(page_name)

    def substitute(match: re.Match[str]) -> str:
        section = match.group(1)
        return "nav-active" if section == active_page else ""

    return NAV_ACTIVE_RE.sub(substitute, nav)


def render_album_years(page_name: str) -> str:
    base = load_component("albums-years")
    page_name = page_name.lower()

    if page_name == "albums.html":
        return base

    active_match = re.fullmatch(r"albums-(\d{4})\.html", page_name)
    active_year = active_match.group(1) if active_match and active_match.group(1) in ALBUM_YEAR_SET else None

    def substitute(match: re.Match[str]) -> str:
        year = match.group(1)
        if year == active_year:
            return f'href="albums.html#{year}" class="nav-active"'
        return f'href="albums-{year}.html"'

    return re.sub(r'href="#(\d{4})"', substitute, base)


def render_music_years(page_name: str) -> str:
    base = load_component("music-years")
    page_name = page_name.lower()

    if page_name == "music.html":
        return base

    if page_name == "music-old.html":
        rendered = re.sub(r'href="#(\d{4})"', lambda match: f'href="music-{match.group(1)}.html"', base)
        return rendered.replace('href="#OlderTracks"', 'href="music-old.html" class="nav-active"')

    active_match = re.fullmatch(r"music-(\d{4})\.html", page_name)
    active_year = active_match.group(1) if active_match and active_match.group(1) in MUSIC_YEAR_SET else "2025"

    def substitute(match: re.Match[str]) -> str:
        year = match.group(1)
        if year == active_year:
            return f'href="music.html#{year}" class="nav-active"'
        return f'href="music-{year}.html"'

    rendered = re.sub(r'href="#(\d{4})"', substitute, base)
    return rendered.replace('href="#OlderTracks"', 'href="music-old.html"')


def render_named_component(name: str, page_name: str) -> str:
    if name == "MUSIC_YEARS":
        return render_music_years(page_name)

    if name == "ALBUMS_YEARS":
        return render_album_years(page_name)

    if name == "NAV":
        return render_navigation(page_name)

    component_map = {
        "HEADER": "header",
        "SIDEBAR": "sidebar",
        "FOOTER": "footer",
        "SOCIAL_MEDIA": "social-media",
        "SIDEBAR_BADGES": "sidebar-badges",
    }

    if name not in component_map:
        raise KeyError(f"Unknown include placeholder: {name}")

    return load_component(component_map[name])


def expand_includes(content: str, page_name: str) -> str:
    previous = None
    while previous != content:
        previous = content
        content = PLACEHOLDER_RE.sub(
            lambda match: render_named_component(match.group(1), page_name),
            content,
        )
    return content


def iter_source_files() -> list[Path]:
    return sorted(path for path in SRC_DIR.rglob("*.html") if path.is_file())


def build_file(src_path: Path) -> None:
    page_name = src_path.name
    content = src_path.read_text(encoding="utf-8")
    content = expand_includes(content, page_name)

    output_path = ROOT_DIR / src_path.relative_to(SRC_DIR)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")
    print(f"Built {output_path}")


def main() -> None:
    if not SRC_DIR.exists():
        raise FileNotFoundError(f"Source directory not found: {SRC_DIR}")
    if not COMPONENTS_DIR.exists():
        raise FileNotFoundError(f"Components directory not found: {COMPONENTS_DIR}")

    print("Rendering site from source templates...")
    for src_file in iter_source_files():
        build_file(src_file)
    print("Build complete.")


if __name__ == "__main__":
    main()
