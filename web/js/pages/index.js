import { API_BASE_URL } from "../common/config.js";

let productData = [];

loadProducts();

async function loadProducts() {
  productData = await fetchProducts();
  renderProductCards();
}

// GET /api/products 호출하여 상품 목록 표시
async function fetchProducts(searchTerm = "") {
  const url = `${API_BASE_URL}/products?page=1&page_size=20${searchTerm ? `&search=${searchTerm}` : ""
    }`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

function renderProductCards() {
  const productContainer = document.getElementById("product-container");

  productData.forEach((data) => {
    const productCard = cloneProductCardElem(data);
    productContainer.appendChild(productCard);
    productCard.addEventListener("click", () => {
      window.location.href = `detail.html?id=${data.id}`;
    });
  });
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