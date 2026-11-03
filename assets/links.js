/* Keep category anchors reachable while the resource search is active. */
(() => {
  'use strict';
  const page = document.querySelector('.links-page');
  const input = page?.querySelector('.link-search input');
  const clear = page?.querySelector('[data-clear-link-search]');
  if (!page || !input || !clear) return;

  page.addEventListener('click', event => {
    const link = event.target.closest('.link-category-nav a, a.permalink');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (input.value.trim()) {
      clear.click();
      link.focus({preventScroll: true});
    }
  });

  window.addEventListener('hashchange', () => {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return; }
    const category = target?.closest('.link-category');
    if (category?.hidden) {
      clear.click();
      category.focus({preventScroll: true});
      target.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  });
})();
