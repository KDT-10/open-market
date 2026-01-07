import { createModal } from "../common/modal.js";
import { isLoggedIn, checkLogin, fetchWithAuth } from "../common/auth.js";
import { API_BASE_URL } from "../common/config.js";

// 장바구니 데이터 로드
let cartData;
let sessionCartData;
// 장바구니 데이터 로드
(async () => {
  sessionCartData = JSON.parse(sessionStorage.getItem("cartData")) || [];
  cartData = await Promise.all(
    sessionCartData.map(async ({ product_id }) => ({
      ...(await fetchGetProduct(product_id)),
      includeInTotal: false,
    }))
  );
  renderCartItems();
})();

const modalPromise = loadModal();

// 주문하기
const orderBtnLarge = document.getElementById("order-btn-large");
orderBtnLarge.addEventListener("click", async () => {
  const body = document.body;
  if (!await checkLogin(body)) return;
  order();
});

function renderCartItems() {
  bindIncludeInTotalAllEvent();

  const cartItems = document.getElementById("cart-items");

  toggleEmptyState(cartData.length > 0);

  cartData.forEach((data) => {
    const cartItem = createCartItem(data);
    cartItems.appendChild(cartItem);
  });

  const includeInTotalAll = document.getElementById("include-in-total-all");
  includeInTotalAll.checked = !hasAnyExcluded();

  updateFinalData();
}

function bindIncludeInTotalAllEvent() {
  const includeInTotalAll = document.getElementById("include-in-total-all");
  includeInTotalAll.addEventListener("change", () => {
    const includeInTotals = document.querySelectorAll(".include-in-total");
    includeInTotals.forEach((elem) => {
      elem.checked = includeInTotalAll.checked;
      elem.dispatchEvent(new Event("change"));
    });
  });
}

function toggleEmptyState(hasItems) {
  document.getElementById("empty-message").classList.toggle("hidden", hasItems);
  document.getElementById("cart-container-inner").classList.toggle("hidden", !hasItems);
}

function createCartItem(data) {
  const { id } = data;
  const cartItem = cloneCartItemElem(data);
  cartItem.id = `item-${id}`;
  bindDeleteCartItemEvent(cartItem);
  bindModifyEvent(cartItem, data);
  bindIncludeInTotalEvent(cartItem, data);
  updateCartItemData(cartItem, data);
  return cartItem;
}

// cartItem 생성
function cloneCartItemElem(data) {
  const {
    image,
    name,
    price,
    shipping_method,
    seller: { store_name }
  } = data;

  const template = document.getElementById("cart-item-template");
  const node = template.content.cloneNode(true);
  const elem = node.querySelector(".cart-item");

  elem.querySelector(".include-in-total").checked = getIncludeInTotal(data.id);
  elem.querySelector(".product-img-wrapper img").src = image;
  elem.querySelector(".main-text-brand").textContent = store_name;
  elem.querySelector(".main-text-name").textContent = name;
  elem.querySelector(".main-text-price-unit").textContent = `${price.toLocaleString()}원`;
  elem.querySelector(".secondary-text-delivery").textContent = shipping_method;
  elem.querySelector(".price-red").textContent = `${price.toLocaleString()}원`;

  return elem;
}

function bindDeleteCartItemEvent(cartItem) {
  const deleteBtn = cartItem.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", async () => {
    const modalObj = await modalPromise;
    setDeleteModal(modalObj);
    modalObj.open(() => {
      const id = getCartItemIdFromElem(cartItem);
      if (isLoggedIn()) {
        fetchDeleteCart();
      }
      else {
        deleteSessionStorage(id);
      }
      cartItem.remove();
      updateFinalData();
      toggleEmptyState(cartData.length > 0);
    });
  });
}

function getCartItemIdFromElem(elem) {
  return elem.id.split("-")[1];
}

