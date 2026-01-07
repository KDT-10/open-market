// 장바구니 데이터
let cartItems = [];

// API 기본 URL 설정
const API_BASE_URL = "http://localhost:3000";

// 로딩 상태 관리
let isLoading = false;

// 모달 관련 변수
let currentModalItem = null;

// 로그인 확인 함수
function isUserLoggedIn() {
  // localStorage에서 access_token 확인 (PROJECT.md 기준)
  const token = localStorage.getItem("access_token");
  return !!token;
}

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", function () {
  // API에서 장바구니 데이터 가져오기
  fetchCartItems();

  // 모달 이벤트 리스너 초기화
  initModalEventListeners();
});

//  * fetch API를 사용하여 서버에서 데이터를 가져오기

async function fetchCartItems() {
  try {
    // 로딩 상태 시작
    isLoading = true;
    showLoadingState();

    // Authorization 헤더 추가 (PROJECT.md 기준)
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // API 호출
    const response = await fetch(`${API_BASE_URL}/cart/`, {
      headers: headers,
    });

    // HTTP 에러 체크
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    // JSON 데이터 파싱
    const data = await response.json();

    // 데이터가 있는 경우
    if (Array.isArray(data) && data.length > 0) {
      // 각 장바구니 아이템에 대해 상품 상세 정보 가져오기
      const cartItemsWithProducts = await Promise.all(
        data.map(async (item) => {
          try {
            const productResponse = await fetch(
              `${API_BASE_URL}/products/${item.product_id}`
            );
            if (!productResponse.ok) {
              throw new Error("상품 정보를 불러올 수 없습니다.");
            }
            const product = await productResponse.json();

            return {
              id: item.id,
              name: product.name,
              category: product.seller?.store_name || "일반상품",
              price: product.price,
              image: product.image.startsWith("./")
                ? product.image.replace("./", "../../")
                : product.image,
              option: `${
                product.shipping_method === "PARCEL" ? "택배배송" : "직접배송"
              } / ${product.shipping_fee === 0 ? "무료배송" : "유료배송"}`,
              quantity: item.quantity,
              checked: true,
              productId: product.id,
            };
          } catch (error) {
            console.error(`상품 ID ${item.product_id} 정보 로드 실패:`, error);
            return null;
          }
        })
      );

      // null이 아닌 항목만 필터링
      cartItems = cartItemsWithProducts.filter((item) => item !== null);

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
    // Authorization 헤더 추가 (PROJECT.md 기준)
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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
    console.log("✓ 수량 업데이트 성공:", data);
    return data;
  } catch (error) {
    console.error("✗ 수량 업데이트 실패:", error);
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
    // 빈 장바구니 메시지 복원
    emptyCart.innerHTML = `
      <p class="empty-title">장바구니에 담긴 상품이 없습니다.</p>
      <p class="empty-subtitle">원하는 상품을 찾아가세요!</p>
    `;
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
  minusBtn.addEventListener("click", function () {
    openModal("quantityModal", item);
  });

  // 수량 증가 버튼
  const plusBtn = card.querySelector(".plus");
  plusBtn.addEventListener("click", function () {
    openModal("quantityModal", item);
  });

  // 수량 입력 필드
  const qtyInput = card.querySelector(".qty-input");
  qtyInput.addEventListener("click", function () {
    openModal("quantityModal", item);
  });

  // 개별 주문하기 버튼
  const orderBtn = card.querySelector(".btn-order");
  orderBtn.addEventListener("click", function () {
    // 로그인 확인
    if (!isUserLoggedIn()) {
      openModal("loginModal");
      return;
    }

    console.log("개별 주문:", item.name);
    // 선택한 상품만 체크하고 주문 페이지로 이동
    cartItems.forEach((cartItem) => {
      cartItem.checked = cartItem.id === item.id;
    });
    goToOrderPage([item]);
  });

  // 삭제 버튼
  const removeBtn = card.querySelector(".btn-remove");
  removeBtn.addEventListener("click", function () {
    openModal("deleteModal", item);
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

    // 로그인 확인
    if (!isUserLoggedIn()) {
      openModal("loginModal");
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
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem("orderData", JSON.stringify(orderData));

  // order 페이지로 이동
  window.location.href = "../order/order.html";
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

// 모달 이벤트 리스너 초기화
function initModalEventListeners() {
  // 모든 모달 가져오기
  const quantityModal = document.getElementById("quantityModal");
  const deleteModal = document.getElementById("deleteModal");
  const loginModal = document.getElementById("loginModal");

  // 수량 선택 모달
  if (quantityModal) {
    // 수량 증감 버튼
    const minusBtn = quantityModal.querySelector(".qty-modal-btn.minus");
    const plusBtn = quantityModal.querySelector(".qty-modal-btn.plus");
    const qtyInput = quantityModal.querySelector(".qty-modal-input");
    const cancelBtn = quantityModal.querySelector(".modal-btn.cancel");
    const confirmBtn = quantityModal.querySelector(".modal-btn.confirm");
    const closeBtn = quantityModal.querySelector(".modal-close");
    const overlay = quantityModal.querySelector(".modal-overlay");

    minusBtn.addEventListener("click", () => {
      const currentValue = parseInt(qtyInput.value) || 1;
      if (currentValue > 1) {
        qtyInput.value = currentValue - 1;
      }
    });

    plusBtn.addEventListener("click", () => {
      const currentValue = parseInt(qtyInput.value) || 1;
      qtyInput.value = currentValue + 1;
    });

    // 수량 입력 필드에서 직접 입력 시 유효성 검사
    qtyInput.addEventListener("input", () => {
      const value = parseInt(qtyInput.value);
      if (isNaN(value) || value < 1) {
        qtyInput.value = 1;
      }
    });

    // 수량 입력 필드에서 Enter 키 누르면 수정 실행
    qtyInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        confirmBtn.click();
      }
    });

    cancelBtn.addEventListener("click", () => closeModal(quantityModal));
    closeBtn.addEventListener("click", () => closeModal(quantityModal));
    overlay.addEventListener("click", () => closeModal(quantityModal));

    confirmBtn.addEventListener("click", async () => {
      if (currentModalItem) {
        const newQuantity = parseInt(qtyInput.value);
        if (isNaN(newQuantity) || newQuantity < 1) {
          alert("수량은 1개 이상이어야 합니다.");
          qtyInput.value = currentModalItem.quantity;
          return;
        }

        // 수량이 변경되지 않았으면 모달만 닫기
        if (newQuantity === currentModalItem.quantity) {
          closeModal(quantityModal);
          return;
        }

        try {
          await updateCartItemQuantity(currentModalItem.id, newQuantity);
          currentModalItem.quantity = newQuantity;
          renderCart();
          closeModal(quantityModal);
          console.log(
            `✓ "${currentModalItem.name}" 수량이 ${newQuantity}개로 변경되었습니다.`
          );
        } catch (error) {
          // 에러 처리는 updateCartItemQuantity에서 수행
        }
      }
    });
  }

  // 삭제 확인 모달
  if (deleteModal) {
    const cancelBtn = deleteModal.querySelector(".modal-btn.cancel");
    const confirmBtn = deleteModal.querySelector(".modal-btn.confirm");
    const closeBtn = deleteModal.querySelector(".modal-close");
    const overlay = deleteModal.querySelector(".modal-overlay");

    cancelBtn.addEventListener("click", () => closeModal(deleteModal));
    closeBtn.addEventListener("click", () => closeModal(deleteModal));
    overlay.addEventListener("click", () => closeModal(deleteModal));

    confirmBtn.addEventListener("click", async () => {
      if (currentModalItem) {
        try {
          await deleteCartItem(currentModalItem.id);
          const itemIndex = cartItems.findIndex(
            (item) => item.id === currentModalItem.id
          );
          if (itemIndex !== -1) {
            cartItems.splice(itemIndex, 1);
            renderCart();
          }
          closeModal(deleteModal);
          // 삭제 성공 알림 (선택사항 - 원하면 제거 가능)
          console.log(
            `✓ "${currentModalItem.name}" 상품이 장바구니에서 삭제되었습니다.`
          );
        } catch (error) {
          console.error("삭제 실패:", error);
        }
      }
    });
  }

  // 로그인 요청 모달
  if (loginModal) {
    const cancelBtn = loginModal.querySelector(".modal-btn.cancel");
    const confirmBtn = loginModal.querySelector(".modal-btn.confirm");
    const closeBtn = loginModal.querySelector(".modal-close");
    const overlay = loginModal.querySelector(".modal-overlay");

    // 아니오 버튼 - 결제 페이지로 이동
    cancelBtn.addEventListener("click", () => {
      closeModal(loginModal);
      // 체크된 상품들을 가져와서 주문 페이지로 이동
      const checkedItems = cartItems.filter((item) => item.checked);
      if (checkedItems.length > 0) {
        goToOrderPage(checkedItems);
      }
    });

    closeBtn.addEventListener("click", () => closeModal(loginModal));
    overlay.addEventListener("click", () => closeModal(loginModal));

    // 예 버튼 - 로그인 페이지로 이동 (장바구니로 돌아오기 위한 redirect 파라미터 추가)
    confirmBtn.addEventListener("click", () => {
      closeModal(loginModal);
      window.location.href = "../login/login.html?redirect=cart";
    });
  }
}

// 모달 열기
function openModal(modalId, item = null) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  currentModalItem = item;

  // 수량 선택 모달인 경우 초기값 설정
  if (modalId === "quantityModal" && item) {
    const qtyInput = modal.querySelector(".qty-modal-input");
    if (qtyInput) {
      qtyInput.value = item.quantity;
    }
  }

  // 삭제 모달인 경우 상품명 표시
  if (modalId === "deleteModal" && item) {
    const messageElement = modal.querySelector(".modal-message");
    if (messageElement) {
      messageElement.textContent = `${item.name}을(를) 삭제하시겠습니까?`;
    }
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // 배경 스크롤 방지
}

// 모달 닫기
function closeModal(modal) {
  if (typeof modal === "string") {
    modal = document.getElementById(modal);
  }
  if (!modal) return;

  modal.classList.remove("active");
  document.body.style.overflow = ""; // 배경 스크롤 복원
  currentModalItem = null;
}

// 장바구니 아이템 삭제 API 호출
async function deleteCartItem(cartItemId) {
  try {
    // Authorization 헤더 추가 (PROJECT.md 기준)
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} - ${response.statusText}`
      );
    }

    console.log("✓ 삭제 성공");
    return true;
  } catch (error) {
    console.error("✗ 삭제 실패:", error);
    alert("상품 삭제에 실패했습니다. 다시 시도해주세요.");
    throw error;
  }
}

// 테스트용: 콘솔에서 사용 가능한 함수들
window.addToCart = addToCart;
window.clearCart = clearCart;
window.cartItems = cartItems;
window.openModal = openModal;
