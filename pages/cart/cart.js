// 환경 감지
const isGitHubPages = window.location.hostname.includes("github.io");

// 데이터 경로 - 상대 경로로 통일
function getDataPath() {
  return "../../db.json";
}

// 장바구니 데이터
let cartItems = [];

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", function () {
  fetchCartItems();
  initModalEventListeners();
});

// localStorage에서 장바구니 데이터 가져오기
async function fetchCartItems() {
  try {
    showLoadingState();

    // localStorage에서 장바구니 가져오기
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];

    if (localCart.length === 0) {
      cartItems = [];
      renderCart();
      return;
    }

    // db.json에서 상품 정보 가져오기
    const response = await fetch(getDataPath());
    if (!response.ok) throw new Error("데이터 로드 실패");

    const data = await response.json();
    const products = data.products || [];

    // 장바구니 아이템과 상품 정보 결합
    cartItems = localCart.map(item => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) return null;

      // 이미지 경로 수정 (./assets -> ../../assets)
      let imagePath = product.image;
      if (imagePath && imagePath.startsWith('./')) {
        imagePath = '../../' + imagePath.slice(2);
      }

      return {
        id: item.id,
        name: product.name,
        category: product.seller?.store_name || "일반상품",
        price: product.price,
        image: imagePath,
        option: `${product.shipping_method === "PARCEL" ? "택배배송" : "직접배송"} / ${product.shipping_fee === 0 ? "무료배송" : "유료배송"}`,
        quantity: item.quantity,
        checked: true,
        productId: product.id,
      };
    }).filter(item => item !== null);

    console.log(` 장바구니 데이터 로드 완료: ${cartItems.length}개 상품`);
    renderCart();
  } catch (error) {
    console.error(" 장바구니 데이터를 불러오는 중 오류가 발생했습니다:", error);
    showErrorMessage("장바구니 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
    cartItems = [];
    renderCart();
  } finally {
    hideLoadingState();
  }
}

// 로딩 상태 표시
function showLoadingState() {
  const emptyCart = document.getElementById("emptyCart");
  const cartContainer = document.getElementById("cartContainer");

  if (emptyCart) {
    emptyCart.innerHTML = `
      <div class="loading-spinner">
        <p class="empty-title">로딩 중...</p>
        <p class="empty-subtitle">장바구니 데이터를 불러오고 있습니다.</p>
      </div>
    `;
    emptyCart.style.display = "flex";
  }

  if (cartContainer) {
    cartContainer.style.display = "none";
  }
}

// 로딩 상태 숨기기
function hideLoadingState() {
  // renderCart()에서 처리되므로 별도 처리 불필요
}

// 에러 메시지 표시
function showErrorMessage(message) {
  const emptyCart = document.getElementById("emptyCart");

  if (emptyCart) {
    emptyCart.innerHTML = `
      <p class="empty-title" style="color: #ff4444;"> 오류 발생</p>
      <p class="empty-subtitle">${message}</p>
      <button
        onclick="location.reload()"
        style="margin-top: 20px; padding: 10px 20px; cursor: pointer; background-color: #333; color: white; border: none; border-radius: 5px;">
        새로고침
      </button>
    `;
    emptyCart.style.display = "flex";
  }
}

// 장바구니 렌더링
function renderCart() {
  const emptyCart = document.getElementById("emptyCart");
  const cartContainer = document.getElementById("cartContainer");
  const cartProducts = document.getElementById("cartProducts");

  if (cartItems.length === 0) {
    emptyCart.innerHTML = `
      <p class="empty-title">장바구니에 담긴 상품이 없습니다.</p>
      <p class="empty-subtitle">원하는 상품을 찾아가세요!</p>
    `;
    emptyCart.style.display = "flex";
    cartContainer.style.display = "none";
  } else {
    emptyCart.style.display = "none";
    cartContainer.style.display = "block";

    cartProducts.innerHTML = "";
    cartItems.forEach((item, index) => {
      const productCard = createProductCard(item, index);
      cartProducts.appendChild(productCard);
    });

    updateOrderSummary();
  }
}

