import { loadCSS } from "./dom-utils.js";

loadCSS("styles/components/modal.css");

class Modal {
  #parent;
  #content;
  #cancelBtnTxt;
  #confirmBtnTxt;
  #confirmHandler;

  constructor(modalElem, modalInfo) {
    this.modal = modalElem;
    this.modalCloseBtn = modalElem.querySelector(".modal-close-btn");
    this.modalContent = modalElem.querySelector(".modal-content");
    this.modalBtnCancel = modalElem.querySelector(".modal-btn-cancel");
    this.modalBtnConfirm = modalElem.querySelector(".modal-btn-confirm");

    this.modal.classList.add("hidden");

    const {
      parent = document.body,
      content = null,
      cancelBtnTxt = null,
      confirmBtnTxt = null
    } = modalInfo ?? {};

    this.#parent = parent;
    this.#content = content;
    this.#cancelBtnTxt = cancelBtnTxt;
    this.#confirmBtnTxt = confirmBtnTxt;

    this.modalBtnConfirm.addEventListener("click", () => {
      if (this.#confirmHandler) {
        this.#confirmHandler();
      }
      this.close();
    });

    this.#setParent();
    this.#setContent();
    this.#setBtnTxts();
    this.#bindEvents();
  }

  setModal(modalInfo) {
    const {
      parent,
      content,
      cancelBtnTxt,
      confirmBtnTxt
    } = modalInfo;

    this.#parent = parent;
    this.#content = content;
    this.#cancelBtnTxt = cancelBtnTxt;
    this.#confirmBtnTxt = confirmBtnTxt;

    this.#setParent();
    this.#setContent();
    this.#setBtnTxts();
  }

  open(onConfirm) {
    this.#setConfirmHandler(onConfirm);
    this.modal.classList.remove("hidden");
  }

  close() {
    this.modal.classList.add("hidden");
    this.#confirmHandler = null;
  }

  #setConfirmHandler(fn) {
    this.#confirmHandler = fn;
  }

  #setParent() {
    if (this.#parent) this.#parent.appendChild(this.modal);
  }

  #setContent() {
    if (this.modalContent) this.modalContent.replaceChildren(this.#content);
  }

  #setBtnTxts() {
    if (this.#cancelBtnTxt) {
      this.modalBtnCancel.classList.remove("hidden");
      this.modalBtnCancel.textContent = this.#cancelBtnTxt;
    }
    else {
      this.modalBtnCancel.classList.add("hidden");
    }
    this.modalBtnConfirm.textContent = this.#confirmBtnTxt;
  }

  #bindEvents() {
    this.modalCloseBtn.addEventListener("click", () => this.close());
    if (this.modalBtnCancel) this.modalBtnCancel.addEventListener("click", () => this.close());
  }
}

export async function createModal(modalInfo) {
  try {
    const modalURL = "components/modal.html";
    const res = await fetch(modalURL);
    if (!res.ok) throw new Error('HTML 불러오기 실패');

    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const modalElem = doc.getElementById("modal-cancel-confirm");

    const modal = new Modal(modalElem, modalInfo);

    return modal;
  } catch (err) {
    console.error(err);
    return null;
  }
}