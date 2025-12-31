console.log("Header script loaded successfully.");

// 로고 클릭 이벤트
const mainLogo = document.getElementById('main-logo');
if (mainLogo) {
    mainLogo.addEventListener('click', () => {
        window.location.href = '/web/index.html';
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
        console.log('장바구니 클릭');
        // TODO: 장바구니 페이지로 이동
        alert('장바구니 페이지는 추후 구현 예정입니다.');
    });
}

// 사용자 아이콘 클릭 이벤트
const userIcon = document.getElementById('user-icon');
if (userIcon) {
    userIcon.addEventListener('click', () => {
        console.log('사용자 아이콘 클릭');
        // TODO: 로그인/마이페이지로 이동
        const isLoggedIn = false; // 추후 실제 로그인 상태 확인
        if (isLoggedIn) {
            window.location.href = '/web/mypage.html';
        } else {
            window.location.href = '/web/login.html';
        }
    });
}