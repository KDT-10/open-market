import Validation from "js/common/validation.js";
import { setTabGroup } from "js/common/tab-ui.js";
import { createModal } from "js/common/modal.js";

const modalObj = await createModal();
let isUsernameChecked = false;
let isRegistrationNumberChecked = false;

// 로고 버튼
const logoBtn = document.getElementById("signup-logo-btn");
logoBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// 탭 전환 (구매회원/판매회원)
const buyerTab = document.getElementById("buyer-tab");
const sellerTab = document.getElementById("seller-tab");
const sellerFields = document.getElementById("seller-fields");
setTabGroup("active", [
  { tab: buyerTab, content: null },
  { tab: sellerTab, content: sellerFields }
]);

// 중복 확인
const usernameInput = document.getElementById("username");
const usernameMessage = document.getElementById("username-message");
const dupChkBtn = document.getElementById("dup-chk-btn");
usernameInput.addEventListener("input", () => {
  isUsernameChecked = false;
  Validation.clearMessage(
    usernameInput,
    usernameMessage
  );
});
dupChkBtn.addEventListener("click", () => {
  checkUsername();
});

// 비밀번호 확인
const passwordInput = document.getElementById("password-input");
const passwordMessage = document.getElementById("password-message");
const passwordConfirmInput = document.getElementById("password-confirm-input");
const passwordConfirmMessage = document.getElementById("password-confirm-message");
passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  if (password.length === 0 && passwordConfirm.length === 0) {
    Validation.clearMessage(
      passwordInput,
      passwordMessage
    );
    Validation.clearMessage(
      passwordConfirmInput,
      passwordConfirmMessage
    );
    return;
  }
  else {
    validatePassword();
  }
});
passwordConfirmInput.addEventListener("input", () => {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  if (password.length === 0 && passwordConfirm.length === 0) {
    Validation.clearMessage(
      passwordInput,
      passwordMessage
    );
    Validation.clearMessage(
      passwordConfirmInput,
      passwordConfirmMessage
    );
    return;
  }
  else {
    validatePassword();
  }
});

// 이름 확인
const nameInput = document.getElementById("name");
const nameMessage = document.getElementById("name-message");
nameInput.addEventListener("input", () => {
  Validation.clearMessage(
    nameInput,
    nameMessage
  );
});

// 핸드폰 번호 확인
const phoneInputs = ["phone1", "phone2", "phone3"].map(e => document.getElementById(e));
const phoneMessage = document.getElementById("phone-message");
phoneInputs.forEach(e => {
  e.addEventListener("input", () => {
    Validation.clearMessage(
      e,
      phoneMessage
    );
  });
});

// 사업자등록번호 확인
const registrationNumberInput = document.getElementById("registration-number-input");
const registrationNumberMessage = document.getElementById("registration-number-message");
const registrationNumberChkBtn = document.getElementById("registration-number-chk-btn");
registrationNumberInput.addEventListener("input", () => {
  isRegistrationNumberChecked = false;
  Validation.clearMessage(
    registrationNumberInput,
    registrationNumberMessage
  );
});
registrationNumberChkBtn.addEventListener("click", () => {
  validateRegistrationNumber();
});

// 스토어 이름  확인
const storeNameInput = document.getElementById("store-name");
const storeNameMessage = document.getElementById("store-name-message");
storeNameInput.addEventListener("input", () => {
  Validation.clearMessage(
    storeNameInput,
    storeNameMessage
  );
});

// 약관
const termsCbox = document.getElementById("terms-cbox");
const signupBtn = document.getElementById("signup-btn");
termsCbox.addEventListener("change", () => {
  updateSubmitBtn();
});

// 회원가입
const form = document.getElementById("signup-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isSellerTabActive()) handleBuyerSignup(e);
  else handleSellerSignup(e);
});

