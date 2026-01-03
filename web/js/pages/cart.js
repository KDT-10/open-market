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

renderCartItems();

// 주문하기
const orderBtnLarge = document.getElementById("order-btn-large");
orderBtnLarge.addEventListener("click", () => {
  order();
});

function renderCartItems() {
  const cartItems = document.getElementById("cart-items");

  toggleEmptyState(cartData.length > 0);

  cartData.forEach((data, index) => {
    const cartItem = createCartItem(data, index);
    cartItems.appendChild(cartItem);
  });

  showFinalData();
}

function bindQuantityEvents(cartItem, data, index) {
  const decreaseBtn = cartItem.querySelector(".quantity-decrease");
  const increaseBtn = cartItem.querySelector(".quantity-increase");

  const updateAmount = (delta) => {
    if (data.quantity + delta < 0) return;

    data.quantity += delta;
    modifyQuantity(index, data.quantity);

    showCartItemData(cartItem, data);
    showFinalData();
  };

  decreaseBtn.addEventListener("click", () => updateAmount(-1));
  increaseBtn.addEventListener("click", () => updateAmount(1));
}

function createCartItem(data, index) {
  data.quantity ??= 1;

  const cartItem = cloneCartItemElem(data);
  cartItem.id = `item-${index}`;

  showCartItemData(cartItem, data);
  bindQuantityEvents(cartItem, data, index);

  return cartItem;
}

function toggleEmptyState(hasItems) {
  document.getElementById("empty-message").classList.toggle("hidden", hasItems);
  document.getElementById("cart-container-inner").classList.toggle("hidden", !hasItems);
}

// 수량 변경 시 sessionStorage 업데이트
function modifyQuantity(index, newQuantity) {
  cartData[index].quantity = newQuantity;
  sessionStorage.setItem("cartData", JSON.stringify(cartData));
}

// 데이터 렌더링(카트 아이템)
function showCartItemData(elem, data) {
  elem.querySelector(".quantity-amount").textContent = data.quantity;
  elem.querySelector(".price-red").textContent = `${(data.price * data.quantity).toLocaleString()}원`;
}

// 결제 예정 금액 렌더링
function showFinalData() {
  const {
    priceSum,
    discountAmount,
    deliverySum,
    finalPrice
  } = calculateCartSummary(cartData);

  document.getElementById("total-price").textContent = priceSum.toLocaleString();
  document.getElementById("discount-amount").textContent = discountAmount.toLocaleString();
  document.getElementById("delivery-fee").textContent = deliverySum.toLocaleString();
  document.getElementById("final-price").textContent = finalPrice.toLocaleString();
}

// 결제 예정 금액 계산
function calculateCartSummary(cartData, discountRate = 0) {
  const { priceSum, deliverySum } = cartData.reduce(
    (acc, { price, quantity, shipping_fee }) => {
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
  const el = node.querySelector(".cart-item");

  el.querySelector(".product-img-wrapper img").src = image;
  el.querySelector(".main-text-brand").textContent = store_name;
  el.querySelector(".main-text-name").textContent = name;
  el.querySelector(".main-text-price-unit").textContent = `${price.toLocaleString()}원`;
  el.querySelector(".secondary-text-delivery").textContent = shipping_method;
  el.querySelector(".price-red").textContent = `${price.toLocaleString()}원`;

  return el;
}
