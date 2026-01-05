document.addEventListener("DOMContentLoaded", () => {
  // 탭 전환 (구매회원/판매회원)
  const buyerTab = document.getElementById("buyer-tab");
  const sellerTab = document.getElementById("seller-tab");
  let userType = "BUYER"; // 기본값: 구매회원

  buyerTab.classList.add("active");

  buyerTab.addEventListener("click", () => {
    buyerTab.classList.add("active");
    sellerTab.classList.remove("active");
    userType = "BUYER";
  });

  sellerTab.addEventListener("click", () => {
    sellerTab.classList.add("active");
    buyerTab.classList.remove("active");
    userType = "SELLER";
  });

  // 로그인 처리
  async function handleSignin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // 기본 Validation
    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/accounts/signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "로그인에 실패했습니다.");
      }

      // 사용자 타입 확인
      if (data.user.user_type !== userType) {
        alert(
          `${
            userType === "BUYER" ? "구매회원" : "판매회원"
          } 계정으로 로그인해주세요.`
        );
        return;
      }

      // LocalStorage에 토큰 및 사용자 정보 저장
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 사용자 타입에 따라 페이지 이동
      if (data.user.user_type === "BUYER") {
        window.location.href = "index.html";
      } else if (data.user.user_type === "SELLER") {
        window.location.href = "seller-center.html";
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      alert(error.message || "아이디 또는 비밀번호를 확인해주세요.");
    }
  }

  // 폼 제출 이벤트
  const signinForm = document.getElementById(".login-form");
  signinForm.addEventListener("submit", handleSignin);
});
