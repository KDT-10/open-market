/**
 * ✅ 주문/결제하기 (최종)
 * - orderData 우선순위:
 *   1) sessionStorage.orderData (바로구매/카트 모두 여기 저장 가능)
 *   2) localStorage.orderData
 *   3) (마지막 fallback) 로그인 되어 있으면 /api/cart/ 불러와서 구성
 * - 결제:
 *   /api/order/ POST -> /api/cart/ DELETE -> 메인 이동
 */

const BASE = "http://localhost:3000";
const API = `${BASE}/api`;

document.addEventListener("DOMContentLoaded", async () => {
  wireHeader();
  wireModal();
  wireZipcode();

  const orderItems = await loadOrderItems();
  renderOrder(orderItems);

  document.getElementById("btnPay").addEventListener("click", () => {
    handlePay(orderItems);
  });
});

/* ---------------- 헤더 ---------------- */
function wireHeader() {
  const form = document.getElementById("searchForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    // 검색은 메인에서 처리한다고 가정
    const q = document.getElementById("searchInput")?.value?.trim() || "";
    location.href = q
      ? `/web/index.html?q=${encodeURIComponent(q)}`
      : `/web/index.html`;
  });

  // 장바구니 / 마이페이지 링크는 html에 이미 href로 박아둠
}

