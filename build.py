from __future__ import annotations

import re
from html import escape, unescape
from pathlib import Path

ROOT_DIR = Path(".")
SRC_DIR = ROOT_DIR / "src"
COMPONENTS_DIR = ROOT_DIR / "components"

PLACEHOLDER_RE = re.compile(r"<!--\s*INCLUDE_([A-Z0-9_-]+)(?::\s*([A-Za-z0-9_-]+))?\s*-->")
NAV_ACTIVE_RE = re.compile(r"\[ACTIVE_([A-Z0-9_-]+)\]")

MUSIC_YEAR_GROUPS = (
    ("2026", "2025", "2024", "2023", "2022", "2021"),
    ("2020", "2019", "2018", "2017", "2016", "2015", "2014"),
)
MUSIC_YEAR_SEQUENCE = tuple(year for group in MUSIC_YEAR_GROUPS for year in group)
MUSIC_YEAR_SET = set(MUSIC_YEAR_SEQUENCE)

ALBUM_YEAR_SEQUENCE = ("2025", "2020", "2016", "1999", "1998", "1997")
ALBUM_YEAR_SET = set(ALBUM_YEAR_SEQUENCE)

SITE_URL = "https://www.melcom-music.de"
SOCIAL_IMAGE_URL = f"{SITE_URL}/images/header/header-image07.png"
REDIRECT_PATHS = {
    Path("2022/05/melcoms-chiptune-archive-now-on-sceneorg.html"),
    Path("p/my-samples.html"),
}
CSS_PARTS = (
    "base.css",
    "layout.css",
    "navigation.css",
    "content.css",
    "music.css",
    "components.css",
    "responsive.css",
    "refinements.css",
)
GENERATED_META_RE = re.compile(
    r"\s*<!-- GENERATED_META_START -->.*?<!-- GENERATED_META_END -->",
    re.S,
)


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


def page_description(relative_path: Path) -> str:
    name = relative_path.name.lower()

    descriptions = {
        "index.html": "Music, tracker modules, albums and creative software by demoscene musician melcom. Listen, download and explore the stories behind the projects.",
        "aboutme.html": "Meet melcom, also known as Andreas Thomas Urban, and discover the aliases, music tools, hardware and software behind his demoscene creations.",
        "albums.html": "Explore melcom's music disks and albums, available as tracker modules and MP3 collections with artwork, release details and download links.",
        "contact.html": "Contact melcom through email, social media and music platforms for questions, feedback, collaboration and information about his creative work.",
        "creations.html": "Discover melcom's software, audio tools, samples and community projects, including the FFmpeg Audio Normalizer and GOG Galaxy integrations.",
        "imprint.html": "Legal notice, contact details, privacy information and disclaimers for melcom's official music, software and demoscene website.",
        "links.html": "Browse melcom's curated links to demoscene communities, music platforms, trackers, audio tools, artists and useful creative resources.",
        "music.html": "Browse melcom's complete tracker module and MP3 archive by year, with track stories, cover art, streaming options and free downloads.",
        "music-old.html": "Explore older tracker modules and MP3 releases by melcom, including early demoscene music, production details and download links.",
        "news-archive.html": "Read older news from melcom about music releases, albums, demoscene projects, software updates and creative milestones.",
    }

    if name in descriptions:
        return descriptions[name]

    music_match = re.fullmatch(r"music-(\d{4})\.html", name)
    if music_match:
        year = music_match.group(1)
        return f"Listen to and download melcom's {year} tracker modules and MP3 releases, with cover art, production details, streaming links and track stories."

    album_match = re.fullmatch(r"albums-(\d{4})\.html", name)
    if album_match:
        year = album_match.group(1)
        return f"Explore melcom's music disks and albums from {year}, with cover artwork, release information, tracker files, MP3 versions and download links."

    return "Music, software and creative projects by demoscene musician melcom."


