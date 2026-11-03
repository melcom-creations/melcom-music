"""Build melcom's static music archive from the supplied original content."""
from pathlib import Path
from lxml import html, etree
from html import escape
from urllib.parse import urlparse, parse_qs
from link_policy import apply_link_policy
import json
import re
import copy

ROOT = Path(__file__).resolve().parent
OUT = ROOT
CONTENT = ROOT / 'content'
ORIGIN = 'https://www.melcom-music.de'

def normalize_text(text):
    text = text.translate(str.maketrans({'“':'"','”':'"','„':'"','’':"'",'–':'-','—':'-','\u00a0':' '}))
    text = re.sub('[\U0001F000-\U0001FAFF\u2300-\u23ff\u2600-\u27ff\ufe0f]', '', text)
    return text

def clean(text):
    text = normalize_text(text)
    return re.sub(r'\s+', ' ', text).strip()

def doc(name):
    return html.fromstring((CONTENT / name).read_bytes())

def inner(node):
    return (escape(node.text or '') + ''.join(html.tostring(x, encoding='unicode') for x in node))

def has_class(cls):
    return 'contains(concat(" ", normalize-space(@class), " "), " '+cls+' ")'

catalog = []
for pattern, kind in [('music-*.html','track'), ('albums-*.html','album')]:
    for path in sorted(CONTENT.glob(pattern), reverse=True):
        d = doc(path.name)
        for item in d.xpath('//main/*['+has_class('content-box')+']'):
            covers = item.xpath('.//a['+has_class('info-actions-cover')+']//img')
            if not covers:
                continue
            title = clean(item.xpath('string(.//h2[1])'))
            year = path.stem.split('-')[1]
            story = item.xpath('.//*['+has_class('info-story')+']//p')
            summary = clean(' '.join(story[0].itertext())) if story else ''
            providers = [{'name':clean(a.text_content()), 'url':a.get('href'),
                'group':clean(a.getparent().getparent().xpath('string(.//*['+has_class('action-group-label')+'])'))}
                for a in item.xpath('.//a['+has_class('action-link')+']')]
            yt = next((x['url'] for x in providers if 'youtube.com/watch' in x['url']), '')
            yt = parse_qs(urlparse(yt).query).get('v',[''])[0]
            length = next((clean(td.text_content()).split('Length:')[-1].strip() for td in item.xpath('.//td') if 'Length:' in td.text_content()), '')
            formats = clean(' / '.join(item.xpath('.//th/text()'))).replace(' Download','')
            catalog.append({'id':item.get('id'), 'title':title, 'year':year, 'kind':kind,
                'href':path.name+'#'+item.get('id'), 'cover':covers[0].get('src'),
                'summary':summary, 'providers':providers, 'video':yt, 'length':length,
                'formats':formats, 'upcoming':year=='2026'})

catalog.sort(key=lambda x: (x['year'] if x['year'].isdigit() else '0000'), reverse=True)
tracks = [x for x in catalog if x['kind']=='track']
albums = [x for x in catalog if x['kind']=='album']
released = [x for x in tracks if not x['upcoming']]
by_id = {x['id']:x for x in catalog}

ICONS = {
 'arrow':'<path d="M5 12h14M13 6l6 6-6 6"/>',
 'external':'<path d="M8 5H5v14h14v-3M12 5h7v7M19 5 9 15"/>',
 'play':'<path d="m9 5 11 7-11 7z"/>',
 'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
 'close':'<path d="m6 6 12 12M6 18 18 6"/>',
 'grid':'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
 'list':'<path d="M8 6h12M8 12h12M8 18h12M3 6h1M3 12h1M3 18h1"/>',
 'shuffle':'<path d="m17 3 4 4-4 4M3 17l5-1 8-9h5M17 13l4 4-4 4M3 7l5 1 2 3M14 15l2 2h5"/>',
 'chevron':'<path d="m9 5 7 7-7 7"/>',
 'sound':'<path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 10v4"/>',
 'mail':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
}

def icon(name, cls=''):
    return f'<svg class="icon {cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'

def brand():
    return f'<a class="brand" href="index.html" aria-label="melcom home">{icon("sound")}<span>melcom<span class="brand-dot">.</span></span></a>'

