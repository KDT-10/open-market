import { API_BASE_URL } from "../common/config.js";
import { createModal } from "../common/modal.js";

const modalObj = createModal();

document.addEventListener("DOMContentLoaded", async () => {
  // 탭 전환 (구매회원/판매회원)
  const buyerTab = document.getElementById("commonTab");
  const sellerTab = document.getElementById("venderTab");
  let userType = "BUYER";

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

  // 실시간으로 공백 입력 방지

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  usernameInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\s/g, "");
  });

  passwordInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\s/g, "");
  });

  // ============ 비로그인 장바구니 → 서버 동기화 ============
  async function syncGuestCartToServer(accessToken) {
    const guestCartData = JSON.parse(sessionStorage.getItem("cartData")) || [];

    if (guestCartData.length === 0) {
      return; // 동기화할 데이터 없음
    }

    const baseURL = API_BASE_URL;
    const syncResults = [];

    for (const item of guestCartData) {
      try {
        const response = await fetch(`${baseURL}/cart/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            product_id: item.product_id,
            quantity: item.quantity,
          }),
        });

        if (response.ok) {
          syncResults.push({ product_id: item.product_id, success: true });
        } else {
          console.error(
            `상품 ${item.product_id} 동기화 실패:`,
            await response.json()
          );
          syncResults.push({ product_id: item.product_id, success: false });
        }
      } catch (error) {
        console.error(`상품 ${item.product_id} 동기화 오류:`, error);
        syncResults.push({ product_id: item.product_id, success: false });
      }
    }

    // 동기화 완료 후 sessionStorage 클리어
    sessionStorage.removeItem("cartData");

    console.log("장바구니 동기화 결과:", syncResults);
    return syncResults;
  }

  // ============ 로그인 처리 ============
  async function handleSignin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
      showSimpleModal("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/accounts/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "로그인에 실패했습니다.");
      }

      if (data.user.user_type !== userType) {
        showSimpleModal(
          `${userType === "BUYER" ? "구매회원" : "판매회원"
          } 계정으로 로그인해주세요.`
        );
        return;
      }

      // LocalStorage에 토큰 및 사용자 정보 저장
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ 비로그인 장바구니 데이터를 서버에 동기화
      // await syncGuestCartToServer(data.access);

      // 사용자 타입에 따라 페이지 이동

      const dest = sessionStorage.getItem("redirectAfterLogin");
      window.location.href = dest;
    } catch (error) {
      console.error("로그인 오류:", error);
      showSimpleModal(error.message || "아이디 또는 비밀번호를 확인해주세요.");
    }
  }

  const signinForm = document.querySelector(".login-form");
  signinForm.addEventListener("submit", handleSignin);
});

async function showSimpleModal(infoTxt) {
  const content = document.createElement("p");
  content.textContent = infoTxt;
  (await modalObj).setModal({
    parent: document.body,
    content: content,
    cancelBtnTxt: null,
    confirmBtnTxt: "확인",
  });
  (await modalObj).open((await modalObj).close());
}
