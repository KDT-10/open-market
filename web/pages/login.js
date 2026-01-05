//탭 전환
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

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = userId.value.trim();
  const pw = userPw.value.trim();
  // 아이디, 비밀번호 모두 공란 OR 비밀번호만 입력
  if ((!id && !pw) || (!id && pw)) {
    errorMessage.textContent = "아이디를 입력해 주세요.";
    userId.focus();
    return;
  }

  // 아이디만 입력
  if (id && !pw) {
    errorMessage.textContent = "비밀번호를 입력해 주세요.";
    userPw.focus();
    return;
  }

  // 아이디, 비밀번호 불일치 (임시 조건)
  const CORRECT_ID = "test";
  const CORRECT_PW = "1234";

  if (id !== CORRECT_ID || pw !== CORRECT_PW) {
    errorMessage.textContent = "아이디 또는 비밀번호가 일치하지 않습니다.";
    return;
  }

  // 성공
  errorMessage.textContent = "";
  localStorage.setItem("auth", JSON.stringify({ isLogin: true, id }));
  alert("로그인에 성공했습니다!");
  window.location.href = "index.html";
});
[userId, userPw].forEach((el) => {
  el.addEventListener("input", () => (errorMessage.textContent = ""));
});