def header(active):
    nav = [('index.html','Discover','home'),('music.html','Music','music'),('albums.html','Albums','albums'),('creations.html','Creations','creations'),('aboutme.html','About','about'),('links.html','Links','links')]
    links = ''.join(f'<a href="{url}"'+(' aria-current="page"' if active==key else '')+f'>{label}</a>' for url,label,key in nav)
    return f'''<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header"><div class="header-inner">{brand()}<button class="menu-toggle icon-button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-nav">{icon('menu')}</button><nav id="site-nav" class="site-nav" aria-label="Main navigation">{links}</nav><a class="contact-link" href="contact.html">Let's talk {icon('external')}</a></div></header>'''

SOCIALS = [('Bandcamp','https://melcom.bandcamp.com'),('SoundCloud','https://soundcloud.com/melcom'),('Spotify','https://open.spotify.com/artist/5UIgac40dS3OEC0FGHDxRw'),('YouTube','https://youtube.com/@melcom'),('Bluesky','https://bsky.app/profile/melcom-music.bsky.social'),('GitHub','https://github.com/melcom-creations')]
FOOTER_SOCIALS = dict(SOCIALS + [
    ('Linktree', 'https://linktr.ee/melcom'),
    ('Mastodon', 'https://mastodon.social/@melcom'),
    ('W Social', 'https://wsocial.eu/profile/melcom.wsocial.eu'),
])
FOOTER_SOCIAL_GROUPS = [
    ('Music', ['Bandcamp', 'SoundCloud', 'Spotify', 'YouTube']),
    ('Social', ['Bluesky', 'Mastodon', 'W Social']),
    ('Profiles', ['GitHub', 'Linktree']),
]

def socials(platforms=SOCIALS):
    return ''.join(f'<a href="{url}" target="_blank" rel="noopener noreferrer">{name} {icon("external")}</a>' for name,url in platforms)

def footer_socials():
    return ''.join(
        f'<div class="footer-social-group"><h3>{title}</h3>'
        + socials([(name, FOOTER_SOCIALS[name]) for name in names]) + '</div>'
        for title, names in FOOTER_SOCIAL_GROUPS
    )

def footer():
    return f'''<section class="closing-strip wrap"><div><span class="eyebrow">A NOTE, A QUESTION, A HELLO</span><h2>Good things start<br>with a conversation<span class="lime">.</span></h2></div><a class="button button-outline" href="contact.html">Get in touch {icon('arrow')}</a></section>
<footer class="site-footer"><div class="wrap">
<div class="footer-top">
<div>{brand()}<p>Electronic music. Creative tools.<br>A little piece of the Demoscene.</p></div>
<div class="footer-socials">{footer_socials()}</div>
<nav class="footer-pages" aria-label="Footer navigation"><a href="news-archive.html">News & archive</a><a href="imprint.html">Imprint & disclaimer</a></nav>
</div>
<div class="footer-bottom"><p class="footer-copyright">© 2014 - 2026 melcom · Andreas Thomas Urban</p><p class="footer-license">The music on this website is licensed under a<br><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.</p></div>
</div></footer>'''

def back_to_top():
    return '<button type="button" id="myBtn" title="Go to top" aria-label="Back to top" hidden><img src="images/melcom-puzzle-icon.png" alt="" width="48" height="48" aria-hidden="true"></button>'


def dialogs():
    return f'''<dialog id="media-dialog" class="media-dialog" aria-labelledby="media-title"><div class="dialog-heading"><p id="media-title"></p><button class="icon-button" data-close-dialog aria-label="Close player">{icon('close')}</button></div><div id="media-content"></div><p class="player-help">Player unavailable? <a id="media-external" href="https://youtube.com/@melcom" target="_blank" rel="noopener noreferrer">Open on YouTube {icon('external')}</a></p></dialog>
<dialog id="gallery-dialog" class="gallery-dialog" aria-labelledby="gallery-title"><div class="dialog-heading"><p id="gallery-title">Artwork</p><button class="icon-button" data-close-dialog aria-label="Close image viewer">{icon('close')}</button></div><div class="gallery-stage"><button class="gallery-prev icon-button" aria-label="Previous image">←</button><img id="gallery-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt=""><button class="gallery-next icon-button" aria-label="Next image">→</button></div><div id="gallery-thumbnails"></div><p class="gallery-caption" aria-live="polite"></p></dialog>'''

