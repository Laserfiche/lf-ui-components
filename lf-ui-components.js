var head = document.getElementsByTagName('head')[0];
var js = document.createElement('script');
var jsWithoutZone = document.createElement('script');
js.type = 'text/javascript';
js.src = 'https://cdn.jsdelivr.net/npm/@laserfiche/lf-ui-components@NPM_VERSION/cdn/ui-components.js';

jsWithoutZone.type = 'text/javascript';
jsWithoutZone.src = 'https://cdn.jsdelivr.net/npm/@laserfiche/lf-ui-components@NPM_VERSION/cdn/ui-components-without-zone.js';

if (typeof window.Zone == 'undefined') {
  head.appendChild(js);
} else {
  head.appendChild(jsWithoutZone);
}
