import { fetchAPI, isLoggedIn } from '../../scripts/api.js';

// 장바구니 데이터
let cartItems = [];

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", function () {
  // 로그인 체크
  if (!isLoggedIn()) {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
      window.location.href = '../login/login.html';
    }
    return;
  }

  fetchCartItems();
  initModalEventListeners();
});

// API에서 장바구니 데이터 가져오기
async function fetchCartItems() {
  try {
    showLoadingState();

    // API에서 장바구니 가져오기
    const response = await fetchAPI('/cart/?page_size=1000');
    if (!response.ok) throw new Error("장바구니 로드 실패");

    const data = await response.json();
    const apiCartItems = data.results || [];

    if (apiCartItems.length === 0) {
      cartItems = [];
      renderCart();
      return;
    }

    // API 데이터를 화면 표시용 형식으로 변환
    cartItems = apiCartItems.map(item => ({
      id: item.id,
      name: item.product.name,
      category: item.product.seller?.store_name || "일반상품",
      price: item.product.price,
      image: item.product.image,
      option: `${item.product.shipping_method === "PARCEL" ? "택배배송" : "직접배송"} / ${item.product.shipping_fee === 0 ? "무료배송" : "유료배송"}`,
      quantity: item.quantity,
      checked: true,
      productId: item.product.id,
    }));

    console.log(`✅ 장바구니 데이터 로드 완료: ${cartItems.length}개 상품`);
    renderCart();
  } catch (error) {
    console.error("❌ 장바구니 데이터를 불러오는 중 오류가 발생했습니다:", error);
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
      <div class="error-message">
        <p class="empty-title">오류 발생</p>
        <p class="empty-subtitle">${message}</p>
        <button class="retry-button" onclick="window.location.reload()">다시 시도</button>
      </div>
    `;
    emptyCart.style.display = "flex";
  }
}

// 장바구니 렌더링
function renderCart() {
  const emptyCart = document.getElementById("emptyCart");
  const cartContainer = document.getElementById("cartContainer");

  if (cartItems.length === 0) {
    emptyCart.style.display = "flex";
    cartContainer.style.display = "none";
    emptyCart.innerHTML = `
      <p class="empty-title">장바구니에 담긴 상품이 없습니다.</p>
      <p class="empty-subtitle">원하는 상품을 장바구니에 담아보세요!</p>
    `;
    return;
  }

  emptyCart.style.display = "none";
  cartContainer.style.display = "flex";

  renderCartItemsList();
  updateCartSummary();
}

// 장바구니 아이템 목록 렌더링
function renderCartItemsList() {
  const cartItemsContainer = document.getElementById("cartItems");
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = cartItems
    .map(
      (item) => `
    <li class="cart-item">
      <input
        type="checkbox"
        class="item-checkbox"
        data-id="${item.id}"
        ${item.checked ? "checked" : ""}
        aria-label="${item.name} 선택"
      />
      <img src="${item.image}" alt="${item.name}" class="item-image" loading="lazy" />
      <div class="item-details">
        <p class="item-category">${item.category}</p>
        <p class="item-name">${item.name}</p>
        <p class="item-price">${item.price.toLocaleString()}원</p>
        <p class="item-option">${item.option}</p>
      </div>
      <div class="item-quantity">
        <button class="quantity-btn decrease" data-id="${item.id}" aria-label="수량 감소">-</button>
        <input type="number" value="${item.quantity}" class="quantity-input" data-id="${item.id}" min="1" max="99" aria-label="수량" />
        <button class="quantity-btn increase" data-id="${item.id}" aria-label="수량 증가">+</button>
      </div>
      <button class="delete-btn" data-id="${item.id}" aria-label="${item.name} 삭제">
        <img src="/assets/icons/icon-delete.svg" alt="삭제" />
      </button>
    </li>
  `
    )
    .join("");

  attachCartItemEventListeners();
}

// 장바구니 요약 업데이트
function updateCartSummary() {
  const checkedItems = cartItems.filter((item) => item.checked);

  const totalQuantity = checkedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalProductAmount = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 0; // 배송비 계산 로직 필요시 추가
  const totalAmount = totalProductAmount + shippingFee;

  document.getElementById("totalQuantity").textContent = `${totalQuantity}개`;
  document.getElementById("totalProductAmount").textContent = `${totalProductAmount.toLocaleString()}원`;
  document.getElementById("shippingFee").textContent = `${shippingFee.toLocaleString()}원`;
  document.getElementById("totalAmount").textContent = `${totalAmount.toLocaleString()}원`;
}

// 장바구니 아이템 이벤트 리스너 연결
function attachCartItemEventListeners() {
  // 체크박스
  document.querySelectorAll(".item-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const id = parseInt(e.target.dataset.id);
      const item = cartItems.find((item) => item.id === id);
      if (item) {
        item.checked = e.target.checked;
        updateCartSummary();
        updateSelectAllCheckbox();
      }
    });
  });

  // 수량 증가 버튼
  document.querySelectorAll(".quantity-btn.increase").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = parseInt(e.target.dataset.id);
      await updateItemQuantity(id, 1);
    });
  });

  // 수량 감소 버튼
  document.querySelectorAll(".quantity-btn.decrease").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = parseInt(e.target.dataset.id);
      await updateItemQuantity(id, -1);
    });
  });

  // 수량 입력
  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const id = parseInt(e.target.dataset.id);
      const newQuantity = parseInt(e.target.value);
      const item = cartItems.find((item) => item.id === id);

      if (item && newQuantity > 0 && newQuantity <= 99) {
        await updateItemQuantityDirect(id, newQuantity);
      } else {
        e.target.value = item?.quantity || 1;
      }
    });
  });

  // 삭제 버튼
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = parseInt(e.target.closest("button").dataset.id);
      await deleteCartItem(id);
    });
  });
}

// 수량 업데이트 (상대적)
async function updateItemQuantity(id, delta) {
  const item = cartItems.find((item) => item.id === id);
  if (!item) return;

  const newQuantity = item.quantity + delta;
  if (newQuantity < 1 || newQuantity > 99) return;

  try {
    const response = await fetchAPI(`/cart/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQuantity })
    });

    if (!response.ok) throw new Error('수량 업데이트 실패');

    item.quantity = newQuantity;
    renderCart();
  } catch (error) {
    console.error('수량 업데이트 실패:', error);
    alert('수량 업데이트에 실패했습니다.');
  }
}

