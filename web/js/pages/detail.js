const detailContainer = document.getElementById('detail-container');
const productId = getProductIdFromURL();

if (productId) {
    fetchProductDetail(productId);
} else {
    detailContainer.innerHTML = '<p>유효하지 않은 상품 ID입니다.</p>';
}
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
async function fetchProductDetail(id) {
    try {
        const response = await fetch(`https://localhost:3000/products/${id}`);
        if (!response.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
        const product = await response.json();
        renderProductDetail(product);
    } catch (error) {
        console.error(error);
        detailContainer.innerHTML = `<p>${error.message}</p>`;
    }
}
function renderProductDetail(product) {
    detailContainer.innerHTML = `
        <h1>${product.name}</h1>
        <img src="${product.imageUrl}" alt="${product.name}">
        <p>가격: ${product.price}원</p>
        <p>${product.description}</p>
        <button id="add-to-cart-btn">장바구니에 추가</button>
    `;
    const addToCartBtn = document.getElementById('add-to-cart-btn');    
    addToCartBtn.addEventListener('click', () => {
        alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
    });
}