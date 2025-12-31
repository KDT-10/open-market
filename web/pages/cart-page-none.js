// 장바구니 데이터 (예시 데이터 - 실제로는 서버에서 가져오거나 localStorage에서 불러옴)
let cartItems = [];

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", function () {
  // 초기 렌더링
  renderCart();

  // 검색 기능
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");

  searchBtn.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      console.log("검색어:", searchTerm);
      // 검색 기능 구현
    }
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        console.log("검색어:", searchTerm);
        // 검색 기능 구현
      }
    }
  });

  // 장바구니 버튼
  const cartBtn = document.querySelector(".cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", function () {
      console.log("장바구니 페이지");
    });
  }

  // 마이페이지 버튼
  const mypageBtn = document.querySelector(".mypage-btn");
  if (mypageBtn) {
    mypageBtn.addEventListener("click", function () {
      console.log("마이페이지로 이동");
    });
  }
});

function renderCart() {
  const emptyCart = document.getElementById("emptyCart");
  const cartContainer = document.getElementById("cartContainer");
  const cartProducts = document.getElementById("cartProducts");
}

//장바구니가 비어있는지 확인
if (cartItems.length === 0) {
  emptyCart.style.display = "none";
} else {
  emptyCart.style.display = "none";
  cartContainer.style.display = "block";

  //상품 목록 렌더링

  cartProducts.innerHTML = "";
  cartItems.forEach((item, index) => {
    const productCard = createProductCard(item, index);
    cartProducts.appendChild(productCard);
  });
  //금액계산이랑 업데이트
  updateOrderSummary();
}

function createProductCard(item, index) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
  <input type="checkbox"
  class=product-checkbox"
  id="product${item.id}"
  ${item.checked ? "checked" : ""}
  />
  <label for="product${item.id}" class"checkbox-label"></label>
  <div class="product-image">
  <img src="${item.image}" alt="${item.name}" />
  </div>
  
  <div class="product-info">
  <p class="product-category">${item.category}</p>
  <h3 class="product-name">${item.name}</h3>
  <p class="product-price">${formatPrice(item.price)}원</p>
  <p class="product-option">${item.option}</p>
  </div>
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
}
