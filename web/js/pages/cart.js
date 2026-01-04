import { createModal } from "/js/common/modal.js";

// TODO: TEST: 임시 데이터 사용 중
// sessionStorage에서 cartData 불러와서 표시
const cartData = JSON.parse(sessionStorage.getItem("cartData")) || [
  {
    "id": 1,
    "name": "Hack Your Life 개구리 노트북 파우치",
    "info": "우당탕탕 라이언의 실무생",
    "image": "./assets/images/product1.png",
    "price": 29000,
    "shipping_method": "PARCEL",
    "shipping_fee": 1000,
    "stock": 8,
    "seller": {
      "username": "seller@test.com",
      "name": "이스트2",
      "phone_number": "010-1111-2222",
      "user_type": "SELLER",
      "company_registration_number": "1122334455",
      "store_name": "이스트가게"
    },
    "created_at": "2024-10-27T10:30:00.000Z",
    "updated_at": "2025-11-18T03:29:19.984Z"
  },
  {
    "id": 2,
    "name": "네 개발자니? 개발자팀 코딩키링",
    "info": "개구쟁이코더들",
    "image": "./assets/images/product2.png",
    "price": 29000,
    "shipping_method": "DELIVERY",
    "shipping_fee": 1000,
    "stock": 16,
    "seller": {
      "username": "seller@test.com",
      "name": "이스트2",
      "phone_number": "010-1111-2222",
      "user_type": "SELLER",
      "company_registration_number": "1122334455",
      "store_name": "이스트가게"
    },
    "created_at": "2024-10-27T10:30:00.000Z",
    "updated_at": "2025-10-22T08:28:58.816Z"
  },
];

const modifyQuantityModalPromise = createModifyQuantityModal();
const deleteCartItemModalPromise = createDeleteCartItemModal();
const orderModalPromise = createOrderModal();
renderCartItems();

// 주문하기
const orderBtnLarge = document.getElementById("order-btn-large");
orderBtnLarge.addEventListener("click", () => {
  order();
});

function renderCartItems() {
  bindIncludeInTotalAllEvent();

  const cartItems = document.getElementById("cart-items");

  toggleEmptyState(cartData.length > 0);

  cartData.forEach((data) => {
    data.quantity ??= 1;
    data.includeInTotal ??= false;
    const cartItem = createCartItem(data);
    cartItems.appendChild(cartItem);
  });

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

    updateFinalData();
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
  updateFinalData();
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
    const modalObj = await deleteCartItemModalPromise;
    modalObj.open(() => {
      cartItem.remove();
      const id = cartItem.id.split("-")[1];
      deleteSessionStorage(id);
      updateFinalData();
    });
  });
}

function bindModifyEvent(cartItem, data) {
  const decreaseBtn = cartItem.querySelector(".quantity-decrease");
  const increaseBtn = cartItem.querySelector(".quantity-increase");
  const quantityAmountBtn = cartItem.querySelector(".quantity-amount-btn");

  const updateAmount = (amount) => {
    if (data.quantity + amount < 1) return;
    data.quantity += amount;
    updateSessionStorage();
    updateCartItemData(cartItem, data);
    updateFinalData();
  };
  decreaseBtn.addEventListener("click", () => updateAmount(-1));
  increaseBtn.addEventListener("click", () => updateAmount(1));

  quantityAmountBtn.addEventListener("click", async () => {
    const quantityAmount = quantityAmountBtn.textContent;
    const modalObj = await modifyQuantityModalPromise;
    const modalQuantityAmountBtn = modalObj.modal.querySelector(".quantity-amount-btn");
    modalQuantityAmountBtn.textContent = quantityAmount;
    modalObj.open(() => {
      const modalQuantityAmount = Number(modalQuantityAmountBtn.textContent);
      data.quantity = modalQuantityAmount;
      updateSessionStorage();
      updateCartItemData(cartItem, data);
      updateFinalData();
    });
  });
}

function bindIncludeInTotalEvent(cartItem, data) {
  const includeInTotal = cartItem.querySelector(".include-in-total");
  includeInTotal.addEventListener("change", () => {
    data.includeInTotal = includeInTotal.checked;
    updateFinalData();
  });
}

function deleteSessionStorage(id) {
  const index = cartData.findIndex(data => Number(data.id) === Number(id));
  if (index !== -1) cartData.splice(index, 1);
  updateSessionStorage();
}

function updateSessionStorage() {
  sessionStorage.setItem("cartData", JSON.stringify(cartData));
}

// 데이터 렌더링(카트 아이템)
function updateCartItemData(elem, data) {
  elem.querySelector(".quantity-amount-btn").textContent = data.quantity;
  elem.querySelector(".price-red").textContent = `${(data.price * data.quantity).toLocaleString()}원`;
}

// 결제 예정 금액 렌더링
function updateFinalData() {
  const {
    priceSum,
    discountAmount,
    deliverySum,
    finalPrice
  } = calcPriceSum(cartData);

  document.getElementById("total-price").textContent = priceSum.toLocaleString();
  document.getElementById("discount-amount").textContent = discountAmount.toLocaleString();
  document.getElementById("delivery-fee").textContent = deliverySum.toLocaleString();
  document.getElementById("final-price").textContent = finalPrice.toLocaleString();
}

// 결제 예정 금액 계산
function calcPriceSum(cartData) {
  // TODO: discount는 db에 없음
  let discountRate = 0.0;

  const { priceSum, deliverySum } = cartData.reduce(
    (acc, { price, quantity, shipping_fee, includeInTotal }) => {
      if (!includeInTotal) return acc;
      acc.priceSum += price * quantity;
      acc.deliverySum += quantity > 0 ? shipping_fee : 0;
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
  const selectedItems = cartData.filter(item => document.getElementById(`item-${item.id}`).checked);
  sessionStorage.setItem("orderData", JSON.stringify(selectedItems));
  window.location.href = "order.html";
}

// TODO: 각 모달 상세 내용
async function createModifyQuantityModal() {
  const parent = document.body;
  const content = document.createElement("div");
  const template = document.getElementById("cart-item-template");
  const templateContent = template.content;
  const quantityControlTemplate = templateContent.querySelector(".quantity-control");
  const quantityControl = quantityControlTemplate.cloneNode(true);
  content.appendChild(quantityControl);
  const cancelBtnTxt = "취소";
  const confirmBtnTxt = "수정";
  const modalObj = await createModal({
    parent,
    content,
    cancelBtnTxt,
    confirmBtnTxt
  });

  bindModalModifyEvent(modalObj.modal);

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

async function createDeleteCartItemModal() {
  const parent = document.body;
  const content = document.createElement("p");
  content.textContent = "상품을 삭제하시겠습니까?";
  const cancelBtnTxt = "취소";
  const confirmBtnTxt = "확인";
  const modalObj = await createModal({
    parent,
    content,
    cancelBtnTxt,
    confirmBtnTxt
  });

  return modalObj;
}
async function createOrderModal() {
  // const modalObj = await createModal();
  // modalObj.setContent();
  // return modalObj;
}