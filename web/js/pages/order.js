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
