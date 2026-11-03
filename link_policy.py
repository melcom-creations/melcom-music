"""Apply external-link protections without rewriting page content or URLs."""

from html import escape
from html.parser import HTMLParser
import re
from urllib.parse import urljoin, urlsplit


class _LinkPolicyParser(HTMLParser):
    def __init__(self, markup, document_url):
        super().__init__(convert_charrefs=False)
        self.markup = markup
        self.base_url = document_url
        self.origin = urlsplit(document_url)
        hostname = (self.origin.hostname or '').lower().rstrip('.')
        bare_hostname = hostname.removeprefix('www.')
        self.site_hosts = {bare_hostname, 'www.' + bare_hostname}
        self.base_seen = False
        self.line_offsets = [0] + [match.end() for match in re.finditer('\n', markup)]
        self.edits = []

    def is_external(self, href):
        browser_href = href.replace('\\', '/')
        if browser_href.startswith('//'):
            browser_href = '//' + browser_href.lstrip('/')
        target = urlsplit(urljoin(self.base_url, browser_href))
        if target.scheme not in {'http', 'https'}:
            return False
        hostname = (target.hostname or '').lower().rstrip('.')
        if hostname not in self.site_hosts:
            return True
        default_port = 443 if target.scheme == 'https' else 80
        if target.port in {None, default_port} and self.origin.port is None:
            return False
        origin_port = self.origin.port or (443 if self.origin.scheme == 'https' else 80)
        return target.scheme != self.origin.scheme or (target.port or default_port) != origin_port

    def handle_starttag(self, tag, attrs):
        values = {}
        for name, value in attrs:
            values.setdefault(name, value)
        if tag == 'base' and not self.base_seen and values.get('href') is not None:
            self.base_url = urljoin(self.base_url, values['href'])
            self.base_seen = True
        if tag not in {'a', 'area'} or values.get('href') is None:
            return

        target = values.get('target')
        rel = list(dict.fromkeys((values.get('rel') or '').lower().split()))
        if self.is_external(values['href']):
            target = '_blank'
            rel = [token for token in rel if token != 'opener']
            rel.extend(token for token in ('noopener', 'noreferrer') if token not in rel)
        else:
            if (target or '').lower() == '_blank':
                target = None
            rel = [token for token in rel if token not in {'noopener', 'noreferrer'}]
        rel = ' '.join(rel) or None
        if target == values.get('target') and rel == values.get('rel'):
            return

        updated = [(name, value) for name, value in attrs if name not in {'target', 'rel'}]
        if target is not None:
            updated.append(('target', target))
        if rel is not None:
            updated.append(('rel', rel))
        attributes = ''.join(' ' + name if value is None else f' {name}="{escape(value, quote=True)}"' for name, value in updated)
        original = self.get_starttag_text()
        closing = ' />' if original.rstrip().endswith('/>') else '>'
        replacement = '<' + tag + attributes + closing
        line, column = self.getpos()
        start = self.line_offsets[line - 1] + column
        self.edits.append((start, start + len(original), replacement))


def apply_link_policy(markup, document_url):
    """Open off-site web links in a protected tab and keep local links ordinary."""
    parser = _LinkPolicyParser(markup, document_url)
    parser.feed(markup)
    parser.close()
    for start, end, replacement in reversed(parser.edits):
        markup = markup[:start] + replacement + markup[end:]
    return markup
