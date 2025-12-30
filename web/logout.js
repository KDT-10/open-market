/**
 * 로그아웃 처리 (공통 - header.js)
 */
function handleLogout() {
  // LocalStorage에서 모든 인증 정보 삭제
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  // SessionStorage 정리 (장바구니, 주문 데이터 등)
  sessionStorage.clear();

  // 로그인 페이지로 이동
  window.location.href = "signin.html";
}

// 로그아웃 버튼 이벤트 (예시)
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}
