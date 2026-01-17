import { isLoggedIn, logout } from "/js/common/auth.js";
import { createModal } from "/js/common/modal.js";

export function initHeader() {
    const parent = document.body;
    const content = document.createElement("p");
    content.textContent = "로그아웃 하시겠습니까?";
    const cancelBtnTxt = "취소";
    const confirmBtnTxt = "확인";
    const modalObj = createModal({
        parent,
        content,
        cancelBtnTxt,
        confirmBtnTxt
    });

    // 로고 클릭 이벤트
    const mainLogo = document.getElementById('main-logo');
    if (mainLogo) {
        mainLogo.addEventListener('click', () => {
            window.location.href = '/';
        });
        mainLogo.style.cursor = 'pointer';
    }

    // 검색바 기능
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.innerHTML = `
        <input type="text" placeholder="상품을 검색해보세요" id="search-input">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
    `;

        const searchInput = document.getElementById('search-input');
        const searchIcon = searchBar.querySelector('.search-icon');

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                console.log('검색어:', query);
                // TODO: 실제 검색 기능 구현
                alert(`"${query}" 검색 기능은 추후 구현 예정입니다.`);
            }
        };

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        searchIcon.addEventListener('click', performSearch);
        searchIcon.style.cursor = 'pointer';
    }

    // 장바구니 아이콘 클릭 이벤트
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            window.location.href = "/cart.html";
        });
    }

    // 사용자 아이콘 클릭 이벤트
    const userIcon = document.getElementById('user-icon');
    if (userIcon) {
        userIcon.addEventListener('click', () => {
            if (isLoggedIn()) {
                (async () => {
                    (await modalObj).open(() => {
                        logout();
                    })
                })();
            } else {
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = '/signin.html';
            }
        });
    }
}