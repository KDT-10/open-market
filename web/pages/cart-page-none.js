// 장바구니 데이터 (예시 데이터 - 실제로는 서버에서 가져오거나 localStorage에서 불러옴)
let cartItems = [];
// // ===== 테스트용: 장바구니에 상품 2개 보기 (주석 해제하면 상품 2개 표시됨) =====

cartItems = [
  {
    id: 1,
    name: "담려낼 개발자 무릎 담요",
    category: "책/엔드/굿즈",
    price: 17500,
    image: "../assets/images/product3.png",
    option: "택배배송 / 무료배송",
    quantity: 1,
    checked: true,
  },
  {
    id: 2,
    name: "Hack Your Life 개발자 노트북 파우치",
    category: "주당당틀 라이즈의 삼실집",
    price: 29000,
    image: "../assets/images/product1.png",
    option: "택배배송 / 무료배송",
    quantity: 1,
    checked: true,
  },
];

// // ===== 테스트 데이터 끝 =====
// // 페이지 로드 시 실행
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
  minusBtn.addEventListener("click", function () {
    if (cartItems[index].quantity > 1) {
      cartItems[index].quantity--;
      renderCart();
    }
  });

  // 수량 증가 버튼
  const plusBtn = card.querySelector(".plus");
  plusBtn.addEventListener("click", function () {
    cartItems[index].quantity++;
    renderCart();
  });

  // 수량 입력 필드
  const qtyInput = card.querySelector(".qty-input");
  qtyInput.addEventListener("change", function () {
    const newQty = parseInt(this.value);
    if (newQty >= 1) {
      cartItems[index].quantity = newQty;
      renderCart();
    } else {
      this.value = cartItems[index].quantity;
    }
  });

  // 개별 주문하기 버튼
  const orderBtn = card.querySelector(".btn-order");
  orderBtn.addEventListener("click", function () {
    console.log("개별 주문:", item.name);
    alert(`${item.name} 주문하기`);
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
    alert(
      `총 ${checkedItems.length}개 상품 주문하기\n결제 예정 금액: ${formatPrice(
        finalTotal
      )}원`
    );
  };
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
