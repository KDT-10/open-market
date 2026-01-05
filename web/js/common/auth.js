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
