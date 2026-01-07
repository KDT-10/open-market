# 자두마켓 (ZaduMarket)

## 프로젝트 개요

이 문서는 '자두팀'이 진행한 바닐라 JS 기반 오픈마켓 서비스 프로젝트의 목표, 기능, 아키텍처, 팀원 역할 및 협업 과정을 상세히 기술한 문서입니다.

### 1. 목표와 기능

#### 1.1. 목표

본 프로젝트의 핵심 목표는 프레임워크의 도움 없이 순수 Vanilla JS만을 사용하여 웹 애플리케이션의 전체적인 구조를 설계하고 구현하는 경험을 쌓는 것입니다. 이를 통해 아래와 같은 세부 목표를 달성하고자 했습니다.

- **기술 목표**: Vanilla JS를 사용하여 컴포넌트 기반의 동적 MPA(Multi-Page Application)를 개발하고, 비동기 통신과 상태 관리의 기본 원리를 깊이 있게 이해합니다.
- **협업 목표**: Git-flow 전략에 기반한 버전 관리, Pull Request를 통한 코드 리뷰, 정기적인 소통을 통해 실전적인 팀 협업 프로세스를 경험하고 함께 성장합니다.
- **설계 목표**: 향후 유지보수와 기능 확장을 고려하여, 기능별로 책임이 명확히 분리된 모듈화 아키텍처를 설계하고 구현합니다.

#### 1.2. 기능

본 프로젝트에서 구현된 핵심 기능은 다음과 같습니다.

| 구분          | 주요 기능       | 상세 설명                                                                                |
| :------------ | :-------------- | :--------------------------------------------------------------------------------------- |
| **회원 인증** | 로그인/로그아웃 | JWT 토큰 기반의 인증을 처리하며, 로그인 성공 시 이전 페이지로 리다이렉트됩니다.          |
|               | 회원가입        | 아이디 중복 확인 API 연동 및 모든 입력값에 대한 유효성 검사를 수행합니다.                |
| **상품**      | 상품 목록 조회  | 메인 페이지에서 전체 상품 목록을 비동기적으로 불러와 동적 렌더링합니다.                  |
|               | 상품 상세 조회  | 상품 ID를 기반으로 특정 상품의 상세 정보를 불러와 렌더링합니다.                          |
|               | 상품 검색       | Header의 검색 기능을 통해 상품명으로 검색할 수 있습니다.                                 |
| **장바구니**  | 장바구니 관리   | 상품 추가, 삭제, 수량 변경이 가능하며, 모든 변경사항은 실시간으로 반영됩니다.            |
|               | 금액 계산       | 상품 선택 여부와 수량에 따라 총 상품금액, 할인, 배송비를 실시간으로 계산하여 표시합니다. |
| **주문/결제** | 주문서 생성     | 장바구니의 상품 정보를 바탕으로 수정 불가능한 주문서를 생성합니다.                       |
|               | 결제 프로세스   | 배송 정보 등 모든 필수 입력이 완료되어야 결제 버튼이 활성화됩니다.                       |

#### 1.3. 팀 구성

- **팀명**: 자두팀 (Team JADUPAGE)
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

##### 배포된 사이트 접속

배포된 웹사이트에 바로 접속하여 사용할 수 있습니다.

