import { loadHTMLElem, loadCSS } from "./dom-utils.js";

const body = document.body;

loadCSS('../../styles/components/header.css');
loadCSS('../../styles/components/footer.css');

loadHTMLElem(body, '../../header.html', false);
loadHTMLElem(body, '../../footer.html', true);