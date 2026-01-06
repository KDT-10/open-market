const detailContainer = document.getElementById('detail-container');
const productId = getProductIdFromURL();
import { createModal } from "/js/common/modal.js";
import { checkLogin } from "/js/common/auth.js";

// 상품 ID가 유효한지 확인
if (productId) {
    fetchProductDetail(productId);
} else {
    detailContainer.innerHTML = '<p>유효하지 않은 상품 ID입니다.</p>';
}

// URL에서 상품 ID 추출
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// 상품 상세 정보 가져오기
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

window.controlQuantity = function(type) {
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
  totalPriceEl.textContent = `총 가격: ${(price * quantity + delivery)}원`;
}


// 각 요소에 직접 값 할당
function setProductDetailElements(product) {
  if (!product) return;
  document.getElementById('product-image').src = product.image;
  document.getElementById('product-image').alt = product.name;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('seller-name').textContent = `${product.seller?.store_name || product.seller?.name || ''}`;
  document.getElementById('price').textContent = `가격: ${product.price}원`;
  document.getElementById('delivery-charge').textContent = `배송비: ${product.shipping_fee}원`;
  document.getElementById('stock').textContent = `재고: ${product.stock}개`;
  document.getElementById('quantity').value = 1;
  document.getElementById('total-price').textContent = `총 가격: ${product.price + product.shipping_fee}원`;
  let infoEl = document.querySelector('.product-info p');
  if (infoEl) infoEl.textContent = product.info;
}

function setQuantityHandlers(product) {
  const quantityInput = document.getElementById('quantity');
  const decreaseBtn = document.getElementById('decrease-qty');
  const increaseBtn = document.getElementById('increase-qty');
  const totalPriceEl = document.getElementById('total-price');
  let quantity = 1;
  const decreaseHandler = () => {
    if (quantity > 1) {
      quantity--;
      quantityInput.value = quantity;
      totalPriceEl.textContent = `총 가격: ${(product.price + product.shipping_fee) * quantity}원`;
    }
  };
  const increaseHandler = () => {
    if (quantity < product.stock) {
      quantity++;
      quantityInput.value = quantity;
      totalPriceEl.textContent = `총 가격: ${(product.price + product.shipping_fee) * quantity}원`;
    }
  };
  if (decreaseBtn._handler) decreaseBtn.removeEventListener('click', decreaseBtn._handler);
  if (increaseBtn._handler) increaseBtn.removeEventListener('click', increaseBtn._handler);
  decreaseBtn.addEventListener('click', decreaseHandler);
  increaseBtn.addEventListener('click', increaseHandler);
  decreaseBtn._handler = decreaseHandler;
  increaseBtn._handler = increaseHandler;
  return { quantityInput, totalPriceEl, getQuantity: () => quantity };
}

function setBuyNowHandler(product, getQuantity) {
  const buyNowBtn = document.getElementById('buy-now');
  if (buyNowBtn._handler) buyNowBtn.removeEventListener('click', buyNowBtn._handler);
  const handler = () => {
    const quantity = getQuantity();
    createModal({
      parent: document.body,
      content: document.createTextNode(`${product.name} ${quantity}개를 바로 구매하시겠습니까?`),
      cancelBtnTxt: '취소',
      confirmBtnTxt: '구매'
    }).then(modal => {
      if (!modal) return;
      modal.open(() => {
        fetch('http://127.0.0.1:3000/api/order/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('access') ? `Bearer ${localStorage.getItem('access')}` : undefined
          },
          body: JSON.stringify({
            order_type: 'direct_order',
            product_id: product.id,
            quantity
          })
        })
        .then(res => {
          if (!res.ok) throw new Error('주문 저장 실패');
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
        })
        .catch(err => {
          createModal({
            parent: document.body,
            content: document.createTextNode('주문 저장 중 오류 발생: ' + err.message),
            cancelBtnTxt: null,
            confirmBtnTxt: '확인'
          }).then(errModal => {
            if (errModal) errModal.open();
          });
        });
      });
    });
  };
  buyNowBtn.addEventListener('click', handler);
  buyNowBtn._handler = handler;
}

function setAddToCartHandler(product, getQuantity) {
  const addToCartBtn = document.getElementById('add-to-cart');
  if (addToCartBtn._handler) addToCartBtn.removeEventListener('click', addToCartBtn._handler);
  const handler = () => {
    const quantity = getQuantity();
    if (checkLogin()) {
      const token = localStorage.getItem('access');
      fetch('http://127.0.0.1:3000/api/cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id, quantity })
      })
      .then(async res => {
        if (res.status === 409) {
          await createModal({
            parent: document.body,
            content: document.createTextNode('장바구니에 이미 물품이 있습니다. 장바구니로 넘어가시겠습니까?'),
            cancelBtnTxt: '아니오',
            confirmBtnTxt: '예'
          }).then(goCartModal => {
            if (goCartModal) goCartModal.open(() => {
              window.location.href = '/cart.html';
            });
          });
          return;
        }
        if (!res.ok) {
          throw new Error('장바구니 저장 실패');
        }
        await createModal({
          parent: document.body,
          content: document.createTextNode('장바구니에 추가됐습니다. 장바구니로 가시겠습니까?'),
          cancelBtnTxt: '아니오',
          confirmBtnTxt: '예'
        }).then(goCartModal => {
          if (goCartModal) goCartModal.open(() => {
            window.location.href = '/cart.html';
          });
        });
      })
      .catch(err => {
        createModal({
          parent: document.body,
          content: document.createTextNode('장바구니 저장 중 오류 발생: ' + err.message),
          cancelBtnTxt: null,
          confirmBtnTxt: '확인'
        }).then(errModal => {
          if (errModal) errModal.open();
        });
      });
    } else {
      let cart = [];
      try {
        cart = JSON.parse(sessionStorage.getItem('cart')) || [];
      } catch (e) {
        cart = [];
      }
      const existing = cart.find(item => item.product_id === product.id);
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
      cart.push({
        product_id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        shipping_fee: product.shipping_fee,
        quantity: quantity
      });
      sessionStorage.setItem('cart', JSON.stringify(cart));
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
  };
  addToCartBtn.addEventListener('click', handler);
  addToCartBtn._handler = handler;
}

window.addToCart = function() {
  const productId = getProductIdFromURL();
  const quantity = parseInt(document.getElementById('quantity').value, 10);

  let cart = [];
  try {
    cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  } catch (e) {
    cart = [];
  }
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
  cart.push({
    product_id: productId,
    quantity
  });
  sessionStorage.setItem('cartdata', JSON.stringify(cart));
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

window.buyNow = function() {
  const productId = getProductIdFromURL();
  const quantity = parseInt(document.getElementById('quantity').value, 10);

  // 주문 정보 세션스토리지에 저장
  const order = {
    product_id: productId,
    quantity
  };
  sessionStorage.setItem('orderdata', JSON.stringify(order));

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

function renderProductDetail(product) {
  setProductDetailElements(product);
  document.getElementById('decrease-qty').setAttribute('onclick', "controlQuantity('decrease')");
  document.getElementById('increase-qty').setAttribute('onclick', "controlQuantity('increase')");
  document.getElementById('add-to-cart').setAttribute('onclick', "addToCart()")
  document.getElementById('buy-now').setAttribute('onclick', "buyNow()");
}

// 하단 탭 버튼 클릭 시 active 유지
const tabBtns = document.querySelectorAll(
  '.button-container, .review-container, .qna-container, .Return-Exchange-container'
);
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/*
이벤트 수정.
*/