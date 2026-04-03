(function () {
  // Resolve project root from this script's own URL so links work
  // whether the page is at root depth or inside a subdirectory.
  const root = new URL('.', document.currentScript.src).href;

  // Inject nav.css
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = root + 'nav.css';
  document.head.appendChild(cssLink);

  const pages = [
    { label: 'Punctuators', file: 'index.html' },
    { label: 'Typing Game', file: 'typing.html', desktopOnly: true },
    { label: 'Spin Nids',   file: 'SpinNidIndex.html' },
    { label: 'IPA Fan',     file: 'IPA-fan-game/ipaFan.html' },
    { label: 'Webtoons',    href: 'https://www.webtoons.com/en/challenge/the-punctuators-super-powered-punctuation/list?title_no=318764', external: true },
    { label: 'Books',       href: 'https://a.co/d/aX8NZcc', external: true },
  ];

  const currentPath = window.location.pathname;

  function isActive(file) {
    // Match the file name at the end of the path (handles subdirs too)
    const name = file.split('/').pop();
    // Special case: index.html matches "/" or "/PunctuatorsGame/" etc.
    if (name === 'index.html') {
      return currentPath.endsWith('/index.html') || currentPath.endsWith('/');
    }
    return currentPath.endsWith('/' + name);
  }

  const linkItems = pages
    .map(p => {
      const href   = p.external ? p.href : `${root}${p.file}`;
      const target = p.external ? ' target="_blank" rel="noopener"' : '';
      const active = (!p.external && isActive(p.file)) ? ' aria-current="page"' : '';
      const cls    = p.desktopOnly ? ' class="nav-desktop-only"' : '';
      return `<li${cls}><a href="${href}"${target}${active}>${p.label}</a></li>`;
    })
    .join('');

  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.id = 'site-nav';
  // Set critical layout properties inline so they work even before nav.css loads
  nav.style.cssText = 'position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:99999!important;';
  nav.innerHTML = `
    <a class="site-nav__brand" href="${root}index.html">Exclamachine</a>
    <button class="site-nav__toggle" id="nav-toggle" aria-label="Toggle menu">&#9776;</button>
    <ul class="site-nav__links" id="nav-links">${linkItems}</ul>
  `;

  (document.body || document.documentElement).insertAdjacentElement('afterbegin', nav);

  document.getElementById('nav-toggle').addEventListener('click', function () {
    document.getElementById('nav-links').classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  document.getElementById('nav-links').addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      document.getElementById('nav-links').classList.remove('open');
    }
  });
})();
