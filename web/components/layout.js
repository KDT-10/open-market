// 로그인 관련 공통 (토큰 저장 위치 LocalStorage)
function getAccessToken() {
  return localStorage.getItem('access_token'); // login.js랑 맞춤
}

// 로그인 여부 판단
function isLoggedIn() {
  return !!getAccessToken();
}

// 로그인 필요 처리
function requireLogin(callback) {
  return function (e) {
    e.preventDefault();
    if (!isLoggedIn()) {
      window.location.href = '/pages/login/login.html';
      return;
    }
    callback();
  };
}

// CSS 로드
loadCSS('/components/layout.css');

function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

// layout.html 로드 (header + footer)
loadLayout();

async function loadLayout() {
  try {
    const res = await fetch('/components/layout.html');
    if (!res.ok) throw new Error('layout.html 로드 실패');

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // layout에서 header와 footer만 가져오기
    const header = doc.querySelector('header');
    const footer = doc.querySelector('footer');

    if (header) document.body.prepend(header);
    if (footer) document.body.appendChild(footer);

    // 페이지 콘텐츠를 main으로 이동
    movePageContentToMain();

    // header 이벤트 연결
    bindHeaderEvents();
  } catch (err) {
    console.error('loadLayout 에러:', err);
  }
}

// 페이지 콘텐츠를 main 안으로 이동
function movePageContentToMain() {
  const main = document.querySelector('#main-content');
  if (!main) return;

  const pageContents = [...document.body.children].filter(
    el => !el.matches('header, footer, #main-content, script, link')
  );

  pageContents.forEach(el => main.appendChild(el));
}

// header 이벤트 바인딩
function bindHeaderEvents() {
  // 장바구니 버튼
  const cartBtn = document.querySelector('header .icon-item[aria-label="장바구니"]');
  if (cartBtn) {
    cartBtn.addEventListener('click', requireLogin(() => {
      window.location.href = '/pages/cart/cart.html';
    }));
  }

  // 마이페이지 버튼
  const mypageBtn = document.querySelector('header .icon-item[aria-label="마이페이지"]');
  if (mypageBtn) {
    mypageBtn.addEventListener('click', () => {
      if (!isLoggedIn()) {
        window.location.href = '/pages/login/login.html';
      } else {
        window.location.href = '/404.html';
      }
    });
  }
}
