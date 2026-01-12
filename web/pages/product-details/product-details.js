// 환경 감지
import { API_BASE_URL } from "../../scripts/api.js";

// URL에서 상품 id 가져오기 (?id=1,2,3,4,5)
const params = new URLSearchParams(window.location.search);

const productId = parseInt(params.get("id"), 10);

if (!productId) {
  alert("잘못된 상품 접근입니다.");
  throw new Error("productId가 없습니다.");
}

// 가격, 수량, 상품 정보
let quantity = 1;
let price = 0;
let currentProduct = null;

// DOM (TODO: 확인하기01.06)
const minusBtn = document.querySelector(".quantify button:first-child");
const plusBtn = document.querySelector(".quantify button:last-child");
const quantityInput = document.querySelector(".quantify input");
const totalQuantityText = document.querySelector(".total-quantify");
const totalPriceText = document.querySelector(".total-price");

const tabbtn = document.getElementById("tab-btn");
const tabReview = document.getElementById("tab-review");
const tabQna = document.getElementById("tab-qna");
const tabReturn = document.getElementById("tab-return");

const buyBtn = document.querySelector(".buy");
const cartBtn = document.querySelector(".cart");

const modal = document.getElementById("Cart-Modal");
const modalNo = document.getElementById("modalNo");
const modalYes = document.getElementById("modalYes");
const overlay = document.querySelector(".modal-overlay");
const closeBtn = document.querySelector(".modal-close");

// 로그인 체크 함수
function getAccessToken() {
  return localStorage.getItem("access_token");
}

function isLoggedIn() {
  return !!getAccessToken();
}

// 수량/가격 계산
function updateTotal() {
  if (!quantityInput || !totalQuantityText || !totalPriceText) return;

  quantityInput.value = quantity;
  totalQuantityText.textContent = `총 수량 ${quantity}개`;
  totalPriceText.textContent = (price * quantity).toLocaleString() + "원";
}

// 상품 렌더링 함수
function renderProductDetails(product) {
  if (!product) return;

  currentProduct = product;
  price = product.price;

  const imgEl = document.querySelector(".product-image img");
  if (imgEl) imgEl.src = `../../assets/images/product${product.id}.png`;

  const nameEl = document.getElementById("productName");
  if (nameEl) nameEl.textContent = product.name;

  const brandEl = document.getElementById("productBrand");
  if (brandEl) brandEl.textContent = product.info;

  const priceEl = document.querySelector(".price");
  if (priceEl) priceEl.textContent = product.price.toLocaleString() + "원";

  updateTotal();
}

// 상품 불러오기 (async/await)
async function fetchProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    console.log("응답 status:", response.status);
    if (!response.ok) throw new Error("상품 조회 실패");

    const product = await response.json();
    console.log("상품 데이터:", product);

    renderProductDetails(product);
  } catch (err) {
    console.error(err);
    alert("상품 데이터를 불러오는 중 오류가 발생했습니다.");
  }
}

// 모달
function openModal() {
  modal.classList.remove("hidden");
}
function closeModal() {
  modal.classList.add("hidden");
}
function openCartConfirmModal() {
  modal.classList.remove("hidden");
}

// 장바구니 추가 API (sessionStorage 방식으로 변경)
function addToCart(productId, quantity) {
  let cart = [];

  try {
    cart = JSON.parse(sessionStorage.getItem("cartData")) || [];
  } catch (e) {
    cart = [];
  }

  const existing = cart.find(item => item.product_id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product_id: productId,
      quantity,
    });
  }

  sessionStorage.setItem("cartData", JSON.stringify(cart));
  console.log("장바구니 저장 완료:", cart);
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // 상품 불러오기
  fetchProduct(productId);

  // 수량 버튼
  if (plusBtn && minusBtn && quantityInput) {
    plusBtn.addEventListener("click", () => {
      if (quantity < 99) quantity++;
      updateTotal();
    });
    minusBtn.addEventListener("click", () => {
      if (quantity > 1) quantity--;
      updateTotal();
    });
    quantityInput.addEventListener("input", () => {
      let value = parseInt(quantityInput.value, 10);
      if (isNaN(value) || value < 1) value = 1;
      if (value > 99) value = 99;
      quantity = value;
      updateTotal();
    });
  }

  // 탭 버튼
  const tabs = [tabbtn, tabReview, tabQna, tabReturn].filter(Boolean);
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  // 바로 구매 버튼
  if (buyBtn) {
    buyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!isLoggedIn()) {
        window.location.href = "../login/login.html";
        return;
      }

      // 상품 정보를 sessionStorage에 저장
      if (currentProduct) {
        const orderData = {
          type: "direct_order",
          items: [
            {
              product_id: currentProduct.id,
              name: currentProduct.name,
              brand: currentProduct.info || "백엔드글로벌",
              price: currentProduct.price,
              image: `../../assets/images/product${currentProduct.id}.png`,
              quantity: quantity,
            },
          ],
        };
        sessionStorage.setItem("orderData", JSON.stringify(orderData));
      }

      window.location.href = `../order/order.html?id=${productId}&quantity=${quantity}`;
    });
  }

  // 장바구니 버튼 (async/await)
  if (cartBtn) {
     cartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addToCart(productId, quantity);
    openCartConfirmModal();
    });
  }

  // 모달 버튼
  if (modalNo) modalNo.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modalYes) {
    modalYes.addEventListener("click", () => {
      window.location.href = "../cart/cart.html";
    });
  }
});
