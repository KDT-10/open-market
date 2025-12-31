const items = [
  { name: "딥러닝 개발자 무릎 담요", price: 17500 },
  { name: "Hack Your Life 개발자 노트북 파우치", price: 29000 },
];

const list = document.getElementById("orderList");

function won(n) {
  return n.toLocaleString() + "원";
}

function render() {
  let sum = 0;
  items.forEach((it) => {
    sum += it.price;
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="prod">
        <div class="thumb"></div>
        <div>${it.name}</div>
      </div>
      <div>-</div>
      <div>무료배송</div>
      <div class="right">${won(it.price)}</div>
    `;
    list.appendChild(el);
  });

  document.getElementById("totalTop").textContent = won(sum);
  document.getElementById("sumGoods").textContent = won(sum);
  document.getElementById("sumPay").textContent = won(sum);
}

const agree = document.getElementById("agreeChk");
const btn = document.getElementById("payBtn");

agree.addEventListener("change", () => {
  btn.disabled = !agree.checked;
  btn.classList.toggle("enabled", agree.checked);
});

render();