def page(name, title, description, body, active='', cls='', news=False, release=False):
    depth = len(Path(name).parts)-1
    base = '<base href="'+'../'*depth+'">' if depth else ''
    news_assets = '<link rel="stylesheet" href="assets/news.css?v=20261103-small-type"><script defer src="assets/news.js?v=20261103-news"></script>' if news else ''
    release_assets = '<link rel="stylesheet" href="assets/releases.css?v=20261103-info-border">' if release else ''
    creation_assets = '<link rel="stylesheet" href="assets/creations.css?v=20261103-small-type">' if name == 'creations.html' else ''
    reading_assets = '<link rel="stylesheet" href="assets/info-pages.css?v=20261103-small-type">' if name in {'creations.html', 'aboutme.html', 'links.html', 'contact.html', 'imprint.html'} else ''
    links_assets = '<link rel="stylesheet" href="assets/links.css?v=20261103-small-type"><script defer src="assets/links.js?v=20261103-links"></script>' if name == 'links.html' else ''
    content = f'''<!doctype html>
<html lang="en" id="top"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">{base}<title>{escape(title)} - melcom</title><meta name="description" content="{escape(description,quote=True)}"><meta name="theme-color" content="#111411"><link rel="icon" href="images/favicon.ico"><link rel="canonical" href="{ORIGIN}/{name}"><meta property="og:title" content="{escape(title,quote=True)} - melcom"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:image" content="{ORIGIN}/images/singlecovers/track-fernweh-3.jpg"><meta property="og:type" content="website"><link rel="stylesheet" href="assets/site.css?v=20261103-footer-4"><script defer src="assets/catalog.js"></script><script defer src="assets/site.js?v=20261103-top"></script>{news_assets}{release_assets}{creation_assets}{reading_assets}{links_assets}<link rel="stylesheet" href="assets/common-links.css?v=20261103-link-style"></head><body class="{cls}">{header(active)}{body}{footer()}{back_to_top()}{dialogs()}</body></html>'''
    target = OUT / name
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(apply_link_policy(content, ORIGIN + '/' + name), encoding='utf-8')

def track_card(item, small=False):
    e=lambda x:escape(str(x),quote=True)
    title=e(item['title'])
    if item['video']:
        action=f'<button class="art-play" data-video="{e(item["video"])}" data-title="{title}" aria-label="Listen to {title}">{icon("play")}</button>'
    else:
        listen=next((p['url'] for p in item['providers'] if p['group']=='Listen'),item['href'])
        action=f'<a class="art-play" href="{e(listen)}" aria-label="Listen to {title}">{icon("external")}</a>' if not item['upcoming'] else ''
    duration=item['length'] if item['length'] not in ['n/a','TBA',''] else ''
    badge='UPCOMING' if item['upcoming'] else 'ARCHIVE' if item['year']=='old' else item['year']
    return f'''<article class="release-card{' compact' if small else ''}" {'hidden' if item['upcoming'] else ''} data-year="{item['year']}" data-upcoming="{str(item['upcoming']).lower()}" data-search="{e((item['title']+' '+item['summary']).lower())}" data-formats="{e(item['formats'].lower())}"><div class="release-art"><a href="{item['href']}" tabindex="-1" aria-hidden="true"><img src="{item['cover']}" alt="" width="600" height="600" loading="lazy"></a>{action}<span class="art-badge">{badge}</span></div><div class="release-info"><div class="release-type">{'ALBUM / COLLECTION' if item['kind']=='album' else 'SINGLE / '+item['formats'].replace('.','').strip(' /')}<span>{duration}</span></div><h3><a href="{item['href']}">{title}</a></h3><p>{e(item['summary'][:130])}{'...' if len(item['summary'])>130 else ''}</p><a class="release-details" href="{item['href']}">{'Explore album' if item['kind']=='album' else 'Track story & downloads'} {icon('arrow')}</a></div></article>'''

