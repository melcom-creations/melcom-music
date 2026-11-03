# melcom - Music & Creations

A complete static website for [www.melcom-music.de](https://www.melcom-music.de/), prepared for the [melcom-creations/melcom-music](https://github.com/melcom-creations/melcom-music) repository and GitHub Pages.

The website includes 51 released tracks, three upcoming releases, nine albums, the complete project pages, production notes, artwork, original download destinations, news, personal background and selected links.

## Publish the supplied files

The HTML files and assets in this package are already generated. Extract the archive and put its **contents directly in the repository root**, beside `CNAME` and `index.html`. No build or dependency installation is required to publish these files.

Keep `CNAME` with the exact content `www.melcom-music.de`. Keep `.nojekyll` in the repository root as well. Canonical URLs, social images, robots.txt and the sitemap use `https://www.melcom-music.de`.

For the repository's existing Pages configuration, preserve the current publishing source. If the site is published from the `main` branch and its root folder, the supplied layout matches that configuration.

The site runs as plain HTML, CSS and JavaScript. There is no ChatGPT sign-in or dependency on Sites hosting. External music and download links retain their existing destinations. YouTube videos are loaded only when a visitor chooses a play button. Statcounter uses the original website's project for visitor statistics. The analytics notice follows the browser language (German or US English), and its OK button remembers dismissal for 365 days using the original cookie.

## Edit and rebuild

The build script requires Python 3.9 or newer and lxml. Install the build dependency once:

```sh
python -m pip install -r requirements.txt
```

Then regenerate the HTML and music catalog:

```sh
python build.py
```

| Path | Purpose |
| --- | --- |
| `content/` | Original page texts, production details, track lists, credits and links used as build inputs |
| `build.py` | Generates the redesigned pages and music catalog directly in the repository root; includes the homepage composition |
| `link_policy.py` | Opens off-site web links in a new tab with `noopener noreferrer` and keeps internal links in the current tab |
| `assets/site.css` | Responsive layouts, typography and visual design |
| `assets/common-links.css` | Shared colors for external and internal text links, plus consistent category navigation controls |
| `assets/site.js` | Search, filters, list/grid controls, galleries and click-to-load video players |
| `assets/info-banner.css` and `assets/info-banner.js` | Bilingual analytics notice, original dismissal cookie and Statcounter integration |
| `assets/catalog.js` | Generated catalog used by the browser |
| `images/` | Original artwork, project screenshots, banners and profile images |
| `fonts/` | Locally hosted Lato font files and their license |
| `CNAME` | Custom GitHub Pages domain |
| `.nojekyll` | Publishes the already generated static files without Jekyll processing |

Generated pages retain their existing filenames and release anchors. The two historical redirect routes are included as landing pages pointing to their current destinations. Upcoming tracks remain hidden in the music library until a visitor enables them.

`cleanup.py` is now a harmless compatibility notice. The former reverse-cleanup workflow is no longer used. The previous `src/`, `components/`, `css/` and `js/` directories are not inputs to the new build. Keep any old version in Git history or a separate backup if you want to preserve that workflow.

## Content and license

Copyright 2014 - 2026 melcom, Andreas Thomas Urban.

The music remains licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/). Other source files, software projects, images and third-party assets may have their own terms. The bundled font license is in `fonts/OFL.txt`.
