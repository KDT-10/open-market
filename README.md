# 자두페이지 (ZADU PAGE)

## 프로젝트 개요

'새싹코딩팀'이 진행한 Vanilla JavaScript 기반 오픈마켓 서비스 프로젝트입니다.
프레임워크 없이 순수 JavaScript만으로 MPA(Multi-Page Application)를 구현하며, 모듈화 아키텍처와 Git-flow 협업 전략을 실천했습니다.

### 1. 목표와 기능

#### 1.1. 목표

본 프로젝트의 핵심 목표는 프레임워크의 도움 없이 순수 Vanilla JS만을 사용하여 웹 애플리케이션의 전체적인 구조를 설계하고 구현하는 경험을 쌓는 것입니다. 이를 통해 아래와 같은 세부 목표를 달성하고자 했습니다.

- **기술 목표**: Vanilla JS를 사용하여 컴포넌트 기반의 동적 MPA(Multi-Page Application)를 개발하고, 비동기 통신과 상태 관리의 기본 원리를 깊이 있게 이해합니다.
- **협업 목표**: Git-flow 전략에 기반한 버전 관리, Pull Request를 통한 코드 리뷰, 정기적인 소통을 통해 실전적인 팀 협업 프로세스를 경험하고 함께 성장합니다.
- **설계 목표**: 향후 유지보수와 기능 확장을 고려하여, 기능별로 책임이 명확히 분리된 모듈화 아키텍처를 설계하고 구현합니다.

#### 1.2. 핵심 기능

| 구분          | 주요 기능       | 상세 설명                                              |
| :------------ | :-------------- | :----------------------------------------------------- |
| **회원 인증** | 로그인/로그아웃 | JWT 토큰 기반 인증, 자동 로그아웃 기능                 |
|               | 회원가입        | 아이디 중복 확인, 입력값 유효성 검사                   |
| **상품**      | 상품 목록 조회  | 비동기 데이터 로딩, 캐러셀, 탭 UI, 페이지네이션        |
|               | 상품 검색       | 검색어 기반 상품 필터링 (json-server의 name_like 활용) |
|               | 상품 상세 조회  | 상품 ID 기반 상세 정보, 수량 선택, 장바구니 담기       |
| **장바구니**  | 장바구니 관리   | 상품 추가/삭제/수량 변경, 모달 UI                      |
|               | 금액 계산       | 실시간 총 금액 계산 (상품 금액 + 배송비)               |
| **주문/결제** | 주문서 생성     | 장바구니 선택 상품 기반 주문서 생성                    |
|               | 결제 프로세스   | 배송 정보 입력, 결제 수단 선택                         |

#### 1.3. 팀 구성

- **팀명**: 새싹코딩팀
- **팀원**: 김영종, 고은표, 장화연, 김세윤, 장영재

---

### 2. 개발 환경 및 실행 방법

#### 2.1. 개발 환경

- **언어**:
  <div>
  <img width=58 src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img width=45 src="https://img.shields.io/badge/CSS-0078D7?style=for-the-badge&logo=CSS&logoColor=white">
  <img width=85 src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img width=64 src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">
  </div>
- **방식**: MPA (Multi-Page Application)
- **협업 도구**: Git, GitHub, Discord, Notion
- **코드 스타일**: Prettier
- **라이브러리**: Swiper.js (캐러셀)
- **백엔드**: JSON Server

#### 2.2. 실행 방법

##### 🌐 배포된 사이트 접속

