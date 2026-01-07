// web/pages/order/order.js
const BASE_URL = "http://localhost:3000";

const $ = (sel) => document.querySelector(sel);

const el = {
  tbody: $("#orderTbody"),
  totalPriceText: $("#totalPriceText"),
  sumItems: $("#sumItems"),
  sumDiscount: $("#sumDiscount"),
  sumShip: $("#sumShip"),
  sumTotal: $("#sumTotal"),

  payBtn: $("#payBtn"),
  agree: $("#agree"),

  // buyer
  buyerName: $("#buyerName"),
  buyerPhone1: $("#buyerPhone1"),
  buyerPhone2: $("#buyerPhone2"),
  buyerPhone3: $("#buyerPhone3"),
  buyerEmail: $("#buyerEmail"),

  // recv
  recvName: $("#recvName"),
  recvPhone1: $("#recvPhone1"),
  recvPhone2: $("#recvPhone2"),
  recvPhone3: $("#recvPhone3"),

  postcode: $("#postcode"),
  addr1: $("#addr1"),
  addr2: $("#addr2"),
  addrExtra: $("#addrExtra"),
  shipMsg: $("#shipMsg"),
  postcodeBtn: $("#postcodeBtn"),

  // modal
  modal: $("#modal"),
  modalText: $("#modalText"),
  modalClose: $("#modalClose"),
  modalDim: $("#modalDim"),
};

function formatWon(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("ko-KR");
}

function safeJsonParse(v, fallback) {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

/**
 * ✅ orderData 소스 우선순위
 * 1) localStorage.orderData (cart/product-details에서 넣는 값)
 * 2) 없으면 /cart에서 selected/checked 찾아보기
 */
async function getOrderItems() {
  const raw = localStorage.getItem("orderData");
  const fromLS = safeJsonParse(raw, null);

  if (Array.isArray(fromLS) && fromLS.length > 0) return fromLS;
  if (fromLS && Array.isArray(fromLS.items) && fromLS.items.length > 0)
    return fromLS.items;

  // fallback: cart에서 선택된 것 찾기
  try {
    const res = await fetch(`${BASE_URL}/cart`);
    if (!res.ok) throw new Error("cart fetch failed");
    const cart = await res.json();

    // 가능한 필드 케이스 모두 대응
    const picked = cart.filter(
      (it) =>
        it.selected === true || it.checked === true || it.isChecked === true
    );
    if (picked.length > 0) return picked;

    // 선택 필드가 없으면 장바구니 전체를 주문으로 보지 않도록(실수 방지)
    return [];
  } catch {
    return [];
  }
}

function calcLineTotal(item) {
  const price = Number(item.price ?? item.productPrice ?? item.amount ?? 0);
  const qty = Number(item.qty ?? item.quantity ?? item.count ?? 1);
  return price * qty;
}

function getItemName(item) {
  return item.name ?? item.title ?? item.productName ?? "상품";
}

function getItemImg(item) {
  // 이미지 필드 케이스 다양하게 대응
  return (
    item.image ||
    item.img ||
    item.thumbnail ||
    item.productImage ||
    "../../assets/images/product1.png"
  );
}

function renderEmptyRow() {
  el.tbody.innerHTML = `
    <tr>
      <td colspan="4" class="emptyRow">
        주문 정보가 없습니다. (orderData가 비어있어요) 다시 주문해주세요.
      </td>
    </tr>
  `;
}

function renderRows(items) {
  el.tbody.innerHTML = items
    .map((item) => {
      const name = getItemName(item);
      const img = getItemImg(item);
      const qty = Number(item.qty ?? item.quantity ?? item.count ?? 1);
      const lineTotal = calcLineTotal(item);

      return `
        <tr class="itemRow">
          <td class="colInfo">
            <div class="prod">
              <img class="prod__img" src="${img}" alt="${name}" />
              <div class="prod__txt">
                <div class="prod__name">${name}</div>
                <div class="prod__meta">수량 : ${qty}개</div>
              </div>
            </div>
          </td>
          <td class="colDiscount">-</td>
          <td class="colShip">무료배송</td>
          <td class="colPrice"><b>${formatWon(lineTotal)}</b>원</td>
        </tr>
      `;
    })
    .join("");
}

function renderTotals(items) {
  const itemsSum = items.reduce((acc, it) => acc + calcLineTotal(it), 0);
  const discount = 0;
  const ship = 0;
  const total = itemsSum - discount + ship;

  el.totalPriceText.textContent = formatWon(total);

  el.sumItems.textContent = formatWon(itemsSum);
  el.sumDiscount.textContent = formatWon(discount);
  el.sumShip.textContent = formatWon(ship);
  el.sumTotal.textContent = formatWon(total);

  return { itemsSum, discount, ship, total };
}

function openModal(message) {
  el.modalText.textContent = message;
  el.modal.classList.add("isOpen");
  el.modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  el.modal.classList.remove("isOpen");
  el.modal.setAttribute("aria-hidden", "true");
}

function isFilled(v) {
  return String(v ?? "").trim().length > 0;
}

function validateRequired() {
  // ✅ “배송정보를 하나라도 입력하지 않으면” = 주문자+배송지 필수로 봄
  const required = [
    el.buyerName.value,
    el.buyerPhone1.value,
    el.buyerPhone2.value,
    el.buyerPhone3.value,
    el.buyerEmail.value,
    el.recvName.value,
    el.recvPhone1.value,
    el.recvPhone2.value,
    el.recvPhone3.value,
    el.postcode.value,
    el.addr1.value,
    el.addr2.value,
  ];

  const ok = required.every(isFilled);
  if (!ok) return { ok: false, msg: "배송정보를 빠짐없이 입력해주세요." };

  if (!el.agree.checked)
    return { ok: false, msg: "주문 내용 확인 및 동의에 체크해주세요." };

  return { ok: true };
}

function bindPostcode() {
  el.postcodeBtn.addEventListener("click", () => {
    // ✅ 버튼 클릭할 때만 실행
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

        el.postcode.value = data.zonecode;
        el.addr1.value = addr;
        el.addrExtra.value = extraAddr;
        el.addr2.focus();
      },
    }).open();
  });
}