// 수량 업데이트 (절대값)
async function updateItemQuantityDirect(id, newQuantity) {
  const item = cartItems.find((item) => item.id === id);
  if (!item) return;

  try {
    const response = await fetchAPI(`/cart/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQuantity })
    });

    if (!response.ok) throw new Error('수량 업데이트 실패');

    item.quantity = newQuantity;
    renderCart();
  } catch (error) {
    console.error('수량 업데이트 실패:', error);
    alert('수량 업데이트에 실패했습니다.');
  }
}

// 장바구니 아이템 삭제
async function deleteCartItem(id) {
  if (!confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) return;

  try {
    const response = await fetchAPI(`/cart/${id}/`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('삭제 실패');

    cartItems = cartItems.filter((item) => item.id !== id);
    renderCart();
  } catch (error) {
    console.error('삭제 실패:', error);
    alert('상품 삭제에 실패했습니다.');
  }
}

// 전체 선택 체크박스 업데이트
function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.getElementById("selectAll");
  if (!selectAllCheckbox) return;

  const allChecked = cartItems.length > 0 && cartItems.every((item) => item.checked);
  selectAllCheckbox.checked = allChecked;
}

// 모달 이벤트 리스너
function initModalEventListeners() {
  const selectAllCheckbox = document.getElementById("selectAll");
  const deleteSelectedBtn = document.getElementById("deleteSelected");
  const orderBtn = document.getElementById("orderBtn");

  // 전체 선택
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", (e) => {
      const checked = e.target.checked;
      cartItems.forEach((item) => (item.checked = checked));
      renderCart();
    });
  }

  // 선택 삭제
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", async () => {
      const selectedItems = cartItems.filter((item) => item.checked);
      if (selectedItems.length === 0) {
        alert("삭제할 상품을 선택해주세요.");
        return;
      }

      if (!confirm(`선택한 ${selectedItems.length}개 상품을 삭제하시겠습니까?`)) return;

      try {
        // 선택된 아이템들을 순차적으로 삭제
        for (const item of selectedItems) {
          const response = await fetchAPI(`/cart/${item.id}/`, {
            method: 'DELETE'
          });
          if (!response.ok) throw new Error('삭제 실패');
        }

        cartItems = cartItems.filter((item) => !item.checked);
        renderCart();
      } catch (error) {
        console.error('선택 삭제 실패:', error);
        alert('선택한 상품 삭제에 실패했습니다.');
      }
    });
  }

  // 주문하기
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      const selectedItems = cartItems.filter((item) => item.checked);
      if (selectedItems.length === 0) {
        alert("주문할 상품을 선택해주세요.");
        return;
      }

      alert("주문 기능은 준비 중입니다.");
    });
  }
}
