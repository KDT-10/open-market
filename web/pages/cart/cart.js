// 장바구니 데이터
let cartItems = [];

// API 기본 URL 설정
const API_BASE_URL = "http://localhost:3000/api";

// 로딩 상태 관리
let isLoading = false;

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", function () {
  // API에서 장바구니 데이터 가져오기
  fetchCartItems();

  // 초기 렌더링
  renderCart();
});

//  * fetch API를 사용하여 서버에서 데이터를 가져오기

async function fetchCartItems() {
  try {
    // 로딩 상태 시작
    isLoading = true;
    showLoadingState();

    // API 호출
    const response = await fetch(`${API_BASE_URL}/cart/`);

    // HTTP 에러 체크
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    // JSON 데이터 파싱
    const data = await response.json();

    // 데이터가 있는 경우
    if (data.results && Array.isArray(data.results)) {
      // API 응답 데이터를 화면에 맞게 변환
      cartItems = data.results.map((item) => ({
        id: item.id,
        name: item.product.name,
        category: item.product.seller?.store_name || "일반상품",
        price: item.product.price,
        image: item.product.image.startsWith('/web') ? item.product.image : `/web${item.product.image}`,
        option: `${
          item.product.shipping_method === "PARCEL" ? "택배배송" : "직접배송"
        } / ${item.product.shipping_fee === 0 ? "무료배송" : "유료배송"}`,
        quantity: item.quantity,
        checked: true,
        productId: item.product.id,
      }));

      console.log(` 장바구니 데이터 로드 완료: ${cartItems.length}개 상품`);
    } else {
      cartItems = [];
      console.log("ℹ 장바구니가 비어있습니다.");
    }

    // 로딩 완료 후 렌더링
    renderCart();
  } catch (error) {
    // 예외 처리
    console.error(" 장바구니 데이터를 불러오는 중 오류가 발생했습니다:", error);

    // 사용자에게 에러 메시지 표시
    showErrorMessage(
      "장바구니 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요."
    );

    // 빈 장바구니 표시
    cartItems = [];
    renderCart();
  } finally {
    // 로딩 상태 종료
    isLoading = false;
    hideLoadingState();
  }
}

/**
 * 로딩 상태 표시
 */
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

/**
 * 로딩 상태 숨기기
 */
function hideLoadingState() {
  // renderCart()에서 처리되므로 별도 처리 불필요
}

/**
 * 에러 메시지 표시
 */
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

/**
 * 장바구니 아이템 수량 업데이트 API 호출
 * @param {number} cartItemId - 장바구니 아이템 ID
 * @param {number} newQuantity - 새로운 수량
 */
async function updateCartItemQuantity(cartItemId, newQuantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(" 수량 업데이트 성공:", data);
    return data;
  } catch (error) {
    console.error(" 수량 업데이트 실패:", error);
    alert("수량 업데이트에 실패했습니다. 다시 시도해주세요.");
    // 실패 시 원래 데이터로 복구
    await fetchCartItems();
    throw error;
  }
}

