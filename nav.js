(function () {
  // Resolve project root from this script's own URL so links work
  // whether the page is at root depth or inside a subdirectory.
  const root = new URL(".", document.currentScript.src).href;

  // Inject nav.css
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = root + "nav.css";
  document.head.appendChild(cssLink);

  // Inject theme.css AFTER nav.css so the theme's design tokens (e.g. the
  // --nav-* colors) win over nav.css's own defaults and reskin the nav.
  const themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.href = root + "theme.css";
  document.head.appendChild(themeLink);

  const pages = [
    { label: "Punctuators Game", file: "punctuators.html" },
    { label: "Typow!", file: "typing.html", desktopOnly: true },
    { label: "Spin Nids", file: "SpinNidIndex.html" },
    { label: "Write. Right!", file: "WriteRight.html" },
    { label: "Kaimoju", file: "kaimoju.html" },
    {
      label: "Webtoons",
      href: "https://www.webtoons.com/en/challenge/the-punctuators-super-powered-punctuation/list?title_no=318764",
      external: true,
    },
    {
      label: "Read Free",
      // Free graphic-novel PDFs hosted on Dropbox.
      children: [
        {
          label: "Question Markswoman (Book 1)",
          href: "https://www.dropbox.com/scl/fo/0kx2ztlbq95ioxnfifew9/AGYTaJ0ALODy-SidG3yS6Y0/rescaled%20Punctuators%20Question%20Quest%20copy%202.pdf?rlkey=hje8gtuguop92sjyqtrj7yu9h&st=82b298t2&dl=0",
        },
        {
          label: "Exclamachine (Book 2)",
          href: "https://www.dropbox.com/scl/fi/u5lk0v1h4loxopy5j3ekw/Exclamachine.pdf?rlkey=ifv7oxkr48mart3r9wgbjqt5c&st=rvqhht6a&dl=0",
        },
      ],
    },
    { label: "Books", href: "https://a.co/d/aX8NZcc", external: true },
    { label: "Contact", file: "contact.html" },
  ];

  const currentPath = window.location.pathname;

  function isActive(file) {
    // Match the file name at the end of the path (handles subdirs too)
    const name = file.split("/").pop();
    // Special case: index.html matches "/" or "/PunctuatorsGame/" etc.
    if (name === "index.html") {
      return currentPath.endsWith("/index.html") || currentPath.endsWith("/");
    }
    return currentPath.endsWith("/" + name);
  }

  const linkItems = pages
    .map((p) => {
      // Dropdown item: a labelled toggle with a nested list of links.
      if (p.children) {
        const subItems = p.children
          .map(
            (c) =>
              `<li><a href="${c.href}" target="_blank" rel="noopener">${c.label}</a></li>`,
          )
          .join("");
        return `<li class="has-sub"><a href="#" class="sub-toggle" aria-haspopup="true">${p.label} &#9662;</a><ul class="site-nav__sub">${subItems}</ul></li>`;
      }
      const href = p.external ? p.href : `${root}${p.file}`;
      const target = p.external ? ' target="_blank" rel="noopener"' : "";
      const active =
        !p.external && isActive(p.file) ? ' aria-current="page"' : "";
      const cls = p.desktopOnly ? ' class="nav-desktop-only"' : "";
      return `<li${cls}><a href="${href}"${target}${active}>${p.label}</a></li>`;
    })
    .join("");

  const nav = document.createElement("nav");
  nav.className = "site-nav";
  nav.id = "site-nav";
  // Set critical layout properties inline so they work even before nav.css loads
  nav.style.cssText =
    "position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:99999!important;";
  nav.innerHTML = `
    <a class="site-nav__brand" href="${root}index.html">Punctuators</a>
    <button class="site-nav__toggle" id="nav-toggle" aria-label="Toggle menu">&#9776;</button>
    <ul class="site-nav__links" id="nav-links">${linkItems}</ul>
  `;

  (document.body || document.documentElement).insertAdjacentElement(
    "afterbegin",
    nav,
  );

  document.getElementById("nav-toggle").addEventListener("click", function () {
    document.getElementById("nav-links").classList.toggle("open");
  });

  // Toggle a dropdown open/closed (works on touch where hover doesn't).
  document.querySelectorAll(".sub-toggle").forEach(function (t) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.parentElement.classList.toggle("open");
    });
  });

  // Close any open dropdown when clicking elsewhere on the page.
  document.addEventListener("click", function () {
    document.querySelectorAll(".has-sub.open").forEach(function (li) {
      li.classList.remove("open");
    });
  });

  // Close mobile menu when a real link is clicked (not a dropdown toggle).
  document.getElementById("nav-links").addEventListener("click", function (e) {
    if (e.target.tagName === "A" && !e.target.classList.contains("sub-toggle")) {
      document.getElementById("nav-links").classList.remove("open");
    }
  });
})();