function bindModifyEvent(cartItem, data) {
  const decreaseBtn = cartItem.querySelector(".quantity-decrease");
  const increaseBtn = cartItem.querySelector(".quantity-increase");
  const quantityAmountBtn = cartItem.querySelector(".quantity-amount-btn");

  const updateAmount = (amount) => {
    modifyQuantity(data, amount);
    updateCartSessionStorage();
    updateCartItemData(cartItem, data);
    updateFinalData();
  };
  decreaseBtn.addEventListener("click", () => updateAmount(-1));
  increaseBtn.addEventListener("click", () => updateAmount(1));

  quantityAmountBtn.addEventListener("click", async () => {
    const quantityAmount = quantityAmountBtn.textContent;
    const modalObj = await modalPromise;
    setModifyModal(modalObj);
    const modalQuantityAmountBtn = modalObj.modal.querySelector(".quantity-amount-btn");
    modalQuantityAmountBtn.textContent = quantityAmount;
    modalObj.open(() => {
      const modalQuantityAmount = Number(modalQuantityAmountBtn.textContent);
      setQuantity(data, modalQuantityAmount);
      updateCartSessionStorage();
      updateCartItemData(cartItem, data);
      updateFinalData();
    });
  });
}
function setModifyModal(modalObj) {
  const parent = document.body;
  const content = document.createElement("div");
  const template = document.getElementById("cart-item-template");
  const templateContent = template.content;
  const quantityControlTemplate = templateContent.querySelector(".quantity-control");
  const quantityControl = quantityControlTemplate.cloneNode(true);
  content.appendChild(quantityControl);
  const cancelBtnTxt = "취소";
  const confirmBtnTxt = "수정";
  modalObj.setModal({
    parent,
    content,
    cancelBtnTxt,
    confirmBtnTxt
  });

  bindModalModifyEvent(modalObj.modal);
}
function setDeleteModal(modalObj) {
  const parent = document.body;
  const content = document.createElement("p");
  content.textContent = "상품을 삭제하시겠습니까?";
  const cancelBtnTxt = "취소";
  const confirmBtnTxt = "확인";
  modalObj.setModal({
    parent,
    content,
    cancelBtnTxt,
    confirmBtnTxt
  });
}

function bindIncludeInTotalEvent(cartItem, data) {
  const includeInTotal = cartItem.querySelector(".include-in-total");
  includeInTotal.addEventListener("change", () => {
    setIncludeInTotal(data.id, includeInTotal.checked);
    updateFinalData();
  });
}

function deleteSessionStorage(id) {
  const index = cartData.findIndex(data => Number(data.id) === Number(id));
  if (index !== -1) cartData.splice(index, 1);
  if (index !== -1) sessionCartData.splice(index, 1);
  updateCartSessionStorage();
}

function updateCartSessionStorage() {
  sessionStorage.setItem("cart", JSON.stringify(cartData));
  sessionStorage.setItem("cartData", JSON.stringify(sessionCartData));
}

// 데이터 렌더링(카트 아이템)
function updateCartItemData(elem, data) {
  elem.querySelector(".quantity-amount-btn").textContent = getQuantity(data.id);
  elem.querySelector(".price-red").textContent = `${(data.price * getQuantity(data.id)).toLocaleString()}원`;
}

// 결제 예정 금액 렌더링
function updateFinalData() {
  const {
    priceSum,
    discountAmount,
    deliverySum,
    finalPrice
  } = calcPriceSum();

  document.getElementById("total-price").textContent = priceSum.toLocaleString();
  document.getElementById("discount-amount").textContent = discountAmount.toLocaleString();
  document.getElementById("delivery-fee").textContent = deliverySum.toLocaleString();
  document.getElementById("final-price").textContent = finalPrice.toLocaleString();
}

// 결제 예정 금액 계산
function calcPriceSum() {
  // TODO: discount는 db에 없음
  let discountRate = 0.0;

  const { priceSum, deliverySum } = cartData.reduce(
    (acc, { price, id, shipping_fee }) => {
      if (!getIncludeInTotal(id)) return acc;
      acc.priceSum += price * getQuantity(id);
      acc.deliverySum += getQuantity(id) > 0 ? shipping_fee : 0;
      return acc;
    },
    { priceSum: 0, deliverySum: 0 }
  );

  const discountAmount = priceSum * discountRate;
  const finalPrice = priceSum - discountAmount + deliverySum;

  return {
    priceSum,
    discountAmount,
    deliverySum,
    finalPrice
  };
}

// "주문하기" 클릭 시 선택된 상품만 orderData로 전달
function order() {
  if (hasAnyIncluded()) {
    sessionStorage.removeItem("orderData");
    const selectedItems = sessionCartData.filter(item => item.includeInTotal);
    sessionStorage.setItem("orderData", JSON.stringify(selectedItems));
    window.location.href = "order.html";
  }
  else {
    (async () => {
      const modalObj = await modalPromise;
      const parent = document.body;
      const content = document.createElement("p");
      content.textContent = "구매할 상품을 선택해주세요.";
      const cancelBtnTxt = null;
      const confirmBtnTxt = "확인";
      modalObj.setModal({
        parent,
        content,
        cancelBtnTxt,
        confirmBtnTxt
      });
      modalObj.open(modalObj.close());
    })();
  }
}

