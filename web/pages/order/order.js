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

function getAccessToken() {
  return (
    localStorage.getItem("access_token") || localStorage.getItem("token") || ""
  );
}

function authHeaders(extra = {}) {
  const t = getAccessToken();
  return {
    ...extra,
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || data?.detail || "요청 실패";
    throw new Error(msg);
  }
  return data;
}

function normalizeImagePath(img) {
  if (!img) return "../../assets/images/product1.png";
  if (typeof img === "string" && img.startsWith("./"))
    return img.replace("./", "../../");
  return img;
}

function safeParseJSON(raw) {
  try {
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getPaymentMethodValue() {
  const checked = document.querySelector('input[name="pay"]:checked');
  const v = checked?.value || "card";
  const map = {
    card: "card",
    bank: "deposit",
    mobile: "phone",
    naver: "naverpay",
    kakao: "kakaopay",
  };
  return map[v] || "card";
}

/**
 * ✅ 여러 후보 경로 중 "진짜 페이지"로 보이는 곳으로 이동
 * - 서버가 없는 페이지도 200으로 주고 404 UI를 띄우는 경우를 대비해서
 *   HTML 내용에 404/Not Found 흔적이 있으면 실패로 판단하고 다음 후보로 넘어감
 */
async function goToFirstValidPath(paths, fallbackPath) {
  for (const p of paths) {
    try {
      const url = new URL(p, window.location.origin).toString();
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      if (!res.ok) continue;

      const text = (await res.text()).slice(0, 3000).toLowerCase();

      const looks404 =
        text.includes("<title>404") ||
        (text.includes("404") && text.includes("not found")) ||
        text.includes("페이지를 찾을 수") ||
        text.includes("cannot get") ||
        text.includes("not found") ||
        text.includes("page not found");

      if (looks404) continue;

      window.location.href = url;
      return;
    } catch {
      // 다음 후보
    }
  }

  window.location.href = new URL(
    fallbackPath,
    window.location.origin
  ).toString();
}

/**
 * ✅ 헤더 아이콘 네비게이션(자두=홈, 장바구니=카트)
 * - layout.js가 header를 동적으로 주입하므로 주입 후 바인딩
 * - 가장 정확한 방법: 헤더 안의 a[href]가 있으면 그 경로 그대로 따라가기
 * - a[href]가 없으면 후보 경로로 탐색
 */
function wireHeaderNav() {
  const HOME_FALLBACK = "/index.html";

  // ✅ 현재 페이지 경로를 보고 cart 경로 후보를 앞쪽에 더 정확히 배치
  const path = window.location.pathname; // 예: /pages/order/order.html
  const preferPages = path.includes("/pages/");

  const HOME_CANDIDATES = ["/index.html", "/pages/index.html"];

  const CART_CANDIDATES = preferPages
    ? [
        "/pages/cart/cart.html",
        "/pages/cart.html",
        "/cart/cart.html",
        "/cart.html",
        "/cart",
      ]
    : [
        "/cart/cart.html",
        "/cart.html",
        "/pages/cart/cart.html",
        "/pages/cart.html",
        "/cart",
      ];

  const bind = () => {
    const header = document.querySelector("header");
    if (!header) return false;

    // ---- 홈(자두) ----
    const homeSelectors = [
      'img[alt*="자두"]',
      'img[alt*="로고"]',
      'img[src*="jadoo"]',
      'img[src*="plum"]',
      ".logo",
      ".headerLogo",
      "#logo",
      "#headerLogo",
      'a[href*="index"]',
    ];

    let homeEl = null;
    for (const sel of homeSelectors) {
      homeEl = header.querySelector(sel);
      if (homeEl) break;
    }

    if (homeEl) {
      const clickable = homeEl.closest("a, button, div, span") || homeEl;
      clickable.style.cursor = "pointer";

      if (!clickable.dataset.wiredHome) {
        clickable.dataset.wiredHome = "1";
        clickable.addEventListener("click", async (e) => {
          e.preventDefault();

          // ✅ 헤더 내부에 a[href]가 있으면 그걸 그대로 사용 (정답률 최고)
          const a = clickable.closest("a");
          const href = a?.getAttribute("href");
          if (href && href !== "#") {
            window.location.href = new URL(
              href,
              window.location.origin
            ).toString();
            return;
          }

          await goToFirstValidPath(HOME_CANDIDATES, HOME_FALLBACK);
        });
      }
    }

    // ---- 장바구니 ----
    const cartSelectors = [
      'img[alt*="장바구니"]',
      'img[src*="cart"]',
      ".cart",
      ".cartIcon",
      ".headerCart",
      "#cart",
      "#cartIcon",
      "#headerCart",
      'a[href*="cart"]',
    ];

    let cartEl = null;
    for (const sel of cartSelectors) {
      cartEl = header.querySelector(sel);
      if (cartEl) break;
    }

    if (cartEl) {
      const clickable = cartEl.closest("a, button, div, span") || cartEl;
      clickable.style.cursor = "pointer";

      if (!clickable.dataset.wiredCart) {
        clickable.dataset.wiredCart = "1";
        clickable.addEventListener("click", async (e) => {
          e.preventDefault();

          // ✅ 가장 확실: 헤더에서 제공하는 cart 링크(a[href])가 있으면 그걸 우선 사용
          const a = clickable.closest("a");
          const href = a?.getAttribute("href");
          if (href && href !== "#") {
            window.location.href = new URL(
              href,
              window.location.origin
            ).toString();
            return;
          }

          // ✅ 없으면 후보 경로 탐색
          await goToFirstValidPath(CART_CANDIDATES, "/pages/cart/cart.html");
        });
      }
    }

    return Boolean(homeEl || cartEl);
  };

  // header 주입 타이밍 대비: 반복 + MutationObserver 보험
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    const ok = bind();
    if (ok || tries >= 30) clearInterval(timer);
  }, 100);

  const observer = new MutationObserver(() => {
    const ok = bind();
    if (ok) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
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
$modalClose?.addEventListener("click", closeModal);
$modalOk?.addEventListener("click", closeModal);
$modal?.addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true") closeModal();
});

// -----------------------------
// Daum postcode
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

// -----------------------------
// 주문 데이터 구성
// -----------------------------
async function buildOrderDataSmart() {
  const params = new URLSearchParams(location.search);
  const productId = params.get("id");
  const quantity = Math.max(1, Number(params.get("quantity") || 1));

  // ✅ 1) 바로구매: URL에 id가 있으면 무조건 이걸로
  if (productId) {
    const p = await fetchJSON(`${API_BASE_URL}/api/products/${productId}`);
    const orderData = {
      type: "direct_order",
      timestamp: new Date().toISOString(),
      items: [
        {
          product_id: Number(productId),
          quantity,
          name: p.name,
          brand: p?.seller?.store_name || "백엔드글로벌",
          price: p.price,
          image: normalizeImagePath(p.image),
        },
      ],
    };
    sessionStorage.setItem("orderData", JSON.stringify(orderData));
    return orderData;
  }

  // ✅ 2) 장바구니: session/local 둘 다 있으면 "더 최신 timestamp" 선택
  const session = safeParseJSON(sessionStorage.getItem("orderData"));
  const local = safeParseJSON(localStorage.getItem("orderData"));

  const sessionHas = Array.isArray(session?.items) && session.items.length > 0;
  const localHas = Array.isArray(local?.items) && local.items.length > 0;

  if (sessionHas || localHas) {
    const sTime = session?.timestamp
      ? new Date(session.timestamp).getTime()
      : 0;
    const lTime = local?.timestamp ? new Date(local.timestamp).getTime() : 0;

    const picked = localHas && lTime >= sTime ? local : session;

    const normalized = {
      type: picked.type || "cart_order",
      timestamp: picked.timestamp || new Date().toISOString(),
      items: picked.items,
    };

    sessionStorage.setItem("orderData", JSON.stringify(normalized));
    return normalized;
  }

  // ✅ 3) fallback: 서버 장바구니에서 직접 구성
  const token = getAccessToken();
  if (!token)
    return {
      type: "cart_order",
      timestamp: new Date().toISOString(),
      items: [],
    };

  const cart = await fetchJSON(`${API_BASE_URL}/api/cart/`, {
    headers: authHeaders(),
  });

  if (!Array.isArray(cart) || cart.length === 0) {
    return {
      type: "cart_order",
      timestamp: new Date().toISOString(),
      items: [],
    };
  }

  const items = await Promise.all(
    cart.map(async (c) => {
      const p = await fetchJSON(`${API_BASE_URL}/api/products/${c.product_id}`);
      return {
        id: c.id, // ✅ cart_order에 필요
        product_id: c.product_id,
        quantity: c.quantity,
        name: p.name,
        brand: p?.seller?.store_name || "백엔드글로벌",
        price: p.price,
        image: normalizeImagePath(p.image),
      };
    })
  );

  const orderData = {
    type: "cart_order",
    timestamp: new Date().toISOString(),
    items,
  };
  sessionStorage.setItem("orderData", JSON.stringify(orderData));
  return orderData;
}

// -----------------------------
// 렌더
// -----------------------------
function renderOrderItems(items = []) {
  if (!$orderItems) return 0;

  $orderItems.innerHTML = "";

  if (!items.length) {
    $orderItems.innerHTML = `
      <div class="item" style="grid-template-columns: 1fr;">
        <div class="item-cell" style="text-align:left; padding:10px 0;">
          주문 정보가 없습니다. 장바구니에서 다시 주문해주세요.
        </div>
      </div>
    `;
    return 0;
  }

  let total = 0;

  for (const it of items) {
    const name = it.name || it.product_name || "상품";
    const brand = it.brand || it.category || "백엔드글로벌";
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
  if ($totalPriceText) $totalPriceText.textContent = formatWon(total);
  if ($sumProduct) $sumProduct.textContent = formatWon(total);
  if ($sumDiscount) $sumDiscount.textContent = formatWon(0);
  if ($sumShip) $sumShip.textContent = formatWon(0);
  if ($sumPay) $sumPay.textContent = formatWon(total);
}

function isShippingValid() {
  const buyerName = $buyerName?.value.trim();
  const buyerPhone = (
    ($buyerPhone1?.value || "") +
    ($buyerPhone2?.value || "") +
    ($buyerPhone3?.value || "")
  ).trim();
  const buyerEmail = $buyerEmail?.value.trim();

  const recvName = $recvName?.value.trim();
  const recvPhone = (
    ($recvPhone1?.value || "") +
    ($recvPhone2?.value || "") +
    ($recvPhone3?.value || "")
  ).trim();

  const postcode = $postcode?.value.trim();
  const addr1 = $addr1?.value.trim();
  const addr2 = $addr2?.value.trim();

  if (!buyerName) return false;
  if (buyerPhone.length < 10) return false;
  if (!buyerEmail) return false;

  if (!recvName) return false;
  if (recvPhone.length < 10) return false;

  if (!postcode || !addr1 || !addr2) return false;

  return true;
}

function calcTotalPriceFromItems(items = []) {
  return items.reduce((sum, it) => {
    const qty = Number(it.quantity || 1);
    const price = Number(it.price || it.product_price || 0);
    return sum + price * qty;
  }, 0);
}

// -----------------------------
// 주문 생성
// -----------------------------
async function createOrderByType(orderData) {
  const token = getAccessToken();
  if (!token) throw new Error("로그인이 필요합니다.");

  const type = orderData?.type;
  const items = orderData?.items || [];
  const total_price = calcTotalPriceFromItems(items);

  const receiver = $recvName.value.trim();
  const receiver_phone_number = `${$recvPhone1.value}-${$recvPhone2.value}-${$recvPhone3.value}`;
  const address = `${$addr1.value.trim()} ${$addr2.value.trim()}`.trim();
  const address_message = $shipMsg.value.trim();
  const payment_method = getPaymentMethodValue();

  if (type === "direct_order") {
    const first = items[0] || {};
    const product_id = first.product_id ?? first.id;
    const quantity = Number(first.quantity || 1);
    if (!product_id) throw new Error("직접구매 상품 정보가 없습니다.");

    return fetchJSON(`${API_BASE_URL}/api/order/`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        order_type: "direct_order",
        product_id: Number(product_id),
        quantity,
        total_price,
        receiver,
        receiver_phone_number,
        address,
        address_message,
        payment_method,
      }),
    });
  }

  if (type === "cart_order" || type === "cart") {
    const cart_items = items
      .map((it) => Number(it.id ?? it.cartItemId ?? it.cart_item_id))
      .filter((n) => Number.isFinite(n));

    if (!cart_items.length)
      throw new Error("장바구니 주문 아이템(id)이 없습니다.");

    return fetchJSON(`${API_BASE_URL}/api/order/`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        order_type: "cart_order",
        cart_items,
        total_price,
        receiver,
        receiver_phone_number,
        address,
        address_message,
        payment_method,
      }),
    });
  }

  throw new Error("orderData.type이 올바르지 않습니다.");
}

