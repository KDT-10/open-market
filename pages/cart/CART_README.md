# 장바구니 페이지 (Cart Page)

## 📋 목차

1. [개요](#개요)
2. [파일 구조](#파일-구조)
3. [주요 기능](#주요-기능)
4. [코드 설명](#코드-설명)
5. [API 연동](#api-연동)
6. [상태 관리](#상태-관리)
7. [UI/UX 특징](#uiux-특징)

---

## 개요

장바구니 페이지는 사용자가 선택한 상품들을 확인하고 수량을 조절하며, 주문을 진행할 수 있는 페이지입니다. REST API와 연동하여 실시간으로 데이터를 관리하며, 로그인 여부에 따라 다른 동작을 수행합니다.

### 주요 특징

- **실시간 데이터 동기화**: JSON Server API와 연동하여 장바구니 데이터를 실시간으로 관리
- **인터랙티브 UI**: 수량 변경, 삭제 등 사용자 인터랙션에 즉각 반응
- **모달 기반 UX**: 모든 중요한 액션은 모달을 통해 확인
- **자동 금액 계산**: 선택된 상품들의 총액을 실시간으로 계산
- **인증 처리**: JWT 토큰 기반 인증을 통한 보안 강화

---

## 파일 구조

```
web/pages/cart/
├── cart.html          # 장바구니 페이지 HTML
├── cart.js            # 장바구니 비즈니스 로직
├── cart.md            # 기획 문서 (기존)
└── CART_README.md     # 코드 설명 문서 (본 문서)
```

---

## 주요 기능

### 1. 장바구니 조회
- API를 통해 사용자의 장바구니 데이터를 불러옴
- 각 상품의 상세 정보를 추가로 조회하여 표시
- 로딩 상태와 에러 상태를 시각적으로 표시

### 2. 수량 관리
- 수량 증가/감소 버튼을 통한 조절
- 모달을 통한 직접 입력 가능
- API를 통해 서버에 실시간 업데이트
- 수량 변경 시 자동으로 금액 재계산

### 3. 상품 삭제
- 개별 상품 삭제 기능
- 삭제 확인 모달을 통한 안전장치
- API를 통해 서버에서 삭제

### 4. 주문하기
- 개별 상품 주문 (상품 카드의 "주문하기" 버튼)
- 선택된 상품들 일괄 주문 (하단의 "주문하기" 버튼)
- 주문 데이터를 localStorage에 저장 후 주문 페이지로 이동

### 5. 금액 계산
- 선택된 상품들의 총 금액 계산
- 할인 금액 표시 (현재 0원)
- 배송비 계산 (현재 0원)
- 최종 결제 예정 금액 표시

---

## 코드 설명

### 전역 변수

```javascript
let cartItems = [];           // 장바구니 상품 배열
const API_BASE_URL = "http://localhost:3000";  // API 기본 URL
let isLoading = false;        // 로딩 상태
let currentModalItem = null;  // 현재 모달에서 다루는 상품
```

### 핵심 함수 설명

#### 1. `fetchCartItems()` - 장바구니 데이터 로드

장바구니의 모든 데이터를 API에서 가져오는 핵심 함수입니다.

```javascript
async function fetchCartItems() {
  try {
    // 1. 로딩 상태 표시
    isLoading = true;
    showLoadingState();

    // 2. 인증 토큰 가져오기
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 3. 장바구니 목록 API 호출
    const response = await fetch(`${API_BASE_URL}/cart/`, { headers });

    // 4. 에러 처리
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 5. 데이터 파싱
    const data = await response.json();

    // 6. 각 장바구니 아이템의 상품 정보 가져오기
    const cartItemsWithProducts = await Promise.all(
      data.map(async (item) => {
        const productResponse = await fetch(
          `${API_BASE_URL}/products/${item.product_id}`
        );
        const product = await productResponse.json();

        // 장바구니 정보 + 상품 정보 병합
        return {
          id: item.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: item.quantity,
          checked: true,
          // ...
        };
      })
    );

    // 7. 전역 변수에 저장 및 렌더링
    cartItems = cartItemsWithProducts.filter(item => item !== null);
    renderCart();
  } catch (error) {
    console.error("장바구니 데이터 로드 실패:", error);
    showErrorMessage("장바구니를 불러올 수 없습니다.");
  } finally {
    isLoading = false;
    hideLoadingState();
  }
}
```

**주요 포인트:**
- `Promise.all()`을 사용하여 여러 상품 정보를 병렬로 가져옴
- 각 장바구니 아이템에 대해 상품 상세 정보를 추가 조회
- 에러 발생 시 사용자 친화적인 메시지 표시

---

#### 2. `renderCart()` - 화면 렌더링

장바구니 데이터를 받아 화면에 표시하는 함수입니다.

```javascript
function renderCart() {
  const emptyCart = document.getElementById("emptyCart");
  const cartContainer = document.getElementById("cartContainer");
  const cartProducts = document.getElementById("cartProducts");

  // 장바구니가 비어있는 경우
  if (cartItems.length === 0) {
    emptyCart.innerHTML = `
      <p class="empty-title">장바구니에 담긴 상품이 없습니다.</p>
      <p class="empty-subtitle">원하는 상품을 찾아가세요!</p>
    `;
    emptyCart.style.display = "flex";
    cartContainer.style.display = "none";
  } else {
    // 장바구니에 상품이 있는 경우
    emptyCart.style.display = "none";
    cartContainer.style.display = "block";

    // 상품 카드 렌더링
    cartProducts.innerHTML = "";
    cartItems.forEach((item, index) => {
      const productCard = createProductCard(item, index);
      cartProducts.appendChild(productCard);
    });

    // 금액 계산 및 업데이트
    updateOrderSummary();
  }
}
```

**주요 포인트:**
- 빈 장바구니와 상품이 있는 장바구니의 UI를 구분
- `createProductCard()`를 통해 각 상품 카드를 동적으로 생성
- 렌더링 후 자동으로 금액 계산

---

#### 3. `createProductCard()` - 상품 카드 생성

각 장바구니 아이템을 카드 형태로 생성하고 이벤트를 바인딩합니다.

```javascript
function createProductCard(item, index) {
  const card = document.createElement("div");
  card.className = "product-card";

  // HTML 구조 생성
  card.innerHTML = `
    <input type="checkbox" class="product-checkbox"
           id="product${item.id}" ${item.checked ? "checked" : ""} />
    <label for="product${item.id}" class="checkbox-label"></label>

    <div class="product-image">
      <img src="${item.image}" alt="${item.name}" />
    </div>

    <div class="product-info">
      <p class="product-category">${item.category}</p>
      <h3 class="product-name">${item.name}</h3>
      <p class="product-price">${formatPrice(item.price)}원</p>
      <p class="product-option">${item.option}</p>
    </div>

    <div class="product-right">
      <!-- 수량 조절 버튼 -->
      <div class="product-quantity">
        <button class="qty-btn minus" data-index="${index}">-</button>
        <input type="number" class="qty-input" value="${item.quantity}"
               min="1" data-index="${index}" />
        <button class="qty-btn plus" data-index="${index}">+</button>
      </div>

      <!-- 총 가격 -->
      <div class="product-price-total">
        <p class="price-amount">${formatPrice(item.price * item.quantity)}원</p>
      </div>

      <!-- 주문하기 버튼 -->
      <button class="btn-order" data-index="${index}">주문하기</button>
    </div>

    <!-- 삭제 버튼 -->
    <button class="btn-remove" data-index="${index}">
      <svg><!-- X 아이콘 --></svg>
    </button>
  `;

  // 이벤트 리스너 바인딩
  // 1. 체크박스 변경
  card.querySelector(".product-checkbox").addEventListener("change", function() {
    cartItems[index].checked = this.checked;
    updateOrderSummary();
  });

  // 2. 수량 감소 버튼
  card.querySelector(".minus").addEventListener("click", () => {
    openModal("quantityModal", item);
  });

  // 3. 수량 증가 버튼
  card.querySelector(".plus").addEventListener("click", () => {
    openModal("quantityModal", item);
  });

  // 4. 수량 입력 필드 클릭
  card.querySelector(".qty-input").addEventListener("click", () => {
    openModal("quantityModal", item);
  });

  // 5. 개별 주문하기
  card.querySelector(".btn-order").addEventListener("click", () => {
    if (!isUserLoggedIn()) {
      openModal("loginModal");
      return;
    }
    // 선택한 상품만 주문
    cartItems.forEach(cartItem => {
      cartItem.checked = cartItem.id === item.id;
    });
    goToOrderPage([item]);
  });

  // 6. 삭제 버튼
  card.querySelector(".btn-remove").addEventListener("click", () => {
    openModal("deleteModal", item);
  });

  return card;
}
```

**주요 포인트:**
- 모든 버튼과 입력 필드에 이벤트 리스너 바인딩
- 수량 조절은 모달을 통해 처리 (UX 일관성)
- 체크박스 변경 시 즉시 금액 재계산

---

#### 4. `updateOrderSummary()` - 금액 계산

선택된 상품들의 총 금액을 계산하고 UI를 업데이트합니다.

```javascript
function updateOrderSummary() {
  // 1. 체크된 상품만 필터링
  const checkedItems = cartItems.filter(item => item.checked);

  // 2. 총 상품금액 계산
  const totalProductPrice = checkedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  // 3. 할인 및 배송비 (현재는 0원)
  const totalDiscount = 0;
  const shippingFee = 0;

  // 4. 최종 결제 금액
  const finalTotal = totalProductPrice - totalDiscount + shippingFee;

  // 5. UI 업데이트
  document.getElementById("totalProductPrice").textContent =
    formatPrice(totalProductPrice) + "원";
  document.getElementById("totalDiscount").textContent =
    formatPrice(totalDiscount) + "원";
  document.getElementById("shippingFee").textContent =
    formatPrice(shippingFee) + "원";
  document.getElementById("finalTotal").textContent =
    formatPrice(finalTotal) + "원";

  // 6. 전체 주문하기 버튼 이벤트
  const checkoutBtn = document.getElementById("checkoutBtn");
  checkoutBtn.onclick = function() {
    if (checkedItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }
    if (!isUserLoggedIn()) {
      openModal("loginModal");
      return;
    }
    goToOrderPage(checkedItems);
  };
}
```

**주요 포인트:**
- `Array.reduce()`를 사용한 효율적인 금액 계산
- 체크된 상품만 계산에 포함
- 계산 후 즉시 UI 업데이트

---

#### 5. `updateCartItemQuantity()` - 수량 업데이트 API

서버에 수량 변경을 요청하는 함수입니다.

```javascript
async function updateCartItemQuantity(cartItemId, newQuantity) {
  try {
    // 1. 인증 토큰 가져오기
    const token = localStorage.getItem("access_token");

    // 2. PUT 요청으로 수량 업데이트
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });

    // 3. 에러 체크
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 4. 응답 데이터 반환
    const data = await response.json();
    console.log("✓ 수량 업데이트 성공:", data);
    return data;
  } catch (error) {
    console.error("✗ 수량 업데이트 실패:", error);
    alert("수량 업데이트에 실패했습니다.");
    // 실패 시 원래 데이터로 복구
    await fetchCartItems();
    throw error;
  }
}
```

**주요 포인트:**
- PUT 메서드를 사용한 RESTful API 호출
- 실패 시 자동으로 장바구니 데이터 새로고침
- 에러 발생 시 사용자에게 알림

---

#### 6. `deleteCartItem()` - 상품 삭제 API

서버에서 장바구니 아이템을 삭제하는 함수입니다.

```javascript
async function deleteCartItem(cartItemId) {
  try {
    // 1. 인증 토큰 가져오기
    const token = localStorage.getItem("access_token");

    // 2. DELETE 요청
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // 3. 에러 체크
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("✓ 삭제 성공");
    return true;
  } catch (error) {
    console.error("✗ 삭제 실패:", error);
    alert("상품 삭제에 실패했습니다.");
    throw error;
  }
}
```

**주요 포인트:**
- DELETE 메서드를 사용한 RESTful API 호출
- 삭제 성공 후 `renderCart()`로 UI 업데이트
- 에러 발생 시 사용자에게 알림

---

### 모달 시스템

#### 모달 초기화 - `initModalEventListeners()`

페이지 로드 시 모든 모달의 이벤트 리스너를 초기화합니다.

```javascript
function initModalEventListeners() {
  // 1. 수량 선택 모달
  const quantityModal = document.getElementById("quantityModal");
  if (quantityModal) {
    // - (감소) 버튼
    quantityModal.querySelector(".minus").addEventListener("click", () => {
      const qtyInput = quantityModal.querySelector(".qty-modal-input");
      const currentValue = parseInt(qtyInput.value) || 1;
      if (currentValue > 1) {
        qtyInput.value = currentValue - 1;
      }
    });

    // + (증가) 버튼
    quantityModal.querySelector(".plus").addEventListener("click", () => {
      const qtyInput = quantityModal.querySelector(".qty-modal-input");
      const currentValue = parseInt(qtyInput.value) || 1;
      qtyInput.value = currentValue + 1;
    });

    // 수정 버튼
    quantityModal.querySelector(".confirm").addEventListener("click", async () => {
      const newQuantity = parseInt(qtyInput.value);
      if (newQuantity < 1) {
        alert("수량은 1개 이상이어야 합니다.");
        return;
      }

      // API 호출하여 수량 업데이트
      await updateCartItemQuantity(currentModalItem.id, newQuantity);
      currentModalItem.quantity = newQuantity;
      renderCart();
      closeModal(quantityModal);
    });

    // 취소 버튼, X 버튼, 오버레이 클릭
    quantityModal.querySelector(".cancel").addEventListener("click", () =>
      closeModal(quantityModal));
    quantityModal.querySelector(".modal-close").addEventListener("click", () =>
      closeModal(quantityModal));
    quantityModal.querySelector(".modal-overlay").addEventListener("click", () =>
      closeModal(quantityModal));
  }

  // 2. 삭제 확인 모달
  const deleteModal = document.getElementById("deleteModal");
  if (deleteModal) {
    // 예 버튼 - 삭제 실행
    deleteModal.querySelector(".confirm").addEventListener("click", async () => {
      await deleteCartItem(currentModalItem.id);
      const itemIndex = cartItems.findIndex(item => item.id === currentModalItem.id);
      if (itemIndex !== -1) {
        cartItems.splice(itemIndex, 1);
        renderCart();
      }
      closeModal(deleteModal);
    });

    // 아니오 버튼, X 버튼, 오버레이 클릭
    // ... (유사한 패턴)
  }

  // 3. 로그인 요청 모달
  const loginModal = document.getElementById("loginModal");
  if (loginModal) {
    // 예 버튼 - 로그인 페이지로 이동
    loginModal.querySelector(".confirm").addEventListener("click", () => {
      closeModal(loginModal);
      window.location.href = "../login/login.html?redirect=cart";
    });

    // 아니오 버튼 - 비로그인으로 주문 진행
    loginModal.querySelector(".cancel").addEventListener("click", () => {
      closeModal(loginModal);
      const checkedItems = cartItems.filter(item => item.checked);
      if (checkedItems.length > 0) {
        goToOrderPage(checkedItems);
      }
    });

    // ... (유사한 패턴)
  }
}
```

**주요 포인트:**
- 모든 모달의 이벤트를 한 곳에서 초기화
- 모달마다 고유한 동작 정의
- 일관된 닫기 동작 (취소, X, 오버레이)

---

#### 모달 열기 - `openModal()`

```javascript
function openModal(modalId, item = null) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // 현재 모달 아이템 저장
  currentModalItem = item;

  // 수량 선택 모달인 경우 초기값 설정
  if (modalId === "quantityModal" && item) {
    const qtyInput = modal.querySelector(".qty-modal-input");
    if (qtyInput) {
      qtyInput.value = item.quantity;
    }
  }

  // 삭제 모달인 경우 상품명 표시
  if (modalId === "deleteModal" && item) {
    const messageElement = modal.querySelector(".modal-message");
    if (messageElement) {
      messageElement.textContent = `${item.name}을(를) 삭제하시겠습니까?`;
    }
  }

  // 모달 표시
  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // 배경 스크롤 방지
}
```

**주요 포인트:**
- 모달 타입에 따라 초기값 설정
- 배경 스크롤 방지로 UX 향상
- 현재 작업 중인 아이템 정보 저장

---

#### 모달 닫기 - `closeModal()`

```javascript
function closeModal(modal) {
  // 문자열로 전달된 경우 요소로 변환
  if (typeof modal === "string") {
    modal = document.getElementById(modal);
  }
  if (!modal) return;

  // 모달 숨기기
  modal.classList.remove("active");
  document.body.style.overflow = ""; // 배경 스크롤 복원
  currentModalItem = null;
}
```

**주요 포인트:**
- 문자열 ID 또는 DOM 요소 모두 지원
- 배경 스크롤 복원
- 현재 아이템 정보 초기화

---

### 유틸리티 함수

#### 가격 포맷팅 - `formatPrice()`

```javascript
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
```

**동작:**
- 숫자를 천 단위로 콤마 구분
- 예: `1000000` → `"1,000,000"`

---

#### 로그인 확인 - `isUserLoggedIn()`

```javascript
function isUserLoggedIn() {
  const token = localStorage.getItem("access_token");
  return !!token;
}
```

**동작:**
- localStorage에서 `access_token` 확인
- 토큰이 있으면 `true`, 없으면 `false` 반환

---

#### 주문 페이지 이동 - `goToOrderPage()`

```javascript
function goToOrderPage(orderItems) {
  // 주문 데이터를 localStorage에 저장
  const orderData = {
    items: orderItems,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem("orderData", JSON.stringify(orderData));

  // 주문 페이지로 이동
  window.location.href = "../order/order.html";
}
```

**동작:**
- 주문할 상품 데이터를 localStorage에 저장
- 타임스탬프 추가로 데이터 유효성 관리
- 주문 페이지로 리다이렉트

---

## API 연동

### API 엔드포인트

| 기능                | HTTP Method | URL                       | 인증 필요 |
| :------------------ | :---------- | :------------------------ | :-------- |
| 장바구니 목록 조회  | GET         | `/cart/`                  | ✅        |
| 장바구니 항목 수정  | PUT         | `/cart/{cart_item_id}/`   | ✅        |
| 장바구니 항목 삭제  | DELETE      | `/cart/{cart_item_id}/`   | ✅        |
| 상품 상세 정보 조회 | GET         | `/products/{product_id}/` | ❌        |

### 인증 방식

모든 인증이 필요한 API 호출에는 다음과 같이 JWT 토큰을 포함합니다:

```javascript
const token = localStorage.getItem("access_token");
const headers = {
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
};

const response = await fetch(url, {
  method: "GET",
  headers
});
```

---

## 상태 관리

### 전역 상태

장바구니 페이지의 상태는 다음 전역 변수들로 관리됩니다:

```javascript
// 장바구니 아이템 배열
let cartItems = [
  {
    id: 1,                    // 장바구니 아이템 ID
    name: "상품명",
    category: "카테고리",
    price: 10000,
    image: "이미지 URL",
    option: "배송 옵션",
    quantity: 2,
    checked: true,            // 체크박스 선택 여부
    productId: 10             // 원본 상품 ID
  },
  // ...
];

// 로딩 상태
let isLoading = false;

// 현재 모달에서 다루는 상품
let currentModalItem = null;
```

### 상태 업데이트 흐름

```
1. 사용자 액션 (버튼 클릭, 체크박스 변경 등)
   ↓
2. 이벤트 리스너 실행
   ↓
3. API 호출 (필요시)
   ↓
4. 전역 상태 업데이트 (cartItems 배열 수정)
   ↓
5. renderCart() 호출로 UI 재렌더링
   ↓
6. updateOrderSummary() 호출로 금액 재계산
```

---

## UI/UX 특징

### 1. 로딩 상태 표시

```javascript
function showLoadingState() {
  const emptyCart = document.getElementById("emptyCart");
  emptyCart.innerHTML = `
    <div class="loading-spinner">
      <p class="empty-title">로딩 중...</p>
      <p class="empty-subtitle">장바구니 데이터를 불러오고 있습니다.</p>
    </div>
  `;
  emptyCart.style.display = "flex";
}
```

- API 호출 중에는 "로딩 중..." 메시지 표시
- 사용자에게 진행 상황 피드백

### 2. 에러 처리

```javascript
function showErrorMessage(message) {
  const emptyCart = document.getElementById("emptyCart");
  emptyCart.innerHTML = `
    <p class="empty-title" style="color: #ff4444;"> 오류 발생</p>
    <p class="empty-subtitle">${message}</p>
    <button onclick="location.reload()">새로고침</button>
  `;
  emptyCart.style.display = "flex";
}
```

- API 호출 실패 시 사용자 친화적인 에러 메시지
- "새로고침" 버튼으로 재시도 가능

### 3. 빈 장바구니 안내

```javascript
if (cartItems.length === 0) {
  emptyCart.innerHTML = `
    <p class="empty-title">장바구니에 담긴 상품이 없습니다.</p>
    <p class="empty-subtitle">원하는 상품을 찾아가세요!</p>
  `;
}
```

- 장바구니가 비어있을 때 안내 메시지 표시
- 쇼핑 유도 문구 포함

### 4. 실시간 금액 계산

- 체크박스 변경 시 즉시 금액 재계산
- 수량 변경 시 개별 상품 금액 및 총액 업데이트
- 시각적으로 명확한 금액 표시

### 5. 모달 기반 인터랙션

- 중요한 액션(수량 변경, 삭제)은 모달로 확인
- 실수로 인한 데이터 손실 방지
- 일관된 UX 제공

---

## 개선 가능한 부분

### 1. 상태 관리 패턴 도입

현재는 전역 변수로 상태를 관리하지만, 복잡도가 증가하면 다음과 같은 패턴을 고려할 수 있습니다:

```javascript
// Observer 패턴 예시
class CartStore {
  constructor() {
    this.items = [];
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  updateItems(newItems) {
    this.items = newItems;
    this.notify();
  }

  notify() {
    this.listeners.forEach(listener => listener(this.items));
  }
}

const cartStore = new CartStore();
cartStore.subscribe(renderCart);
cartStore.subscribe(updateOrderSummary);
```

### 2. API 호출 최적화

- **Debouncing**: 수량 입력 시 연속된 API 호출 방지
- **Caching**: 상품 정보 캐싱으로 중복 요청 감소
- **Optimistic UI**: API 응답 전에 UI 먼저 업데이트

### 3. 에러 처리 강화

```javascript
class APIError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new APIError(response.status, await response.text());
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 4. 접근성 개선

- 키보드 네비게이션 강화
- ARIA 속성 추가
- 스크린 리더 지원

---

## 테스트 가이드

### 테스트 시나리오

#### 1. 정상 플로우
1. 페이지 접속
2. 장바구니 데이터 로드 확인
3. 상품 카드 렌더링 확인
4. 체크박스 선택/해제 시 금액 변경 확인
5. 수량 변경 후 금액 재계산 확인
6. 주문하기 버튼 클릭 시 주문 페이지 이동 확인

#### 2. 예외 플로우
1. 비로그인 상태에서 주문 시도 → 로그인 모달 표시
2. 빈 장바구니 접근 → 빈 장바구니 메시지 표시
3. API 실패 시 → 에러 메시지 및 새로고침 버튼 표시
4. 수량을 0 이하로 변경 시도 → 유효성 검사로 차단

### 콘솔 테스트 명령어

브라우저 개발자 도구 콘솔에서 다음 명령어로 테스트 가능:

```javascript
// 현재 장바구니 데이터 확인
console.log(window.cartItems);

// 모달 강제 열기
window.openModal("quantityModal", window.cartItems[0]);

// 장바구니 비우기
window.clearCart();
```

---

## 참고 자료

- [PROJECT.md](../../../PROJECT.md) - 전체 프로젝트 명세
- [cart.md](./cart.md) - 장바구니 기획 문서
- [api.js](../../scripts/api.js) - API 통신 계층
- [layout.js](../../components/layout.js) - 공통 레이아웃 및 인증

---

## 버전 히스토리

- **v1.0.0** (2026-01-07): 초기 장바구니 페이지 구현
  - API 연동 완료
  - 모달 시스템 구현
  - 수량 조절 기능
  - 주문하기 기능

---

## 작성자

- **담당자**: [김영종](https://github.com/ressna93)
- **작성일**: 2026-01-07
- **수정일**: 2026-01-07