/* ---------------- 모달 ---------------- */
function wireModal() {
  const dim = document.getElementById("modalDim");
  const closeBtn = document.getElementById("modalClose");
  const okBtn = document.getElementById("modalOk");

  const close = () => hideModal();

  closeBtn?.addEventListener("click", close);
  okBtn?.addEventListener("click", close);

  dim?.addEventListener("click", (e) => {
    if (e.target === dim) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function showModal(msg) {
  document.getElementById("modalMsg").textContent = msg;
  document.getElementById("modalDim").classList.add("show");
  document.getElementById("modalDim").setAttribute("aria-hidden", "false");
}
function hideModal() {
  document.getElementById("modalDim").classList.remove("show");
  document.getElementById("modalDim").setAttribute("aria-hidden", "true");
}

/* ---------------- 우편번호(다음) ---------------- */
function wireZipcode() {
  const btn = document.getElementById("btnZip");
  btn?.addEventListener("click", () => {
    if (!window.daum || !window.daum.Postcode) {
      showModal("우편번호 서비스 스크립트를 불러오지 못했습니다.");
      return;
    }

    new daum.Postcode({
      oncomplete: function (data) {
        // 도로명/지번 주소
        const addr =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        // 참고항목
        let extra = "";
        if (data.userSelectedType === "R") {
          if (data.bname) extra += data.bname;
          if (data.buildingName)
            extra += extra ? `, ${data.buildingName}` : data.buildingName;
          if (extra) extra = `(${extra})`;
        }

        document.getElementById("postcode").value = data.zonecode || "";
        document.getElementById("addr1").value = addr || "";
        document.getElementById("addrExtra").value = extra || "";
        document.getElementById("addr2").focus();
      },
    }).open();
  });
}

/* ---------------- 주문 데이터 로딩 ---------------- */
async function loadOrderItems() {
  // 1) sessionStorage 우선
  const ss = safeParse(sessionStorage.getItem("orderData"));
  if (Array.isArray(ss) && ss.length) {
    return await normalizeItems(ss);
  }
  if (ss && Array.isArray(ss.items) && ss.items.length) {
    return await normalizeItems(ss.items);
  }

  // 2) localStorage
  const ls = safeParse(localStorage.getItem("orderData"));
  if (Array.isArray(ls) && ls.length) {
    return await normalizeItems(ls);
  }
  if (ls && Array.isArray(ls.items) && ls.items.length) {
    return await normalizeItems(ls.items);
  }

  // 3) fallback: 로그인 되어 있으면 카트 API
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const cart = await apiFetch(`${API}/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(cart) && cart.length) {
        // cart: [{ product_id, quantity }]
        const items = await Promise.all(
          cart.map(async (c) => {
            const product = await fetchProduct(c.product_id);
            return {
              product_id: c.product_id,
              quantity: Number(c.quantity || 1),
              product,
            };
          })
        );
        return items;
      }
    } catch (e) {
      // 무시하고 빈 배열
    }
  }

  return [];
}

async function normalizeItems(rawItems) {
  const items = await Promise.all(
    rawItems.map(async (it) => {
      const quantity = Number(it.quantity || it.qty || 1);

      const pid =
        it.product_id ??
        it.productId ??
        it.id ??
        it.product?.id ??
        it.product?.product_id;

      let product = it.product || null;

      // product 정보가 없으면 products에서 조회
      if (!product && pid != null) {
        product = await fetchProduct(pid);
      }

      return {
        product_id: pid,
        quantity,
        product,
      };
    })
  );

  // product가 없는 항목 제거
  return items.filter((x) => x.product && x.quantity > 0);
}

async function fetchProduct(id) {
  const pid = String(id);
  const url = `${BASE}/products/${encodeURIComponent(pid)}`;
  return await apiFetch(url);
}

function safeParse(v) {
  try {
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${txt}`);
  }
  return await res.json();
}

/* ---------------- 렌더 ---------------- */
function renderOrder(items) {
  const rows = document.getElementById("orderRows");
  rows.innerHTML = "";

  if (!items.length) {
    rows.innerHTML = `
      <div class="otRow">
        <div class="infoCell">
          <div class="meta">
            <div class="name">주문 정보가 없습니다. 다시 주문해주세요.</div>
            <div class="qty">orderData가 비어있습니다.</div>
          </div>
        </div>
        <div class="cellRight">0원</div>
        <div class="cellRight">0원</div>
        <div class="cellRight"><strong>0원</strong></div>
      </div>
    `;
    updateTotals(0, 0, 0);
    return;
  }

  let productSum = 0;
  let shipSum = 0; // 필요하면 상품별 배송비 합산
  let discountSum = 0;

  items.forEach((it) => {
    const p = it.product;
    const price = Number(p.price || 0);
    const line = price * it.quantity;

    productSum += line;

    // db.json에 shipping_fee가 있고, 무료배송이면 0
    const ship = Number(p.shipping_fee || 0);
    // 보통 “상품별”이 아니라 “주문 전체” 규칙이 있을 수 있는데,
    // 프로젝트 요구가 없어서 단순합산 대신 0으로 유지하려면 아래 주석 처리하면 됨.
    // shipSum += ship;

    const imgSrc = resolveImage(p.image);

    const brand = p.info || (p.seller && p.seller.store_name) || "";
    const name = p.name || "";

    const row = document.createElement("div");
    row.className = "otRow";
    row.innerHTML = `
      <div class="infoCell">
        <div class="thumb"><img src="${imgSrc}" alt="${escapeHtml(
      name
    )}" /></div>
        <div class="meta">
          <div class="brand">${escapeHtml(brand)}</div>
          <div class="name">${escapeHtml(name)}</div>
          <div class="qty">수량 ${it.quantity}개</div>
        </div>
      </div>

      <div class="cellRight">0원</div>
      <div class="cellRight">${formatWon(ship)}원</div>
      <div class="cellRight"><strong>${formatWon(line)}원</strong></div>
    `;
    rows.appendChild(row);
  });

  updateTotals(productSum, discountSum, shipSum);
}

function updateTotals(productSum, discountSum, shipSum) {
  const total = productSum - discountSum + shipSum;

  setText("topTotalPrice", formatWon(total));
  setText("sumProduct", formatWon(productSum));
  setText("sumDiscount", formatWon(discountSum));
  setText("sumShip", formatWon(shipSum));
  setText("sumTotal", formatWon(total));
}

function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function formatWon(n) {
  return Number(n || 0).toLocaleString("ko-KR");
}

function resolveImage(imagePath) {
  if (!imagePath) return "";
  // db.json: "./assets/images/xxx.png" -> "/web/assets/images/xxx.png"
  if (imagePath.startsWith("./assets/")) return "/web/" + imagePath.slice(2);
  if (imagePath.startsWith("assets/")) return "/web/" + imagePath;
  if (imagePath.startsWith("/web/")) return imagePath;
  return imagePath;
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------- 결제 처리 ---------------- */
async function handlePay(orderItems) {
  // 주문데이터 없으면 결제 불가
  if (!orderItems || !orderItems.length) {
    showModal("주문 정보가 없습니다. 다시 주문해주세요.");
    return;
  }

  // 필수값 체크
  const requiredChecks = [
    ["buyerName", "주문자 이름을 입력해주세요."],
    ["buyerPhone1", "주문자 휴대폰을 입력해주세요."],
    ["buyerPhone2", "주문자 휴대폰을 입력해주세요."],
    ["buyerPhone3", "주문자 휴대폰을 입력해주세요."],
    ["buyerEmail", "이메일을 입력해주세요."],
    ["recvName", "수령인 이름을 입력해주세요."],
    ["recvPhone1", "수령인 휴대폰을 입력해주세요."],
    ["recvPhone2", "수령인 휴대폰을 입력해주세요."],
    ["recvPhone3", "수령인 휴대폰을 입력해주세요."],
    ["postcode", "우편번호 조회를 진행해주세요."],
    ["addr1", "주소를 입력해주세요."],
    ["addr2", "상세주소를 입력해주세요."],
  ];

  for (const [id, msg] of requiredChecks) {
    const v = document.getElementById(id)?.value?.trim();
    if (!v) {
      showModal(msg);
      document.getElementById(id)?.focus();
      return;
    }
  }

  const agree = document.getElementById("agree")?.checked;
  if (!agree) {
    showModal("주문 동의 체크를 해주세요.");
    return;
  }

  const token = localStorage.getItem("access_token");
  if (!token) {
    showModal("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
    return;
  }

  const userShippingInfo = collectShippingInfo();
  const orderData = orderItems.map((x) => ({
    product_id: x.product_id,
    quantity: x.quantity,
    // 서버에는 product 정보까지 보내도 되고, 최소키만 보내도 됨.
    // 여기선 안전하게 product도 포함
    product: x.product,
  }));

  try {
    // 1) 주문 생성
    await apiFetch(`${API}/order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderData, userShippingInfo }),
    });

    // 2) 장바구니 비우기 (요구사항: 결제 완료되면 비움)
    await apiFetch(`${API}/cart/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    // 3) orderData 정리(다음 주문 꼬임 방지)
    sessionStorage.removeItem("orderData");
    // localStorage는 팀 정책에 따라 남길 수도 있지만, 여기선 안전하게 제거
    localStorage.removeItem("orderData");

    // 4) 메인으로 이동
    location.href = "/web/index.html";
  } catch (e) {
    showModal("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    console.error(e);
  }
}

function collectShippingInfo() {
  const buyerPhone = [
    v("buyerPhone1"),
    v("buyerPhone2"),
    v("buyerPhone3"),
  ].join("-");
  const recvPhone = [v("recvPhone1"), v("recvPhone2"), v("recvPhone3")].join(
    "-"
  );

  return {
    buyer: {
      name: v("buyerName"),
      phone: buyerPhone,
      email: v("buyerEmail"),
    },
    receiver: {
      name: v("recvName"),
      phone: recvPhone,
    },
    address: {
      postcode: v("postcode"),
      addr1: v("addr1"),
      addr2: v("addr2"),
      extra: v("addrExtra"),
    },
    message: v("shipMsg"),
    payMethod:
      document.querySelector('input[name="pay"]:checked')?.value || "card",
  };
}

function v(id) {
  return document.getElementById(id)?.value?.trim() || "";
}
