// URL에서 상품 id 가져오기
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

// 가격, 수량
let quantity = 1;
let price = 0;

// DOM
const minusBtn = document.querySelector('.quantify button:first-child');
const plusBtn = document.querySelector('.quantify button:last-child');
const quantityInput = document.querySelector('.quantify input');
const modalText = document.querySelector('modal-text');
const totalQuantityText = document.querySelector('.total-quantify');
const totalPriceText = document.querySelector('.total-price');

// 총 수량, 총 가격
function updateTotal() {
  quantityInput.value = quantity;
  totalQuantityText.textContent = `총 수량 ${quantity}개`;
  totalPriceText.textContent =
  (price * quantity).toLocaleString() + '원';
}

// 상품 불러오기 (파라미터?)
fetch(`http://localhost:3000/products/${productId}`)
  .then(res => {
    console.log('응답 status:', res.status);
    return res.json();
  })
  .then(product => {
    console.log('상품 데이터:', product);

    // 가격
    price = product.price;

    // 이미지 (강사님께 물어보기)
    document.querySelector('.product-image img').src = 
    `/assets/images/product${product.id}.png`;

    // 상품 정보
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productBrand').textContent = product.info;
    document.querySelector('.price').textContent =
    product.price.toLocaleString() + '원';

    // 총액 계산
    updateTotal();
  })
  //에러
  .catch(err => {
    console.error(err);
    alert('상품 정보를 불러오지 못했습니다.');
});

// +/- 버튼
plusBtn.addEventListener('click', () => {
  if (quantity >= 99) return;
  quantity++;
  updateTotal();
});

minusBtn.addEventListener('click', () => {
  if (quantity <= 1) return;
  quantity--;
  updateTotal();
});

// input 직접 입력 (테스트 필요)
quantityInput.addEventListener('input', () => {
  let value = parseInt(quantityInput.value, 10);

  if (isNaN(value) || value < 1) value = 1;
  if (value > 99) value = 99;

  quantity = value;
  updateTotal();
});

// tab 버튼
const tabbtn = document.getElementById('tab-btn');
const tabReview = document.getElementById('tab-review');
const tabQna = document.getElementById('tab-qna');
const tabReturn = document.getElementById('tab-return');

const tabs = [tabbtn, tabReview, tabQna, tabReturn];

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});


// 장바구니 모달
const buyBtn = document.querySelector('.buy');
const cartBtn = document.querySelector('.cart');

const modal = document.getElementById('Cart-Modal');
const modalNo = document.getElementById('modalNo');
const modalYes = document.getElementById('modalYes');
const overlay = document.querySelector('.modal-overlay');
const closeBtn = document.querySelector('.modal-close');

// 연습용 로그인 체크 (로그인 상태)
const isLogin = !!localStorage.getItem('accessToken');

// 모달 스위치
function openModal() {
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function openCartConfirmModal() {
  modal.classList.remove('hidden');
}

// 로그인 체크 공통 함수
function requireLogin(callback) {
  return function (e) {
    e.preventDefault();

    if (!isLogin) {
      openModal();
      return;
    }

    callback();
  };
}

// 바로 구매 버튼
buyBtn.addEventListener(
  'click',
  requireLogin(() => {
    openCartConfirmModal();
  })
);

// 장바구니 버튼
cartBtn.addEventListener(
  'click',
  requireLogin(() => {
    openCartConfirmModal();
  })
);


// 모달 버튼
modalNo.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);

modalYes.addEventListener('click', () => {
  window.location.href = '/pages/cart-page-none.html';
});