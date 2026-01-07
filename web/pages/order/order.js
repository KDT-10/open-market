const API_BASE_URL = "http://localhost:3000";

// -----------------------------
// 유틸
// -----------------------------
function formatWon(num) {
  const n = Number(num || 0);
  return n.toLocaleString("ko-KR") + "원";
}

function onlyDigits(el) {
  el.addEventListener("input", () => {
    el.value = el.value.replace(/[^\d]/g, "");
  });
}

function getToken() {
  return localStorage.getItem("token") || "";
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || "요청 실패";
    throw new Error(msg);
  }
  return data;
}

// -----------------------------
// DOM
// -----------------------------
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

// -----------------------------
// 모달
// -----------------------------
function openModal() {
  $modal.classList.remove("hidden");
  $modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  $modal.classList.add("hidden");
  $modal.setAttribute("aria-hidden", "true");
}

$modalClose.addEventListener("click", closeModal);
$modalOk.addEventListener("click", closeModal);
$modal.addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true") closeModal();
});

// -----------------------------
// Daum postcode (open 방식)
// -----------------------------
function openDaumPostcode() {
  if (!window.daum?.Postcode) {
    alert("우편번호 서비스를 불러오지 못했습니다.");
    return;
  }

  new daum.Postcode({
    oncomplete: function (data) {
      let addr = "";
      let extraAddr = "";

      if (data.userSelectedType === "R") {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
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

$btnPostcode.addEventListener("click", openDaumPostcode);

// -----------------------------
// 렌더: 주문상품(세션 orderData)
// -----------------------------
function getOrderData() {
  try {
    return JSON.parse(sessionStorage.getItem("orderData") || "null");
  } catch {
    return null;
  }
}

function renderOrderItems(items = []) {
  $orderItems.innerHTML = "";

  if (!items.length) {
    $orderItems.innerHTML = `
      <div class="item" style="grid-template-columns: 1fr;">
        <div class="item-cell" style="text-align:left; padding:10px 0;">
          주문 정보가 없습니다. (orderData가 비어있어요) 다시 주문해주세요.
        </div>
      </div>
    `;
    return 0;
  }

  let total = 0;

  for (const it of items) {
    const name = it.name || it.product_name || "상품";
    const brand = it.brand || it.seller || "백엔드글로벌";
    const qty = Number(it.quantity || 1);
    const price = Number(it.price || it.product_price || 0);

    const thumb =
      it.image ||
      it.thumbnail ||
      it.image_url ||
      "../../assets/images/product1.png";

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

// -----------------------------
// 결제(주문 생성 API 호출)
// -----------------------------
function isShippingValid() {
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

  //  “배송정보 하나라도 입력하지 않으면” → 사실상 필수 묶음 체크
  if (!buyerName) return false;
  if (buyerPhone.length < 10) return false;
  if (!buyerEmail) return false;

  if (!recvName) return false;
  if (recvPhone.length < 10) return false;

  if (!postcode || !addr1 || !addr2) return false;

  return true;
}

async function createOrderByType(orderData) {
  const token = getToken();
  if (!token) throw new Error("로그인이 필요합니다.");

  // PROJECT.md 기준: { type:'direct_order' | 'cart', items:[...] }
  const type = orderData?.type;
  const items = orderData?.items || [];

  const bodyCommon = {
    delivery_name: $recvName.value.trim(),
    delivery_phone: `${$recvPhone1.value}-${$recvPhone2.value}-${$recvPhone3.value}`,
    delivery_zipcode: $postcode.value.trim(),
    delivery_address: $addr1.value.trim(),
    delivery_address_detail: $addr2.value.trim(),
    delivery_request: $shipMsg.value.trim(),
  };

  if (type === "direct_order") {
    // items[0] 기반
    const first = items[0] || {};
    const product_id = first.product_id ?? first.id;
    const quantity = Number(first.quantity || 1);

    if (!product_id) throw new Error("직접구매 상품 정보가 없습니다.");

    return fetchJSON(`${API_BASE_URL}/api/order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        order_type: "direct_order",
        product_id,
        quantity,
        ...bodyCommon,
      }),
    });
  }

  if (type === "cart") {
    // cart 주문은 cart_items 배열(서버는 cart_item_id(=id) 필요)
    const cart_items = items.map((it) => ({
      cart_item_id: it.cart_item_id ?? it.id,
      quantity: Number(it.quantity || 1),
    }));

    if (!cart_items.length || !cart_items[0].cart_item_id) {
      throw new Error("장바구니 주문 정보가 올바르지 않습니다.");
    }

    return fetchJSON(`${API_BASE_URL}/api/order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        order_type: "cart",
        cart_items,
        ...bodyCommon,
      }),
    });
  }

  throw new Error("orderData.type이 올바르지 않습니다.");
}

$payBtn.addEventListener("click", async () => {
  // 버튼은 항상 초록색, 대신 클릭 시 검증해서 모달
  if (!isShippingValid()) {
    openModal();
    return;
  }

  const orderData = getOrderData();
  if (!orderData) {
    alert("주문 정보가 없습니다. 다시 주문해주세요.");
    return;
  }

  try {
    await createOrderByType(orderData);

    // 결제 완료 → orderData 삭제 → 메인으로 이동
    sessionStorage.removeItem("orderData");
    window.location.href = "../../index.html";
  } catch (err) {
    alert(err?.message || "결제 처리 중 오류가 발생했습니다.");
  }
});

// -----------------------------
// 초기화
// -----------------------------
(function init() {
  // 숫자만 입력
  [
    $buyerPhone1,
    $buyerPhone2,
    $buyerPhone3,
    $recvPhone1,
    $recvPhone2,
    $recvPhone3,
  ].forEach(onlyDigits);

  // 초기 모달은 숨김 확정
  closeModal();

  const orderData = getOrderData();
  const items = orderData?.items || [];
  const total = renderOrderItems(items);
  updateSummary(total);
})();