def section_head(kicker,title,url='',link='View all'):
    return f'<div class="section-heading"><div><span class="eyebrow">{kicker}</span><h2>{title}</h2></div>'+ (f'<a class="text-link" href="{url}">{link} {icon("arrow")}</a>' if url else '')+'</div>'

def library_page(kind):
    is_album=kind=='album'
    items=albums if is_album else tracks
    title='Albums & collections' if is_album else 'Find your next world.'
    description='Music disks, soundtracks and complete collections. From the 1990s to the present.' if is_album else 'Electronic stories, tracker modules and sounds from somewhere else. Listen, explore, download.'
    years=sorted({x['year'] for x in items if x['year'].isdigit() and x['year']!='2026'}, reverse=True)
    if any(x['year']=='old' for x in items): years.append('old')
    filters=('' if is_album else '<option value="2026" id="upcoming-year-option" hidden disabled>2026 (upcoming)</option>')+''.join(f'<option value="{x}">{"Older tracks" if x=="old" else x}</option>' for x in years)
    upcoming='' if is_album else '<label class="upcoming-control"><input id="include-upcoming" type="checkbox"> Include upcoming releases <span class="count-pill">3</span></label>'
    cards=''.join(track_card(x) for x in items)
    body=f'''<main id="main-content" class="wrap library-page"><div class="page-intro"><span class="eyebrow">{'THE LONG PLAY' if is_album else 'THE MUSIC ARCHIVE'}</span><h1>{title}</h1><p>{description}</p></div><div class="library-tabs"><a href="music.html" {'aria-current="page"' if not is_album else ''}>Singles & modules <span>{len(released)}</span></a><a href="albums.html" {'aria-current="page"' if is_album else ''}>Albums & music disks <span>{len(albums)}</span></a></div><div class="library-controls"><label class="search-field">{icon('search')}<span class="visually-hidden">Search {'albums' if is_album else 'tracks'}</span><input id="music-search" type="search" placeholder="Search by title or story..."></label><label class="select-field"><span class="visually-hidden">Filter by year</span><select id="year-filter" aria-label="Filter by year"><option value="all">All years</option>{filters}</select></label><label class="select-field"><span class="visually-hidden">Filter by format</span><select id="format-filter" aria-label="Filter by format"><option value="all">All formats</option><option value="mp3">MP3</option><option value="it">Impulse Tracker</option><option value="s3m">Scream Tracker</option></select></label><div class="view-buttons"><button class="icon-button active" data-view="grid" aria-label="Grid view" aria-pressed="true">{icon('grid')}</button><button class="icon-button" data-view="list" aria-label="List view" aria-pressed="false">{icon('list')}</button></div></div><div class="library-meta"><p id="results-count" role="status">{len(items) if is_album else len(released)} {'albums' if is_album else 'released tracks'}</p>{upcoming}</div><section class="release-grid library-grid" id="catalog-grid" aria-labelledby="catalog-heading"><h2 id="catalog-heading" class="visually-hidden">{'Albums' if is_album else 'Tracks'}</h2>{cards}</section><div class="empty-state" id="empty-state" hidden><h2>No matches this time.</h2><p>Try another title, year or format.</p><button class="button button-outline" data-reset-filters>Reset filters {icon('arrow')}</button></div><p class="archive-note">{'Complete track lists, background stories and original download links are included with every album.' if is_album else 'Original tracker files and MP3 downloads are linked on the track pages. All music is shared under CC BY-NC-SA 4.0.'}</p></main>'''
    if not is_album:
        source=doc('music.html')
        notes=source.xpath('//p[contains(., "I don\'t want to offer any more old titles here.") or contains(.,"In 2020, I also released")]')
        archive='<section class="deep-archive"><span class="eyebrow">FURTHER BACK IN TIME</span><h2>There is more in the archives.</h2>'+''.join(html.tostring(p,encoding='unicode') for p in notes)+'</section>'
        body=body.replace('</main>',archive+'</main>')
    page('albums.html' if is_album else 'music.html',title,description,body,'albums' if is_album else 'music')

library_page('track')
library_page('album')

