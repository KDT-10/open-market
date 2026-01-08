# Cart.js 코드 리뷰 및 구조 정리

## 목차

1. [데이터 구조 (장바구니)](#1-데이터-구조-장바구니)
2. [장바구니 렌더링](#2-장바구니-렌더링)
3. [모달 처리 흐름](#3-모달-처리-흐름)
4. [주문 기능](#4-주문-기능)
5. [수량 업데이트 & 삭제](#5-수량-업데이트--삭제)
6. [로딩 및 에러 처리](#6-로딩-및-에러-처리)
7. [코드 핵심 포인트](#7-코드-핵심-포인트)
8. [페이지 흐름도](#8-페이지-흐름도)

---

## 1. 데이터 구조 (장바구니)

### API 호출 방식

- **엔드포인트**: `/cart/` → 각 상품 상세 `/products/{id}` fetch
- **인증**: Authorization 헤더 필요 (access_token)

```javascript
// API 호출
const response = await fetch(`${API_BASE_URL}/cart/`, {
  headers: headers,
});

// HTTP 에러 체크
if (!response.ok) {
  throw new Error(
    `HTTP error! status: ${response.status} - ${response.statusText}`
  );
}
```

### 주요 특징

- 장바구니 목록 조회 후 각 상품의 상세 정보를 개별적으로 fetch
- Authorization 토큰을 통한 사용자별 장바구니 관리

---

## 2. 장바구니 렌더링

### 핵심 함수

- **`renderCart()`**: 장바구니 전체 렌더링 담당
- **`createProductCard()`**: 개별 상품 카드 생성 (반복 렌더링)

### 수량 조정

- **수량 모달(quantityModal)** 사용
- 감소/증가 버튼 이벤트 처리

```javascript
// 수량 감소 버튼
const minusBtn = card.querySelector(".minus");
minusBtn.addEventListener("click", function () {
  openModal("quantityModal", item);
});

// 수량 증가 버튼
const plusBtn = card.querySelector(".plus");
plusBtn.addEventListener("click", function () {
  openModal("quantityModal", item);
});
```

### 삭제 기능

- **삭제 모달(deleteModal)** 사용하여 사용자 확인 후 삭제

---

## 3. 모달 처리 흐름

### 모달 종류

1. **수량 모달**: 상품 수량 변경 시
2. **삭제 모달**: 상품 삭제 확인 시
3. **로그인 모달**: 미로그인 상태에서 주문 시도 시

### 핵심 함수

```javascript
openModal(modalId, item); // 모달 열기
closeModal(modal); // 모달 닫기 (클래스 제거)
```

### 처리 흐름

- 모달 열기 → 사용자 입력/확인 → 이벤트 처리 → 모달 닫기

---

## 4. 주문 기능

### 주문 프로세스

1. **체크된 상품만 선택**: `goToOrderPage(orderItems)` 호출
2. **localStorage 저장**: 선택된 상품 정보를 `orderData`로 저장
3. **페이지 이동**: `../order/order.html`로 이동

### 지원 기능

- 개별 주문 지원
- 전체 주문 지원
- 로그인 상태 확인
- 미로그인 시 로그인 모달 표시

### 특징

- 체크박스로 선택된 상품만 주문 가능
- 로그인 상태에 따른 분기 처리

---

## 5. 수량 업데이트 & 삭제

### API 통신

```javascript
updateCartItemQuantity(cartItemId, newQuantity); // PUT 요청
deleteCartItem(cartItemId); // DELETE 요청
```

### 처리 흐름

1. **서버 API 호출** (PUT / DELETE)
2. **실패 시**: 사용자에게 알림 표시
3. **성공 시**: `renderCart()` 호출하여 화면 재렌더링

### 특징

- 비동기 처리로 사용자 경험 향상
- 에러 핸들링으로 안정성 확보

---

## 6. 로딩 및 에러 처리

### 로딩 상태 관리

- **`isLoading`** 변수로 로딩 상태 추적
- 데이터 로딩 중 → 로딩 메시지 표시

### 에러 처리

- **API 오류 발생 시**:
  - 에러 메시지 표시
  - 새로고침 버튼 제공
  - 사용자 친화적인 에러 안내

### 처리 방식

```javascript
try {
  // API 호출
} catch (error) {
  // 에러 메시지 표시 및 새로고침 버튼 제공
}
```

---

## 7. 코드 핵심 포인트

### 모달 재사용성

- 수량, 삭제, 로그인 모달 모두 `openModal` / `closeModal` 공통 처리
- 코드 중복 최소화 및 유지보수성 향상

### 비동기 처리

- `async/await` + `try/catch` 패턴 사용
- 안정적인 에러 핸들링

### UI 반응형

- 수량 조정 버튼 이벤트 연결
- 체크박스 상태 관리
- 주문 버튼 이벤트 처리

### localStorage 활용

- **로그인 토큰**: 인증 정보 저장
- **주문 데이터**: 선택된 상품 정보 저장 및 페이지 간 데이터 전달

---

## 8. 페이지 흐름도

```
[페이지 로드]
     ↓
[fetchCartItems()] → [cartItems 데이터 조회]
     ↓
[renderCart()] → [상품 카드 생성 및 렌더링]
     ↓
[모달 열기/닫기] ← 사용자 클릭 (수량 조정, 삭제, 로그인)
     ↓
[수량 변경 / 삭제 / 주문]
     ↓
[API 호출] (PUT/DELETE)
     ↓
[화면 갱신] (renderCart 재호출)
```

---

## 노션 프로젝트 필수 사항 체크리스트

- API 인증 처리 (Authorization 헤더)
- 에러 핸들링 및 사용자 피드백
- 모달 UI/UX 구현
- 장바구니 CRUD 기능
- 주문 페이지 연동
- 로그인 상태 검증
- localStorage 활용한 데이터 전달

---

**작성일**: 2026-01-07
**대상 파일**: Cart.js
**목적**: 코드 리뷰 및 구조 이해
