(() => {
  const canonicalPath = '/pages/lab-reports';
  const url = new URL(location.href);
  const preview = url.searchParams.has('preview_theme_id') || window.Shopify?.designMode || window.Shopify?.theme?.role !== 'main';
  if (!preview && (url.pathname !== canonicalPath || url.searchParams.has('view'))) {
    url.pathname = canonicalPath;
    url.searchParams.delete('view');
    location.replace(url.href);
    return;
  }
  const root = document.querySelector('.dandy-coa');
  if (!root) return;
  const tools = root.querySelector('.coa-tools');
  const search = root.querySelector('#CoaSearch');
  const rows = [...root.querySelectorAll('[data-coa-category]')];
  const buttons = [...root.querySelectorAll('[data-coa-filter]')];
  let category = 'all';
  const filter = () => {
    const term = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const row of rows) {
      row.hidden = !((category === 'all' || row.dataset.coaCategory === category) && row.textContent.toLocaleLowerCase().includes(term));
      if (!row.hidden) count++;
    }
    root.querySelector('#CoaResultCount').textContent = `${count} ${count === 1 ? 'report' : 'reports'}`;
    root.querySelector('#CoaEmpty').hidden = count !== 0;
  };
  for (const button of buttons) button.addEventListener('click', () => {
    category = button.dataset.coaFilter;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    filter();
  });
  search.addEventListener('input', filter);
  tools.hidden = false;
  filter();
})();