def layout_release_sections(main):
    """Place artwork beside resources, followed by the release story."""
    for section in main.xpath('./*[' + has_class('content-box') + ']'):
        covers = section.xpath('.//a[' + has_class('info-actions-cover') + ']')
        if not covers:
            continue
        bodies = section.xpath('./*[' + has_class('box-content') + ']')
        specs = section.xpath('.//*[' + has_class('info-specs') + ']')
        if len(covers) != 1 or len(bodies) != 1 or len(specs) != 1:
            raise ValueError(f'Unexpected release layout: {section.get("id")}')
        body, resources, cover = bodies[0], specs[0], covers[0]
        actions = resources.xpath('./*[' + has_class('info-actions') + ']')
        if len(actions) != 1:
            raise ValueError(f'Missing release actions: {section.get("id")}')
        actions = actions[0]
        top = etree.Element('div', {'class': 'release-top'})
        body.insert(body.index(resources), top)
        top.append(cover)
        top.append(resources)
        actions.set('class', 'info-actions')
        metadata = etree.Element('div', {'class': 'release-metadata'})
        for child in list(resources):
            if child is not actions:
                metadata.append(child)
        resources.append(metadata)
        body.set('class', body.get('class', '') + ' release-layout')
        stories = body.xpath('./*[' + has_class('info-story') + ']')
        if not stories and section.get('id') == 'oblivion':
            story = etree.SubElement(body, 'div', {'class': 'info-box info-story'})
            etree.SubElement(story, 'h3').text = 'Track Information'
            etree.SubElement(story, 'p').text = 'Oblivion is part of my 2019 music archive and is available as an Impulse Tracker module and an MP3.'
            stories = [story]
        for story in stories:
            for notes in story.xpath('.//*[' + has_class('production-notes') + ']'):
                story.append(notes)


def layout_creation_sections(main):
    """Arrange the normalizer introduction and accent project support headings."""
    bodies = main.xpath('./*[@id="ffmpeg"]/*[' + has_class('box-content') + ']')
    if len(bodies) != 1:
        raise ValueError('Missing normalizer project content')
    body = bodies[0]
    covers = body.xpath('./*[' + has_class('edition-cover') + ']')
    downloads = body.xpath('./*[' + has_class('action-bar') + ']')
    if len(covers) != 1 or len(downloads) != 1:
        raise ValueError('Missing normalizer artwork or downloads')
    cover = covers[0]
    paragraphs = [child for child in body if child.tag == 'p' and body.index(child) < body.index(cover)]
    overview = etree.Element('div', {'class': 'project-overview'})
    body.insert(0, overview)
    overview.append(cover)
    summary = etree.SubElement(overview, 'div', {'class': 'project-summary'})
    for paragraph in paragraphs:
        summary.append(paragraph)
    summary.append(downloads[0])
    for heading in main.xpath('.//*[' + has_class('project-support') + ']/h3'):
        for marker in heading.xpath('./span[@aria-hidden="true"]'):
            marker.drop_tag()
        etree.SubElement(heading, 'span', {'class': 'support-coffee', 'aria-hidden': 'true'}).text = ' \u2615'


