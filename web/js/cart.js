// ==============================
// cart.js
// ==============================

// DOM 요소
const emptyEl = document.getElementById("cart-empty");
const listEl = document.getElementById("cart-list");
const itemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const orderBtn = document.getElementById("order-btn");

let cartItems = []; // 장바구니 상태 저장

document.addEventListener("DOMContentLoaded", loadCart);

/**
 * 장바구니 조회
 */ function loadCart() {
  // 데이터를 불러오기 전 초기 상태 설정 (선택 사항)
  emptyEl.style.display = "block";
  listEl.style.display = "none";

  if (!Utils.isLoggedIn()) {
    alert("로그인이 필요합니다.");
    location.href = "/signin.html";
    return;
  }

  fetch(`${API_URL}/cart`, {
    headers: Utils.getAuthHeaders(),
  })
    .then((res) => res.json())
    .then((data) => {
      cartItems = data.results;
      // 데이터 결과에 따라 화면 전환
      if (cartItems && cartItems.length > 0) {
        renderCartList();
      } else {
        renderEmpty();
      }
    })
    .catch((err) => {
      console.error("데이터 로딩 실패:", err);
      renderEmpty(); // 에러 발생 시에도 빈 화면 표시
    });
}

/**
 * 빈 장바구니 화면
 */
function renderEmpty() {
  emptyEl.style.display = "block";
  listEl.style.display = "none";
}

/**
 * 장바구니 리스트 렌더링
 */
function renderCartList() {
  emptyEl.style.display = "none";
  listEl.style.display = "block";

  itemsEl.innerHTML = "";
  cartItems.forEach((item) => {
    const li = document.createElement("li");
    li.dataset.id = item.id;

    li.innerHTML = `
      <input type="checkbox" class="item-check" checked />

      <strong>${item.product.name}</strong><br/>

      가격: ${Utils.formatNumber(item.product.price)}원<br/>

      <button class="qty-minus">−</button>
      <span class="qty">${item.quantity}</span>
      <button class="qty-plus">+</button>

      <button class="delete-btn">삭제</button>
    `;

    itemsEl.appendChild(li);
  });

  bindEvents();
  updateTotalPrice();
}

/**
 * 이벤트 바인딩
 */
function bindEvents() {
  itemsEl
    .querySelectorAll(".qty-plus")
    .forEach((btn) => btn.addEventListener("click", onIncrease));

  itemsEl
    .querySelectorAll(".qty-minus")
    .forEach((btn) => btn.addEventListener("click", onDecrease));

  itemsEl
    .querySelectorAll(".delete-btn")
    .forEach((btn) => btn.addEventListener("click", onDelete));

  itemsEl
    .querySelectorAll(".item-check")
    .forEach((chk) => chk.addEventListener("change", updateTotalPrice));

  orderBtn.addEventListener("click", moveToOrder);
}

/**
 * 수량 증가
 */
function onIncrease(e) {
  const li = e.target.closest("li");
  const id = li.dataset.id;
  const item = cartItems.find((i) => i.id == id);

  updateQuantity(item.id, item.quantity + 1);
}

/**
 * 수량 감소
 */
function onDecrease(e) {
  const li = e.target.closest("li");
  const id = li.dataset.id;
  const item = cartItems.find((i) => i.id == id);

  if (item.quantity === 1) return;
  updateQuantity(item.id, item.quantity - 1);
}

/**
 * 수량 변경 API
 */
function updateQuantity(cartItemId, quantity) {
  fetch(`${API_URL}/cart/${cartItemId}`, {
    method: "PATCH",
    headers: Utils.getAuthHeaders(),
    body: JSON.stringify({ quantity }),
  }).then(loadCart);
}

/**
 * 상품 삭제
 */
function onDelete(e) {
  const li = e.target.closest("li");
  const id = li.dataset.id;

  if (!confirm("삭제하시겠습니까?")) return;

  fetch(`${API_URL}/cart/${id}`, {
    method: "DELETE",
    headers: Utils.getAuthHeaders(),
  }).then(loadCart);
}

/**
 * 선택된 상품 합계 계산
 */
function updateTotalPrice() {
  let total = 0;

  itemsEl.querySelectorAll("li").forEach((li) => {
    const checked = li.querySelector(".item-check").checked;
    if (!checked) return;

    const id = li.dataset.id;
    const item = cartItems.find((i) => i.id == id);

    total += item.product.price * item.quantity;
  });

  totalPriceEl.textContent = Utils.formatNumber(total);
}

/**
 * 주문 페이지 이동
 */
function moveToOrder() {
  const selectedIds = [];

  itemsEl.querySelectorAll("li").forEach((li) => {
    if (li.querySelector(".item-check").checked) {
      selectedIds.push(li.dataset.id);
    }
  });

  if (selectedIds.length === 0) {
    alert("주문할 상품을 선택하세요.");
    return;
  }

  // 선택 상품 저장 (주문 페이지에서 사용)
  localStorage.setItem("order_items", JSON.stringify(selectedIds));
  location.href = "/order.html";
}
