const Validation = {
  showMessage(inputElement, messageElement, message, type) {
    // inputElement.classList.remove("error", "success");
    messageElement.classList.remove("error", "success");

    if (type === "error" || type === "success") {
      // inputElement.classList.add(type);
      messageElement.classList.add(type);
    }

    messageElement.textContent = message;
  },

  clearMessage(inputElement, messageElement) {
    // inputElement.classList.remove("error", "success");
    messageElement.classList.remove("error", "success");
    messageElement.textContent = "";
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPhone(phone1, phone2, phone3) {
    return (
      /^\d{3}$/.test(phone1) && /^\d{4}$/.test(phone2) && /^\d{4}$/.test(phone3)
    );
  },
};

export default Validation;