// 장바구니 렌더링
function renderCart() {
  const emptyCart = document.getElementById("emptyCart");
  const cartContainer = document.getElementById("cartContainer");
  const cartProducts = document.getElementById("cartProducts");

  // 장바구니가 비어있는지 확인
  if (cartItems.length === 0) {
    emptyCart.style.display = "flex";
    cartContainer.style.display = "none";
  } else {
    emptyCart.style.display = "none";
    cartContainer.style.display = "block";

    // 상품 목록 렌더링
    cartProducts.innerHTML = "";
    cartItems.forEach((item, index) => {
      const productCard = createProductCard(item, index);
      cartProducts.appendChild(productCard);
    });

    // 금액 계산 및 업데이트
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
        <input type="number" class="qty-input" value="${
          item.quantity
        }" min="1" data-index="${index}" />
        <button class="qty-btn plus" data-index="${index}">+</button>
      </div>

      <div class="product-price-total">
        <p class="price-amount">${formatPrice(item.price * item.quantity)}원</p>
      </div>

      <button class="btn-order" data-index="${index}">주문하기</button>
    </div>

    <button class="btn-remove" data-index="${index}">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 5L5 15M5 5L15 15"
          stroke="#999999"
          stroke-width="2"
          stroke-linecap="round"
        />
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
  minusBtn.addEventListener("click", async function () {
    if (cartItems[index].quantity > 1) {
      const newQuantity = cartItems[index].quantity - 1;
      try {
        // API 호출하여 수량 업데이트
        await updateCartItemQuantity(cartItems[index].id, newQuantity);
        // 성공 시 로컬 데이터 업데이트
        cartItems[index].quantity = newQuantity;
        renderCart();
      } catch (error) {
        // 에러는 updateCartItemQuantity에서 처리됨
      }
    }
  });

  // 수량 증가 버튼
  const plusBtn = card.querySelector(".plus");
  plusBtn.addEventListener("click", async function () {
    const newQuantity = cartItems[index].quantity + 1;
    try {
      // API 호출하여 수량 업데이트
      await updateCartItemQuantity(cartItems[index].id, newQuantity);
      // 성공 시 로컬 데이터 업데이트
      cartItems[index].quantity = newQuantity;
      renderCart();
    } catch (error) {
      // 에러는 updateCartItemQuantity에서 처리됨
    }
  });

  // 수량 입력 필드
  const qtyInput = card.querySelector(".qty-input");
  qtyInput.addEventListener("change", async function () {
    const newQty = parseInt(this.value);
    if (newQty >= 1) {
      try {
        // API 호출하여 수량 업데이트
        await updateCartItemQuantity(cartItems[index].id, newQty);
        // 성공 시 로컬 데이터 업데이트
        cartItems[index].quantity = newQty;
        renderCart();
      } catch (error) {
        // 에러 발생 시 원래 값으로 복구
        this.value = cartItems[index].quantity;
      }
    } else {
      this.value = cartItems[index].quantity;
    }
  });

  // 개별 주문하기 버튼
  const orderBtn = card.querySelector(".btn-order");
  orderBtn.addEventListener("click", function () {
    console.log("개별 주문:", item.name);
    // 선택한 상품만 체크하고 주문 페이지로 이동
    cartItems.forEach(cartItem => {
      cartItem.checked = cartItem.id === item.id;
    });
    goToOrderPage([item]);
  });

  // 삭제 버튼
  const removeBtn = card.querySelector(".btn-remove");
  removeBtn.addEventListener("click", function () {
    if (confirm(`${item.name}을(를) 장바구니에서 삭제하시겠습니까?`)) {
      cartItems.splice(index, 1);
      renderCart();
    }
  });

  return card;
}

// 주문 요약 업데이트
function updateOrderSummary() {
  // 체크된 상품만 계산
  const checkedItems = cartItems.filter((item) => item.checked);

  // 총 상품금액
  const totalProductPrice = checkedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 상품 할인 (현재는 0원)
  const totalDiscount = 0;

  // 배송비 (현재는 0원)
  const shippingFee = 0;

  // 결제 예정 금액
  const finalTotal = totalProductPrice - totalDiscount + shippingFee;

  // UI 업데이트
  document.getElementById("totalProductPrice").textContent =
    formatPrice(totalProductPrice) + "원";
  document.getElementById("totalDiscount").textContent =
    formatPrice(totalDiscount) + "원";
  document.getElementById("shippingFee").textContent =
    formatPrice(shippingFee) + "원";
  document.getElementById("finalTotal").textContent =
    formatPrice(finalTotal) + "원";

  // 전체 주문하기 버튼 이벤트
  const checkoutBtn = document.getElementById("checkoutBtn");
  checkoutBtn.onclick = function () {
    if (checkedItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }
    console.log("전체 주문:", checkedItems);
    goToOrderPage(checkedItems);
  };
}

// 주문 페이지로 이동
function goToOrderPage(orderItems) {
  // 주문 상품 데이터를 localStorage에 저장
  const orderData = {
    items: orderItems,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('orderData', JSON.stringify(orderData));

  // order 페이지로 이동
  window.location.href = '/web/pages/order/order.html';
}

// 가격 포맷팅 (천 단위 콤마)
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 상품 추가 함수 (테스트용)
function addToCart(product) {
  cartItems.push(product);
  renderCart();
}

// 장바구니 비우기 함수 (테스트용)
function clearCart() {
  cartItems = [];
  renderCart();
}

// 테스트용: 콘솔에서 사용 가능한 함수들
window.addToCart = addToCart;
window.clearCart = clearCart;
window.cartItems = cartItems;
