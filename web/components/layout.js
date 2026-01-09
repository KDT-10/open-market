// 환경 감지 및 경로 계산
const isGitHubPages = window.location.hostname.includes("github.io");
const BASE_PATH = isGitHubPages ? "/team1-JADUPAGE/web" : "";

function getResourcePath(resource) {
  if (isGitHubPages) {
    return `${BASE_PATH}/components/${resource}`;
  }
  const inPagesFolder = window.location.pathname.includes("/pages/");
  return inPagesFolder
    ? `../../components/${resource}`
    : `./components/${resource}`;
}

function getPagePath(page) {
  if (isGitHubPages) {
    return `${BASE_PATH}/${page}`;
  }
  const inPagesFolder = window.location.pathname.includes("/pages/");
  // index.html에서: ./pages/cart.html
  // pages 폴더에서: ../cart.html 또는 ../../index.html
  if (page.startsWith("pages/")) {
    return inPagesFolder ? `../../${page}` : `./${page}`;
  } else if (page === "index.html") {
    return inPagesFolder ? "../../index.html" : "./index.html";
  } else {
    return inPagesFolder ? `../${page}` : `./${page}`;
  }
}

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
  window.location.href = getPagePath("pages/login/login.html");
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
      window.location.href = getPagePath("pages/login/login.html");
      return;
    }
    callback();
  };
}

// 현재 페이지의 web 폴더 기준 경로 계산
function getBasePath() {
  const path = window.location.pathname;
  // web/index.html 또는 web/pages/cart/cart.html 등에서 web 폴더까지의 상대 경로 계산
  const depth = path.split("/").filter((p) => p && p !== "web").length - 1;
  return depth === 0 ? "." : "../".repeat(depth);
}

// CSS 로드
loadCSS("../../components/layout.css");

function loadCSS(url) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

// layout.html 로드 (header + footer)
loadLayout();

scheduleAutoLogout();

async function loadLayout() {
  try {
    const res = await fetch(getResourcePath("layout.html"));
    if (!res.ok) throw new Error("layout.html 로드 실패");

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // layout에서 header와 footer만 가져오기
    const header = doc.querySelector("header");
    const footer = doc.querySelector("footer");

    if (header) document.body.prepend(header);
    if (footer) document.body.appendChild(footer);

    // Asset 경로 수정 (이미지, SVG 등)
    // fixAssetPaths();

    // 페이지 콘텐츠를 main으로 이동
    movePageContentToMain();

    // header 이벤트 연결
    bindHeaderEvents();
  } catch (err) {
    console.error("loadLayout 에러:", err);
  }
}

// Asset 경로 수정 (이미지, 아이콘 등)
function fixAssetPaths() {
  function getAssetPath(assetPath) {
    if (isGitHubPages) {
      return `${BASE_PATH}/${assetPath}`;
    }
    const inPagesFolder = window.location.pathname.includes("/pages/");
    return inPagesFolder ? `../../${assetPath}` : `./${assetPath}`;
  }

  // 이미지 경로 수정
  const images = document.querySelectorAll("header img, footer img");
  images.forEach((img) => {
    if (img.src.includes("../assets/")) {
      const assetPath = img.getAttribute("src").replace("../", "");
      img.src = getAssetPath(assetPath);
    }
  });

  // SVG use 태그 경로 수정
  const svgUses = document.querySelectorAll("header use, footer use");
  svgUses.forEach((use) => {
    const href = use.getAttribute("href");
    if (href && href.includes("../assets/")) {
      const assetPath = href.split("#")[0].replace("../", "");
      const iconId = href.split("#")[1];
      use.setAttribute("href", `${getAssetPath(assetPath)}#${iconId}`);
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

// 현재 페이지의 web 폴더 기준 경로 계산
function getBasePath() {
  const path = window.location.pathname;
  // web/index.html 또는 web/pages/cart/cart.html 등에서 web 폴더까지의 상대 경로 계산
  const depth = path.split("/").filter((p) => p && p !== "web").length - 1;
  return depth === 0 ? "." : "../".repeat(depth);
}

// header 이벤트 바인딩
function bindHeaderEvents() {
  // 장바구니 버튼
  const cartBtn = document.querySelector(
    'header .icon-item[aria-label="장바구니"]'
  );
  if (cartBtn) {
    cartBtn.addEventListener(
      "click",
      requireLogin(() => {
        window.location.href = getPagePath("pages/cart/cart.html");
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
        window.location.href = getPagePath("pages/login/login.html");
      } else {
        window.location.href = getPagePath("404.html");
      }
    });
  }
}