async function postOrder(payload) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("order post failed");
  return res.json();
}

async function clearCart(items) {
  // items에 id가 있으면 그 id만 삭제, 없으면 cart 전체 삭제는 안 함(안전)
  const ids = items
    .map((it) => it.id)
    .filter((v) => v !== undefined && v !== null);

  if (ids.length === 0) return;

  await Promise.all(
    ids.map((id) =>
      fetch(`${BASE_URL}/cart/${id}`, { method: "DELETE" }).catch(() => null)
    )
  );
}

function getPayMethod() {
  const picked = document.querySelector('input[name="pay"]:checked');
  return picked?.value ?? "card";
}

function buildShippingInfo() {
  return {
    buyer: {
      name: el.buyerName.value.trim(),
      phone: `${el.buyerPhone1.value.trim()}-${el.buyerPhone2.value.trim()}-${el.buyerPhone3.value.trim()}`,
      email: el.buyerEmail.value.trim(),
    },
    receiver: {
      name: el.recvName.value.trim(),
      phone: `${el.recvPhone1.value.trim()}-${el.recvPhone2.value.trim()}-${el.recvPhone3.value.trim()}`,
    },
    address: {
      postcode: el.postcode.value.trim(),
      addr1: el.addr1.value.trim(),
      addr2: el.addr2.value.trim(),
      extra: el.addrExtra.value.trim(),
    },
    message: el.shipMsg.value.trim(),
  };
}

async function init() {
  // modal close
  el.modalClose.addEventListener("click", closeModal);
  el.modalDim.addEventListener("click", closeModal);

  bindPostcode();

  const items = await getOrderItems();

  if (!items || items.length === 0) {
    renderEmptyRow();
    renderTotals([]);
    // ✅ 결제하기는 항상 활성화지만, 눌렀을 때 모달 뜨게 하면 됨
  } else {
    renderRows(items);
    renderTotals(items);
  }

  el.payBtn.addEventListener("click", async () => {
    // ✅ 클릭했을 때만 모달
    const v = validateRequired();
    if (!v.ok) {
      openModal(v.msg);
      return;
    }

    // 주문 데이터가 없으면 결제 진행 X
    if (!items || items.length === 0) {
      openModal("주문 상품이 없습니다. 다시 주문해주세요.");
      return;
    }

    const totals = renderTotals(items);
    const orderPayload = {
      createdAt: new Date().toISOString(),
      payMethod: getPayMethod(),
      items,
      totals,
      shipping: buildShippingInfo(),
      status: "PAID",
    };

    try {
      await postOrder(orderPayload);
      await clearCart(items);

      // localStorage 정리(키 이름이 달라도 안전하게 몇 개 같이 제거)
      localStorage.removeItem("orderData");
      localStorage.removeItem("selectedCart");
      localStorage.removeItem("selectedCartIds");

      // 결제 완료 → 메인으로 이동
      window.location.href = "../../index.html";
    } catch (e) {
      openModal("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.error(e);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
