# 자두마켓 (ZaduMarket)

바닐라 JavaScript 기반 오픈마켓 서비스 프로젝트

---

## 1. 프로젝트 개요

자두마켓은 프레임워크 없이 순수 Vanilla JavaScript만을 사용하여 개발한 오픈마켓 서비스입니다. 이 프로젝트는 웹 애플리케이션의 전체적인 구조를 설계하고 구현하는 경험을 통해, 프론트엔드 개발의 기본 원리를 깊이 있게 이해하는 것을 목표로 합니다.

---

## 2. 목표와 기능

### 2.1. 목표

- **기술 목표**: Vanilla JavaScript를 사용하여 컴포넌트 기반의 동적 MPA(Multi-Page Application)를 개발하고, 비동기 통신과 상태 관리의 기본 원리를 이해합니다.
- **협업 목표**: Git-flow 전략에 기반한 버전 관리, Pull Request를 통한 코드 리뷰, 정기적인 소통을 통해 실전적인 팀 협업 프로세스를 경험합니다.
- **설계 목표**: 향후 유지보수와 기능 확장을 고려하여, 기능별로 책임이 명확히 분리된 모듈화 아키텍처를 설계하고 구현합니다.

### 2.2. 주요 기능

| 구분          | 주요 기능       | 상세 설명                                                                                |
| :------------ | :-------------- | :--------------------------------------------------------------------------------------- |
| **회원 인증** | 로그인/로그아웃 | JWT 토큰 기반의 인증을 처리하며, 로그인 성공 시 이전 페이지로 리다이렉트됩니다.          |
| **상품**      | 상품 목록 조회  | 메인 페이지에서 전체 상품 목록을 비동기적으로 불러와 동적 렌더링합니다.                  |
|               | 상품 상세 조회  | 상품 ID를 기반으로 특정 상품의 상세 정보를 불러와 렌더링합니다.                          |
| **장바구니**  | 장바구니 관리   | 상품 추가, 삭제, 수량 변경이 가능하며, 모든 변경사항은 실시간으로 반영됩니다.            |
|               | 금액 계산       | 상품 선택 여부와 수량에 따라 총 상품금액, 할인, 배송비를 실시간으로 계산하여 표시합니다. |
| **주문/결제** | 주문서 생성     | 장바구니의 상품 정보를 바탕으로 주문서를 생성합니다.                                     |
|               | 결제 프로세스   | 배송 정보 등 모든 필수 입력이 완료되어야 결제 버튼이 활성화됩니다.                       |

---

## 3. 협업 도구

- **버전 관리**: Git, GitHub
- **커뮤니케이션**: Discord
- **프로젝트 관리**: Notion
- **디자인**: Figma
- **코드 스타일**: Prettier

---

## 4. 요구사항 명세와 기능 명세

### 4.1. 개발 철학

프로젝트의 주요 과제는 프레임워크 없이, 다양한 역량을 가진 팀원들이 일관성 있는 코드를 작성할 수 있는 환경을 구축하는 것이었습니다. 이를 위해 **기능의 모듈화**와 **직관적인 인터페이스 제공**이라는 두 가지 원칙을 세웠습니다.

### 4.2. 핵심 아키텍처

- **API 통신 계층**: 모든 서버 HTTP 요청을 중앙에서 관리하여 통신의 복잡성을 추상화
- **인증 관리**: JWT 기반 인증의 전체 생명주기를 관리하며, 토큰 갱신 과정을 자동화
- **공통 모듈**: 반복적으로 사용되는 UI 로직을 모듈화하여 코드 중복 방지 및 일관성 유지

### 4.3. 상세 요구사항

#### 4.3.1. 디자인 및 범위

- 피그마를 참고하여 디자인을 완성합니다.
- **대상**: 메인 페이지 제작 + 주요 서브 페이지 제작
- **기술**: HTML, CSS 또는 Sass(컴파일된 CSS), JavaScript(프레임워크 미사용)
- **반응형**: 모바일 퍼스트, 주요 브레이크 포인트 480, 768, 1200을 기점으로 자유롭게 추가할 수 있다.
- **배포**: GitHub Pages에 정적 호스팅한다.

#### 4.3.2. 페이지별 기능 명세

**메인 페이지 (`/index.html`)**
- 전체 상품 목록 표시
- 페이지네이션 지원
- 상품 카드 형태로 표시 (이미지, 판매자명, 상품명, 가격)
- Header 검색 기능

