// 유틸

function formatWon(num) {
  const n = Number(num || 0);
  return n.toLocaleString("ko-KR") + "원";
}

function onlyDigits(el) {
  el.addEventListener("input", () => {
    el.value = el.value.replace(/[^\d]/g, "");
  });
}

function getQuery() {
  return new URLSearchParams(window.location.search);
}

// DOM

const $orderItems = document.getElementById("orderItems");
const $totalPriceText = document.getElementById("totalPriceText");

const $sumProduct = document.getElementById("sumProduct");
const $sumDiscount = document.getElementById("sumDiscount");
const $sumShip = document.getElementById("sumShip");
const $sumPay = document.getElementById("sumPay");

const $payBtn = document.getElementById("payBtn");
const $agree = document.getElementById("agree");

const $btnPostcode = document.getElementById("btnPostcode");
const $postcode = document.getElementById("postcode");
const $addr1 = document.getElementById("addr1");
const $addr2 = document.getElementById("addr2");
const $addrExtra = document.getElementById("addrExtra");

// modal
const $modal = document.getElementById("modal");
const $modalClose = document.getElementById("modalClose");
const $modalOk = document.getElementById("modalOk");
const $modalTitle =
  document.getElementById("modalTitle") || $modal.querySelector(".modal-title");

// inputs
const $buyerName = document.getElementById("buyerName");
const $buyerPhone1 = document.getElementById("buyerPhone1");
const $buyerPhone2 = document.getElementById("buyerPhone2");
const $buyerPhone3 = document.getElementById("buyerPhone3");
const $buyerEmail = document.getElementById("buyerEmail");

const $recvName = document.getElementById("recvName");
const $recvPhone1 = document.getElementById("recvPhone1");
const $recvPhone2 = document.getElementById("recvPhone2");
const $recvPhone3 = document.getElementById("recvPhone3");
const $shipMsg = document.getElementById("shipMsg");

// 모달

let modalOkHandler = null;

function openModal(message, onOk) {
  if ($modalTitle) $modalTitle.textContent = message || "";
  modalOkHandler = typeof onOk === "function" ? onOk : null;

  $modal.classList.remove("hidden");
  $modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  $modal.classList.add("hidden");
  $modal.setAttribute("aria-hidden", "true");
  modalOkHandler = null;
}

$modalClose?.addEventListener("click", closeModal);

$modalOk?.addEventListener("click", () => {
  if (modalOkHandler) return modalOkHandler();
  closeModal();
});

$modal?.addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true") closeModal();
});

// 체크박스에 따라 결제버튼 활성/비활성

function syncPayButtonState() {
  const enabled = !!$agree.checked;
  $payBtn.disabled = !enabled;
}

$agree?.addEventListener("change", syncPayButtonState);

// Daum postcode (open 방식)

function openDaumPostcode() {
  if (!window.daum?.Postcode) {
    alert("우편번호 서비스를 불러오지 못했습니다.");
    return;
  }

  new daum.Postcode({
    oncomplete: function (data) {
      let addr = "";
      let extraAddr = "";

      if (data.userSelectedType === "R") addr = data.roadAddress;
      else addr = data.jibunAddress;

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname))
          extraAddr += data.bname;
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        if (extraAddr !== "") extraAddr = " (" + extraAddr + ")";
      }

      $postcode.value = data.zonecode || "";
      $addr1.value = addr || "";
      $addrExtra.value = extraAddr || "";

      $addr2.focus();
    },
  }).open();
}

$btnPostcode?.addEventListener("click", openDaumPostcode);

// 주문 데이터 로딩

let currentOrder = null; // { type: 'direct_order' | 'cart_order', items: [...] }
let currentTotal = 0;

function normalizeImagePath(img) {
  if (!img) return "../../assets/images/product1.png";
  if (typeof img === "string" && img.startsWith("./")) {
    return img.replace("./", "../../");
  }
  return img;
}

function loadOrderDataLocalOnly() {
  // 1) sessionStorage.orderData
  try {
    const s = sessionStorage.getItem("orderData");
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed?.type && Array.isArray(parsed?.items)) return parsed;
      if (Array.isArray(parsed)) return { type: "cart_order", items: parsed };
    }
  } catch {}

  // 2) localStorage.orderData
  try {
    const l = localStorage.getItem("orderData");
    if (l) {
      const parsed = JSON.parse(l);
      if (parsed?.type && Array.isArray(parsed?.items)) return parsed;
      if (Array.isArray(parsed?.items))
        return { type: "cart_order", items: parsed.items };
    }
  } catch {}

  // 3) query string (id/quantity)이 있더라도 서버를 안 쓰기로 했으니
  //    최소 표시용 더미로만 구성 (상품명/가격이 없다면 화면엔 기본값으로 표시됨)
  const qs = getQuery();
  const productId = qs.get("id");
  const quantity = Number(qs.get("quantity") || 1);
  if (productId) {
    return {
      type: "direct_order",
      items: [
        {
          product_id: Number(productId),
          name: "상품",
          brand: "백엔드글로벌",
          price: 0,
          image: "../../assets/images/product1.png",
          quantity: Math.max(1, quantity || 1),
        },
      ],
    };
  }

  return { type: null, items: [] };
}