// 상품 카드 생성
function createProductCard(item, index) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <input
      type="checkbox"
      class="product-checkbox"
      id="product${item.id}"
      ${item.checked ? "checked" : ""}
    />
    <label for="product${item.id}" class="checkbox-label"></label>

    <div class="product-image">
      <img src="${item.image}" alt="${item.name}" />
    </div>

    <div class="product-info">
      <p class="product-category">${item.category}</p>
      <h3 class="product-name">${item.name}</h3>
      <p class="product-price">${formatPrice(item.price)}원</p>
      <p class="product-option">${item.option}</p>
    </div>

    <div class="product-right">
      <div class="product-quantity">
        <button class="qty-btn minus" data-index="${index}">-</button>
        <input type="number" class="qty-input" value="${item.quantity}" min="1" data-index="${index}" readonly />
        <button class="qty-btn plus" data-index="${index}">+</button>
      </div>

      <div class="product-price-total">
        <p class="price-amount">${formatPrice(item.price * item.quantity)}원</p>
      </div>

      <button class="btn-order" data-index="${index}">주문하기</button>
    </div>

    <button class="btn-remove" data-index="${index}">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 5L5 15M5 5L15 15" stroke="#999999" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  // 체크박스 이벤트
  const checkbox = card.querySelector(".product-checkbox");
  checkbox.addEventListener("change", function () {
    cartItems[index].checked = this.checked;
    updateOrderSummary();
  });

  // 수량 감소 버튼
  const minusBtn = card.querySelector(".minus");
  minusBtn.addEventListener("click", function () {
    if (item.quantity > 1) {
      item.quantity--;
      updateLocalStorage();
      renderCart();
    }
  });

  // 수량 증가 버튼
  const plusBtn = card.querySelector(".plus");
  plusBtn.addEventListener("click", function () {
    item.quantity++;
    updateLocalStorage();
    renderCart();
  });

  // 주문하기 버튼 (단일 상품 주문)
  const orderBtn = card.querySelector(".btn-order");
  orderBtn.addEventListener("click", function () {
    // 주문 데이터를 sessionStorage에 저장
    const orderData = [{
      ...item,
      order_type: 'direct_order'
    }];
    sessionStorage.setItem('orderData', JSON.stringify(orderData));

    // 주문 페이지로 이동
    window.location.href = '../order/order.html';
  });

  // 삭제 버튼
  const removeBtn = card.querySelector(".btn-remove");
  removeBtn.addEventListener("click", function () {
    if (confirm(`${item.name}을(를) 삭제하시겠습니까?`)) {
      cartItems.splice(index, 1);
      updateLocalStorage();
      renderCart();
    }
  });

  return card;
}

// localStorage 업데이트
function updateLocalStorage() {
  const localCart = cartItems.map(item => ({
    id: item.id,
    product_id: item.productId,
    quantity: item.quantity
  }));
  localStorage.setItem('cart', JSON.stringify(localCart));
}

// 주문 요약 업데이트
function updateOrderSummary() {
  const checkedItems = cartItems.filter((item) => item.checked);

  const totalProductPrice = checkedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalDiscount = 0;
  const shippingFee = 0;
  const finalTotal = totalProductPrice - totalDiscount + shippingFee;

  document.getElementById("totalProductPrice").textContent =
    formatPrice(totalProductPrice) + "원";
  document.getElementById("totalDiscount").textContent =
    formatPrice(totalDiscount) + "원";
  document.getElementById("shippingFee").textContent =
    formatPrice(shippingFee) + "원";
  document.getElementById("finalTotal").textContent =
    formatPrice(finalTotal) + "원";

  const checkoutBtn = document.getElementById("checkoutBtn");
  checkoutBtn.onclick = function () {
    if (checkedItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }

    // 선택된 상품들을 주문 데이터로 변환
    const orderData = checkedItems.map(item => ({
      ...item,
      order_type: 'cart_order'
    }));

    // sessionStorage에 저장
    sessionStorage.setItem('orderData', JSON.stringify(orderData));

    // 주문 페이지로 이동
    window.location.href = '../order/order.html';
  };
}

// 가격 포맷팅
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 모달 이벤트 리스너 초기화 (필요시)
function initModalEventListeners() {
  // 정적 사이트에서는 모달 기능 최소화
}