<!-- 🔗 **배포 URL**: [https://zadupage.github.io/team1-JADUPAGE/](https://zadupage.github.io/team1-JADUPAGE/) -->

> 배포 예정

##### 로컬 개발 환경 실행

**1. 프로젝트 클론**

```bash
git clone https://github.com/zadupage/team1-JADUPAGE.git
cd team1-JADUPAGE
```

**2. JSON Server 실행 (백엔드)**

```bash
npm install
npm run server
```

서버는 `http://localhost:3000`에서 실행됩니다.

**3. 프론트엔드 실행**

- VS Code의 `Live Server` 확장 프로그램을 설치합니다.
- `index.html` 파일을 우클릭하여 `Open with Live Server`를 실행합니다.
- 브라우저에서 자동으로 메인 페이지가 열립니다.

---

### 3. 요구사항 명세와 기능 명세

#### 3.1. 핵심 아키텍처

##### API 통신 계층 ([web/scripts/api.js](web/scripts/api.js))

프로젝트의 모든 HTTP 요청을 중앙에서 관리하는 API 통신 계층입니다.

**핵심 함수: `fetchAPI(url, options)`**

```javascript
// api.js
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // 204 No Content와 같이 body가 없는 성공 응답을 별도 처리
    if (response.status === 204) {
      return { isSuccessful: true, detail: "요청이 성공했습니다." };
    }

    const data = await response.json();

    // 4xx, 5xx 에러 발생 시, 서버가 보낸 에러 메시지를 포함한 커스텀 에러 객체를 생성하여 전파
    if (!response.ok) {
      const customError = new Error(
        data?.error || "통신 중 문제가 발생했습니다."
      );
      customError.status = response.status;
      customError.messages = data;
      throw customError;
    }

    return data;
  } catch (error) {
    throw error;
  }
}
```

**특징:**

- 중앙화된 에러 처리 (네트워크, HTTP 상태 코드)
- 204 No Content 등 특수 케이스 처리
- 일관된 에러 객체 구조

**제공 API:**

```javascript
export const API = {
  getProducts: async () => {...},           // 전체 상품 목록 조회
  getProduct: async (productId) => {...},   // 상품 상세 조회
  searchProducts: async (query) => {...}    // 상품 검색
};
```

---

##### 인증 관리 계층 ([web/components/layout.js](web/components/layout.js))

JWT 기반 인증의 전체 생명주기를 관리하며, 토큰 만료 시 자동 로그아웃을 처리합니다.

```javascript
// layout.js
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function scheduleAutoLogout() {
  const token = getAccessToken();
  if (!token) return;

  const payload = parseJwt(token);
  if (!payload?.exp) return;

  const remainingMs = payload.exp * 1000 - Date.now();

  if (remainingMs <= 0) {
    logout();
    return;
  }

  if (logoutTimerId) clearTimeout(logoutTimerId);
  logoutTimerId = setTimeout(() => {
    logout("로그인이 만료되었습니다.");
  }, remainingMs);
}
```

**주요 기능:**

- JWT 토큰 파싱 및 만료 확인
- 자동 로그아웃 타이머 설정
- 페이지 전환 시 인증 상태 유지

---

##### 공통 레이아웃 모듈 ([web/components/layout.html](web/components/layout.html))

Header와 Footer를 컴포넌트화하여 코드 중복을 방지하고 UI 일관성을 유지합니다.

**포함 요소:**

- 검색 기능 (json-server의 `name_like` 활용)
- 장바구니 링크
- 마이페이지 링크
- 로그인/로그아웃 버튼

---

#### 3.3. 주요 기능 흐름

**로그인 시퀀스 예시:**

1. **Client**: 사용자가 ID와 PW를 입력하고 '로그인' 버튼을 클릭합니다.
2. **Web (`login.js`)**: `login.js`가 입력값의 유효성을 검사한 후, `api.js`의 `login` 함수를 호출합니다.
3. **Web (`api.js`)**: `fetchAPI` 함수를 통해 서버로 `POST` 요청을 보냅니다.
4. **Server (JSON Server)**: 서버는 전달받은 ID/PW를 검증합니다.
5. **Server -> Web**:
   - **(성공 시)**: `access token`과 `refresh token`을 응답으로 전달합니다.
   - **(실패 시)**: 401 Unauthorized 에러와 실패 메시지를 응답으로 전달합니다.
6. **Web (`login.js`)**:
   - **(성공 시)**: 응답받은 토큰을 `localStorage`에 안전하게 저장합니다.
   - **(실패 시)**: 에러를 처리하여 사용자에게 실패 메시지를 노출합니다.
7. **Web**: 로그인이 성공했으므로, 사용자를 메인 페이지로 리다이렉트 시킵니다.

---

### 4. 프로젝트 구조와 개발 일정

#### 4.1. 프로젝트 구조

```text
📂 zadu/
├── 📂 web/
│   ├── 📂 assets/
│   │   ├── 📂 icons/              # SVG 아이콘 스프라이트
│   │   └── 📂 images/             # 상품 이미지, 로고
│   ├── 📂 components/
│   │   ├── 📜 layout.html         # 공통 헤더/푸터
│   │   ├── 📜 layout.js           # 레이아웃 로직 및 JWT 인증
│   │   └── 📜 layout.css          # 레이아웃 스타일
│   ├── 📂 pages/
│   │   ├── 📂 cart/
│   │   │   ├── 📜 cart.html       # 장바구니 페이지
│   │   │   ├── 📜 cart.js         # 장바구니 로직 (모달, CRUD)
│   │   │   └── 📜 CART_README.md  # 장바구니 기능 문서
├────────────📂node_modules
│   │   │
│   │   ├── 📂 login/
│   │   │   ├── 📜 login.html      # 로그인 페이지
│   │   │   └── 📜 login.js        # 로그인 로직
│   │   ├── 📂 signup/
│   │   │   ├── 📜 signup.html     # 회원가입 페이지
│   │   │   └── 📜 signup.js       # 회원가입 로직
│   │   ├── 📂 product-details/
│   │   │   ├── 📜 product-details.html  # 상품 상세 페이지
│   │   │   └── 📜 product-details.js    # 상품 상세 로직
│   │   └── 📂 order/
│   │       ├── 📜 order.html      # 주문/결제 페이지
│   │       └── 📜 order.js        # 주문 로직
│   ├── 📂 scripts/
│   │   ├── 📜 api.js              # API 통신 계층 (fetchAPI)
│   │   └── 📜 main.js             # 메인 페이지 로직 (캐러셀, 탭, 검색)
│   ├── 📂 styles/
│   │   ├── 📜 variables.css       # CSS 변수 정의
│   │   ├── 📜 fonts.css           # 폰트 스타일
│   │   ├── 📜 main.css            # 메인 페이지 스타일
│   │   ├── 📜 login.css           # 로그인 페이지 스타일
│   │   ├── 📜 signup.css          # 회원가입 페이지 스타일
│   │   ├── 📜 cart.css            # 장바구니 페이지 스타일
│   │   ├── 📜 order.css           # 주문 페이지 스타일
│   │   ├── 📜 product-details.css # 상품 상세 페이지 스타일
│   │   └── 📜 404.css             # 404 페이지 스타일
│   ├── 📜 index.html              # 메인 페이지
│   ├── 📜 404.html                # 404 에러 페이지
│   └── 📜 404.js                  # 404 페이지 로직
├── 📂 server/
│   └── 📜 server.js               # JSON Server 설정 및 데이터
├── 📜 Main.html                   # 프로젝트 진입점
├── 📜 404오류.html                # 404 에러 페이지 (루트)
├── 📜 package.json                # 프로젝트 의존성 관리
├── 📜 package-lock.json
├── 📜 .gitignore
├── 📜 jsconfig.json               # JavaScript 설정
├── 📜 PROJECT.md                  # 프로젝트 상세 문서
└── 📜 README.md                   # 프로젝트 소개 (이 파일)
```

#### 4.2. 개발 일정 (WBS)

**기간**: 2025년 12월 30일 ~ 2026년 1월 8일 (10일간)

프로젝트의 상세 일정 및 작업 분배는 Notion을 통해 관리되었습니다. 주차별 목표와 개인별 할당 작업 내역을 칸반 보드 형식으로 확인하고, Discord로 실시간 작업 상황을 공유하며 진행 상황을 추적했습니다.

[ Notion TODOLIST 링크](https://www.notion.so/1-8b2d79c7a4804539ae592c923cc2e1fb)

| 기간          | 주요 작업                                                                   |
| :------------ | :-------------------------------------------------------------------------- |
| 12/30 ~ 01/02 | 프로젝트 기획, 요구사항 정의, Git-flow 전략 수립                            |
| 01/03 ~ 01/05 | 핵심 아키텍처 구축 (API 계층, 인증 모듈, 공통 레이아웃)                     |
| 01/06 ~ 01/07 | 페이지별 기능 개발 (메인, 로그인, 회원가입, 상품 상세, 장바구니, 주문/결제) |
| 01/08         | 통합 테스트, 버그 수정, 최종 발표 준비                                      |

---

### 5. 역할 분담

각 팀원은 다음과 같은 목표와 의도를 가지고 역할을 수행했습니다.

| 담당 페이지 / 역할 | 담당자 | 주요 업무 |
| **메인 페이지** | [장화연](https://github.com/Hwayeon842) | 상품 목록 렌더링, 캐러셀 구현, 탭 UI, 검색 기능, 페이지네이션 구현 |
| **로그인,회원가입** | [고은표](https://github.com/goeunpyo8-debug) | JWT 기반 로그인 구현, 토큰 관리, 자동 로그아웃 기능 구현 | |
| **상품상세,404** | [장영재](https://github.com/YoungjaeJang7) | 상품 상세 정보 렌더링, 수량 조절 기능, 장바구니 담기 기능 구현 |
| **메인,장바구니** | [김영종](https://github.com/ressna93) | 장바구니 상태 관리, 수량 조절, 삭제 기능, 총 금액 계산, 주문 연동 |
| **주문/결제** | [김세윤](https://github.com/seyunkims) | 주문서 생성, 배송 정보 입력, 결제 수단 선택, 최종 결제 금액 계산 |
| **공통 아키텍처** | [고은표](https://github.com/goeunpyo8-debug),[김세윤](https://github.com/seyunkims),[김영종](https://github.com/ressna93),[장영재](https://github.com/YoungjaeJang7) | API 통신 계층 설계, 공통 레이아웃 컴포넌트, 404 페이지, Git-flow 전략 수립 및 코드 리뷰 참여 |

---

### 6. 주요 기술적 특징

#### 6.1. 탭 UI (Vanilla JS)

라이브러리 없이 순수 JavaScript로 탭 전환 기능을 구현했습니다. 클릭 이벤트뿐만 아니라 키보드 접근성(좌/우 화살표, Home/End 키)도 지원합니다.

```javascript
// main.js - 탭 UI 초기화
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      switchTab(button);
    });

    button.addEventListener("keydown", (e) => {
      // 키보드 접근성 구현
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // 탭 전환 로직
      }
    });
  });
}
```

#### 6.2. 슬라이드 캐러셀 (Swiper.js)

메인 페이지에서 Swiper.js 라이브러리를 활용하여 반응형 캐러셀을 구현했습니다.

```javascript
// main.js - Swiper 초기화
function initSwiper() {
  const swiper = new Swiper(".swiper", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    touchRatio: 1, // 터치 스와이프 지원
  });
}
```

#### 6.3. 검색 기능 (json-server)

별도의 백엔드 개발 없이 json-server의 `name_like` 파라미터를 활용하여 검색 기능을 구현했습니다.

```javascript
// api.js - 검색 API
searchProducts: async (query) => {
  return fetchAPI(
    `${API_BASE_URL}/products?name_like=${encodeURIComponent(query)}`
  );
};

// main.js - 검색 기능 초기화
function initSearch() {
  const searchForm = document.querySelector(".search-form");
  const searchInput = searchForm.querySelector('input[name="q"]');

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (!query) {
      await loadProducts(); // 검색어 없으면 전체 상품 표시
      return;
    }

    const data = await API.searchProducts(query);
    allProducts = data;
    currentPage = 1;
    renderProducts();
  });
}
```

**특징:**

- 실시간 검색어 처리
- 빈 검색어 시 전체 목록 표시
- json-server의 내장 검색 기능 활용

#### 6.4. 비동기 데이터 로딩 및 에러 처리

모든 API 호출은 `try/catch` 블록으로 감싸 안정적인 에러 처리를 보장합니다. 로딩 상태와 에러 상태를 사용자에게 명확하게 전달합니다.

```javascript
// main.js - 상품 목록 로딩
async function loadProducts() {
  try {
    const data = await API.getProducts();
    allProducts = data;
    renderProducts();
  } catch (error) {
    console.error("상품 로딩 실패:", error);
    alert("상품을 불러오는데 실패했습니다.");
  }
}
```

#### 6.5. 반응형 디자인

모바일 퍼스트 접근 방식으로 설계되었으며, 주요 브레이크포인트(480px, 768px, 1200px)에서 레이아웃이 자연스럽게 조정됩니다.

```css
/* variables.css */
:root {
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1200px;
}

/* 반응형 미디어 쿼리 예시 */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### 6.6. 접근성 (A11y)

- 모든 이미지에 대체 텍스트(`alt`) 제공
- 키보드 탭 순서 보장 (`tabindex` 적절히 활용)
- 명도 대비 WCAG AA 준수 (텍스트 대비 4.5:1 이상)
- 시맨틱 HTML 사용 (`header`, `nav`, `main`, `footer`, `article` 등)

---

### 7. 협업 방식

#### 7.1. Git-flow 전략

- **main**: 프로덕션 배포용 브랜치
- **develop**: 개발 통합 브랜치
- **feature/기능명**: 기능 개발 브랜치 (예: `feature/login`, `feature/cart`)

모든 코드는 Pull Request와 동료 리뷰를 통해서만 `develop` 브랜치에 병합되었습니다.

#### 7.2. Commit Convention

일관된 커밋 메시지 작성을 위해 다음 컨벤션을 따랐습니다.

- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `style:` 코드 스타일 변경 (포맷팅, 세미콜론 누락 등)
- `refactor:` 코드 리팩토링
- `docs:` 문서 수정
- `chore:` 빌드 업무, 패키지 매니저 설정 등

**커밋 예시:**

```
feat: 로그인 페이지 JWT 인증 구현
fix: 장바구니 수량 변경 버그 수정
style: 메인 페이지 CSS 정렬
```

#### 7.3. Communication

- **Notion**: 전체 업무 계획 수립, 요구사항 문서화, WBS 관리
- **Discord**: 실시간 커뮤니케이션, 작업 완료 공유, 데일리 스탠드업
- **GitHub**: 코드 리뷰, Issue 트래킹, Pull Request 논의

---

### 8. 화면 설계

프로젝트의 전체적인 UI/UX 디자인은 제공된 피그마(Figma) 시안을 기반으로 구현되었습니다.

#### 8.1. 주요 화면

- **메인 페이지**: 캐러셀, 탭 UI, 상품 목록, 검색 기능
- **로그인 페이지**: 아이디/비밀번호 입력, 유효성 검사
- **회원가입 페이지**: 폼 유효성 검사, 아이디 중복 확인
- **상품 상세 페이지**: 상품 정보, 수량 선택, 장바구니 담기
- **장바구니 페이지**: 상품 목록, 수량 조절, 삭제, 총 금액 계산
- **주문/결제 페이지**: 주문 상품 목록, 배송 정보 입력, 결제 수단 선택
- **404 페이지**: 에러 안내 및 홈으로 돌아가기

---

### 9. 데이터베이스 모델링 (ERD)

본 프로젝트는 JSON Server를 사용하여 백엔드를 구성했습니다. 주요 데이터 모델은 다음과 같습니다.

#### 9.1. 데이터 구조

**Products (상품)**

```json
{
  "id": 1,
  "name": "상품명",
  "info": "상품 설명",
  "image": "이미지 URL",
  "price": 29000,
  "shipping_method": "PARCEL",
  "shipping_fee": 1000,
  "stock": 8,
  "seller": {
    "username": "seller@test.com",
    "name": "판매자명",
    "store_name": "상점명"
  }
}
```

**Users (사용자)**

```json
{
  "id": 1,
  "username": "buyer@test.com",
  "password": "hashed_password",
  "name": "사용자명",
  "phone_number": "010-1234-5678",
  "user_type": "BUYER"
}
```

**Cart (장바구니)**

```json
{
  "id": 1,
  "user_id": 1,
  "product_id": 1,
  "quantity": 2,
  "is_selected": true
}
```

---

### 10. 트러블슈팅 (Troubleshooting)

프로젝트 개발 과정에서 발생한 주요 문제와 해결 방법을 페이지별로 정리했습니다.

#### 10.1. 장바구니 페이지 (Cart)

| 문제                                      | 원인                                                 | 해결 방법                                                                                                                   |
| :---------------------------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **이미지 깨짐 현상**                      | 상품 이미지 URL 경로 오류 또는 서버 응답 지연        | - 이미지 로드 실패 시 기본 이미지(placeholder) 표시<br>- `onerror` 이벤트로 fallback 처리<br>- 상대 경로를 절대 경로로 변경 |
| **빈 장바구니에서 "로딩중..." 무한 표시** | 빈 배열 처리 로직 누락으로 로딩 상태가 해제되지 않음 | - 장바구니 데이터가 빈 배열일 때도 로딩 상태 해제<br>- `if (cartItems.length === 0)` 조건문 추가하여 빈 장바구니 UI 표시    |
| **페이지 로드 시 중복 렌더링**            | `DOMContentLoaded`와 함수 호출이 중복 실행됨         | - 초기화 함수를 한 곳에서만 호출하도록 수정<br>- `renderCart()` 호출 시점을 명확히 분리                                     |

**주요 코드 수정 예시:**

```javascript
// 빈 장바구니 처리
if (!cartItems || cartItems.length === 0) {
  isLoading = false;
  loadingSkeleton.style.display = "none";
  showEmptyCartMessage(); // 빈 장바구니 메시지 표시
  return;
}
```

---

#### 10.2. 로그인/회원가입 페이지

| 문제                  | 원인                                                                                      | 해결 방법                                                                                                                                       |
| :-------------------- | :---------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **포트 불일치 오류**  | API 호출 시 하드코딩된 `localhost:3000`만 사용<br>프론트엔드는 `8080` 포트에서 실행       | - `API_BASE_URL`을 환경 변수나 설정 파일로 분리<br>- CORS 설정 추가하여 다른 포트 간 통신 허용<br>- Live Server 포트와 관계없이 동작하도록 수정 |
| **토큰 키 이름 오타** | localStorage 저장/조회 시 팀원 간 키 이름 불일치<br>(예: `accessToken` vs `access_token`) | - 공통 상수로 토큰 키 이름 정의<br>- `const TOKEN_KEY = 'access_token'`으로 통일<br>- 코드 리뷰 시 네이밍 컨벤션 확인                           |

**해결된 코드:**

```javascript
// api.js - 환경에 맞는 BASE_URL 설정
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://api.example.com";

// 토큰 키 상수화
const TOKEN_KEYS = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
};

// 사용 예시
localStorage.setItem(TOKEN_KEYS.ACCESS, token);
```

---

#### 10.3. 상품 상세 페이지 (Product Details)

| 문제                                | 원인                                                                  | 해결 방법                                                                                                                       |
| :---------------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **공통 레이아웃 적용 시 경로 오류** | 상대 경로(`../../components/layout.html`)가 페이지 깊이에 따라 달라짐 | - 절대 경로(`/web/components/layout.html`) 사용<br>- 또는 `base` 태그로 기준 경로 설정                                          |
| **상품 ID가 undefined 전달**        | URL 쿼리 파라미터 파싱 오류<br>`URLSearchParams` 사용법 미숙          | - URL에서 `id` 파라미터 정확히 추출<br>- `const id = new URLSearchParams(window.location.search).get('id')`<br>- null 체크 추가 |
| **서버 포트 불일치 (3000 vs 8080)** | 개발 서버와 API 서버 포트 혼용                                        | - 위 로그인 페이지와 동일하게 `API_BASE_URL` 통일<br>- JSON Server는 `3000`, Live Server는 `8080` 사용을 명확히 구분            |

**수정 예시:**

```javascript
// 상품 ID 안전하게 가져오기
const productId = new URLSearchParams(window.location.search).get("id");

if (!productId) {
  alert("상품 정보를 찾을 수 없습니다.");
  window.location.href = "/web/index.html";
  return;
}

// 상품 정보 로드
const product = await API.getProduct(productId);
```

---

#### 10.4. 주문/결제 페이지 (Order/Payment)

| 문제                           | 원인                                                            | 해결 방법                                                                                                                    |
| :----------------------------- | :-------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **주문 데이터 전달 실패**      | localStorage 저장/조회 시점 오류<br>데이터 직렬화/역직렬화 오류 | - `JSON.stringify()`로 저장, `JSON.parse()`로 조회<br>- 데이터 저장 직후 바로 조회하여 검증<br>- try-catch로 파싱 에러 처리  |
| **결제 금액 계산 오류**        | 배송비 계산 로직 누락<br>수량 × 단가 계산 시 타입 변환 오류     | - `Number()` 또는 `parseInt()`로 명시적 타입 변환<br>- 배송비 조건부 로직 명확화<br>- 총 금액 = 상품 금액 + 배송비 공식 확인 |
| **입력 필드 유효성 검사 오류** | 정규식 패턴 오류<br>필수 필드 체크 누락                         | - 각 필드별 정규식 테스트 강화<br>- 모든 필수 필드 입력 확인 후 결제 버튼 활성화<br>- 실시간 유효성 검사 피드백 제공         |

**개선된 코드:**

```javascript
// localStorage 안전한 사용
function saveOrderData(data) {
  try {
    localStorage.setItem("orderData", JSON.stringify(data));
  } catch (error) {
    console.error("주문 데이터 저장 실패:", error);
    alert("주문 정보를 저장할 수 없습니다.");
  }
}

// 금액 계산 (명시적 타입 변환)
function calculateTotal(items) {
  const productTotal = items.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);

  const shippingFee = productTotal >= 50000 ? 0 : 3000;
  return productTotal + shippingFee;
}
```

---

### 11. 프로젝트

- **캐러셀 작동**
  메인 페이지의 Swiper 캐러셀이 자동으로 슬라이드되며, 사용자는 좌/우 버튼이나 터치 스와이프로 제어할 수 있습니다.

- **상품 목록 및 검색**
  탭 UI를 통해 카테고리별 상품을 필터링하고, 검색 기능으로 원하는 상품을 빠르게 찾을 수 있습니다.

- **회원가입 및 로그인**
  유효성 검사를 통해 올바른 형식의 데이터만 제출되며, JWT 토큰 기반 인증으로 안전하게 로그인됩니다.

- **상품 상세 및 장바구니**
  상품 상세 페이지에서 수량을 선택하고 장바구니에 담으면, 장바구니 페이지에서 실시간으로 총 금액이 계산됩니다.

- **주문 및 결제**
  장바구니에서 선택한 상품들이 주문서로 넘어가며, 배송 정보를 입력하면 결제 버튼이 활성화됩니다.

---

### 11. 개발하며 느낀점 (프로젝트 회고)

#### 11.1. 주요 성과

- **프레임워크 없는 개발 경험**: React, Vue 같은 프레임워크 없이 순수 JavaScript만으로 MPA를 구축하며, 웹의 기본 원리를 깊이 이해하게 되었습니다.
- **모듈화 설계의 중요성**: API 계층, 인증 모듈, 공통 레이아웃을 분리하여 코드 재사용성과 유지보수성을 크게 향상시켰습니다.
- **실전 협업 경험**: Git-flow 전략, Pull Request, 코드 리뷰를 통해 실무와 유사한 협업 프로세스를 경험했습니다.
- **접근성과 사용자 경험**: 키보드 접근성, 반응형 디자인, 에러 처리 등 사용자 중심의 개발을 실천했습니다.

#### 11.2. 개선점 및 배운 점

**긍정적 성과:**

- 팀원들과 서로 가르치고 배우는 문화를 통해 기술적 성장을 이끌어냈습니다.
- 프레임워크 없이도 모듈화 설계로 재사용성 높은 코드를 작성하는 경험을 쌓았습니다.

**개선이 필요한 부분:**

**1. 업무 분담 방식**

- 문제: 페이지 단위로 업무를 나누다 보니 모달, 유효성 검사 등 공통 기능이 중복 개발되었습니다.
- 영향: 코드 스타일 불일치, 수정 시 여러 파일 동기화 필요
- 개선 방향: 다음 프로젝트에서는 공통 기능을 먼저 함께 설계하고 구현한 뒤 페이지별 작업 시작

**2. 상태 관리**

- 복잡한 장바구니 상태 관리를 통해 전역 상태 관리의 필요성을 체감했습니다.
- 향후 경량 상태 관리 패턴(Context API 패턴) 도입을 고려하겠습니다.

**3. 테스트 코드**

- 시간 제약으로 테스트 코드를 작성하지 못했지만, 버그 사전 방지를 위해 단위 테스트와 통합 테스트의 중요성을 느꼈습니다.

**핵심 학습 내용:**

- **비동기 프로그래밍**: `async/await`, `Promise`, `fetch API` 활용
- **DOM 조작**: 프레임워크 없이 직접 DOM 조작하며 브라우저 렌더링 최적화 이해
- **Git 협업**: 브랜치 전략, 충돌 해결, 코드 리뷰 프로세스 체득
- **문제 해결**: 프레임워크 추상화 없이 근본 원리를 파악하는 능력 향상

---

### 12. Developers

#### 팀원

[고은표](https://github.com/goeunpyo8-debug)  
[김세윤](https://github.com/seyunkims)  
[장영재](https://github.com/YoungjaeJang7)  
 [김영종](https://github.com/ressna93)  
[장화연](https://github.com/Hwayeon842)

#### 저장소

🔗 **GitHub Repository**: [자두페이지 새싹코딩팀](https://github.com/zadupage/team1-JADUPAGE)

---

### 13. 라이선스

이 프로젝트는 학습 목적으로 제작되었으며, 상업적 사용을 금지합니다.

---

## 감사합니다!

**자두페이지(ZADU PAGE)** 프로젝트를 통해 Vanilla JavaScript의 기본 원리와 팀 협업의 중요성을 깊이 있게 배웠습니다.

프레임워크 없이 직접 구현하며 얻은 경험을 바탕으로, 앞으로도 사용자 중심의 웹 애플리케이션을 만들기 위해 노력하겠습니다.

---

**Made with by 새싹코딩팀**
