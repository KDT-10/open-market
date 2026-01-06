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
    throw new Error(data.error || data.message || "요청에 실패했습니다.");
  }
  return data;
}

/* =========================
   탭 전환 + 카드 높이 전환 + CTA 버튼 전환
========================= */
const card = document.querySelector(".card");
const tabs = document.querySelectorAll(".tab");

const buyerForm = document.getElementById("buyerForm");
const sellerForm = document.getElementById("sellerForm");

const buyerSubmit = document.getElementById("buyerSubmit");
const sellerSubmit = document.getElementById("sellerSubmit");

const agree = document.getElementById("agree");

let currentTarget = "buyer";

function syncSubmitDisabled() {
  const checked = !!agree?.checked;

  if (currentTarget === "buyer") {
    buyerSubmit.disabled = !checked;
    sellerSubmit.disabled = true;
  } else {
    sellerSubmit.disabled = !checked;
    buyerSubmit.disabled = true;
  }
}

function setMode(target) {
  currentTarget = target;

  // 탭 UI
  tabs.forEach((t) => {
    const active = t.dataset.target === target;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });

  // 폼 전환
  buyerForm.classList.toggle("is-hidden", target !== "buyer");
  sellerForm.classList.toggle("is-hidden", target !== "seller");

  // CTA 버튼 전환
  buyerSubmit.classList.toggle("is-hidden", target !== "buyer");
  sellerSubmit.classList.toggle("is-hidden", target !== "seller");

  // ✅ 카드 높이 클래스 전환 (3번 핵심)
  card.classList.toggle("is-buyer", target === "buyer");
  card.classList.toggle("is-seller", target === "seller");

  // 동의 상태 반영
  syncSubmitDisabled();
}

tabs.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.target));
});

agree?.addEventListener("change", syncSubmitDisabled);

// 초기 상태
setMode("buyer");

/* =========================
   체크 버튼: 클릭 토글
========================= */
document.querySelectorAll('.check-btn[data-mode="toggle"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("is-active");
  });
});

/* =========================
   비밀번호 유효/일치 > 체크 자동 활성화
========================= */
setupPassword("buyer");
setupPassword("seller");

function setupPassword(prefix) {
  const pw = document.getElementById(`${prefix}Pw`);
  const pw2 = document.getElementById(`${prefix}Pw2`);
  const pwWrap = document.getElementById(`${prefix}PwWrap`);
  const pw2Wrap = document.getElementById(`${prefix}Pw2Wrap`);
  if (!pw || !pw2 || !pwWrap || !pw2Wrap) return;

  const pwBtn = pwWrap.querySelector(".check-btn");
  const pw2Btn = pw2Wrap.querySelector(".check-btn");

  const validHint = document.getElementById(`${prefix}PwValidHint`);
  const matchHint = document.getElementById(`${prefix}PwHint`);

  function validate() {
    const a = pw.value;
    const b = pw2.value;

    // 유효성: 8자 이상
    if (a.length >= 8) {
      pwBtn?.classList.add("is-active");
      if (validHint) validHint.textContent = "";
    } else {
      pwBtn?.classList.remove("is-active");
      if (validHint)
        validHint.textContent = "비밀번호는 8자 이상 입력해 주세요.";
    }

    // 재확인칸 비면 검사 X
    if (!b) {
      pw2Btn?.classList.remove("is-active");
      if (matchHint) matchHint.textContent = "";
      return;
    }

    // 일치 체크
    if (a === b) {
      pw2Btn?.classList.add("is-active");
      if (matchHint) matchHint.textContent = "";
    } else {
      pw2Btn?.classList.remove("is-active");
      if (matchHint) matchHint.textContent = "비밀번호가 일치하지 않습니다.";
    }
  }

  pw.addEventListener("input", validate);
  pw2.addEventListener("input", validate);
}

/* =========================
   아이디 중복검사 API
========================= */
async function validateUsername(username) {
  return apiFetch("http://localhost:3000/api/accounts/validate-username", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

["buyer", "seller"].forEach((type) => {
  document
    .getElementById(`${type}CheckIdBtn`)
    ?.addEventListener("click", async () => {
      const username = document.getElementById(`${type}Id`).value.trim();
      const hint = document.getElementById(`${type}IdHint`);

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
});

/* =========================
   판매자 사업자등록번호 인증 API
========================= */
async function validateBizNo(company_registration_number) {
  return apiFetch(
    "http://localhost:3000/api/accounts/seller/validate-registration-number",
    {
      method: "POST",
      body: JSON.stringify({ company_registration_number }),
    }
  );
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
   회원가입 API
========================= */
buyerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = buyerId.value.trim();
  const password = buyerPw.value.trim();
  const name = buyerName.value.trim();
  const phone_number = `${
    buyerPhone1.value
  }-${buyerPhone2.value.trim()}-${buyerPhone3.value.trim()}`;

  try {
    await apiFetch("http://localhost:3000/api/accounts/buyer/signup", {
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

  const username = sellerId.value.trim();
  const password = sellerPw.value.trim();
  const name = sellerName.value.trim();
  const phone_number = `${
    sellerPhone1.value
  }-${sellerPhone2.value.trim()}-${sellerPhone3.value.trim()}`;
  const company_registration_number = bizNo.value.trim();
  const store_name = storeName.value.trim();

  try {
    await apiFetch("http://localhost:3000/api/accounts/seller/signup", {
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
// =========================
// 전화번호 입력: 숫자만 허용
// =========================
function onlyDigits(el, maxLen) {
  if (!el) return;
  el.addEventListener("input", () => {
    el.value = el.value.replace(/\D/g, "");
    if (maxLen) el.value = el.value.slice(0, maxLen);
  });
}

// 구매자 전화번호
onlyDigits(buyerPhone1, 3);
onlyDigits(buyerPhone2, 4);
onlyDigits(buyerPhone3, 4);

// 판매자 전화번호
onlyDigits(sellerPhone1, 3);
onlyDigits(sellerPhone2, 4);
onlyDigits(sellerPhone3, 4);
