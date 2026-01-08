import { API_BASE_URL } from "../common/config.js";
import { createModal } from "../common/modal.js";
import { isLoggedIn } from "../common/auth.js";

const modalObj = createModal();
const checkbox = document.getElementById("agreeCheckbox");
const payButton = document.getElementById("payButton");

checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    payButton.disabled = false;
    payButton.classList.add("active");
  } else {
    payButton.disabled = true;
    payButton.classList.remove("active");
  }
});

payButton.addEventListener("click", () => {
  if (!validateInputs()) {
    return;
  }

  // 주문 데이터 비우기
  sessionStorage.removeItem("orderData");
  orderData = [];

  // 장바구니에서 구매한 것들 비우기
  const orderProductIds = new Set(sessionOrderData.map(item => item.product_id));
  const updatedCartData = sessionCartData.filter(
    item => !orderProductIds.has(item.product_id)
  );

  // 결과 sessionStorage에 반영
  if (updatedCartData.length > 0) {
    sessionStorage.setItem('cartData', JSON.stringify(updatedCartData));
  } else {
    sessionStorage.removeItem('cartData');
  }

  // 렌더링
  renderOrderItems();

  (async () => {
    const parent = document.body;
    const content = document.createElement("p");
    content.textContent = "결제 완료되었습니다.";
    const cancelBtnTxt = null;
    const confirmBtnTxt = "메인으로 이동";
    (await modalObj).setModal({
      parent,
      content,
      cancelBtnTxt,
      confirmBtnTxt
    });
    (await modalObj).open(() => window.location.href = 'index.html');
  })();
});

let orderData;
let sessionOrderData;
let cartData;
let sessionCartData;
(async () => {
  // 로그인 상태에 따른 데이터 로드
  if (isLoggedIn()) {
    sessionOrderData = JSON.parse(sessionStorage.getItem("orderData")) || [];
    orderData = await Promise.all(
      sessionOrderData.map(async ({ product_id }) => ({
        ...(await fetchGetProduct(product_id)),
      }))
    );

    sessionCartData = JSON.parse(sessionStorage.getItem("cartData")) || [];
    cartData = await Promise.all(
      sessionCartData.map(async ({ product_id }) => ({
        ...(await fetchGetProduct(product_id)),
      }))
    );
  } else {
    window.location.href = "signin.html";
  }
  renderOrderItems();
})();

function renderOrderItems() {
  const orderItemContainer = document.querySelector(".order-container");
  const orderItems = document.querySelectorAll(".header-p");
  // 템플릿 제외 모두 삭제
  Array.from(orderItems).forEach((orderItemEl) => {
    orderItemEl.remove();
  });

  orderData.forEach((data) => {
    data.quantity ??= 1;
    data.includeInTotal ??= false;
    const orderItem = createOrderItem(data);
    orderItemContainer.appendChild(orderItem);
  });

  updateFinalData();
}

function createOrderItem(data) {
  const orderItem = cloneOrderItemElem(data);
  return orderItem;
}

function cloneOrderItemElem(data) {
  const {
    image,
    name,
    discount = 0.0,
    price,
    shipping_fee,
    seller: { store_name }
  } = data;

  const template = document.getElementById("order-item-template");
  const node = template.content.cloneNode(true);
  const elem = node.querySelector(".header-p");

  const discountAmount = Math.floor(price * discount * getQuantity(data.id));
  const shoppingFee = Number(shipping_fee) === 0 ? '무료배송' : `${shipping_fee.toLocaleString()}원`;
  const totalPrice = price * getQuantity(data.id);

  elem.querySelector(".header-p-fornt img").src = image;
  elem.querySelector(".order-item-brand").textContent = store_name;
  elem.querySelector(".order-item-name").textContent = name;
  elem.querySelector(".order-item-quantity").textContent = `수량 : ${getQuantity(data.id)}개`;
  elem.querySelector(".order-item-discount").textContent = `${discountAmount}원`;
  elem.querySelector(".order-item-shopping-fee").textContent = shoppingFee;
  elem.querySelector(".order-item-price").textContent = `${totalPrice.toLocaleString()}원`;

  return elem;
}

function updateFinalData() {
  const priceSumEl = document.getElementById("price-sum");
  const billPrice = document.getElementById("bill-price");
  const billDiscountAmount = document.getElementById("bill-discount-amount");
  const billShoppingFee = document.getElementById("bill-shopping-fee");
  const billTotalPrice = document.getElementById("bill-total-price");
  let priceSum = 0;
  let discountAmount = 0;
  let shoppingFee = 0;
  let totalPrice = 0;
  orderData.forEach(data => {
    priceSum += (data.price * getQuantity(data.id));
    discountAmount -= Math.floor(data.price * data.discountAmount ? data.discountAmount : 0.0);
    shoppingFee += data.shipping_fee;
  });
  totalPrice = priceSum - discountAmount + shoppingFee;

  priceSumEl.querySelector("span").textContent = totalPrice.toLocaleString();
  billPrice.querySelector("strong").textContent = priceSum.toLocaleString();
  billDiscountAmount.querySelector("strong").textContent = discountAmount.toLocaleString();
  billShoppingFee.querySelector("strong").textContent = shoppingFee.toLocaleString();
  billTotalPrice.querySelector("strong").textContent = totalPrice.toLocaleString();
}

function validateInputs() {
  const customerName = document.getElementById("customerName");
  if (customerName.value === "") {
    createSimpleModal("주문자 이름을 입력해주세요.");
    return false;
  }
  const customerPhone = ["customerPhone1", "customerPhone2", "customerPhone3"].map((str) => document.getElementById(str));
  if (customerPhone.some((el) => el.value === "")) {
    createSimpleModal("주문자 휴대폰을 입력해주세요.");
    return false;
  }
  const email = document.getElementById("email");
  if (email.value === "") {
    createSimpleModal("이메일을 입력해주세요.");
    return false;
  }
  const receiverName = document.getElementById("receiverName");
  if (receiverName.value === "") {
    createSimpleModal("배송지 수령인을 입력해주세요.");
    return false;
  }
  const receiverPhone = ["receiverPhone1", "receiverPhone2", "receiverPhone3"].map((str) => document.getElementById(str));
  if (receiverPhone.some((el) => el.value === "")) {
    createSimpleModal("배송지 휴대폰을 입력해주세요.");
    return false;
  }
  const receiverAddress = [
    "receiverAddress1",
    "receiverAddress2",
    "receiverAddress3"
  ].map((str) => document.getElementById(str));
  if (receiverAddress.some((el) => el.value === "")) {
    createSimpleModal("배송지 주소를 입력해주세요.");
    return false;
  }
  const selected = document.querySelector('input[name="pay-radiobtn"]:checked');
  const value = selected ? selected.value : null;
  if (!value) {
    createSimpleModal("결제수단을 선택해주세요.");
    return false;
  }

  return true;
}

async function fetchGetProduct(id) {
  const url = `${API_BASE_URL}/products/${id}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function getQuantity(id) {
  return sessionOrderData.find(item => Number(item.product_id) === Number(id)).quantity;
}

async function createSimpleModal(msg) {
  const parent = document.body;
  const content = document.createElement("p");
  content.textContent = msg;
  const cancelBtnTxt = null;
  const confirmBtnTxt = "확인";
  (await modalObj).setModal({
    parent,
    content,
    cancelBtnTxt,
    confirmBtnTxt
  });
  (await modalObj).open(async () => (await modalObj).close());
}