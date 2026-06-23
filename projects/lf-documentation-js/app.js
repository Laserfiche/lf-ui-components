import { lfTagsDemoService } from './lf-tags/lf-tags-demo.service.js';

// Route map: hash fragment -> { html, js, css, args }
const routes = {
  'lf-tags': {
    html: './lf-tags/lf-tags-documentation.html',
    js: './lf-tags/lf-tags-documentation.js',
    css: './lf-tags/lf-tags-documentation.css',
    args: [lfTagsDemoService],
  },
};

const defaultRoute = 'lf-tags';

// ── Sidebar ──────────────────────────────────────────────────────────
function buildNav(activeRoute) {
  const nav = document.getElementById('sideNav');
  nav.innerHTML = Object.keys(routes)
    .map((route) => {
      const cls = route === activeRoute ? 'nav-item active' : 'nav-item';
      return `<a class="${cls}" href="#${route}">${route}</a>`;
    })
    .join('');
}

// ── Component CSS ─────────────────────────────────────────────────────
let componentStyleLink = null;

function loadComponentCss(href) {
  componentStyleLink?.remove();
  componentStyleLink = document.createElement('link');
  componentStyleLink.rel = 'stylesheet';
  componentStyleLink.href = href;
  document.head.appendChild(componentStyleLink);
}

// ── Router ────────────────────────────────────────────────────────────
async function navigate(route) {
  const config = routes[route] ?? routes[defaultRoute];
  const resolvedRoute = routes[route] ? route : defaultRoute;

  buildNav(resolvedRoute);
  loadComponentCss(config.css);

  const [htmlText, mod] = await Promise.all([fetch(config.html).then((r) => r.text()), import(config.js)]);

  // Parse into a detached node so Angular Element inputs can be set
  // before the element connects to the live DOM. Angular Elements caches
  // property values set pre-connect and applies them in ngAfterViewInit.
  const scratch = document.createElement('div');
  scratch.innerHTML = htmlText;
  mod.preInit?.(scratch, ...(config.args ?? []));

  const container = document.getElementById('mainContent');
  container.replaceChildren(...Array.from(scratch.childNodes));

  mod.init?.(...(config.args ?? []));
}

// Initial load + hash-change navigation
const initialRoute = location.hash.slice(1) || defaultRoute;
navigate(initialRoute);

window.addEventListener('hashchange', () => {
  navigate(location.hash.slice(1) || defaultRoute);
});
