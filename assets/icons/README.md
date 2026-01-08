# SVG Icon Sprite

## 📁 파일 구조

```
web/assets/icons/
└── sprite.svg    # 모든 SVG 아이콘을 포함한 스프라이트 파일
```

## 🎨 포함된 아이콘

| 아이콘 ID             | 설명                 | 사용 위치                  |
| --------------------- | -------------------- | -------------------------- |
| `icon-cart`           | 장바구니             | 헤더                       |
| `icon-user`           | 사용자               | 헤더                       |
| `icon-search`         | 검색                 | 헤더 검색바                |
| `icon-chevron-left`   | 왼쪽 화살표          | 배너 슬라이더              |
| `icon-chevron-right`  | 오른쪽 화살표        | 배너 슬라이더              |
| `icon-check-password` | 비밀번호 유효성 체크 | 회원가입                   |
| `icon-eye`            | 눈 (비밀번호 보기)   | 로그인/회원가입 (선택사항) |
| `icon-close`          | 닫기/삭제 (X)        | 장바구니, 모달             |
| `icon-order-minus`    | 수량 감소 (-)        | 상품 상세, 장바구니        |
| `icon-order-plus`     | 수량 증가 (+)        | 상품 상세, 장바구니        |
| `icon-plus`           | 추가 (+)             | 상품 등록                  |
| `icon-instagram`      | 인스타그램           | 푸터                       |
| `icon-facebook`       | 페이스북             | 푸터                       |
| `icon-youtube`        | 유튜브               | 푸터                       |
| `icon-image`          | 이미지 업로드        | 상품 등록/수정             |
| `icon-seller-center`  | 판매자 센터          | 헤더 (판매자 로그인 시)    |

## 🔧 사용 방법

### HTML에서 사용

```html
<!-- 기본 사용법 -->
<svg width="24" height="24">
  <use href="assets/icons/sprite.svg#icon-cart"></use>
</svg>

<!-- 크기 조절 -->
<svg width="20" height="20">
  <use href="assets/icons/sprite.svg#icon-search"></use>
</svg>
```

### CSS로 스타일링

```css
/* 색상은 currentColor를 사용하므로 부모 요소의 color가 적용됩니다 */
.icon-button {
  color: #333;
}

.icon-button:hover {
  color: #5cb85c; /* 호버 시 녹색으로 변경 */
}

.icon-button svg {
  display: block;
}
```

## ✨ 장점

### 1. 성능 최적화

- ✅ **한 번의 HTTP 요청**으로 모든 아이콘 로드
- ✅ **브라우저 캐싱** - 한 번 로드 후 재사용
- ✅ **파일 크기 작음** - 중복 코드 제거

### 2. 유지보수 용이

- ✅ 한 파일에서 모든 아이콘 관리
- ✅ 새 아이콘 추가 쉬움
- ✅ 일관된 스타일 유지

### 3. CSS 제어 가능

- ✅ `currentColor`로 색상 변경 가능
- ✅ CSS transition/animation 적용 가능
- ✅ 반응형 크기 조절 쉬움

### 4. 확장성

- ✅ 새 아이콘 추가 시 sprite.svg만 수정
- ✅ HTML 변경 최소화

## 🆕 새 아이콘 추가 방법

### Step 1: sprite.svg에 symbol 추가

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <!-- 기존 아이콘들 -->

  <!-- 새 아이콘 추가 -->
  <symbol id="icon-새아이콘" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="..."></path>
    <!-- SVG path 내용 -->
  </symbol>
</svg>
```

### Step 2: HTML에서 사용

```html
<svg width="24" height="24">
  <use href="assets/icons/sprite.svg#icon-새아이콘"></use>
</svg>
```

## 📐 아이콘 크기 가이드

| 아이콘                            | 권장 크기 | 용도                  |
| --------------------------------- | --------- | --------------------- |
| `icon-cart`                       | 32x32     | 헤더 장바구니 버튼    |
| `icon-user`                       | 32x32     | 헤더 사용자 버튼      |
| `icon-seller-center`              | 32x32     | 헤더 판매자 센터 버튼 |
| `icon-search`                     | 24x24     | 검색 버튼             |
| `icon-chevron-left/right`         | 24x24     | 배너 슬라이더 버튼    |
| `icon-check-password`             | 28x28     | 비밀번호 유효성 체크  |
| `icon-eye`                        | 20x20     | 비밀번호 보기/숨기기  |
| `icon-close`                      | 20x20     | 닫기/삭제 버튼        |
| `icon-order-minus/plus`           | 34x34     | 수량 조절 버튼        |
| `icon-plus`                       | 32x32     | 상품 추가 버튼        |
| `icon-image`                      | 60x60     | 이미지 업로드 영역    |
| `icon-instagram/facebook/youtube` | 32x32     | 푸터 SNS 링크         |

**참고:** 위 크기는 권장 사항이며, 디자인에 따라 조절 가능합니다.

## 🎯 실제 사용 예시

### 헤더 아이콘 (장바구니, 사용자, 판매자 센터)

```html
<!-- 장바구니 버튼 -->
<a href="cart.html" class="icon-button" id="cart-button">
  <svg width="32" height="32">
    <use href="assets/icons/sprite.svg#icon-cart"></use>
  </svg>
  <span>장바구니</span>