def layout_link_sections(main):
    """Use shared section headings and separate resource names from descriptions."""
    def append_text(parent, text):
        if len(parent):
            parent[-1].tail = (parent[-1].tail or '') + text
        else:
            parent.text = (parent.text or '') + text

    categories = {}
    for section in main.xpath('./section[' + has_class('link-category') + ']'):
        header = section.xpath('./header')[0]
        heading = header.xpath('.//h2')[0]
        description = header.xpath('./p')[0]
        resources = section.xpath('./ul[' + has_class('link-list') + ']')[0]
        title = heading.text or ''
        heading.text = None
        heading.set('class', 'content-box-title')
        anchor = etree.Element('a', {'class': 'permalink', 'href': '#' + section.get('id'), 'aria-label': 'Link to ' + clean(title)})
        anchor.text = '#'
        anchor.tail = ' ' + title
        heading.insert(0, anchor)
        section.insert(0, heading)
        body = etree.SubElement(section, 'div', {'class': 'box-content'})
        description.set('class', 'link-category-description')
        body.append(description)
        body.append(resources)
        section.remove(header)
        section.set('class', 'content-box ' + ' '.join(cls for cls in section.get('class').split() if cls != 'link-box'))
        section.set('tabindex', '-1')
        categories[section.get('id')] = len(resources.xpath('./li'))
        for item in resources.xpath('./li'):
            children = list(item)
            primary = item.xpath('./a')[0]
            name = etree.Element('div', {'class': 'link-entry-title'})
            details = etree.Element('div', {'class': 'link-entry-description'})
            details.text, item.text = item.text, None
            for child in children:
                tail, child.tail = child.tail or '', None
                badge = child.tag == 'span' and child.get('class') in {'new-tag', 'recommended-tag'}
                if child is primary or (badge and not clean(''.join(details.itertext()))):
                    name.append(child)
                    if tail.strip():
                        append_text(details, tail)
                    else:
                        child.tail = tail
                else:
                    details.append(child)
                    child.tail = tail
            item.append(name)
            if clean(''.join(details.itertext())):
                item.append(details)
    for link in main.xpath('.//nav[' + has_class('link-category-nav') + ']/a'):
        count = categories[link.get('href').lstrip('#')]
        label = clean(link.xpath('string(.//strong)'))
        link.set('aria-label', f'{label}, {count} links')
        etree.SubElement(link, 'span', {'class': 'link-category-count', 'aria-hidden': 'true'}).text = str(count)


def layout_page_intro(main):
    """Move the page description below its title within one open introduction."""
    intros = main.xpath('./div[' + has_class('page-intro') + ']')
    descriptions = main.xpath('./div[' + has_class('intro-highlight-box') + ']')
    if len(intros) != 1 or len(descriptions) != 1:
        raise ValueError('Missing page introduction or description')
    intro, description = intros[0], descriptions[0]
    intro.set('class', intro.get('class') + ' open-intro')
    for paragraph in description.xpath('./p'):
        intro.append(paragraph)
    description.getparent().remove(description)


