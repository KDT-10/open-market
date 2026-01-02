import { loadHTMLElem, loadCSS } from "/js/common/dom-utils.js";

const body = document.body;

loadCSS('/styles/components/header.css');
loadCSS('/styles/components/footer.css');

loadHTMLElem(body, '/components/header.html', false);
loadHTMLElem(body, '/components/footer.html', true);