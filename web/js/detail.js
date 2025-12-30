// URL에서 product_id 추출
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// GET /api/products/:product_id 호출하여 상세 정보 표시
const response = await fetch(`http://localhost:3000/api/products/${productId}`);
const product = await response.json();

// "바로 구매" 클릭 시
const orderData = [
  {
    order_type: "direct_order",
    product_id: product.id,
    quantity: quantity,
    // ... 기타 정보
  },
];
sessionStorage.setItem("orderData", JSON.stringify(orderData));
window.location.href = "order.html";

// "장바구니" 클릭 시
// 1. POST /api/cart/ 호출
// 2. 성공 시 sessionStorage에도 저장
// 3. 모달 표시 ("장바구니에 담았습니다")
