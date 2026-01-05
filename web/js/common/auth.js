import { createModal } from "/js/common/modal.js";

// 로그아웃 기능 바인딩
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}

export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

function getUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

let loginModal;
export async function checkLogin(modalParent) {
  if (!isLoggedIn()) {
    const content = document.createElement("div");
    const [p1, p2] = [document.createElement("p"), document.createElement("p")];
    p1.textContent = "로그인이 필요한 서비스입니다.";
    p2.textContent = "로그인 하시겠습니까?";
    content.appendChild(p1);
    content.appendChild(p2);
    loginModal ??= await createModal({
      parent: modalParent,
      content,
      cancelBtnTxt: "아니오",
      confirmBtnTxt: "예"
    });
    loginModal.open(() => {
      window.location.href = "signin.html";
    });
    return false;
  }
  return true;
}

function handleLogout() {
  // LocalStorage에서 모든 인증 정보 삭제
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  // SessionStorage 정리 (장바구니, 주문 데이터 등)
  sessionStorage.clear();

  // 로그인 페이지로 이동
  window.location.href = "/signin.html";
}

/**
 * API 호출 공통 함수
 * @param {string} endpoint api로 호출할 엔드포인트. /api는 이미 엔드포인트에 포함됨.
 * @param {object} options { method, headers, body } header에 Content-Type: "application/json"은 포함됨
 * @returns {Promise<object>} 요청에 대한 응답
 * @example
 * fetchWithAuth("cart", {
 *   method: "POST",
 *   headers: {
 *     "Content-Type": "application/json",
 *   },
 *   body: JSON.stringify({ product_id: 1, quantity: 2 }),
 * });
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const baseURL = "http://localhost:3000/api"
  const targetURL = `${baseURL}/${endpoint}`;
  const accessToken = localStorage.getItem("access_token");

  const response = await fetch(targetURL, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 401 에러 (토큰 만료)
  if (response.status === 401) {
    // Refresh Token으로 새 Access Token 발급
    const refreshToken = localStorage.getItem("refresh_token");

    const refreshEndpoint = `${baseURL}/accounts/token/refresh`;
    const refreshResponse = await fetch(refreshEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("access_token", data.access);

      // 원래 요청 재시도
      return fetch(targetURL, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.access}`,
        },
      });
    } else {
      // Refresh Token도 만료됨 -> 로그인 페이지로 이동
      localStorage.clear();
      window.location.href = "signin.html";
    }
  }

  return response;
}