**회원가입 (`signup.html`)**
- 아이디(이메일), 비밀번호, 비밀번호 확인, 이름, 전화번호 입력
- 아이디 중복 확인 (`POST /api/accounts/validate-username`)
- 비밀번호 확인 일치 체크
- 전화번호 형식 검증 (010-XXXX-XXXX)
- 회원가입 API 호출 (`POST /api/accounts/buyer/signup`)

**로그인 (`signin.html`)**
- 아이디, 비밀번호 입력
- 구매회원/판매회원 탭 선택
- 로그인 API 호출 (`POST /api/accounts/signin`)
- JWT 토큰 및 사용자 정보를 LocalStorage에 저장
- 로그인 성공 시 메인 페이지로 이동

**로그아웃**
- LocalStorage에서 토큰 및 사용자 정보 삭제
- 로그인 페이지로 이동

**상품 상세 조회 (`detail.html`)**
- 상품 카드 클릭 시 상세 페이지로 이동 (querystring으로 product_id 전달)
- 상품 상세 정보 표시 (`GET /api/products/:product_id`)
- 판매자명, 상품명, 가격, 배송비, 재고 표시
- 수량 선택 기능 (+/- 버튼, 최소 1개, 최대 재고 수량)
- 총 가격 계산 표시 ((가격 + 배송비) × 수량)

**장바구니 (`cart.html`)**
- SessionStorage에서 cartData 불러오기 또는 API 호출 (`GET /api/cart/`)
- 상품 이미지, 이름, 가격, 수량, 배송비, 총 가격 표시
- +/- 버튼으로 수량 조절 (최소 1개)
- SessionStorage 업데이트 또는 API 호출 (`PUT /api/cart/:cart_item_id/`)
- 개별 상품 총 가격 재계산
- 총 결제 금액 표시

**주문/결제 (`order.html`)**
- SessionStorage에서 orderData 불러오기
- 주문 상품 목록 표시 (상품명, 수량, 가격, 배송비)
- 배송 정보 입력 (받는 사람, 휴대폰 번호, 주소, 배송 메시지)
- 결제 수단 선택 (카드, 무통장입금, 휴대폰, 네이버페이, 카카오페이)
- 최종 결제 금액 표시

#### 4.3.3. 공통 레이아웃 요구사항

**Header**
- 상단 고정(Sticky Header): 스크롤시 헤더를 고정한다. [필수]
- 모든 페이지 공통으로 사용한다. (단, 로그인/회원가입 페이지 제외) [필수]

**Footer**
- 하단 회사 정보 표시
- 모든 페이지 공통으로 사용한다. (단, 로그인/회원가입 페이지 제외) [필수]

### 4.4. 기술 요구사항

#### 4.4.1. 탭 UI [필수]

- 라이브러리 및 플러그인 사용없이 바닐라 자바스크립트로 작성한다.
- 클릭 및 키보드로 탭 전환이 가능하다. [옵션]
- 키보드 조작: 좌/우 화살표로 탭 이동, Home/End로 처음/마지막 탭으로 이동한다. [옵션]
- 초기 렌더링 시 첫 탭이 활성화되어야 한다.

#### 4.4.2. 슬라이드(캐러셀) [옵션]

- 공개 라이브러리 활용 (예: **Swiper.js**)
- 기능: 루프, 페이징, 이전/다음, 터치 스와이프, 자동재생(Autoplay) 지원

#### 4.4.3. 비동기 프로그래밍/데이터 렌더링/예외처리 [필수]

**데이터 소스**
- API (예: `/api/products`)를 `fetch`로 로드한다.

```javascript
// /api/products 응답 예시
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Hack Your Life 개구리 노트북 파우치",
      "info": "우당탕탕 라이언의 실무생",
      "image": "./assets/images/product1.png",
      "price": 29000,
      "shipping_method": "PARCEL",
      "shipping_fee": 1000,
      "stock": 8,
      "seller": {
        "username": "seller@test.com",
        "name": "이스트2",
        "phone_number": "010-1111-2222",
        "user_type": "SELLER",
        "company_registration_number": "1122334455",
        "store_name": "이스트가게"
      },
      "created_at": "2024-10-27T10:30:00.000Z",
      "updated_at": "2025-11-18T03:29:19.984Z"
    }
  ]
}
```