async function loadModal() {
  const modalObj = await createModal();
  return modalObj;
}
function bindModalModifyEvent(modal) {
  const decreaseBtn = modal.querySelector(".quantity-decrease");
  const increaseBtn = modal.querySelector(".quantity-increase");

  const updateAmount = (amount) => {
    const quantityAmountBtn = modal.querySelector(".quantity-amount-btn");
    let quantityAmount = Number(quantityAmountBtn.textContent);
    if (quantityAmount + amount < 1) return;
    quantityAmount += amount;
    quantityAmountBtn.textContent = quantityAmount;
  };
  decreaseBtn.addEventListener("click", () => updateAmount(-1));
  increaseBtn.addEventListener("click", () => updateAmount(1));
}

async function fetchGetProduct(id) {
  const url = `${API_BASE_URL}/products/${id}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// GET /api/cart 호출하여 상품 목록 표시
async function fetchGetCart() {
  const endpoint = `cart`;
  const response = await fetchWithAuth(endpoint, {
    method: "GET"
  });
  const data = await response.json();
  return data.results;
}

async function fetchDeleteCart(cartItemId) {
  const endpoint = `cart/${cartItemId}/`;

  const response = await fetchWithAuth(endpoint, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("장바구니 삭제 실패");
  }
}

function setIncludeInTotal(id, state) {
  sessionCartData.find(item => Number(item.product_id) === Number(id)).includeInTotal = state;
  updateCartSessionStorage();
}
function getIncludeInTotal(id) {
  return sessionCartData.find(item => Number(item.product_id) === Number(id)).includeInTotal;
}
function getQuantity(id) {
  return sessionCartData.find(item => Number(item.product_id) === Number(id)).quantity;
}
function setQuantity(data, newQuantity) {
  const item = sessionCartData.find(
    item => Number(item.product_id) === Number(data.id)
  );

  if (newQuantity > data.stock) {
    (async () => {
      const modalObj = await modalPromise;
      const parent = document.body;
      const content = document.createElement("p");
      content.textContent = "재고가 부족합니다.";
      const cancelBtnTxt = null;
      const confirmBtnTxt = "확인";
      modalObj.setModal({
        parent,
        content,
        cancelBtnTxt,
        confirmBtnTxt
      });
      modalObj.open(modalObj.close());
    })();
    return;
  }

  item.quantity = newQuantity;
  updateCartSessionStorage();
}
function modifyQuantity(data, amount) {
  const item = sessionCartData.find(
    item => Number(item.product_id) === Number(data.id)
  );

  const newQuantity = item.quantity + amount;

  if (newQuantity < 1) {
    (async () => {
      const modalObj = await modalPromise;
      const parent = document.body;
      const content = document.createElement("p");
      content.textContent = "최소 1개 이상 선택해야 합니다.";
      const cancelBtnTxt = null;
      const confirmBtnTxt = "확인";
      modalObj.setModal({
        parent,
        content,
        cancelBtnTxt,
        confirmBtnTxt
      });
      modalObj.open(modalObj.close());
    })();
    return;
  }
  if (newQuantity > data.stock) {
    (async () => {
      const modalObj = await modalPromise;
      const parent = document.body;
      const content = document.createElement("p");
      content.textContent = "재고가 부족합니다.";
      const cancelBtnTxt = null;
      const confirmBtnTxt = "확인";
      modalObj.setModal({
        parent,
        content,
        cancelBtnTxt,
        confirmBtnTxt
      });
      modalObj.open(modalObj.close());
    })();
    return;
  }

  item.quantity = newQuantity;
  updateCartSessionStorage();
}

function hasAnyExcluded() {
  const cartItems = document.getElementById("cart-items");
  return [...cartItems.querySelectorAll(".include-in-total")].some(checkbox => !checkbox.checked);
}
function hasAnyIncluded() {
  const cartItems = document.getElementById("cart-items");
  return [...cartItems.querySelectorAll(".include-in-total")].some(checkbox => checkbox.checked);
}