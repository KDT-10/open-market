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