async function clearCartAlways() {
  const token = getAccessToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/api/cart/`, {
    method: "DELETE",
    headers: authHeaders(),
  }).catch(() => {});
}

function cleanupOrderData() {
  sessionStorage.removeItem("orderData");
  localStorage.removeItem("orderData");
}

// -----------------------------
// 결제 버튼
// -----------------------------
$payBtn?.addEventListener("click", async () => {
  if (!isShippingValid()) {
    openModal();
    return;
  }

  // 동의 강제하고 싶으면 주석 해제
  // if (!$agree?.checked) { alert("동의가 필요합니다."); return; }

  const orderData = safeParseJSON(sessionStorage.getItem("orderData"));
  if (!orderData?.items?.length) {
    alert("주문 정보가 없습니다. 장바구니에서 다시 주문해주세요.");
    return;
  }

  try {
    await createOrderByType(orderData);
    await clearCartAlways();
    cleanupOrderData();
    window.location.href = "../../index.html";
  } catch (err) {
    alert(err?.message || "결제 처리 중 오류가 발생했습니다.");
  }
});

// -----------------------------
// 초기화
// -----------------------------
(async function init() {
  // ✅ 헤더 아이콘 네비게이션: 자두=홈 / 장바구니=카트
  wireHeaderNav();

  [
    $buyerPhone1,
    $buyerPhone2,
    $buyerPhone3,
    $recvPhone1,
    $recvPhone2,
    $recvPhone3,
  ]
    .filter(Boolean)
    .forEach(onlyDigits);

  closeModal();

  const orderData = await buildOrderDataSmart();
  const items = orderData?.items || [];
  const total = renderOrderItems(items);
  updateSummary(total);
})();
