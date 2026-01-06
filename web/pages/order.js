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

/* ===== 합계 ===== */
function calcTotals() {
  const goods = items.reduce((a, it) => a + it.price * it.qty, 0);
  const discount = items.reduce((a, it) => a + (it.discount || 0), 0);
  const ship = items.reduce((a, it) => a + (it.shipping || 0), 0);
  const pay = goods - discount + ship;
  return { goods, discount, ship, pay };
}

function updateTotals() {
  const { goods, discount, ship, pay } = calcTotals();
  $("#totalTop").textContent = won(pay);
  $("#sumGoods").textContent = won(goods);
  $("#sumDiscount").textContent = won(discount);
  $("#sumShip").textContent = won(ship);
  $("#sumPay").textContent = won(pay);
}

function renderItems() {
  const list = $("#orderList");
  list.innerHTML = "";

  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "otRow";
    row.innerHTML = `
      <div class="infoCell">
        <div class="thumb">${it.img ? `<img src="${it.img}" alt="">` : ``}</div>
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

/* ===== 모달 ===== */
const modalBack = $("#modalBack");
const modalClose = $("#modalClose");
const modalOk = $("#modalOk");
const modalText = $("#modalText");

let lastFocusEl = null;

function openModal(message, focusEl = null) {
  modalText.textContent = message;
  lastFocusEl = focusEl;

  modalBack.removeAttribute("hidden");
  modalOk.focus();
}

function closeModal() {
  modalBack.setAttribute("hidden", "");

  //  닫을 때, 안내했던 입력칸으로 이동
  if (lastFocusEl && typeof lastFocusEl.focus === "function") {
    lastFocusEl.focus();
  }
  lastFocusEl = null;
}

modalClose.addEventListener("click", closeModal);
modalOk.addEventListener("click", closeModal);
modalBack.addEventListener("click", (e) => {
  if (e.target === modalBack) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (!modalBack.hasAttribute("hidden") && e.key === "Escape") closeModal();
});

/* ===== 동의 체크 -> 결제버튼 활성 ===== */
const agreeChk = $("#agreeChk");
const payBtn = $("#payBtn");

agreeChk.addEventListener("change", () => {
  const ok = agreeChk.checked;
  payBtn.disabled = !ok;
  payBtn.classList.toggle("enabled", ok);
});

/* =========================================================
    Daum(카카오) 우편번호: open() 방식
   - 버튼 클릭 때만 팝업
   - 선택하면 #zip, #addr1 채우고 #addr2 포커스
========================================================= */
let postcodeDone = false; //  “우편번호 조회했는지” 플래그

function openDaumPostcode() {
  if (!window.daum || !window.daum.Postcode) {
    openModal(
      "우편번호 서비스를 불러오지 못했습니다. (스크립트 로딩 확인)",
      $("#zipBtn")
    );
    return;
  }

  new daum.Postcode({
    oncomplete: function (data) {
      const addr =
        data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

      $("#zip").value = data.zonecode || "";
      $("#addr1").value = addr || "";

      postcodeDone = true; // 조회 완료
      $("#addr2").focus(); // 상세주소로 이동
    },
  }).open();
}

$("#zipBtn").addEventListener("click", openDaumPostcode);

/* =========================================================
    결제하기 클릭 시: 부족한 항목을 “구체 메시지”로 안내
   - 모달은 결제하기 클릭에서만 뜸
========================================================= */
function validateAndGetFirstError() {
  // 주문자
  const buyerName = $("#buyerName").value.trim();
  const buyerEmail = $("#buyerEmail").value.trim();
  const bp =
    onlyDigits($("#buyerPhone1").value) +
    onlyDigits($("#buyerPhone2").value) +
    onlyDigits($("#buyerPhone3").value);

  // 배송지
  const recvName = $("#recvName").value.trim();
  const rp =
    onlyDigits($("#recvPhone1").value) +
    onlyDigits($("#recvPhone2").value) +
    onlyDigits($("#recvPhone3").value);

  // 주소
  const zipEl = $("#zip");
  const addr1El = $("#addr1");
  const addr2El = $("#addr2");

  const zip = zipEl.value.trim();
  const addr1 = addr1El.value.trim();
  const addr2 = addr2El.value.trim();

  if (!postcodeDone && (!zip || !addr1)) {
    return { message: "우편번호를 조회해주세요.", focusEl: $("#zipBtn") };
  }

  if (!buyerName)
    return { message: "주문자 이름을 입력해주세요.", focusEl: $("#buyerName") };
  if (bp.length < 10)
    return {
      message: "주문자 휴대폰 번호를 정확히 입력해주세요.",
      focusEl: $("#buyerPhone1"),
    };
  if (!buyerEmail)
    return {
      message: "주문자 이메일을 입력해주세요.",
      focusEl: $("#buyerEmail"),
    };

  if (!recvName)
    return { message: "수령인 이름을 입력해주세요.", focusEl: $("#recvName") };
  if (rp.length < 10)
    return {
      message: "수령인 휴대폰 번호를 정확히 입력해주세요.",
      focusEl: $("#recvPhone1"),
    };

  // 주소는 더 구체적으로
  if (!zip)
    return { message: "우편번호를 입력(조회)해주세요.", focusEl: zipEl };
  if (!addr1) return { message: "기본주소를 입력해주세요.", focusEl: addr1El };
  if (!addr2) return { message: "상세주소를 입력해주세요.", focusEl: addr2El };

  return null; // 통과
}

payBtn.addEventListener("click", () => {
  if (!agreeChk.checked) return;

  const err = validateAndGetFirstError();
  if (err) {
    openModal(err.message, err.focusEl);
    return;
  }

  openModal("결제가 완료되었습니다.");
});

renderItems();
