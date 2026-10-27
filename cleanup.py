from __future__ import annotations

import argparse
import os
import re
import stat
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from build import (
    GENERATED_META_RE,
    add_page_metadata,
    expand_includes,
    render_album_years,
    render_music_years,
)

ROOT_DIR = Path(__file__).resolve().parent
SRC_DIR = ROOT_DIR / "src"
COMPONENTS_DIR = ROOT_DIR / "components"

HEADER_RE = re.compile(r"<header>.*?</header>(?:[ \t]*\r?\n)+([ \t]*)(?=\S)", re.S)
NAV_RE = re.compile(r"<nav\b[^>]*>.*?</nav>(?:[ \t]*\r?\n)+([ \t]*)(?=\S)", re.S)
SIDEBAR_RE = re.compile(r"<aside class=\"sidebar\">.*?</aside>(?:[ \t]*\r?\n)+([ \t]*)(?=\S)", re.S)
FOOTER_RE = re.compile(r"<footer>.*?<script src=\"js/main\.js\" defer></script>\s*", re.S)

EXCLUDE = {
    "404.html",
}
EXCLUDED_DIRS = {
    "src", "components", "css", "js", "images", "fonts",
    "__pycache__", "node_modules", "venv", "env",
    "backup", "backups", "_backup", "_backups", "old",
    "archive", "archives", "aussortiert",
}
BACKUP_DIR_NAME = ".cleanup-backups"

ALBUMS_PLACEHOLDER = "                    <!-- INCLUDE_ALBUMS_YEARS -->"
MUSIC_PLACEHOLDER = "                    <!-- INCLUDE_MUSIC_YEARS -->"


@dataclass(frozen=True)
class CleanupItem:
    generated_path: Path
    source_path: Path
    generated_bytes: bytes
    source_bytes: Optional[bytes]
    replacement_bytes: Optional[bytes]
    conflict: bool


def is_link_or_junction(path: Path) -> bool:
    attributes = getattr(path.lstat(), "st_file_attributes", 0)
    reparse_flag = getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0)
    return path.is_symlink() or bool(attributes & reparse_flag)


def check_local_path(path: Path) -> None:
    current = ROOT_DIR
    for part in path.relative_to(ROOT_DIR).parts:
        current = current / part
        if (current.exists() or current.is_symlink()) and is_link_or_junction(current):
            raise ValueError(f"Refusing a linked path: {current}")


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

    content = HEADER_RE.sub(r"<!-- INCLUDE_HEADER -->\n\1", content, count=1)
    content = NAV_RE.sub(
        f"<!-- INCLUDE_NAV: {nav_target_for(page_name)} -->\n\\1",
        content,
        count=1,
    )
    content = SIDEBAR_RE.sub(r"<!-- INCLUDE_SIDEBAR -->\n\1", content, count=1)
    content = FOOTER_RE.sub("<!-- INCLUDE_FOOTER -->\n", content, count=1)
    content = GENERATED_META_RE.sub("", content)
    content = content.replace("css/site.css", "css/style.css")
    return content


def iter_generated_html():
    def walk_error(error):
        raise error

    def excluded_directory(name):
        return (
            name.startswith(".")
            or name.casefold() in EXCLUDED_DIRS
            or re.match(r"_?backups?(?:[-_ .]|$)", name, re.I) is not None
        )

    for directory, subdirectories, filenames in os.walk(
        ROOT_DIR, topdown=True, onerror=walk_error, followlinks=False
    ):
        directory = Path(directory)
        subdirectories[:] = sorted(
            name for name in subdirectories
            if not excluded_directory(name)
            and not is_link_or_junction(directory / name)
        )
        for name in sorted(filenames):
            path = directory / name
            if (
                name.startswith(".")
                or name.casefold() in EXCLUDE
                or path.suffix.casefold() != ".html"
                or is_link_or_junction(path)
                or not path.is_file()
            ):
                continue
            yield path


def prepare_cleanup() -> list[CleanupItem]:
    items = []
    for html_file in iter_generated_html():
        relative = html_file.relative_to(ROOT_DIR)
        target = SRC_DIR / relative
        check_local_path(html_file)
        check_local_path(target)
        if target.exists() and not target.is_file():
            raise ValueError(f"Source target is not a file: {target}")

        generated_bytes = html_file.read_bytes()
        content = generated_bytes.decode("utf-8").replace("\r\n", "\n")
        source_bytes = target.read_bytes() if target.exists() else None
        conflict = False
        if source_bytes is not None:
            source_content = source_bytes.decode("utf-8").replace("\r\n", "\n")
            expected = expand_includes(source_content, html_file.name)
            expected = add_page_metadata(expected, relative)
            expected = expected.replace("css/style.css", "css/site.css")
            conflict = expected != content

        replacement = None
        if source_bytes is None or conflict:
            replacement = cleanup_content(content, html_file.name).encode("utf-8")
        items.append(
            CleanupItem(
                html_file, target, generated_bytes, source_bytes, replacement, conflict
            )
        )
    return items


