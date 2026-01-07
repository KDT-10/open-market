import { loadHTMLElem, loadCSS } from "/js/common/dom-utils.js";
import { initHeader } from "./header.js";

const body = document.body;

loadCSS("/styles/components/header.css");
loadCSS("/styles/components/footer.css");

await loadHTMLElem(body, "/components/header.html", false);
initHeader();
await loadHTMLElem(body, "/components/footer.html", true);
