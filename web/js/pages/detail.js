// 상품 상세 컨테이너 DOM
const detailContainer = document.getElementById('detail-container');
// URL에서 상품 id 추출
const productId = getProductIdFromURL();
// 인증 유틸 import
import { isLoggedIn, checkLogin } from "/js/common/auth.js";
// 모달 함수 import
import { createModal } from "/js/common/modal.js";

// 상품 ID가 유효하면 상세 정보 요청, 아니면 에러 메시지
if (productId) {
  fetchProductDetail(productId);
} else {
  detailContainer.innerHTML = '<p>유효하지 않은 상품 ID입니다.</p>';
}
// URL에서 상품 ID 추출 함수
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}
// 상품 상세 정보 fetch 및 렌더링
async function fetchProductDetail(id) {
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/products/${id}`);
    if (!response.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
    const product = await response.json();
    renderProductDetail(product);
  } catch (error) {
    console.error(error);
    detailContainer.innerHTML = `<p>${error.message}</p>`;
  }
}
// 수량 증감 및 총 가격 갱신 함수 (배송비는 한 번만 더함)
window.controlQuantity = function (type) {
  const quantityInput = document.getElementById('quantity');
  const totalPriceEl = document.getElementById('total-price');
  const price = parseInt(document.getElementById('price').textContent.replace(/[^0-9]/g, ''), 10);
  const delivery = parseInt(document.getElementById('delivery-charge').textContent.replace(/[^0-9]/g, ''), 10);
  const stock = parseInt(document.getElementById('stock').textContent.replace(/[^0-9]/g, ''), 10);
  let quantity = parseInt(quantityInput.value, 10);
  if (type === 'decrease' && quantity > 1) {
    quantity--;
  } else if (type === 'increase' && quantity < stock) {
    quantity++;
  }
  quantityInput.value = quantity;
  totalPriceEl.textContent = `총 가격: ${(price * quantity + delivery).toLocaleString()}원`;
}
// 상품 정보 각 요소에 할당
function setProductDetailElements(product) {
  if (!product) return;
  document.getElementById('product-image').src = product.image;
  document.getElementById('product-image').alt = product.name;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('seller-name').textContent = `${product.seller?.store_name || product.seller?.name || ''}`;
  document.getElementById('price').textContent = `가격: ${product.price.toLocaleString()}원`;
  document.getElementById('delivery-charge').textContent = `배송비: ${product.shipping_fee.toLocaleString()}원`;
  document.getElementById('stock').textContent = `재고: ${product.stock.toLocaleString()}개`;
  document.getElementById('quantity').value = 1;
  document.getElementById('total-price').textContent = `총 가격: ${(product.price + product.shipping_fee).toLocaleString()}원`;
  let infoEl = document.querySelector('.product-info p');
  if (infoEl) infoEl.textContent = product.info;
}
// 장바구니 추가 - 세션스토리지 cartdata에 id, 수량 저장
window.addToCart = function () {
  const productId = getProductIdFromURL();
  const quantity = parseInt(document.getElementById('quantity').value, 10);
  // 장바구니 데이터 세션스토리지에서 불러오기
  let cart = [];
  try {
    cart = JSON.parse(sessionStorage.getItem('cartData')) || [];
  } catch (e) {
    cart = [];
  }
  // 이미 장바구니에 있는지 확인
  const existing = cart.find(item => item.product_id == productId);
  if (existing) {
    createModal({
      parent: document.body,
      content: document.createTextNode('이미 장바구니에 있습니다. 장바구니로 가시겠습니까?'),
      cancelBtnTxt: '아니오',
      confirmBtnTxt: '예'
    }).then(goCartModal => {
      if (goCartModal) goCartModal.open(() => {
        window.location.href = '/cart.html';
      });
    });
    return;
  }
  // 새로운 상품 장바구니에 추가
  const cartItem = {
    product_id: productId,
    quantity
  };
  cart.push(cartItem);
  sessionStorage.setItem('cartData', JSON.stringify(cart));
  // 장바구니 이동 확인 모달
  createModal({
    parent: document.body,
    content: document.createTextNode('장바구니에 추가되었습니다. 장바구니로 가시겠습니까?'),
    cancelBtnTxt: '아니오',
    confirmBtnTxt: '예'
  }).then(goCartModal => {
    if (goCartModal) goCartModal.open(() => {
      window.location.href = '/cart.html';
    });
  });
}
// 바로구매(주문) - 세션스토리지 orderdata에 id, 수량만 저장
window.buyNow = function () {
  if (!isLoggedIn()) {
    checkLogin(document.body);
    return;
  }

  const productId = getProductIdFromURL();
  const quantity = parseInt(document.getElementById('quantity').value, 10);
  // 주문 데이터 세션스토리지에 저장
  const order = {
    product_id: productId,
    quantity
  };
  sessionStorage.setItem('orderData', JSON.stringify([order]));
  // 구매 확인 모달
  createModal({
    parent: document.body,
    content: document.createTextNode(`${quantity}개를 바로 구매하시겠습니까?`),
    cancelBtnTxt: '취소',
    confirmBtnTxt: '구매'
  }).then(modal => {
    if (!modal) return;
    modal.open(() => {
      createModal({
        parent: document.body,
        content: document.createTextNode('주문이 완료되었습니다. 주문/결제 페이지로 이동합니다.'),
        cancelBtnTxt: null,
        confirmBtnTxt: '확인'
      }).then(successModal => {
        if (successModal) successModal.open(() => {
          window.location.href = '/order.html';
        });
      });
    });
  });
}
// 상품 상세 렌더링 및 버튼 이벤트 연결
function renderProductDetail(product) {
  setProductDetailElements(product);
  document.getElementById('decrease-qty').setAttribute('onclick', "controlQuantity('decrease')");
  document.getElementById('increase-qty').setAttribute('onclick', "controlQuantity('increase')");
  document.getElementById('add-to-cart').setAttribute('onclick', "addToCart()")
  document.getElementById('buy-now').setAttribute('onclick', "buyNow()");
}
// 하단 탭 버튼 토글화
const tabBtns = document.querySelectorAll(
  '.button-container, .review-container, .qna-container, .Return-Exchange-container'
);
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});