// 아이디(이메일) 중복 확인
async function checkUsername() {
  const username = usernameInput.value.trim();

  if (!username) {
    Validation.showMessage(
      usernameInput,
      usernameMessage,
      "아이디를 입력하세요.",
      "error"
    );
    return false;
  }

  if (!Validation.isValidEmail(username)) {
    Validation.showMessage(
      usernameInput,
      usernameMessage,
      "올바른 이메일 형식이 아닙니다.",
      "error"
    );
    return false;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/validate-username",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }
    );

    const data = await response.json();
    const { message } = data;
    const status = data.error ? "error" : "success";

    if (response.ok) {
      Validation.showMessage(
        usernameInput,
        usernameMessage,
        message,
        status
      );
      isUsernameChecked = true;
    } else {
      Validation.showMessage(
        usernameInput,
        usernameMessage,
        message,
        status
      );
      isUsernameChecked = false;
    }
    return isUsernameChecked;
  } catch (err) {
    Validation.showMessage(
      usernameInput,
      usernameMessage,
      "아이디 중복 확인에 실패했습니다.",
      "error"
    );
    console.error("아이디 중복 확인 오류:", err);
    showSimpleModal("아이디 중복 확인에 실패했습니다.");
  }
}

// 비밀번호 Validation
function validatePassword() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  // 비밀번호 길이 체크
  if (0 < password.length && password.length < 8) {
    Validation.showMessage(
      passwordInput,
      passwordMessage,
      "비밀번호는 8자 이상이어야 합니다.",
      "error"
    );
    Validation.clearMessage(
      passwordConfirmInput,
      passwordConfirmMessage
    );
    return false;
  }
  else {
    Validation.clearMessage(
      passwordInput,
      passwordMessage
    );
    Validation.showMessage(
      passwordInput,
      passwordMessage,
      "",
      "success"
    );
  }

  // 비밀번호 일치 확인
  if (password !== passwordConfirm) {
    Validation.showMessage(
      passwordConfirmInput,
      passwordConfirmMessage,
      "비밀번호가 일치하지 않습니다.",
      "error"
    );
    return false;
  }
  else if (password.length === 0 && passwordConfirm.length === 0) {
    Validation.showMessage(
      passwordInput,
      passwordMessage,
      "비밀번호를 입력하세요.",
      "error"
    );
    Validation.showMessage(
      passwordConfirmInput,
      passwordConfirmMessage,
      "비밀번호를 입력하세요.",
      "error"
    );
    return false;
  }
  Validation.showMessage(
    passwordConfirmInput,
    passwordConfirmMessage,
    "비밀번호가 일치합니다.",
    "success"
  );
  return true;
}

// 이름 Validation
function validateName() {
  const nameInput = document.getElementById("name");
  const nameMessage = document.getElementById("name-message");
  const name = nameInput.value.trim();
  if (name.length === 0) {
    Validation.showMessage(
      nameInput,
      nameMessage,
      "이름을 입력하세요.",
      "error"
    );
    return false;
  }
  return true;
}

// 전화번호 Validation
function validatePhone() {
  const [phone1, phone2, phone3] = phoneInputs.map(input => input.value.trim());

  if (!Validation.isValidPhone(phone1, phone2, phone3)) {
    Validation.showMessage(
      phoneInputs,
      phoneMessage,
      "올바른 전화번호 형식이 아닙니다.",
      "error"
    );
    return false;
  }

  return true;
}

// 스토어 이름 Validation
function validateStoreName() {
  const storeNameInput = document.getElementById("store-name");
  const storeNameMessage = document.getElementById("store-name-message");
  const storeName = storeNameInput.value.trim();
  if (storeName.length === 0) {
    Validation.showMessage(
      storeNameInput,
      storeNameMessage,
      "스토어 이름을 입력하세요.",
      "error"
    );
    return false;
  }
  return true;
}

function validateTerms() {
  return termsCbox.checked;
}

function updateSubmitBtn() {
  signupBtn.classList.toggle("disabled-btn", !validateTerms());
  signupBtn.disabled = !signupBtn.disabled;
}

// 구매회원 회원가입 제출
async function handleBuyerSignup(e) {
  e.preventDefault();

  let isValid = true;

  // Validation 체크
  if (!await checkUsername()) {
    isValid = false;
  }
  if (!validatePassword()) {
    isValid = false;
  }
  if (!validateTerms()) {
    isValid = false;
  }
  if (!isUsernameChecked) {
    isValid = false;
  }
  if (!validatePassword()) {
    isValid = false;
  }
  if (!validateName()) {
    isValid = false;
  }
  if (!validatePhone()) {
    isValid = false;
  }
  if (!isValid) {
    return;
  }

  const nameInput = document.getElementById("name");
  const phone1 = document.getElementById("phone1");
  const phone2 = document.getElementById("phone2");
  const phone3 = document.getElementById("phone3");
  const formData = {
    username: usernameInput.value.trim(),
    password: passwordInput.value,
    name: nameInput.value.trim(),
    phone_number: `${phone1.value.trim()}-${phone2.value.trim()}-${phone3.value.trim()}`,
  };

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/buyer/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      const parent = document.body;
      const content = document.createElement("p");
      content.textContent = "회원 가입이 완료되었습니다.";
      const cancelBtnTxt = null;
      const confirmBtnTxt = "로그인 하러 가기";
      modalObj.setModal({
        parent,
        content,
        cancelBtnTxt,
        confirmBtnTxt
      });
      modalObj.open(() => window.location.href = "signin.html");
    } else {
      throw new Error(data.detail || "회원가입에 실패했습니다.");
    }
  } catch (error) {
    console.error("회원가입 오류:", error);
    showSimpleModal(error.message);
  }
}