def add_page_metadata(content: str, relative_path: Path) -> str:
    if relative_path in REDIRECT_PATHS:
        return content

    title_match = re.search(r"<title>(.*?)</title>", content, re.S)
    if not title_match:
        raise ValueError(f"Missing title element in {relative_path}")

    description = page_description(relative_path)
    escaped_description = escape(description, quote=True)
    description_tag = f'<meta name="description" content="{escaped_description}">'
    description_pattern = re.compile(
        r'<meta\b(?=[^>]*\bname\s*=\s*["\']description["\'])[^>]*>',
        re.I,
    )

    if description_pattern.search(content):
        content = description_pattern.sub(description_tag, content, count=1)
    else:
        content = content.replace(title_match.group(0), f"{title_match.group(0)}\n\t{description_tag}", 1)

    content = GENERATED_META_RE.sub("", content)
    title_text = escape(unescape(title_match.group(1)).strip(), quote=True)
    relative_url = relative_path.as_posix()
    canonical_url = f"{SITE_URL}/" if relative_url == "index.html" else f"{SITE_URL}/{relative_url}"
    metadata = (
        "\n\t<!-- GENERATED_META_START -->\n"
        f'\t<link rel="canonical" href="{canonical_url}">\n'
        '\t<meta property="og:type" content="website">\n'
        f'\t<meta property="og:title" content="{title_text}">\n'
        f'\t<meta property="og:description" content="{escaped_description}">\n'
        f'\t<meta property="og:url" content="{canonical_url}">\n'
        f'\t<meta property="og:image" content="{SOCIAL_IMAGE_URL}">\n'
        '\t<meta property="og:image:width" content="1130">\n'
        '\t<meta property="og:image:height" content="200">\n'
        '\t<meta name="twitter:card" content="summary_large_image">\n'
        "\t<!-- GENERATED_META_END -->"
    )

    description_position = content.find(description_tag) + len(description_tag)
    return content[:description_position] + metadata + content[description_position:]


def build_stylesheet() -> None:
    css_dir = ROOT_DIR / "css"
    sections = []

    for filename in CSS_PARTS:
        source_path = css_dir / filename
        if not source_path.exists():
            raise FileNotFoundError(f"Missing CSS source: {source_path}")
        sections.append(
            f"/* Source: {filename} */\n{source_path.read_text(encoding='utf-8').strip()}"
        )

    output_path = css_dir / "site.css"
    output_path.write_text("\n\n".join(sections) + "\n", encoding="utf-8")
    print(f"Built {output_path}")


def write_sitemap(source_files: list[Path]) -> None:
    urls = []

    for source_path in source_files:
        relative_path = source_path.relative_to(SRC_DIR)
        if relative_path in REDIRECT_PATHS:
            continue
        relative_url = relative_path.as_posix()
        url = f"{SITE_URL}/" if relative_url == "index.html" else f"{SITE_URL}/{relative_url}"
        urls.append(f"  <url><loc>{escape(url)}</loc></url>")

    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    output_path = ROOT_DIR / "sitemap.xml"
    output_path.write_text(sitemap, encoding="utf-8")
    print(f"Built {output_path}")


def iter_source_files() -> list[Path]:
    return sorted(path for path in SRC_DIR.rglob("*.html") if path.is_file())


def build_file(src_path: Path) -> None:
    page_name = src_path.name
    relative_path = src_path.relative_to(SRC_DIR)
    content = src_path.read_text(encoding="utf-8")
    content = expand_includes(content, page_name)
    content = add_page_metadata(content, relative_path)
    content = content.replace("css/style.css", "css/site.css")

    output_path = ROOT_DIR / relative_path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")
    print(f"Built {output_path}")


def main() -> None:
    if not SRC_DIR.exists():
        raise FileNotFoundError(f"Source directory not found: {SRC_DIR}")
    if not COMPONENTS_DIR.exists():
        raise FileNotFoundError(f"Components directory not found: {COMPONENTS_DIR}")

    print("Rendering site from source templates...")
    source_files = iter_source_files()
    build_stylesheet()
    for src_file in source_files:
        build_file(src_file)
    write_sitemap(source_files)
    print("Build complete.")


if __name__ == "__main__":
    main()