</a>

<!-- 사용자 버튼 -->
<a href="signin.html" class="icon-button" id="user-button">
  <svg width="32" height="32">
    <use href="assets/icons/sprite.svg#icon-user"></use>
  </svg>
  <span id="user-button-text">로그인</span>
</a>

<!-- 판매자 센터 버튼 (판매자 로그인 시 표시) -->
<a
  href="seller-center.html"
  class="seller-center-button"
  id="seller-center-button"
>
  <svg width="32" height="32">
    <use href="assets/icons/sprite.svg#icon-seller-center"></use>
  </svg>
  <span>판매자 센터</span>
</a>
```

### 검색 버튼

```html
<button type="button" class="search-button">
  <svg width="24" height="24">
    <use href="assets/icons/sprite.svg#icon-search"></use>
  </svg>
</button>
```

### 배너 슬라이더

```html
<!-- 이전 버튼 -->
<button id="prev-button" class="slider-button">
  <svg width="24" height="24">
    <use href="assets/icons/sprite.svg#icon-chevron-left"></use>
  </svg>
</button>

<!-- 다음 버튼 -->
<button id="next-button" class="slider-button">
  <svg width="24" height="24">
    <use href="assets/icons/sprite.svg#icon-chevron-right"></use>
  </svg>
</button>
```

### 수량 조절 버튼

```html
<div class="quantity-selector">
  <button type="button" class="quantity-btn minus">
    <svg width="34" height="34">
      <use href="assets/icons/sprite.svg#icon-order-minus"></use>
    </svg>
  </button>
  <input type="text" value="1" readonly />
  <button type="button" class="quantity-btn plus">
    <svg width="34" height="34">
      <use href="assets/icons/sprite.svg#icon-order-plus"></use>
    </svg>
  </button>
</div>
```

### 비밀번호 유효성 체크

```html
<div class="input-with-icon">
  <input type="password" id="password" />
  <svg width="28" height="28" id="password-icon">
    <use href="assets/icons/sprite.svg#icon-check-password"></use>
  </svg>
</div>
```

### 이미지 업로드

```html
<div class="image-upload-box" id="imageUploadBox">
  <svg width="60" height="60" class="upload-icon">
    <use href="assets/icons/sprite.svg#icon-image"></use>
  </svg>
  <p>이미지를 업로드해주세요</p>
</div>
```

### 푸터 SNS 아이콘

```html
<div class="footer-social">
  <a href="#" class="social-icon instagram" aria-label="Instagram">
    <svg width="32" height="32">
      <use href="assets/icons/sprite.svg#icon-instagram"></use>
    </svg>
  </a>
  <a href="#" class="social-icon facebook" aria-label="Facebook">
    <svg width="32" height="32">
      <use href="assets/icons/sprite.svg#icon-facebook"></use>
    </svg>
  </a>
  <a href="#" class="social-icon youtube" aria-label="YouTube">
    <svg width="32" height="32">
      <use href="assets/icons/sprite.svg#icon-youtube"></use>
    </svg>
  </a>
</div>
```

## 🔍 브라우저 지원

- ✅ Chrome (모든 버전)
- ✅ Firefox (모든 버전)
- ✅ Safari (9.1+)
- ✅ Edge (모든 버전)
- ✅ IE 11+ (polyfill 필요)

## 💡 Tips

### 색상 변경

```css
/* 부모 요소의 color 속성 사용 */
.my-icon {
  color: #ff0000; /* 빨간색 */
}
```

### 애니메이션

```css
.icon-rotate {
  transition: transform 0.3s ease;
}

.icon-rotate:hover svg {
  transform: rotate(180deg);
}
```

### 접근성

```html
<!-- 스크린 리더를 위한 title 추가 -->
<svg width="24" height="24" role="img" aria-label="장바구니">
  <title>장바구니</title>
  <use href="assets/icons/sprite.svg#icon-cart"></use>
</svg>
```

## 📚 참고 자료

- [SVG Sprite 기술](https://css-tricks.com/svg-sprites-use-better-icon-fonts/)
- [SVG `<use>` 요소](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use)
- [currentColor in SVG](https://css-tricks.com/cascading-svg-fill-color/)

---

Made with ❤️ by Open Market Team
