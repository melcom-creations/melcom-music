/* Derive filters from the posts so future categories appear automatically. */
(() => {
  'use strict';
  const page = document.querySelector('.news-overview');
  const tools = page?.querySelector('.news-tools');
  const filters = tools?.querySelector('.news-filters');
  const status = tools?.querySelector('.news-filter-status');
  const articles = page ? [...page.querySelectorAll('.news-card')] : [];
  if (!filters || !status || !articles.length) return;

  const categories = new Map();
  const posts = articles.map(article => {
    const names = [...new Set([...article.querySelectorAll('.news-category')]
      .map(tag => tag.textContent.trim()).filter(Boolean))];
    names.forEach(name => categories.set(name, (categories.get(name) || 0) + 1));
    return {article, categories: names};
  });
  const choices = [{category: null, label: 'All', count: posts.length}];
  categories.forEach((count, name) => choices.push({category: name, label: name, count}));

  function select(category) {
    let visible = 0;
    posts.forEach(post => {
      const matches = category === null || post.categories.includes(category);
      post.article.hidden = !matches;
      if (matches) visible++;
    });
    choices.forEach(choice => choice.button.setAttribute('aria-pressed', String(choice.category === category)));
    status.textContent = category === null
      ? `Showing all ${posts.length} posts`
      : `Showing ${visible} of ${posts.length} posts: ${category}`;
  }

  choices.forEach(choice => {
    const button = document.createElement('button');
    const count = document.createElement('span');
    button.type = 'button';
    button.className = 'news-filter';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `${choice.label}, ${choice.count} ${choice.count === 1 ? 'post' : 'posts'}`);
    button.append(document.createTextNode(choice.label));
    count.className = 'news-filter-count';
    count.setAttribute('aria-hidden', 'true');
    count.textContent = choice.count;
    button.append(count);
    button.addEventListener('click', () => select(choice.category));
    choice.button = button;
    filters.append(button);
  });

  // Incoming permalinks must remain reachable after a category was selected.
  window.addEventListener('hashchange', () => {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return; }
    const article = target?.closest('.news-card');
    if (article?.hidden) {
      select(null);
      target.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  });

  select(null);
  tools.hidden = false;
})();