// 사업자등록번호 검증
async function validateRegistrationNumber() {
  const registrationNumber = registrationNumberInput.value.trim().replace(/-/g, "");

  if (registrationNumber.length !== 10) {
    Validation.showMessage(
      registrationNumberInput,
      registrationNumberMessage,
      "사업자등록번호는 10자리 숫자입니다.",
      "error"
    );
    return false;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/seller/validate-registration-number",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_registration_number: registrationNumber }),
      }
    );

    const data = await response.json();

    if (response.ok && data) {
      Validation.showMessage(
        registrationNumberInput,
        registrationNumberMessage,
        "유효한 사업자등록번호입니다.",
        "success"
      );
      isRegistrationNumberChecked = true;
    } else {
      Validation.showMessage(
        registrationNumberInput,
        registrationNumberMessage,
        "이미 등록된 사업자등록번호입니다.",
        "error"
      );
      isRegistrationNumberChecked = false;
    }
    return isRegistrationNumberChecked;
  } catch (error) {
    console.error("사업자등록번호 검증 오류:", error);
    showSimpleModal("사업자등록번호 검증에 실패했습니다.");
  }
}

// 판매회원 회원가입 제출
async function handleSellerSignup(e) {
  e.preventDefault();

  let isValid = true;

  // Validation 체크
  if (!await checkUsername()) {
    isValid = false;
  }
  if (!validateTerms()) {
    isValid = false;
  }
  if (!isUsernameChecked) {
    isValid = false;
  }
  if (!validatePassword()) {
    isValid = false;
  }
  if (!validateName()) {
    isValid = false;
  }
  if (!validatePhone()) {
    isValid = false;
  }
  if (!await validateRegistrationNumber()) {
    isValid = false;
  }
  if (!isRegistrationNumberChecked) {
    isValid = false;
  }
  if (!validateStoreName()) {
    isValid = false;
  }
  if (!isValid) {
    return;
  }

  const nameInput = document.getElementById("name");
  const phone1 = document.getElementById("phone1");
  const phone2 = document.getElementById("phone2");
  const phone3 = document.getElementById("phone3");
  const formData = {
    username: usernameInput.value.trim(),
    password: passwordInput.value,
    name: nameInput.value.trim(),
    phone_number: `${phone1.value.trim()}-${phone2.value.trim()}-${phone3.value.trim()}`,
    registration_number: registrationNumberInput.value.trim().replace(/-/g, ""),
    store_name: storeNameInput.value,
  };

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/seller/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      const parent = document.body;
      const content = document.createElement("p");
      content.textContent = "판매회원 가입이 완료되었습니다.";
      const cancelBtnTxt = null;
      const confirmBtnTxt = "로그인 하러 가기";
      modalObj.setModal({
        parent,
        content,
        cancelBtnTxt,
        confirmBtnTxt
      });
      modalObj.open(() => window.location.href = "signin.html");
    } else {
      throw new Error(data.detail || "회원가입에 실패했습니다.");
    }
  } catch (error) {
    console.error("판매회원 가입 오류:", error);
    showSimpleModal(error.message);
  }
}

function isSellerTabActive() {
  if (sellerTab.classList.contains("active")) return true;
  return false;
}

function showSimpleModal(msg) {
  const parent = document.body;
  const content = document.createElement("p");
  content.textContent = msg;
  const cancelBtnTxt = null;
  const confirmBtnTxt = "확인";
  modalObj.setModal({
    parent,
    content,
    cancelBtnTxt,
    confirmBtnTxt
  });
  modalObj.open(() => modalObj.close());
}