**비동기 로딩 절차**
- `try/catch/finally`로 `fetch` 수행한다.
- 로딩 상태에서 스켈레톤 UI를 표시한다. [옵션]
- 성공 시 DOM 템플릿을 이용해 상품 목록을 렌더링한다.
- 실패 시 사용자 친화 메시지와 재시도 버튼을 제공한다. [옵션]

#### 4.4.4. 반응형/레이아웃 [필수]

- 컨테이너 폭은 구간별 `min-width`로 제어한다.
- 수평 스크롤이 발생하지 않는다.

#### 4.4.5. 접근성(A11y) [필수]

- 이미지에 대체 텍스트를 제공한다.
- 인터랙티브 요소는 키보드 탭 순서를 보장한다.
- 명도 대비 WCAG AA 준수(텍스트 대비 4.5:1 이상)한다.

#### 4.4.6. 코드 스타일/폴더 구조 (예시)

```
/assets
  /images
  /icons
/styles
  /base/reset.css
  /base/variables.css
  /base/typography.css
  /components/header.css
  /components/tab.css
  /components/footer.css
  /pages/index.css
/js
  /common/header.js
  /common/validation.js
  cart.js
  config.js
  detail.js
  order.js
  signin.js
  signup.js
  script.js
index.html
detail.html
cart.html
order.html
signin.html
signup.html
404.html
```

### 4.5. 품질 보증 체크리스트

#### 기능 테스트
- [ ] Sticky Header 스크롤시 헤더는 고정된다.
- [ ] footer는 모든 페이지에서 공통으로 사용한다. (로그인, 회원가입 페이지 제외)
- [ ] 탭 UI: 마우스/키보드 전환이 된다.
- [ ] 슬라이드: 스와이프·자동재생·prev, next 버튼 클릭시 페이지 이동된다.
- [ ] 비동기 렌더: 로딩중/성공/실패의 케이스가 재현된다.

#### 반응형
- [ ] 미디어 쿼리 구간에서 깨짐이 없다.

#### 접근성
- [ ] 탭 순서/포커스/aria 속성 검수 완료.

#### 성능
- [ ] 이미지 lazy, CLS 없음(레이아웃이 갑자기 움직이지 않음), 불필요 리플로우 없음(DOM 구조 재배치가 거의 발생하지 않음).

---

## 5. 프로젝트 구조

```
zadumarket/
├── web/
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── styles/            # CSS 파일
│   │   ├── variables.css  # CSS 변수 (색상, 폰트 등)
│   │   ├── reset.css      # CSS 리셋
│   │   ├── common.css     # 공통 유틸리티 클래스
│   │   └── global.css     # 메인 CSS (모든 스타일 import)
│   ├── assets/            # 정적 파일
│   │   ├── images/        # 이미지 파일
│   │   └── fonts/         # 폰트 파일
│   └── utils/             # 유틸리티 함수
└── public/                # 공개 파일
```

---

## 6. 개발 일정

**기간**: 2025년 12월 30일 ~ 2026년 1월 8일

프로젝트의 상세 일정 및 작업 분배는 Notion을 통해 관리되었습니다.

[📋 Notion TODOLIST 바로가기](https://www.notion.so/1-8b2d79c7a4804539ae592c923cc2e1fb)

---

## 7. 역할 분담

| 담당 페이지      | 담당자                                       |
| :--------------- | :------------------------------------------- |
| 메인, 404 페이지 | [장화연](https://github.com/Hwayeon842)      |
| 로그인           | [고은표](https://github.com/goeunpyo8-debug) |
| 상품 상세        | [장영재](https://github.com/YoungjaeJang7)   |
| 장바구니         | [김영종](https://github.com/ressna93)        |
| 주문/결제        | [김세윤](https://github.com/seyunkims)       |

---

## 8. 화면 설계

프로젝트의 전체적인 UI/UX 디자인은 제공된 피그마(Figma) 시안을 기반으로 구현되었습니다.

---

## 9. Developers

### 팀원

- **김영종** - [GitHub](https://github.com/ressna93)
- **고은표** - [GitHub](https://github.com/goeunpyo8-debug)
- **장화연** - [GitHub](https://github.com/Hwayeon842)
- **김세윤** - [GitHub](https://github.com/seyunkims)
- **장영재** - [GitHub](https://github.com/YoungjaeJang7)

---
