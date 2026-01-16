const Validation = {
  showMessage(_inputElements, messageElement, message, type) {
    let inputElements;
    if (!Array.isArray(_inputElements)) inputElements = [_inputElements];
    else inputElements = [..._inputElements];

    inputElements.forEach(e => e.classList.remove("error", "success"));
    messageElement.classList.remove("error", "success");
    messageElement.classList.add("hidden");

    if (type === "error" || type === "success") {
      inputElements.forEach(e => e.classList.add(type));
      messageElement.classList.add(type);
      messageElement.classList.remove("hidden");
    }

    messageElement.textContent = message;
  },

  clearMessage(_inputElements, messageElement) {
    let inputElements;
    if (!Array.isArray(_inputElements)) inputElements = [_inputElements];
    else inputElements = [..._inputElements];

    inputElements.forEach(e => e.classList.remove("error", "success"));
    messageElement.classList.remove("error", "success");
    messageElement.classList.add("hidden");
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