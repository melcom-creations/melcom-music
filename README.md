# melcom - Music and Creations

This repository contains the source and generated files for the official website of melcom, a demoscene musician and hobby developer from Germany.

Visit the website: [www.melcom-music.de](https://www.melcom-music.de/)

## About the website

The website brings together:

- Tracker modules and MP3 releases
- Music disks and albums
- Stories and production details behind the music
- Audio tools, software projects, and samples
- GOG Galaxy community integrations
- News, personal background, and selected links

The design is built around a dark, accessible interface that keeps the focus on the music, artwork, and creative projects.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/` | Source HTML templates and page content |
| `components/` | Shared header, navigation, sidebar, footer, and year navigation components |
| `css/` | Modular stylesheet sources and the generated `site.css` bundle |
| `js/` | Site-wide JavaScript for navigation, lightboxes, expandable sections, and other interactions |
| `images/` | Artwork, screenshots, logos, icons, and other visual assets |
| `fonts/` | Locally hosted web fonts |
| `build.py` | Builds the deployable website from the source templates |
| `cleanup.py` | Recreates source templates from generated pages and removes the generated root HTML files |

The HTML files in the repository root are generated deployment files. Content changes should normally be made in `src/` or in the shared files under `components/`.

## Building the website

The build scripts use only the Python standard library and require Python 3.9 or newer.

From the repository root, run:

```powershell
python build.py
```

The build process:

1. Combines the modular CSS files into `css/site.css`.
2. Expands the shared component placeholders in every source page.
3. Adds page metadata, canonical URLs, and social sharing metadata.
4. Writes the generated HTML pages to the repository root.
5. Rebuilds `sitemap.xml`.

After the build finishes, open `index.html` in a browser for a local check.

## Recreating the source templates

`cleanup.py` is a maintenance tool, not a normal build cleanup command. It transfers the generated root HTML pages back into `src/`, restores their component placeholders, and then deletes those generated HTML files from the repository root.

Use it only when you intentionally want to transfer changes from generated pages back into the source templates:

```powershell
python cleanup.py
```

Create a backup or commit your current work before running it.

## HTML and accessibility

The generated pages are maintained as valid HTML5 and can be checked with the [Nu HTML Checker](https://validator.w3.org/nu/?doc=https://www.melcom-music.de).

The interface includes responsive layouts, keyboard focus states, descriptive link and image text, accessible navigation states, and reduced-motion support where appropriate.

## Deployment

The generated files in the repository root are published through GitHub Pages. The public website uses the custom domain:

[https://www.melcom-music.de/](https://www.melcom-music.de/)

## Content and license

Copyright 2014 - 2026 melcom, Andreas Thomas Urban.

The music published on the website is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Other source files, software projects, images, and third-party assets may have their own terms. See the website pages and linked project repositories for details.

## Contact

Questions, feedback, or collaboration ideas are welcome through the [contact page](https://www.melcom-music.de/contact.html).