def check_snapshot(item: CleanupItem) -> None:
    check_local_path(item.generated_path)
    check_local_path(item.source_path)
    if item.generated_path.read_bytes() != item.generated_bytes:
        raise RuntimeError(f"Generated page changed during cleanup: {item.generated_path}")
    current = item.source_path.read_bytes() if item.source_path.exists() else None
    if current != item.source_bytes:
        raise RuntimeError(f"Source changed during cleanup: {item.source_path}")


def create_backup(items: list[CleanupItem]) -> Path:
    backup_root = ROOT_DIR / BACKUP_DIR_NAME
    check_local_path(backup_root)
    backup_root.mkdir(exist_ok=True)
    prefix = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ-")
    backup = Path(tempfile.mkdtemp(prefix=prefix, dir=backup_root))
    for item in items:
        snapshots = [(item.generated_path, item.generated_bytes)]
        if item.source_bytes is not None:
            snapshots.append((item.source_path, item.source_bytes))
        for original, data in snapshots:
            destination = backup / original.relative_to(ROOT_DIR)
            destination.parent.mkdir(parents=True, exist_ok=True)
            with destination.open("xb") as handle:
                handle.write(data)
            if destination.read_bytes() != data:
                raise OSError(f"Backup verification failed: {destination}")
    return backup


def write_source(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=path.parent, prefix=".cleanup-", suffix=".tmp", delete=False
        ) as handle:
            temporary_path = Path(handle.name)
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_path, path)
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()


def main(argv=None) -> None:
    parser = argparse.ArgumentParser(
        description="Recreate source templates safely and remove generated HTML pages."
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Check and list changes without writing files."
    )
    parser.add_argument(
        "--overwrite-existing", action="store_true",
        help="Explicitly import differing generated pages after backing up both versions.",
    )
    args = parser.parse_args(argv)

    if Path.cwd().resolve() != ROOT_DIR.resolve():
        raise SystemExit(f"Run cleanup.py from the project directory: {ROOT_DIR}")
    if args.dry_run:
        print("Dry run: no files will be written or deleted.")

    try:
        if not COMPONENTS_DIR.is_dir():
            raise ValueError(f"Components directory not found: {COMPONENTS_DIR}")
        check_local_path(SRC_DIR)
        items = prepare_cleanup()
    except (OSError, UnicodeError, ValueError, KeyError) as error:
        raise SystemExit(
            f"Cleanup stopped before changing any files: {error}"
        ) from error
    conflicts = [item for item in items if item.conflict]
    if conflicts and not args.overwrite_existing:
        names = "\n".join(
            f"  {item.source_path.relative_to(ROOT_DIR)}" for item in conflicts
        )
        raise SystemExit(
            "Cleanup stopped before changing any files. Generated pages differ from "
            f"the current source templates:\n{names}\n"
            "Keep your source edits and run build.py yourself first, or review both "
            "versions and explicitly use --overwrite-existing to import generated pages."
        )
    if not items:
        print("No generated HTML pages found. Nothing changed.")
        return
    if args.dry_run:
        for item in items:
            action = "Import" if item.replacement_bytes is not None else "Keep source"
            print(f"{action}: {item.source_path.relative_to(ROOT_DIR)}")
        print(f"Would back up {len(items)} generated pages, then remove them.")
        return

    backup = None
    try:
        for item in items:
            check_snapshot(item)
        backup = create_backup(items)
        print(f"Backup: {backup}")
        for item in items:
            check_snapshot(item)
        for item in items:
            check_snapshot(item)
            if item.replacement_bytes is not None:
                write_source(item.source_path, item.replacement_bytes)
                print(f"Created: {item.source_path}")
            else:
                print(f"Kept unchanged: {item.source_path}")

        # Do not remove generated pages until every source file is ready.
        for item in items:
            check_local_path(item.generated_path)
            check_local_path(item.source_path)
            if item.generated_path.read_bytes() != item.generated_bytes:
                raise RuntimeError(f"Generated page changed: {item.generated_path}")
            expected = item.replacement_bytes
            if expected is None:
                expected = item.source_bytes
            if item.source_path.read_bytes() != expected:
                raise RuntimeError(f"Source changed: {item.source_path}")
            item.generated_path.unlink()
        print(f"Finished. {len(items)} generated pages removed; sources are in /src.")
    except (OSError, RuntimeError, ValueError) as error:
        recovery = f" Recovery copies: {backup}" if backup is not None else ""
        raise SystemExit(f"Cleanup stopped: {error}.{recovery}") from error


if __name__ == "__main__":
    main()