def transform_main(d,name):
    m=copy.deepcopy(d.xpath('//main')[0])
    for script in m.xpath('.//script'):
        script.getparent().remove(script)
    # Preserve all content while replacing the old page-level chrome.
    for node in m.xpath('.//*['+has_class('page-year-dropdown')+']'):
        parent=node.getparent(); parent.remove(node)
    for node in m.iter():
        if not isinstance(node.tag,str): continue
        if node.text: node.text=normalize_text(node.text)
        if node.tail: node.tail=normalize_text(node.tail)
        if node.get('style') and node.get('id')!='imprint-details':
            del node.attrib['style']
        for attr in ['onclick','onerror','onload']:
            node.attrib.pop(attr,None)
        if node.tag=='a' and node.get('target')=='_blank':
            node.set('rel','noopener noreferrer')
        for attr in ['href','src']:
            url=node.get(attr)
            if not url: continue
            if url.startswith('https://www.melcom-music.de/'):
                node.set(attr,url.replace('https://www.melcom-music.de/','',1) or 'index.html')
        if node.tag=='img':
            node.set('loading','lazy');node.set('decoding','async')
    # Retain anchor destinations, but make the self-link a quiet permalink.
    for heading in m.xpath('.//h2['+has_class('content-box-title')+']'):
        for a in heading.xpath('./a'):
            if not clean(a.text_content()):
                a.set('class','permalink');a.set('aria-label','Link to this section');a.text='#'
    year=''
    if name.startswith(('music-','albums-')):
        kind='album' if name.startswith('albums-') else 'track'
        options=sorted({x['year'] for x in catalog if x['kind']==kind and x['year'].isdigit()},reverse=True)
        if kind=='track': options.append('old')
        year='<nav class="year-pills" aria-label="Browse by year"><a href="'+('albums.html' if kind=='album' else 'music.html')+'">All releases</a>'+''.join(f'<a href="{"albums" if kind=="album" else "music"}-{x}.html"'+(' aria-current="page"' if name.endswith('-'+x+'.html') else '')+f'>{"Older" if x=="old" else x}</a>' for x in options)+'</nav>'
    head=m.xpath('./div['+has_class('page-header')+']')
    if head:
        head[0].set('class','page-intro original-intro')
        span=etree.Element('span',{'class':'eyebrow'});span.text='THE ARCHIVE' if year else 'MUSIC / CODE / CURIOSITY';head[0].insert(0,span)
        if year:
            head[0].addnext(html.fromstring(year))
    # Add an inline listening action to released tracks using the supplied video links.
    for item in catalog:
        if not item['href'].startswith(name+'#') or not item['video']: continue
        matches=m.xpath('.//*[@id=$id]',id=item['id'])
        if matches:
            actions=matches[0].xpath('.//*['+has_class('info-actions-content')+']')
            if actions:
                button=html.fromstring(f'<button class="button button-lime inline-listen" data-video="{item["video"]}" data-title="{escape(item["title"],quote=True)}">{icon("play")} Listen here</button>')
                actions[0].insert(1,button)
    if year:
        layout_release_sections(m)
    if name == 'creations.html':
        layout_creation_sections(m)
    if name == 'links.html':
        layout_link_sections(m)
    if name=='aboutme.html':
        gallery='<section class="archive-banners"><span class="eyebrow">A LITTLE OLDSKOOL</span><h2>Signatures from the archive.</h2><p>Different looks. The same melcom.</p><div class="banner-gallery">'+''.join(f'<a class="track-image-link" href="images/header/header-image{x}.png"><img src="images/header/header-image{x}.png" alt="melcom archive banner {i+1}" width="1130" height="200" loading="lazy"></a>' for i,x in enumerate(['16','03','15','14','04','07','12']))+'</div></section>'
        m.append(html.fromstring(gallery))
    if name=='contact.html':
        addresses=m.xpath('.//*['+has_class('contact-addresses')+']//code')
        for node in addresses:
            email=clean(node.text_content()).replace(' ','')
            a=etree.Element('a',href='mailto:'+email);a.text=email
            node.clear();node.append(a)
        all_social='<section class="all-socials"><h2>Find me elsewhere.</h2><div class="social-link-grid">'+socials()
        socialdoc=doc('links.html')
        # Preserve the original social profiles as well as the music destinations.
        more=[('Instagram','https://www.instagram.com/just.melcom/'),('Mastodon','https://mastodon.social/@melcom'),('Pinterest','https://www.pinterest.de/melcom_/'),('Threads','https://www.threads.net/@just.melcom'),('W Social','https://wsocial.eu/profile/melcom.wsocial.eu'),('X / Twitter','https://twitter.com/melcom_'),('Linktree','https://linktr.ee/melcom')]
        all_social+=''.join(f'<a href="{u}" target="_blank" rel="noopener noreferrer">{n} {icon("external")}</a>' for n,u in more)+'</div></section>'
        m.append(html.fromstring(all_social))
    if name=='imprint.html':
        # No legacy visitor-tracking code is carried into the new website.
        cookies=m.xpath('.//*[@id="cookies"]')[0]
        cookies.clear();cookies.set('id','cookies')
        cookies.append(html.fromstring('<div><h2>About this website</h2><p>This version of the website does not use Statcounter or another visitor analytics service. Music and video players connect to YouTube only after you choose to open a player. External links and downloads are provided by their respective services.</p></div>'))
        for p in m.xpath('.//*['+has_class('intro-highlight-box')+']//p'):
            p.text='Legal disclosure, contact information and the original disclaimers regarding this website and external links.'
    if name in {'creations.html', 'aboutme.html', 'links.html', 'contact.html', 'imprint.html'}:
        layout_page_intro(m)
    m.set('class','wrap content-page '+('release-page' if year else name.replace('.html','')+'-page'))
    return html.tostring(m,encoding='unicode')

