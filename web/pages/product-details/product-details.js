import { fetchAPI, isLoggedIn as checkLogin } from '../../scripts/api.js';

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

  if (imgEl && product.image) {
    
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
      imgEl.src = `/team1-JADUPAGE/web/${product.image.slice(2)}`;
    } else {
      imgEl.src = product.image.replace('./', '../../');
    }
    console.log('이미지 경로:', imgEl.src);

    imgEl.onerror = () => {
      console.error('이미지 로드 실패:', imgEl.src);
    };
  }

  const nameEl = document.getElementById('productName');
  if (nameEl) nameEl.textContent = product.name;

  const brandEl = document.getElementById('productBrand');
  if (brandEl) brandEl.textContent = product.info;

  const priceEl = document.querySelector('.price');
  if (priceEl) priceEl.textContent = product.price.toLocaleString() + '원';

  updateTotal();
}

// 상품 불러오기 (API에서)
async function fetchProduct(productId) {
  try {
    const response = await fetchAPI(`/products/${productId}`);
    console.log('응답 status:', response.status);
    if (!response.ok) throw new Error('상품 조회 실패');

    const product = await response.json();

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

// 장바구니 추가 - API 사용
async function addToCart(productId, quantity) {
  try {
    // 로그인 확인
    if (!checkLogin()) {
      if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        window.location.href = '../login/login.html';
      }
      throw new Error('로그인 필요');
    }

    // API로 장바구니 추가
    const response = await fetchAPI('/cart/', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    if (!response.ok) throw new Error('장바구니 추가 실패');

    const result = await response.json();
    console.log("장바구니에 추가됨:", result);

    return { success: true };
  } catch (err) {
    console.error("addToCart 에러:", err);
    throw err;
  }
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
    buyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!checkLogin()) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          window.location.href = '../login/login.html';
        }
        return;
      }
      alert('바로 구매 기능은 준비 중입니다.');
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