// 렌더

function renderOrderItems(items = []) {
  $orderItems.innerHTML = "";

  if (!items.length) {
    $orderItems.innerHTML = `
      <div class="item" style="grid-template-columns: 1fr;">
        <div class="item-cell" style="text-align:left; padding:10px 0;">
          주문 정보가 없습니다. 다시 주문해주세요.
        </div>
      </div>
    `;
    return 0;
  }

  let total = 0;

  for (const it of items) {
    const name = it.name || it.product_name || "상품";
    const brand = it.brand || it.category || it.seller || "백엔드글로벌";
    const qty = Number(it.quantity || 1);
    const price = Number(it.price || it.product_price || 0);
    const thumb = normalizeImagePath(it.image || it.thumbnail || it.image_url);

    const rowPrice = price * qty;
    total += rowPrice;

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="item-product">
        <div class="item-thumb"><img src="${thumb}" alt="" /></div>
        <div class="item-meta">
          <div class="item-brand">${brand}</div>
          <div class="item-name">${name}</div>
          <div class="item-qty">수량 : ${qty}개</div>
        </div>
      </div>
      <div class="item-cell">-</div>
      <div class="item-cell">무료배송</div>
      <div class="item-cell item-price">${formatWon(rowPrice)}</div>
    `;
    $orderItems.appendChild(el);
  }

  return total;
}

function updateSummary(total) {
  $totalPriceText.textContent = formatWon(total);
  $sumProduct.textContent = formatWon(total);
  $sumDiscount.textContent = formatWon(0);
  $sumShip.textContent = formatWon(0);
  $sumPay.textContent = formatWon(total);
}

// 입력 검증

function isFormValid() {
  const buyerName = $buyerName.value.trim();
  const buyerPhone = (
    $buyerPhone1.value +
    $buyerPhone2.value +
    $buyerPhone3.value
  ).trim();
  const buyerEmail = $buyerEmail.value.trim();

  const recvName = $recvName.value.trim();
  const recvPhone = (
    $recvPhone1.value +
    $recvPhone2.value +
    $recvPhone3.value
  ).trim();

  const postcode = $postcode.value.trim();
  const addr1 = $addr1.value.trim();
  const addr2 = $addr2.value.trim();

  if (!buyerName)
    return { ok: false, msg: "배송정보를 빠짐없이 입력해주세요." };
  if (buyerPhone.length < 10)
    return { ok: false, msg: "배송정보를 빠짐없이 입력해주세요." };
  if (!buyerEmail)
    return { ok: false, msg: "배송정보를 빠짐없이 입력해주세요." };

  if (!recvName) return { ok: false, msg: "배송정보를 빠짐없이 입력해주세요." };
  if (recvPhone.length < 10)
    return { ok: false, msg: "배송정보를 빠짐없이 입력해주세요." };

  if (!postcode || !addr1 || !addr2)
    return { ok: false, msg: "배송정보를 빠짐없이 입력해주세요." };

  // 체크 안하면 버튼 자체가 disabled지만, 혹시라도 대비
  if (!$agree.checked)
    return { ok: false, msg: "주문 내용 확인 및 동의 체크를 해주세요." };

  return { ok: true, msg: "" };
}

// 결제 성공 처리 (스토리지 정리 + 메인 이동)

function cleanupAfterSuccess() {
  // 메인 상품 데이터는 건드리지 않고
  sessionStorage.removeItem("orderData");
  localStorage.removeItem("orderData");

  // 장바구니 데이터도 같이 비우기
  sessionStorage.removeItem("cartData");
  localStorage.removeItem("cartData");
}

// 결제하기 버튼

$payBtn?.addEventListener("click", () => {
  if ($payBtn.disabled) return;

  const v = isFormValid();
  if (!v.ok) return openModal(v.msg);

  if (!currentOrder || !currentOrder.items?.length) {
    return openModal("주문 정보가 없습니다. 다시 주문해주세요.");
  }

  // 결제 완료 모달 (같은 위치/같은 디자인)
  openModal("결제가 완료되었습니다.", () => {
    cleanupAfterSuccess();
    window.location.href = "../../index.html";
  });
});

// 초기화

(function init() {
  [
    $buyerPhone1,
    $buyerPhone2,
    $buyerPhone3,
    $recvPhone1,
    $recvPhone2,
    $recvPhone3,
  ].forEach((el) => el && onlyDigits(el));

  closeModal();

  // 처음엔 체크 안 되어 있으니까 버튼 회색/비활성
  syncPayButtonState();

  currentOrder = loadOrderDataLocalOnly();
  const items = currentOrder?.items || [];

  currentTotal = renderOrderItems(items);
  updateSummary(currentTotal);
})();
