// 환경 감지
const isGitHubPages = window.location.hostname.includes("github.io");

// 데이터 경로 - 상대 경로로 통일
function getDataPath() {
  return "../../db.json";
}

// URL에서 상품 id 가져오기 (?id=1,2,3,4,5)
const params = new URLSearchParams(window.location.search);

const productId = parseInt(params.get('id'), 10);

if (!productId) {
  alert('잘못된 상품 접근입니다.');
  throw new Error('productId가 없습니다.');
}

// 가격, 수량
let quantity = 1;
let price = 0;

// DOM
const minusBtn = document.querySelector('.quantify button:first-child');
const plusBtn = document.querySelector('.quantify button:last-child');
const quantityInput = document.querySelector('.quantify input');
const totalQuantityText = document.querySelector('.total-quantify');
const totalPriceText = document.querySelector('.total-price');

const tabbtn = document.getElementById('tab-btn');
const tabReview = document.getElementById('tab-review');
const tabQna = document.getElementById('tab-qna');
const tabReturn = document.getElementById('tab-return');

const buyBtn = document.querySelector('.buy');
const cartBtn = document.querySelector('.cart');

const modal = document.getElementById('Cart-Modal');
const modalNo = document.getElementById('modalNo');
const modalYes = document.getElementById('modalYes');
const overlay = document.querySelector('.modal-overlay');
const closeBtn = document.querySelector('.modal-close');

// 수량/가격 계산
function updateTotal() {
  if (!quantityInput || !totalQuantityText || !totalPriceText) return;

  quantityInput.value = quantity;
  totalQuantityText.textContent = `총 수량 ${quantity}개`;
  totalPriceText.textContent = (price * quantity).toLocaleString() + '원';
}

// 상품 렌더링 함수
function renderProductDetails(product) {
  if (!product) return;

  price = product.price;

  const imgEl = document.querySelector('.product-image img');
  if (imgEl) imgEl.src = `/assets/images/product${product.id}.png`;

  const nameEl = document.getElementById('productName');
  if (nameEl) nameEl.textContent = product.name;

  const brandEl = document.getElementById('productBrand');
  if (brandEl) brandEl.textContent = product.info;

  const priceEl = document.querySelector('.price');
  if (priceEl) priceEl.textContent = product.price.toLocaleString() + '원';

  updateTotal();
}

// 상품 불러오기 (db.json에서)
async function fetchProduct(productId) {
  try {
    const response = await fetch(getDataPath());
    console.log('응답 status:', response.status);
    if (!response.ok) throw new Error('상품 조회 실패');

    const data = await response.json();
    const product = data.products.find(p => p.id === productId);

    if (!product) throw new Error('상품을 찾을 수 없습니다.');

    console.log('상품 데이터:', product);
    renderProductDetails(product);
  } catch (err) {
    console.error(err);
    alert('상품 데이터를 불러오는 중 오류가 발생했습니다.');
  }
}

// 모달
function openModal() {
  modal.classList.remove('hidden');
}
function closeModal() {
  modal.classList.add('hidden');
}
function openCartConfirmModal() {
  modal.classList.remove('hidden');
}

// 장바구니 추가 - 정적 페이지에서는 localStorage에만 저장
async function addToCart(productId, quantity) {
  try {
    // 로컬스토리지에 장바구니 저장
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    // 기존 상품이 있는지 확인
    const existingIndex = cartItems.findIndex(item => item.product_id === productId);

    if (existingIndex > -1) {
      // 이미 있으면 수량만 증가
      cartItems[existingIndex].quantity += quantity;
    } else {
      // 없으면 새로 추가
      cartItems.push({
        id: Date.now(), // 임시 ID
        product_id: productId,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    console.log("장바구니에 추가됨:", cartItems);

    return { success: true };
  } catch (err) {
    console.error("addToCart 에러:", err);
    throw err;
  }
}

// 로그인 체크 - 정적 사이트에서는 제한적으로만 사용
function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

// 로그인 체크 공통
function requireLogin(callback) {
  return function (e) {
    e.preventDefault();
    // 정적 사이트에서는 로그인 기능 비활성화
    alert('이 기능은 로컬 서버에서만 사용 가능합니다.');
    // callback(); // 로컬 서버에서만 활성화
  };
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {

  // 상품 불러오기
  fetchProduct(productId);

  // 수량 버튼
  if (plusBtn && minusBtn && quantityInput) {
    plusBtn.addEventListener('click', () => {
      if (quantity < 99) quantity++;
      updateTotal();
    });
    minusBtn.addEventListener('click', () => {
      if (quantity > 1) quantity--;
      updateTotal();
    });
    quantityInput.addEventListener('input', () => {
      let value = parseInt(quantityInput.value, 10);
      if (isNaN(value) || value < 1) value = 1;
      if (value > 99) value = 99;
      quantity = value;
      updateTotal();
    });
  }

  // 탭 버튼
  const tabs = [tabbtn, tabReview, tabQna, tabReturn].filter(Boolean);
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // 바로 구매 버튼
  if (buyBtn) {
    buyBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      // 상품 정보 가져오기
      const response = await fetch(getDataPath());
      const data = await response.json();
      const product = data.products.find(p => p.id === productId);

      if (!product) {
        alert('상품 정보를 찾을 수 없습니다.');
        return;
      }

      // 주문 데이터 생성
      const orderData = [{
        id: Date.now(),
        name: product.name,
        category: product.seller?.store_name || "일반상품",
        price: product.price,
        image: product.image,
        quantity: quantity,
        order_type: 'direct_order',
        productId: product.id
      }];

      // sessionStorage에 저장
      sessionStorage.setItem('orderData', JSON.stringify(orderData));

      // 주문 페이지로 이동
      window.location.href = '../order/order.html';
    });
  }

  // 장바구니 버튼
  if (cartBtn) {
    cartBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await addToCart(productId, quantity);
        console.log("장바구니 추가 성공");
        openCartConfirmModal();
      } catch (e) {
        alert('장바구니 추가 실패');
      }
    });
  }

  // 모달 버튼
  if (modalNo) modalNo.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modalYes) {
    modalYes.addEventListener('click', () => {
      window.location.href = '../cart/cart.html';
    });
  }
});