def news_page(name, archive=False):
    """Use the original news posts within the shared header and footer."""
    source_name = 'news-archive.html' if archive else 'index.html'
    original = doc(source_name)
    main = html.fromstring(transform_main(original, name))
    posts = main.xpath('./*[' + has_class('news-card') + ']')
    if not posts:
        raise ValueError(f'No news posts found in {source_name}')
    if archive:
        kicker = 'From the archive'
        headline = 'News Archive'
        introduction = 'Past releases, project milestones and stories from along the way.'
        heading = 'Archived News'
        title = 'News Archive'
        description = clean(original.xpath('string(//meta[@name="description"]/@content)'))
        related_url, related_label = 'index.html#news-heading', 'Latest News'
    else:
        kicker = 'Welcome to my website' if name == 'index.html' else 'From the workbench'
        headline = 'Music, code & a curious mind.' if name == 'index.html' else 'Notes & new things.'
        introduction = "Electronic music, useful tools and a little Demoscene spirit. Here's what I'm creating, exploring and sharing."
        heading = 'Latest News'
        title = 'Music & Creations' if name == 'index.html' else 'News & updates'
        description = 'Electronic music, demoscene stories and creative software by melcom. Explore free tracks, albums, samples and tools.' if name == 'index.html' else 'New music, software releases and stories from behind the scenes.'
        related_url, related_label = 'news-archive.html', 'News Archive'
    articles = ''.join(html.tostring(post, encoding='unicode') for post in posts)
    related = f'<a class="text-link" href="{related_url}">{related_label} {icon("arrow")}</a>'
    body = f'''<main id="main-content" class="wrap content-page news-overview">
<div class="news-intro"><span class="eyebrow">{escape(kicker)}</span><h1>{escape(headline)}</h1><p>{escape(introduction)}</p></div>
<section class="news-feed" aria-labelledby="news-heading">
<div class="news-feed-heading"><h2 id="news-heading">{heading}</h2>{related}</div>
<div class="news-tools" hidden><div class="news-filters" role="group" aria-label="Filter news by category"></div><p class="news-filter-status" role="status" aria-live="polite" aria-atomic="true"></p></div>
<div class="news-posts">{articles}</div>
<nav class="news-page-links" aria-label="More news">{related}</nav>
</section></main>'''
    page(name, title, description, body, 'home' if name == 'index.html' else '', 'home-page' if name == 'index.html' else '', news=True)


for path in CONTENT.glob('*.html'):
    name=path.name
    if name in ['index.html','music.html','albums.html','news-archive.html']: continue
    d=doc(name)
    if not d.xpath('//main'): continue
    title=clean(d.xpath('string(//title)')).replace(' - melcom','')
    desc=d.xpath('//meta[@name="description"]/@content')
    description=clean(desc[0]) if desc else title+' - music, stories and creations by melcom.'
    active='music' if name.startswith('music-') else 'albums' if name.startswith('albums-') else {'aboutme.html':'about','creations.html':'creations','links.html':'links'}.get(name,'')
    body=transform_main(d,name)
    page(name,title,description,body,active,release=name.startswith(('music-','albums-')))

news_page('index.html')

news_page('news-archive.html', archive=True)

for name,target in [('p/my-samples.html','creations.html#samples'),('2022/05/melcoms-chiptune-archive-now-on-sceneorg.html','news-archive.html#chiptune-archive')]:
    body=f'<main id="main-content" class="wrap"><div class="page-intro"><span class="eyebrow">THE ARCHIVE</span><h1>This page has moved.</h1><p>The same sounds and stories have a new home.</p><a class="button button-lime" href="{target}">Go to the page {icon("arrow")}</a></div></main>'
    page(name,'This page has moved','Find the original samples and music archives on the new melcom website.',body)

(OUT/'assets/catalog.js').write_text('window.MELCOM_CATALOG = '+json.dumps(catalog,ensure_ascii=False)+';\n', encoding='utf-8')
(CONTENT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2), encoding='utf-8')
(OUT/'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /content/\nSitemap: '+ORIGIN+'/sitemap.xml\n', encoding='utf-8')
urls=''.join('<url><loc>'+ORIGIN+'/'+p.name+'</loc></url>' for p in sorted(OUT.glob('*.html')))
(OUT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls+'</urlset>', encoding='utf-8')
print(f'Built {sum(1 for p in OUT.rglob("*.html") if not p.is_relative_to(CONTENT))} pages, {len(released)} released tracks, {len(tracks)-len(released)} upcoming tracks and {len(albums)} albums.')

# Preserve the production domain and publish static files without Jekyll.
(OUT / "CNAME").write_text("www.melcom-music.de\n", encoding='utf-8')
(OUT / ".nojekyll").touch()
