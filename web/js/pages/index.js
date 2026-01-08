import { fetchProducts } from "../common/api.js";
import { createModal } from "../common/modal.js";

let modal = await createModal();
let searchTermQuery = sessionStorage.getItem("searchTerm");
if (searchTermQuery) {
  loadProducts(searchTermQuery);
  searchTermQuery = null;
  sessionStorage.removeItem("searchTerm");
}
else {
  loadProducts();
}

export async function loadProducts(searchTerm = "") {
  const productData = await fetchProducts(searchTerm);
  renderProductCards(productData);
}

function renderProductCards(productData) {
  const productContainer = document.getElementById("product-container");
  // 템플릿 제외 모두 삭제
  Array.from(productContainer.children).forEach((child) => {
    if (child.tagName.toLowerCase() !== "template") {
      productContainer.removeChild(child);
    }
  });

  productData.forEach((data) => {
    const productCard = cloneProductCardElem(data);
    productContainer.appendChild(productCard);
    productCard.addEventListener("click", () => {
      window.location.href = `detail.html?id=${data.id}`;
    });
  });

  const firstProductCard = productContainer.querySelector(".product-card");
  if (!firstProductCard) {
    const parent = document.body;
    const content = document.createElement("p");
    content.textContent = "검색된 상품이 없습니다.";
    const cancelBtnTxt = null;
    const confirmBtnTxt = "확인";
    modal.setModal({
      parent,
      content,
      cancelBtnTxt,
      confirmBtnTxt
    });
    modal.open(() => modal.close());
  }
}

function cloneProductCardElem(data) {
  const {
    image,
    name,
    price,
    seller: { store_name }
  } = data;

  const template = document.getElementById("product-card-template");
  const node = template.content.cloneNode(true);
  const el = node.querySelector(".product-card");
  el.querySelector(".product-img-wrapper img").src = image;
  el.querySelector(".product-seller").textContent = store_name;
  el.querySelector(".product-name").textContent = name;
  el.querySelector(".product-price-text").textContent = `${price.toLocaleString()}`;

  return el;
}