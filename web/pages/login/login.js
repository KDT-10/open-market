const API_BASE = "http://localhost:3000";

// =======================
// ⚠️ 중요: 로그인 페이지는 반드시 프론트 서버(8080)에서 열려야 함
// 만약 3000에서 열리면 localStorage가 분리되어 로그인 유지가 안 됨
// =======================
if (location.port === "3000") {
  location.replace("http://localhost:8080/pages/login/login.html");
}

// 탭 전환
const tabs = document.querySelectorAll(".tab");
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
  });
});

// 로그인 로직
const form = document.getElementById("loginForm");
const userId = document.getElementById("userId");
const userPw = document.getElementById("userPw");
const errorMessage = document.getElementById("errorMessage");

function setError(msg) {
  errorMessage.textContent = msg || "";
}

function saveLogin(data, username) {
  // data = { access, refresh, user }
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

  // 로그인 상태도 유지
  localStorage.setItem("auth", JSON.stringify({ isLogin: true, id: username }));
}

function getAccessToken() {
  return localStorage.getItem("access_token");
}

// ✅ 토큰을 자동으로 붙여주는 fetch 래퍼(편함)
async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  // 서버가 401을 주면 여기서 잡아줄 수 있음
  if (res.status === 401) {
    // 토큰 만료/없음/유효하지 않음
    // (원하면 여기서 refresh 로직 붙일 수 있음)
    throw new Error("인증이 필요합니다. 다시 로그인해 주세요.");
  }

  return res;
}

// =======================
// redirect 파라미터 처리
// 예: /pages/login/login.html?redirect=/pages/cart/cart.html
// =======================
function getRedirectUrl() {
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  // 내부 경로만 허용 (보안)
  if (redirect && redirect.startsWith("/")) {
    return redirect;
  }

  // 기본 이동: 메인 페이지
  return "/index.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = userId.value.trim();
  const password = userPw.value.trim();

  if (!username || !password) {
    setError("아이디 또는 비밀번호를 입력해 주세요.");
    if (!username) userId.focus();
    else userPw.focus();
    return;
  }

  try {
    setError("");

    // 로그인 요청
    const response = await fetch(`${API_BASE}/api/accounts/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(
        data.message ||
          data.error ||
          data.detail ||
          "아이디 또는 비밀번호가 올바르지 않습니다."
      );
      return;
    }

    if (!data?.access || !data?.refresh) {
      setError(
        "로그인 응답에 토큰이 없습니다. server.js 응답을 확인해 주세요."
      );
      return;
    }

    // ===============================================
    // 성공 (토큰 저장)
    saveLogin(data, username);

    alert("로그인에 성공했습니다!");

    // ✅ 원래 가려던 페이지로 이동 (없으면 메인)
    window.location.replace(getRedirectUrl());
  } catch (err) {
    console.error(err);
    setError(err?.message || "서버에 연결할 수 없습니다.");
  }
});

[userId, userPw].forEach((el) => {
  el.addEventListener("input", () => setError(""));
});

// =======================
// (예시) 로그인 후 다른 페이지에서 토큰 포함 요청할 때 이렇게 사용
// =======================
// async function addToCart() {
//   const res = await authFetch("/api/cart/", {
//     method: "POST",
//     body: JSON.stringify({ product_id: 1, quantity: 2 }),
//   });
//   const data = await res.json();
//   console.log(data);
// }
