/* =========================
   API helper
========================= */
async function apiFetch(url, options) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error || data.message || "요청에 실패했습니다.";
    throw new Error(msg);
  }
  return data;
}

/* =========================
   탭 전환
========================= */
const tabs = document.querySelectorAll(".tab");
const buyerForm = document.getElementById("buyerForm");
const sellerForm = document.getElementById("sellerForm");

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");

    const target = btn.dataset.target;
    buyerForm.classList.toggle("is-hidden", target !== "buyer");
    sellerForm.classList.toggle("is-hidden", target !== "seller");
  });
});

/* =========================
   체크 버튼: 클릭 토글
========================= */
document.querySelectorAll('.check-btn[data-mode="toggle"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("is-active");
  });
});

/* =========================
   비밀번호 유효 일치 > 체크 자동 활성화
   - 첫칸: 8자 이상이면 초록
   - 둘째칸: 일치하면 초록
========================= */
setupPassword("buyer");
setupPassword("seller");

function setupPassword(prefix) {
  const pw = document.getElementById(`${prefix}Pw`);
  const pw2 = document.getElementById(`${prefix}Pw2`);

  const pwWrap = document.getElementById(`${prefix}PwWrap`);
  const pw2Wrap = document.getElementById(`${prefix}Pw2Wrap`);

  const pwBtn = pwWrap.querySelector(".check-btn");
  const pw2Btn = pw2Wrap.querySelector(".check-btn");

  const validHint = document.getElementById(`${prefix}PwValidHint`);
  const matchHint = document.getElementById(`${prefix}PwHint`);

  function validate() {
    const a = pw.value;
    const b = pw2.value;

    //유효성: 8자 이상
    const isValid = a.length >= 8;
    if (isValid) {
      pwBtn.classList.add("is-active");
      if (validHint) validHint.textContent = "";
    } else {
      pwBtn.classList.remove("is-active");
      if (validHint)
        validHint.textContent = "테스트 비밀번호는 8자 이상 입력해 주세요!.";
    }

    // 재확인칸이 비어있으면 검사 안함
    if (!b) {
      pw2Btn.classList.remove("is-active");
      if (matchHint) matchHint.textContent = "";
      return;
    }

    //일치 체크
    if (a === b) {
      pw2Btn.classList.add("is-active");
      if (matchHint) matchHint.textContent = "";
    } else {
      pw2Btn.classList.remove("is-active");
      if (matchHint)
        matchHint.textContent = "테스트 비밀번호와 일치하지 않습니다.";
    }
  }

  pw.addEventListener("input", validate);
  pw2.addEventListener("input", validate);
}

/* =========================
   아이디 중복검사 API 연결
========================= */
async function validateUsername(username) {
  return apiFetch("http://localhost:3000/api/accounts/validate-username", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

document
  .getElementById("buyerCheckIdBtn")
  ?.addEventListener("click", async () => {
    const username = document.getElementById("buyerId").value.trim();
    const hint = document.getElementById("buyerIdHint");

    if (!username) {
      hint.className = "hint error";
      hint.textContent = "아이디를 입력해 주세요.";
      return;
    }

    try {
      const data = await validateUsername(username);
      hint.className = "hint";
      hint.style.color = "#1db954";
      hint.textContent = data.message || "사용 가능한 아이디입니다.";
    } catch (e) {
      hint.className = "hint error";
      hint.style.color = "";
      hint.textContent = e.message;
    }
  });

document
  .getElementById("sellerCheckIdBtn")
  ?.addEventListener("click", async () => {
    const username = document.getElementById("sellerId").value.trim();
    const hint = document.getElementById("sellerIdHint");

    if (!username) {
      hint.className = "hint error";
      hint.textContent = "아이디를 입력해 주세요.";
      return;
    }

    try {
      const data = await validateUsername(username);
      hint.className = "hint";
      hint.style.color = "#1db954";
      hint.textContent = data.message || "사용 가능한 아이디입니다.";
    } catch (e) {
      hint.className = "hint error";
      hint.style.color = "";
      hint.textContent = e.message;
    }
  });

/* =========================
   판매자 사업자등록번호 인증 API 연결
   POST /api/accounts/seller/validate-registration-number
========================= */
async function validateBizNo(company_registration_number) {
  return apiFetch("/api/accounts/seller/validate-registration-number", {
    method: "POST",
    body: JSON.stringify({ company_registration_number }),
  });
}

document.getElementById("verifyBizBtn")?.addEventListener("click", async () => {
  const bizNo = document.getElementById("bizNo").value.trim();
  const hint = document.getElementById("bizHint");

  if (!bizNo) {
    hint.className = "hint error";
    hint.textContent = "사업자 등록번호를 입력해 주세요.";
    return;
  }

  try {
    const data = await validateBizNo(bizNo);
    hint.className = "hint";
    hint.style.color = "#1db954";
    hint.textContent = data.message || "사용 가능한 사업자등록번호입니다.";
  } catch (e) {
    hint.className = "hint error";
    hint.style.color = "";
    hint.textContent = e.message;
  }
});

/* =========================
   약관 동의 → 가입하기 활성화
========================= */
const buyerAgree = document.getElementById("buyerAgree");
const buyerSubmit = document.getElementById("buyerSubmit");
buyerAgree?.addEventListener("change", () => {
  buyerSubmit.disabled = !buyerAgree.checked;
});

const sellerAgree = document.getElementById("sellerAgree");
const sellerSubmit = document.getElementById("sellerSubmit");
sellerAgree?.addEventListener("change", () => {
  sellerSubmit.disabled = !sellerAgree.checked;
});

/* =========================
   회원가입 API 연결
========================= */
buyerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("buyerId").value.trim();
  const password = document.getElementById("buyerPw").value.trim();
  const name = document.getElementById("buyerName").value.trim();

  const p1 = document.getElementById("buyerPhone1").value;
  const p2 = document.getElementById("buyerPhone2").value.trim();
  const p3 = document.getElementById("buyerPhone3").value.trim();
  const phone_number = `${p1}-${p2}-${p3}`;

  try {
    await apiFetch("/api/accounts/buyer/signup", {
      method: "POST",
      body: JSON.stringify({ username, password, name, phone_number }),
    });

    alert("구매자 회원가입 성공! 로그인 페이지로 이동합니다.");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
});

sellerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("sellerId").value.trim();
  const password = document.getElementById("sellerPw").value.trim();
  const name = document.getElementById("sellerName").value.trim();

  const p1 = document.getElementById("sellerPhone1").value;
  const p2 = document.getElementById("sellerPhone2").value.trim();
  const p3 = document.getElementById("sellerPhone3").value.trim();
  const phone_number = `${p1}-${p2}-${p3}`;

  const company_registration_number = document
    .getElementById("bizNo")
    .value.trim();
  const store_name = document.getElementById("storeName").value.trim();

  try {
    await apiFetch("/api/accounts/seller/signup", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        name,
        phone_number,
        company_registration_number,
        store_name,
      }),
    });

    alert("판매자 회원가입 성공! 로그인 페이지로 이동합니다.");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
});
