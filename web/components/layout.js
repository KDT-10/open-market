// 로그인 관련 공통
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

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
async function loadLayout() {
  try {
    const res = await fetch('/components/layout.html');
    if (!res.ok) throw new Error('layout.html 로드 실패');

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // layout 삽입 (안전하게)
    if (doc && doc.body) {
      document.body.prepend(...doc.body.children);
    } else {
      console.error('layout.html 문서 구조가 잘못됨');
      return;
    }

    // 페이지 콘텐츠를 main으로 이동
    movePageContentToMain();

    // header 이벤트 연결
    bindHeaderEvents();
  } catch (err) {
    console.error('loadLayout 에러:', err);
  }
}



// header 이벤트 바인딩
function bindHeaderEvents() {
  // 장바구니 버튼
  const cartBtn = document.querySelector(
    'header .icon-item[aria-label="장바구니"]'
  );

  if (cartBtn) {
    cartBtn.addEventListener(
      'click',
      requireLogin(() => {
        window.location.href = '/pages/cart/cart.html';
      })
    );
  }

  // 마이페이지 버튼
  const mypageBtn = document.querySelector(
    'header .icon-item[aria-label="마이페이지"]'
  );

  if (mypageBtn) {
    mypageBtn.addEventListener('click', () => {
      if (!isLoggedIn()) {
        window.location.href = '/pages/login/login.html';
      } else {
        window.location.href = '/pages/404/404.html';
      }
    });
  }
}

function movePageContentToMain() {
  const main = document.querySelector('#main-content');
  if (!main) return;

  const pageContents = [...document.body.children].filter(
    el =>
      !el.matches('header, footer, #main-content, script, link')
  );

  pageContents.forEach(el => main.appendChild(el));
}
