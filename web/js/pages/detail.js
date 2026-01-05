const detailContainer = document.getElementById('detail-container');
const productId = getProductIdFromURL();

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

// 각 요소에 직접 값 할당
function renderProductDetail(product) {
    document.getElementById('product-image').src = product.image;
    document.getElementById('product-image').alt = product.name;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('seller-name').textContent = `판매자: ${product.seller?.store_name || product.seller?.name || ''}`;
    document.getElementById('price').textContent = `가격: ${product.price}원`;
    document.getElementById('delivery-charge').textContent = `배송비: ${product.shipping_fee}원`;
    document.getElementById('stock').textContent = `재고: ${product.stock}개`;
    document.getElementById('quantity').value = 1;
    document.getElementById('total-price').textContent = `총 가격: ${product.price + product.shipping_fee}원`;
    let infoEl = document.querySelector('.product-info p');
    if (infoEl) infoEl.textContent = product.info;

    // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const totalPriceEl = document.getElementById('total-price');
    const buyNowBtn = document.getElementById('buy-now');
    const addToCartBtn = document.getElementById('add-to-cart');

    // removeEventListener를 위해 기존 핸들러를 변수로 선언
    if (decreaseBtn._handler) decreaseBtn.removeEventListener('click', decreaseBtn._handler);
    if (increaseBtn._handler) increaseBtn.removeEventListener('click', increaseBtn._handler);
    if (buyNowBtn._handler) buyNowBtn.removeEventListener('click', buyNowBtn._handler);
    if (addToCartBtn._handler) addToCartBtn.removeEventListener('click', addToCartBtn._handler);

    // 갯수 이벤트
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

    // 구매 및 장바구니 이벤트
    const buyNowHandler = async () => {
        const confirmBuy = confirm(`${product.name} ${quantity}개를 바로 구매하시겠습니까?`);
        if (!confirmBuy) return;
        const token = localStorage.getItem('access');
        try {
            const res = await fetch('http://127.0.0.1:3000/api/order/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : undefined
                },
                body: JSON.stringify({
                    order_type: 'direct_order',
                    product_id: product.id,
                    quantity
                })
            });
            if (!res.ok) throw new Error('주문 저장 실패');
        } catch (err) {
            alert('주문 저장 중 오류 발생: ' + err.message);
            return;
        }
        window.location.href = '/order.html';
    };
    const addToCartHandler = async () => {
        const token = localStorage.getItem('access');
        try {
            const res = await fetch('http://127.0.0.1:3000/api/cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : undefined
                },
                body: JSON.stringify({ product_id: product.id, quantity })
            });
            if (!res.ok) throw new Error('장바구니 저장 실패');
        } catch (err) {
            alert('장바구니 저장 중 오류 발생: ' + err.message);
            return;
        }
        const confirmGoCart = confirm(`${product.name} ${quantity}개를 장바구니에 추가합니다.\n장바구니로 바로 가시겠습니까?`);
        if (confirmGoCart) {
            window.location.href = '/cart.html';
        }
    };
    decreaseBtn.addEventListener('click', decreaseHandler);
    increaseBtn.addEventListener('click', increaseHandler);
    buyNowBtn.addEventListener('click', buyNowHandler);
    addToCartBtn.addEventListener('click', addToCartHandler);

    // 핸들러 참조 저장 (중복 방지)
    decreaseBtn._handler = decreaseHandler;
    increaseBtn._handler = increaseHandler;
    buyNowBtn._handler = buyNowHandler;
    addToCartBtn._handler = addToCartHandler;
}