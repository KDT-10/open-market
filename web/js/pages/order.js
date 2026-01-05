const checkbox = document.getElementById("agreeCheckbox");
const payButton = document.getElementById("payButton");

checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    payButton.disabled = false;
    payButton.classList.add("active");
  } else {
    payButton.disabled = true;
    payButton.classList.remove("active");
  }
});

payButton.addEventListener("click", () => {
  if (!validateInputs()) {
    return;
  }

  alert("결제 완료되었습니다.");
});

function validateInputs() {
  // TODO: html에서 적절한 id로 수정해야 함
  const customerName = document.getElementById("customerName");
  if (customerName.textContent === "") {
    alert("주문자 이름을 입력해주세요.");
    return false;
  }
  const customerPhone = ["customerPhone1", "customerPhone2", "customerPhone3"].map((str) => document.getElementById(str));
  if (customerPhone.some((el) => el.value === "")) {
    alert("주문자 휴대폰을 입력해주세요.");
    return false;
  }
  const email = document.getElementById("e-mail");
  if (email.textContent === "") {
    alert("이메일을 입력해주세요.");
    return false;
  }
  const receiverName = document.getElementById("receiverName");
  if (receiverName.textContent === "") {
    alert("배송지 수령인을 입력해주세요.");
    return false;
  }
  const receiverPhone = ["receiverPhone1", "receiverPhone2", "receiverPhone3"].map((str) => document.getElementById(str));
  if (receiverPhone.some((el) => el.value === "")) {
    alert("배송지 휴대폰을 입력해주세요.");
    return false;
  }
  const receiverAddress = [
    "receiverAddress1",
    "receiverAddress2",
    "receiverAddress3"
  ].map((str) => document.getElementById(str));
  if (receiverAddress.some((el) => el.value === "")) {
    alert("배송지 주소를 입력해주세요.");
    return false;
  }
  // TODO: checkbox 말고 다른 name 필요
  const selected = document.querySelector('input[name="checkbox"]:checked');
  const value = selected ? selected.value : null;
  if (!value) {
    alert("결제수단을 선택해주세요.");
    return false;
  }

  return true;
}