import { isLoggedIn, logout } from "./auth.js";
import { createModal } from "./modal.js";

export async function initHeader() {
  const parent = document.body;
  const content = document.createElement("p");
  content.textContent = "로그아웃 하시겠습니까?";
  const cancelBtnTxt = "취소";
  const confirmBtnTxt = "확인";
  const modalObj = await createModal({
    parent,
    content,
    cancelBtnTxt,
    confirmBtnTxt,
  });

  // 로고 클릭 이벤트
  const mainLogo = document.getElementById("main-logo");
  if (mainLogo) {
    mainLogo.addEventListener("click", () => {
      window.location.href = "index.html";
    });
    mainLogo.style.cursor = "pointer";
  }

  // 검색바 기능
  const searchBar = document.getElementById("search-bar");
  if (searchBar) {
    searchBar.innerHTML = `
        <input type="text" placeholder="상품을 검색해보세요" id="search-input">
        <svg width="24" height="24">
            <use href="assets/icons/sprite.svg#icon-search"></use>
        </svg>`;

    const searchInput = document.getElementById("search-input");
    const searchIcon = searchBar.querySelector("#search-bar > svg");

    const performSearch = async () => {
      const query = searchInput.value.trim();
      if (query) {
        sessionStorage.setItem("searchTerm", query);
        window.location.href = "index.html";
      }
    };

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });

    searchIcon.addEventListener("click", (e) => {
      performSearch();
    });
  }

  // 장바구니 아이콘 클릭 이벤트
  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      window.location.href = "cart.html";
    });
  }

  // 사용자 아이콘 클릭 이벤트
  const userIcon = document.getElementById("user-icon");
  if (userIcon) {
    userIcon.addEventListener("click", () => {
      if (isLoggedIn()) {
        modalObj.open(() => {
          logout();
        });
      } else {
        sessionStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "signin.html";
      }
    });
  }

  // 판매자 회원 헤더 스타일 토글
  const userData = localStorage.getItem("user");
  const sellerCenterButton = document.getElementById('seller-center-button');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.user_type === "SELLER") {
        sellerCenterButton.classList.remove('hidden');
        cartIcon.classList.add('hidden');
      } else {
        sellerCenterButton.classList.add('hidden');
        cartIcon.classList.remove('hidden');
      }
    } catch (error) {
      console.error("user 데이터 파싱 오류:", error);
    }
  } else {
    sellerCenterButton.classList.add('hidden');
    cartIcon.classList.remove('hidden');
  }
}
