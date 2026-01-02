const items = [
  {
    brand: "백엔드글로벌",
    name: "딥러닝 개발자 무릎 담요",
    qty: 1,
    discount: 0,
    shipping: 0,
    price: 17500,
    img: "",
  },
  {
    brand: "우당탕탕 라이캣의 실험실",
    name: "Hack Your Life 개발자 노트북 파우치",
    qty: 1,
    discount: 0,
    shipping: 0,
    price: 29000,
    img: "",
  },
];

const $ = (s) => document.querySelector(s);
const won = (n) => n.toLocaleString("ko-KR") + "원";
const onlyDigits = (v) => String(v || "").replace(/\D/g, "");

function calcTotals() {
  const goods = items.reduce((a, it) => a + it.price * it.qty, 0);
  const discount = items.reduce((a, it) => a + (it.discount || 0), 0);
  const ship = items.reduce((a, it) => a + (it.shipping || 0), 0);
  const pay = goods - discount + ship;
  return { goods, discount, ship, pay };
}

function renderItems() {
  const list = $("#orderList");
  list.innerHTML = "";

  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "otRow";
    row.innerHTML = `
      <div class="infoCell">
        <div class="thumb">
          ${it.img ? `<img src="${it.img}" alt="">` : ``}
        </div>
        <div class="meta">
          <div class="metaTop">${it.brand || ""}</div>
          <div class="name">${it.name}</div>
          <div class="qty">수량 : ${it.qty}개</div>
        </div>
      </div>
      <div>${it.discount ? "-" + won(it.discount) : "-"}</div>
      <div class="freeShip">${
        it.shipping === 0 ? "무료배송" : won(it.shipping)
      }</div>
      <div class="amt">${won(it.price * it.qty)}</div>
    `;
    list.appendChild(row);
  });

  updateTotals();
}

function updateTotals() {
  const { goods, discount, ship, pay } = calcTotals();
  $("#totalTop").textContent = won(pay);
  $("#sumGoods").textContent = won(goods);
  $("#sumDiscount").textContent = won(discount);
  $("#sumShip").textContent = won(ship);
  $("#sumPay").textContent = won(pay);
}

/* ====== 모달 ====== */
const modalBack = $("#modalBack");
const modalClose = $("#modalClose");
const modalOk = $("#modalOk");
const modalText = $("#modalText");

function openModal(message) {
  modalText.textContent = message;
  modalBack.removeAttribute("hidden"); // 보이기
  modalOk.focus();
}

function closeModal() {
  modalBack.setAttribute("hidden", ""); // 숨기기
}

modalClose.addEventListener("click", closeModal);
modalOk.addEventListener("click", closeModal);

// 바깥 클릭 닫기
modalBack.addEventListener("click", (e) => {
  if (e.target === modalBack) closeModal();
});

// ESC 닫기
window.addEventListener("keydown", (e) => {
  if (!modalBack.hidden && e.key === "Escape") closeModal();
});

/* ====== 버튼 활성화 (동의 체크) ====== */
const agreeChk = $("#agreeChk");
const payBtn = $("#payBtn");

agreeChk.addEventListener("change", () => {
  const ok = agreeChk.checked;
  payBtn.disabled = !ok;
  payBtn.classList.toggle("enabled", ok);
});

/* ====== 배송정보 검증 ======
   "배송정보" 입력 하나라도 비면 모달 띄우기
*/
function isShippingFilled() {
  const buyerName = $("#buyerName").value.trim();
  const buyerEmail = $("#buyerEmail").value.trim();

  const bp =
    onlyDigits($("#buyerPhone1").value) +
    onlyDigits($("#buyerPhone2").value) +
    onlyDigits($("#buyerPhone3").value);

  const recvName = $("#recvName").value.trim();
  const rp =
    onlyDigits($("#recvPhone1").value) +
    onlyDigits($("#recvPhone2").value) +
    onlyDigits($("#recvPhone3").value);

  const zip = $("#zip").value.trim();
  const addr1 = $("#addr1").value.trim();
  const addr2 = $("#addr2").value.trim();

  // 하나라도 비어 있으면 false 반환
  if (!buyerName) return false;
  if (bp.length < 10) return false;
  if (!buyerEmail) return false;

  if (!recvName) return false;
  if (rp.length < 10) return false;

  if (!zip || !addr1 || !addr2) return false;

  return true;
}

payBtn.addEventListener("click", () => {
  // 결제하기 버튼을 눌렀을 때만 여기로 들어옴
  // (다른 이벤트에서는 절대 실행 안 됨)

  // 동의 체크 안 되어 있으면 그냥 종료
  if (!agreeChk.checked) return;

  // 배송정보 검증 → 실패 시에만 모달
  if (!isShippingFilled()) {
    openModal("배송정보를 빠짐없이 입력해주세요.");
    return;
  }

  // 여기까지 오면 모든 입력 완료 상태
  openModal("결제가 완료되었습니다.");
});

/* ====== 우편번호 조회 샘플 ====== */
$("#zipBtn").addEventListener("click", () => {
  $("#zip").value = "06236";
  $("#addr1").value = "서울특별시 강남구 테헤란로 123";
  $("#addr2").focus();
});

renderItems();
