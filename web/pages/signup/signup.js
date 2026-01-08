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

/* =========================================================
   전화번호 형식 검증 (buyer/seller 공통)
   - 입력 중에 바로 메시지 출력(추가)
   - submit 때 false면 가입 막기
========================================================= */
function isValidPhone(p1, p2, p3) {
  const ok1 = /^[0-9]{3}$/.test(String(p1));
  const ok2 = /^[0-9]{3,4}$/.test(String(p2));
  const ok3 = /^[0-9]{4}$/.test(String(p3));
  return ok1 && ok2 && ok3;
}

function getOrCreatePhoneHint(type) {
  const phone1 = document.getElementById(`${type}Phone1`);
  const field = phone1?.closest(".field");
  if (!field) return null;

  let hint = field.querySelector(".hint.phone-hint");
  if (!hint) {
    hint = document.createElement("p");
    hint.className = "hint error phone-hint";
    field.appendChild(hint);
  }
  return hint;
}

function validatePhone(type, { strict = false } = {}) {
  const phone1 = document.getElementById(`${type}Phone1`);
  const phone2 = document.getElementById(`${type}Phone2`);
  const phone3 = document.getElementById(`${type}Phone3`);
  const hint = getOrCreatePhoneHint(type);

  const v1 = phone1.value;
  const v2 = phone2.value.trim();
  const v3 = phone3.value.trim();

  // ✅ 입력 중(=strict:false)에는 "지우는 중/미완성"이면 메시지 숨김
  const isIncomplete = !v2 || !v3; // 중간/끝 중 하나라도 비면 미완성
  if (!strict && isIncomplete) {
    if (hint) hint.textContent = ""; // 메시지 제거
    return true; // 입력 중에는 통과 처리(버튼 막는 건 submit에서)
  }

  // ✅ strict 모드(submit)에서는 빈칸도 오류로 처리
  if (!isValidPhone(v1, v2, v3)) {
    if (hint) hint.textContent = "올바른 전화번호 형식이 아닙니다.";
    return false;
  }

  if (hint) hint.textContent = "";
  return true;
}

// ✅ 추가: 입력 중 즉시 검증(실시간)
["buyer", "seller"].forEach((type) => {
  const p1 = document.getElementById(`${type}Phone1`);
  const p2 = document.getElementById(`${type}Phone2`);
  const p3 = document.getElementById(`${type}Phone3`);

  p1?.addEventListener("change", () => validatePhone(type));
  p2?.addEventListener("input", () => validatePhone(type));
  p3?.addEventListener("input", () => validatePhone(type));
});

/* =========================================================
   판매자 사업자등록번호 인증 API (HTML id 맞춤)
========================================================= */
let isRegistrationNumberChecked = false;

async function validateRegistrationNumber() {
  const registrationNumberInput = document.getElementById("bizNo"); // ✅ HTML id
  const registrationNumberMessage = document.getElementById("bizHint"); // ✅ HTML id

  if (!registrationNumberInput || !registrationNumberMessage) return false;

  const registrationNumber = registrationNumberInput.value.replace(/\D/g, "");

  if (registrationNumber.length !== 10) {
    registrationNumberMessage.className = "hint error";
    registrationNumberMessage.style.color = "";
    registrationNumberMessage.textContent =
      "사업자등록번호는 10자리 숫자입니다.";
    isRegistrationNumberChecked = false;
    return false;
  }

  try {
    const data = await apiFetch(
      "http://localhost:3000/api/accounts/seller/validate-registration-number",
      {
        method: "POST",
        body: JSON.stringify({ registration_number: registrationNumber }),
      }
    );

    // 네 기존 코드가 data.Success 기준이었으니 유지
    if (data.Success === true || data.success === true) {
      registrationNumberMessage.className = "hint";
      registrationNumberMessage.style.color = "#1db954";
      registrationNumberMessage.textContent = "유효한 사업자등록번호입니다.";
      isRegistrationNumberChecked = true;
      return true;
    } else {
      registrationNumberMessage.className = "hint error";
      registrationNumberMessage.style.color = "";
      registrationNumberMessage.textContent =
        "유효하지 않은 사업자등록번호입니다.";
      isRegistrationNumberChecked = false;
      return false;
    }
  } catch (error) {
    registrationNumberMessage.className = "hint error";
    registrationNumberMessage.style.color = "";
    registrationNumberMessage.textContent =
      error.message || "사업자등록번호 검증에 실패했습니다.";
    isRegistrationNumberChecked = false;
    return false;
  }
}

// ✅ 인증 버튼 연결
document
  .getElementById("verifyBizBtn")
  ?.addEventListener("click", validateRegistrationNumber);

// ✅ 입력 바뀌면 인증 무효 처리
document.getElementById("bizNo")?.addEventListener("input", () => {
  isRegistrationNumberChecked = false;
  const msg = document.getElementById("bizHint");
  if (msg) {
    msg.textContent = "";
    msg.style.color = "";
    msg.className = "hint";
  }
});

/* =========================
   회원가입 API
========================= */
buyerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // ✅ 추가: 전화번호 틀리면 가입 막기
  if (!validatePhone("buyer")) return;

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
    window.location.href = "../login/login.html";
  } catch (err) {
    alert(err.message);
  }
});

sellerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  //추가: 전화번호 틀리면 가입 막기
  if (!validatePhone("seller")) return;

  //추가: 사업자 인증 안 했으면 가입 막기
  if (!isRegistrationNumberChecked) {
    bizHint.className = "hint error";
    bizHint.textContent = "사업자등록번호 인증을 먼저 완료해 주세요.";
    return;
  }

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
