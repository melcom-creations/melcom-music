/* Client-side controls for melcom's music archive. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const catalog = window.MELCOM_CATALOG || [];
  const menu = $('.menu-toggle');
  const nav = $('#site-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      menu.click(); menu.focus();
    }
  });

  $$('[data-random-track]').forEach(button => button.addEventListener('click', () => {
    const available = catalog.filter(track => track.kind === 'track' && !track.upcoming);
    if (available.length) location.href = available[Math.floor(Math.random() * available.length)].href;
  }));

  // Filter the server-rendered cards so that navigation also works without JS.
  const grid = $('#catalog-grid');
  if (grid) {
    const cards = $$('.release-card', grid);
    const search = $('#music-search');
    const year = $('#year-filter');
    const format = $('#format-filter');
    const upcoming = $('#include-upcoming');
    const status = $('#results-count');
    const isAlbum = location.pathname.endsWith('albums.html');
    const params = new URLSearchParams(location.search);
    if (params.has('q')) search.value = params.get('q');
    if ($$('option', year).some(option => option.value === params.get('year'))) year.value = params.get('year');
    if (upcoming && params.get('upcoming') === '1') upcoming.checked = true;
    function filter() {
      const query = search.value.trim().toLowerCase();
      const upcomingYear = $('#upcoming-year-option');
      if (upcomingYear) {
        upcomingYear.hidden = !upcoming.checked;
        upcomingYear.disabled = !upcoming.checked;
        if (!upcoming.checked && year.value === '2026') year.value = 'all';
      }
      let count = 0;
      cards.forEach(card => {
        const match = (!query || card.dataset.search.includes(query)) &&
          (year.value === 'all' || card.dataset.year === year.value) &&
          (format.value === 'all' || card.dataset.formats.includes(format.value)) &&
          (card.dataset.upcoming !== 'true' || upcoming?.checked);
        card.hidden = !match;
        if (match) count++;
      });
      status.textContent = `${count} ${isAlbum ? (count === 1 ? 'album' : 'albums') : (count === 1 ? 'track' : 'tracks')}${upcoming?.checked ? ' including upcoming releases' : ''}`;
      $('#empty-state').hidden = count !== 0;
    }
    [search, year, format, upcoming].filter(Boolean).forEach(control => control.addEventListener(control === search ? 'input' : 'change', filter));
    $('[data-reset-filters]')?.addEventListener('click', () => {
      search.value = ''; year.value = 'all'; format.value = 'all';
      if (upcoming) upcoming.checked = false;
      filter(); search.focus();
    });
    $$('[data-view]').forEach(button => button.addEventListener('click', () => {
      const list = button.dataset.view === 'list';
      grid.classList.toggle('list-view', list);
      $$('[data-view]').forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
    }));
    filter();
  }

  // User initiated video loading, with an ordinary external link as a fallback.
  const mediaDialog = $('#media-dialog');
  let lastTrigger;
  $$('[data-video]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.video;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    lastTrigger = button;
    $('#media-title').textContent = button.dataset.title || 'Listen to melcom';
    $('#media-external').href = `https://www.youtube.com/watch?v=${id}`;
    const iframe = document.createElement('iframe');
    iframe.title = button.dataset.title || 'Music video';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    $('#media-content').replaceChildren(iframe);
    mediaDialog.showModal();
  }));
  mediaDialog?.addEventListener('close', () => {
    $('#media-content').replaceChildren();
    lastTrigger?.focus();
  });

  // Group related artwork and screenshots in one keyboard-accessible gallery.
  const galleryDialog = $('#gallery-dialog');
  let galleryLinks = [];
  let galleryIndex = 0;
  let galleryTrigger;
  function showImage(index) {
    galleryIndex = index;
    const link = galleryLinks[index];
    const source = $('img', link);
    $('#gallery-image').src = link.href;
    $('#gallery-image').alt = source?.alt || 'Artwork by melcom';
    $('#gallery-title').textContent = source?.title || source?.alt || 'Artwork';
    $('.gallery-caption').textContent = `${index + 1} / ${galleryLinks.length} · ${source?.alt || 'Artwork'}`;
    $('.gallery-prev').disabled = index === 0;
    $('.gallery-next').disabled = index === galleryLinks.length - 1;
    $$('#gallery-thumbnails button').forEach((button, buttonIndex) => {
      if (buttonIndex === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }
  $$('a.track-image-link, a.about-portrait-link').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    galleryTrigger = link;
    const scope = link.closest('.content-box, .archive-banners, .about-profile-card') || document;
    galleryLinks = $$('a.track-image-link, a.about-portrait-link', scope).filter(candidate => $('img', candidate));
    galleryIndex = galleryLinks.indexOf(link);
    if (galleryIndex < 0) { galleryLinks = [link]; galleryIndex = 0; }
    const thumbnails = galleryLinks.map((imageLink, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Show image ${index + 1}: ${$('img', imageLink)?.alt || 'Artwork'}`);
      const image = document.createElement('img');
      image.src = $('img', imageLink).src; image.alt = '';
      button.append(image);
      button.addEventListener('click', () => showImage(index));
      return button;
    });
    $('#gallery-thumbnails').replaceChildren(...thumbnails);
    $('#gallery-thumbnails').hidden = galleryLinks.length < 2;
    showImage(galleryIndex);
    galleryDialog.showModal();
  }));
  $('.gallery-prev')?.addEventListener('click', () => { if (galleryIndex > 0) showImage(galleryIndex - 1); });
  $('.gallery-next')?.addEventListener('click', () => { if (galleryIndex + 1 < galleryLinks.length) showImage(galleryIndex + 1); });
  galleryDialog?.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' && galleryIndex + 1 < galleryLinks.length) { event.preventDefault(); showImage(galleryIndex + 1); }
    if (event.key === 'ArrowLeft' && galleryIndex > 0) { event.preventDefault(); showImage(galleryIndex - 1); }
  });
  galleryDialog?.addEventListener('close', () => galleryTrigger?.focus());
  $$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  }));

  // Original link collection search and category visibility.
  const linkSearch = $('.link-search input');
  if (linkSearch) {
    const categories = $$('.link-category');
    const clear = $('.link-search button');
    const empty = document.createElement('p');
    empty.className = 'link-search-empty'; empty.hidden = true;
    empty.textContent = 'No links match your search. Try another name or description.';
    $('.link-explorer').after(empty);
    function filterLinks() {
      const query = linkSearch.value.trim().toLowerCase();
      if (clear) clear.hidden = !query;
      let total = 0;
      categories.forEach(category => {
        let visible = 0;
        $$('.link-list > li', category).forEach(item => {
          const match = !query || item.textContent.toLowerCase().includes(query);
          item.hidden = !match;
          if (match) visible++;
        });
        category.hidden = visible === 0;
        total += visible;
      });
      empty.hidden = total !== 0;
      const searchStatus = $('#link-search-status');
      if (searchStatus) searchStatus.textContent = query ? `${total} ${total === 1 ? 'link' : 'links'} found` : '';
    }
    linkSearch.addEventListener('input', filterLinks);
    clear?.addEventListener('click', () => { linkSearch.value = ''; filterLinks(); linkSearch.focus(); });
  }
  const imprintButton = $('#imprint-request-btn');
  if (imprintButton) {
    imprintButton.setAttribute('aria-expanded', 'false');
    imprintButton.setAttribute('aria-controls', 'imprint-details');
    imprintButton.addEventListener('click', () => {
      const details = $('#imprint-details');
      details.style.display = 'block';
      $('#imprint-request').hidden = true;
      details.setAttribute('tabindex', '-1'); details.focus({ preventScroll: true });
    });
  }

  // Raise the floating button as the footer enters the viewport.
  const backToTop = $('#myBtn');
  if (backToTop) {
    const footer = $('.site-footer');
    const header = $('.site-header');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let positionQueued = false;

    function positionBackToTop() {
      positionQueued = false;
      const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight;
      const banner = $('#info-banner');
      const bannerHeight = banner && !banner.hidden ? banner.getBoundingClientRect().height : 0;
      const bottom = Math.ceil(Math.max(20, bannerHeight ? bannerHeight + 16 : 0, window.innerHeight - footerTop + 16));
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const buttonTop = window.innerHeight - bottom - 52;
      backToTop.style.setProperty('--back-to-top-bottom', `${bottom}px`);
      backToTop.hidden = window.scrollY <= 240 || buttonTop < headerBottom + 12;
    }

    function queueBackToTopPosition() {
      if (positionQueued) return;
      positionQueued = true;
      window.requestAnimationFrame(positionBackToTop);
    }

    backToTop.addEventListener('click', () => {
      window.scrollTo({top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
    });
    window.addEventListener('scroll', queueBackToTopPosition, {passive: true});
    window.addEventListener('resize', queueBackToTopPosition);
    window.addEventListener('load', queueBackToTopPosition);
    window.addEventListener('pageshow', queueBackToTopPosition);
    window.addEventListener('info-banner-change', queueBackToTopPosition);
    window.visualViewport?.addEventListener('resize', queueBackToTopPosition);

    // Filtering, expanded details and loaded artwork can move the footer without scrolling.
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(queueBackToTopPosition);
      observer.observe(document.body);
      if (footer) observer.observe(footer);
    }
    queueBackToTopPosition();
  }
})();