<!-- 🔗 **배포 URL**: [https://zadupage.github.io/team1-JADUPAGE/](https://zadupage.github.io/team1-JADUPAGE/) 발표전에 링크수정및 주석해제 -->

> 배포 버전은 GitHub Pages를 통해 호스팅되며, 별도의 설치 없이 브라우저에서 바로 사용 가능합니다.

##### 로컬 개발 환경 실행

개발자가 프로젝트를 수정하거나 로컬에서 실행하려면 다음 단계를 따르세요:

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
- `web/index.html` 또는 `Main.html` 파일에서 `Live Server`를 실행합니다.

---

### 3. 요구사항 명세와 기능 명세

#### 3.1. 개발 철학

프로젝트의 주요 과제는 프레임워크 없이, 다양한 역량을 가진 팀원들이 일관성 있는 코드를 작성할 수 있는 환경을 구축하는 것이었습니다. 이를 위해 저희는 **'기능의 모듈화'** 와 **'직관적인 인터페이스 제공'** 이라는 두 가지 원칙을 세웠습니다.

#### 3.2. 핵심 아키텍처

##### API 통신 계층 (api.js)

`api.js`는 프로젝트의 모든 서버 HTTP 요청을 중앙에서 관리하는 API 통신 계층입니다. 이 모듈의 핵심 목표는 통신의 복잡성을 추상화하여, 다른 파일들이 비즈니스 로직에만 집중할 수 있도록 합니다.

`fetchAPI(url, options)` 이 함수는 모든 fetch 요청이 거쳐가는 단일 관문(Gateway) 역할을 수행합니다.

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

**중앙화된 에러 처리**: 모든 API 요청에서 발생할 수 있는 에러(네트워크, HTTP 상태 코드 등)를 이 함수 한 곳에서 일관되게 처리합니다. 이를 통해 각 페이지의 비즈니스 로직에서 반복적인 try...catch 구문을 제거할 수 있습니다.

**표준화된 응답**: 204 No Content와 같은 특수한 성공 케이스를 처리하고, 에러 발생 시 일관된 구조의 에러 객체를 반환하여 호출부가 안정적으로 후속 처리를 할 수 있도록 돕습니다.

---

##### 인증 관리 계층 (layout.js)

`layout.js`는 JWT(JSON Web Token) 기반 인증의 전체 생명주기를 관리합니다. 이 모듈의 가장 중요한 설계 목표는 토큰 만료 시 자동 로그아웃을 처리하여, 사용자 경험을 향상시키는 것입니다.

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

---

##### 공통 레이아웃 모듈 (layout.html, layout.js)

`layout.html`과 `layout.js`는 여러 페이지에서 반복적으로 사용되는 Header와 Footer를 컴포넌트화하여, 코드 중복을 방지하고 프로젝트 전체의 UI 일관성을 유지하는 역할을 합니다.

각 페이지는 동적으로 공통 레이아웃을 로드하여 사용합니다.

```javascript
// 사용 예시
fetch("../../components/layout.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("header").innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector("header").outerHTML;
  });
```

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
📂 zadumarket/
├── 📂 web/
│   ├── 📂 assets/
│   │   ├── 📂 icons/              # 아이콘 파일
│   │   └── 📂 images/             # 이미지 파일
│   ├── 📂 components/
│   │   ├── 📜 layout.html         # 공통 헤더/푸터
│   │   ├── 📜 layout.js           # 레이아웃 로직 및 인증
│   │   └── 📜 layout.css          # 레이아웃 스타일
│   ├── 📂 pages/
│   │   ├── 📂 cart/
│   │   │   ├── 📜 cart.html       # 장바구니 페이지
│   │   │   └── 📜 cart.js
│   │   ├── 📂 login/
│   │   │   ├── 📜 login.html      # 로그인 페이지
│   │   │   └── 📜 login.js
│   │   ├── 📂 signup/
│   │   │   ├── 📜 signup.html     # 회원가입 페이지
│   │   │   └── 📜 signup.js
│   │   ├── 📂 product-details/
│   │   │   ├── 📜 product-details.html  # 상품 상세 페이지
│   │   │   └── 📜 product-details.js
│   │   └── 📂 order/
│   │       ├── 📜 order.html      # 주문/결제 페이지
│   │       └── 📜 order.js
│   ├── 📂 scripts/
│   │   ├── 📜 api.js              # API 통신 계층
│   │   └── 📜 main.js             # 메인 페이지 로직
│   ├── 📂 styles/
│   │   ├── 📜 variables.css       # CSS 변수 정의
│   │   ├── 📜 fonts.css           # 폰트 스타일
│   │   ├── 📜 main.css            # 메인 페이지 스타일
│   │   ├── 📜 login.css
│   │   ├── 📜 signup.css
│   │   ├── 📜 cart.css
│   │   ├── 📜 order.css
│   │   ├── 📜 product-details.css
│   │   └── 📜 404.css
│   ├── 📜 index.html              # 메인 페이지
│   ├── 📜 404.html                # 404 에러 페이지
│   └── 📜 404.js
├── 📂 server/
│   └── 📜 db.json                 # JSON Server 데이터베이스
├── 📜 Main.html                   # 진입점
├── 📜 package.json
├── 📜 package-lock.json
├── 📜 .gitignore
├── 📜 .prettierrc
└── 📜 README.md
```

#### 4.2. 개발 일정 (WBS)

**기간**: 2025년 12월 30일 ~ 2026년 1월 8일 (10일간)

프로젝트의 상세 일정 및 작업 분배는 Notion을 통해 관리되었습니다. 주차별 목표와 개인별 할당 작업 내역을 칸반 보드 형식으로 확인하고, Discord로 실시간 작업 상황을 공유하며 진행 상황을 추적했습니다.

[🌐 Notion TODOLIST 링크](https://www.notion.so/1-8b2d79c7a4804539ae592c923cc2e1fb)

| 기간          | 주요 작업                                                                   |
| :------------ | :-------------------------------------------------------------------------- |
| 12/30 ~ 01/02 | 프로젝트 기획, 요구사항 정의, Git-flow 전략 수립                            |
| 01/03 ~ 01/05 | 핵심 아키텍처 구축 (API 계층, 인증 모듈, 공통 레이아웃)                     |
| 01/06 ~ 01/07 | 페이지별 기능 개발 (메인, 로그인, 회원가입, 상품 상세, 장바구니, 주문/결제) |
| 01/08         | 통합 테스트, 버그 수정, 최종 발표 준비                                      |

---

### 5. 역할 분담

각 팀원은 다음과 같은 목표와 의도를 가지고 역할을 수행했습니다.

| 담당 페이지 / 역할  | 담당자                                                                                                                                                               | 주요 업무                                                                                    |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | --- |
| **메인 페이지**     | [장화연](https://github.com/Hwayeon842)                                                                                                                              | 상품 목록 렌더링, 캐러셀 구현, 탭 UI, 검색 기능, 페이지네이션 구현                           |
| **로그인,회원가입** | [고은표](https://github.com/goeunpyo8-debug)                                                                                                                         | JWT 기반 로그인 구현, 토큰 관리, 자동 로그아웃 기능 구현                                     |     |
| **상품상세,404**    | [장영재](https://github.com/YoungjaeJang7)                                                                                                                           | 상품 상세 정보 렌더링, 수량 조절 기능, 장바구니 담기 기능 구현                               |
| **메인,장바구니**   | [김영종](https://github.com/ressna93)                                                                                                                                | 장바구니 상태 관리, 수량 조절, 삭제 기능, 총 금액 계산, 주문 연동                            |
| **주문/결제**       | [김세윤](https://github.com/seyunkims)                                                                                                                               | 주문서 생성, 배송 정보 입력, 결제 수단 선택, 최종 결제 금액 계산                             |
| **공통 아키텍처**   | [고은표](https://github.com/goeunpyo8-debug),[김세윤](https://github.com/seyunkims),[김영종](https://github.com/ressna93),[장영재](https://github.com/YoungjaeJang7) | API 통신 계층 설계, 공통 레이아웃 컴포넌트, 404 페이지, Git-flow 전략 수립 및 코드 리뷰 참여 |

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

메인 페이지에서 Swiper.js 라이브러리를 활용하여 반응형 캐러셀을 구현했습니다. 루프, 페이징, 이전/다음 버튼, 자동재생, 터치 스와이프를 모두 지원합니다.

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
  });
}
```

#### 6.3. 비동기 데이터 로딩 및 에러 처리

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

#### 6.4. 반응형 디자인

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

#### 6.5. 접근성 (A11y)

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

### 10. 프로젝트 시연 영상

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

#### 11.2. 개선점

> - 팀원들 과 함께하는 환경에서 서로 다독여주고 가르쳐주고 배우는 문화를 통해 팀원들 의 기술 능력 책임감 의 성장을 이끌어냈습니다.

> - 프레임워크 없이도 모듈화 설계를 통해 재사용성과 유지보수성이 높은 코드를 작성하는 경험을 쌓았습니다.

- **업무 분담 방식의 개선**: 프로젝트 초반에 각자 맡은 페이지를 개발하는 방식으로 업무를 나눴습니다. 그런데 모달창, 유효성 검사 같은 공통 기능들이 여러 페이지에서 반복적으로 필요해지면서 예상치 못한 문제가 생겼습니다. 같은 기능을 각자 다르게 구현하다 보니 코드 스타일이 달라지고, 한 곳에서 수정사항이 생기면 다른 페이지에도 반영해야 해서 소통 해야하는 시간 많이 늘었습니다. 다음 프로젝트에서는 먼저 공통으로 사용할 기능들을 함께 설계하고 구현한 뒤, 각자 페이지 작업을 시작하는 방식이 더 효율적일 것 같습니다. 이렇게 하면 코드의 일관성도 유지하고, 불필요한 중복 작업도 줄일 수 있을 것입니다.
-
- **상태 관리**: 복잡한 장바구니 상태를 관리하며 전역 상태 관리의 필요성을 느꼈습니다. 향후 프로젝트에서는 경량 상태 관리 패턴을 도입하는 것을 고려하겠습니다.
-
- **테스트 코드**: 시간 제약으로 테스트 코드를 작성하지 못했지만, 버그를 사전에 방지하기 위해 단위 테스트와 통합 테스트가 필요함을 느꼈습니다.

#### 11.3. 배운 점

- **비동기 프로그래밍**: `async/await`, `Promise`, `fetch API`를 활용하며 비동기 처리의 흐름을 깊이 이해했습니다.
- **DOM 조작과 이벤트 처리**: 프레임워크의 도움 없이 DOM을 직접 조작하며, 브라우저 렌더링 최적화의 중요성을 깨달았습니다.
- **Git 협업**: 브랜치 전략, 충돌 해결, 코드 리뷰 프로세스를 체득하며 팀 협업 역량을 키웠습니다.
- **문제 해결 능력**: 프레임워크가 제공하는 추상화 없이 문제를 해결하며, 근본적인 원리를 파악하는 능력이 향상되었습니다.

---

### 12. Developers

#### 팀원

[고은표](https://github.com/goeunpyo8-debug)  
[김세윤](https://github.com/seyunkims)  
[장영재](https://github.com/YoungjaeJang7)  
 [김영종](https://github.com/ressna93)  
[장화연](https://github.com/Hwayeon842)

#### 저장소

[자두페이지 팀1](https://github.com/zadupage/team1-JADUPAG)
<img src='https://cdn.jsdelivr.net/npm/simple-icons@3.0.1/icons/github.svg' alt='github' height='40' style="display:inline-block; vertical-align:middle;margin-right:10px;">

---

### 13. 라이선스

이 프로젝트는 학습 목적으로 제작되었으며, 상업적 사용을 금지합니다.

---

## 감사합니다!

자두마켓 프로젝트를 통해 Vanilla JavaScript의 힘과 팀 협업의 중요성을 배웠습니다. 앞으로도 사용자 중심의 웹 애플리케이션을 만들기 위해 노력하겠습니다.
