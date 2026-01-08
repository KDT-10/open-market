// 로그인 관련 공통 (토큰 저장 위치 LocalStorage)
function getAccessToken() {
  return localStorage.getItem("access_token"); // login.js랑 맞춤
}

// 로그인 여부 판단
function isLoggedIn() {
  return !!getAccessToken();
}

/* =========================
   자동 로그아웃 (토큰 만료 기반)
========================= */
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function logout(reason = "로그인이 만료되었습니다. 다시 로그인해 주세요.") {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  alert(reason);
  window.location.href = "./pages/login/login.html";
}

let logoutTimerId = null;

function scheduleAutoLogout() {
  const token = getAccessToken(); // 기존 공통 함수 사용
  if (!token) return;

  const payload = parseJwt(token);
  if (!payload?.exp) return;

  const remainingMs = payload.exp * 1000 - Date.now();

  if (remainingMs <= 0) {
    logout();
    return;
  }

  if (logoutTimerId) clearTimeout(logoutTimerId);
  logoutTimerId = setTimeout(() => {
    logout();
  }, remainingMs);
}

// 로그인 필요 처리
function requireLogin(callback) {
  return function (e) {
    e.preventDefault();
    if (!isLoggedIn()) {
      window.location.href = "./pages/login/login.html";
      return;
    }
    callback();
  };
}

// 현재 페이지 깊이 계산 (더 정확한 방식)
function getPagePrefix() {
  const path = window.location.pathname;

  // pages/cart/cart.html 같은 경로인지 확인
  if (path.includes('/pages/')) {
    return '../../';
  }

  // index.html 또는 루트
  return './';
}

// CSS 로드 - 페이지 위치에 따라 자동 경로 설정
(function loadCSS() {
  const prefix = getPagePrefix();
  const cssPath = `${prefix}components/layout.css`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssPath;
  document.head.appendChild(link);
})();

// layout.html 로드 (header + footer)
loadLayout();

scheduleAutoLogout();

async function loadLayout() {
  try {
    // 현재 페이지 위치에 따라 경로 자동 설정
    const prefix = getPagePrefix();
    const layoutPath = `${prefix}components/layout.html`;

    const res = await fetch(layoutPath);
    if (!res.ok) throw new Error("layout.html 로드 실패");

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // layout에서 header와 footer만 가져오기
    const header = doc.querySelector("header");
    const footer = doc.querySelector("footer");

    // 동적 경로 수정 (depth에 따라)
    if (header) {
      fixDynamicPaths(header, prefix);
      document.body.prepend(header);
    }
    if (footer) {
      document.body.appendChild(footer);
    }

    // 페이지 콘텐츠를 main으로 이동
    movePageContentToMain();

    // header 이벤트 연결
    bindHeaderEvents();
  } catch (err) {
    console.error("loadLayout 에러:", err);
  }
}

// 동적 경로 수정 함수
function fixDynamicPaths(element, prefix) {
  // data-dynamic-path 속성을 가진 모든 요소 찾기
  const dynamicElements = element.querySelectorAll('[data-dynamic-path]');

  dynamicElements.forEach(el => {
    const pathType = el.getAttribute('data-dynamic-path');

    if (pathType === 'asset') {
      // 이미지, SVG 아이콘 등 asset 경로 수정
      if (el.tagName === 'IMG' && el.src) {
        const originalPath = el.getAttribute('src');
        if (originalPath.startsWith('./')) {
          el.setAttribute('src', prefix + originalPath.slice(2));
        }
      } else if (el.tagName === 'use' && el.href) {
        const originalHref = el.getAttribute('href');
        if (originalHref && originalHref.startsWith('./')) {
          const parts = originalHref.split('#');
          el.setAttribute('href', prefix + parts[0].slice(2) + (parts[1] ? '#' + parts[1] : ''));
        }
      }
    } else if (pathType === 'index') {
      // index.html 링크 수정
      if (el.tagName === 'A' && el.href) {
        const originalHref = el.getAttribute('href');
        if (originalHref === './index.html') {
          el.setAttribute('href', prefix + 'index.html');
        }
      }
    }
  });
}

// 페이지 콘텐츠를 main 안으로 이동
function movePageContentToMain() {
  const main = document.querySelector("#main-content");
  if (!main) return;

  const pageContents = [...document.body.children].filter(
    (el) => !el.matches("header, footer, #main-content, script, link")
  );

  pageContents.forEach((el) => main.appendChild(el));
}

// header 이벤트 바인딩
function bindHeaderEvents() {
  // 현재 페이지 위치에 따라 경로 설정
  const prefix = getPagePrefix();

  // 장바구니 버튼
  const cartBtn = document.querySelector(
    'header .icon-item[aria-label="장바구니"]'
  );
  if (cartBtn) {
    cartBtn.addEventListener(
      "click",
      requireLogin(() => {
        window.location.href = prefix + "pages/cart/cart.html";
      })
    );
  }

  // 마이페이지 버튼
  const mypageBtn = document.querySelector(
    'header .icon-item[aria-label="마이페이지"]'
  );
  if (mypageBtn) {
    mypageBtn.addEventListener("click", () => {
      if (!isLoggedIn()) {
        window.location.href = prefix + "pages/login/login.html";
      } else {
        window.location.href = prefix + "404.html";
      }
    });
  }
}
