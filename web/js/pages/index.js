import { loadCSS, loadProductElem } from "/js/common/dom-utils.js";

loadCSS('/styles/components/product.css');

createCards();

async function createCards() {
  const results = await fetchProducts();
  const productContainer = document.getElementById("product-container");
  for (const product of results) {
    const card = await loadProductElem(productContainer, "/components/product.html", {
      img: product.image,
      seller: product.info,
      name: product.name,
      price: product.price.toLocaleString(),
    });

    // 상품 카드 클릭 시 querystring으로 product_id 전달
    card.addEventListener("click", () => {
      window.location.href = `detail.html?id=${product.id}`;
    });
  }
}

// GET /api/products 호출하여 상품 목록 표시
async function fetchProducts(searchTerm = "") {
  const url = `http://localhost:3000/api/products?page=1&page_size=20${searchTerm ? `&search=${searchTerm}` : ""
    }`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}