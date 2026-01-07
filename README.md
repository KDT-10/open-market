# Open Market 프로젝트 발표 자료

<div align="center">
  
  <img src="./web/assets/images/logo-jadu-lg.png" alt="ZADU Logo" width="320"/>
  
  <p>구매자·판매자 모두를 위한 오픈마켓 플랫폼</p>
  <p>
    <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
    <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
    <img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white">
    <img src="https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">
  </p>
</div>

## 🎯 목차
- 🌟 빠른 실행 가이드
- 🧭 프로젝트 개요
- 🛠️ 기술 스택
- 📦 기본 데이터
- 🚀 핵심 기능
- 🧩 프론트 흐름
- 🧰 공통 유틸
- 🌐 API 요약
- 🗂️ 파일 구조
- 🤝 역할 & 협업
- 🔧 한계 / 개선

## 🌟 빠른 실행 가이드
| 단계 | 명령 | 비고 |
| --- | --- | --- |
| 1 | npm install | 의존성 설치 |
| 2 | npm run dev | 프론트: http://localhost:8080 |
| 3 | npm start | API: http://localhost:3000 |
| 4 | Swagger | http://localhost:3000/api-docs |

### 폴더 한눈에 보기
```text
open-market/
├─ web/                    # 💻 정적 프론트
│  ├─ index.html ...       # 🏗️ 페이지 엔트리 (cart, detail, order 등)
│  ├─ assets/              # 🎨 아이콘·이미지 리소스
│  ├─ components/          # 🧩 공통 UI 조각(header/footer 등)
│  ├─ js/
│  │  ├─ common/           # 🛠️ 공통 로직(auth/config 등)
│  │  └─ pages/            # 📜 페이지별 스크립트
│  └─ styles/              # 🎨 스타일 (base/components/pages)
├─ server/                 # 🗄️ API 서버
│  ├─ server.js            # 🔌 Express + json-server 엔트리
│  └─ db.json              # 🗃️ 샘플 데이터 (users, products)
├─ package.json            # 📦 스크립트/의존성
└─ jsconfig.json           # 🧭 경로 설정
```

### 파일 간 연계도

<table>
<tr>
<th width="150">📄 페이지 파일</th>
<th width="200">🛠️ 사용하는 공통 모듈</th>
<th width="250">🔌 호출하는 API</th>
</tr>
<tr>
<td><code>index.js</code></td>
<td><code>config.js</code></td>
<td><code>GET /products</code></td>
</tr>
<tr>
<td><code>detail.js</code></td>
<td><code>config.js</code><br><code>auth.js</code><br><code>modal.js</code></td>
<td><code>GET /products/:id</code></td>
</tr>
<tr>
<td><code>cart.js</code></td>
<td><code>config.js</code><br><code>auth.js</code><br><code>modal.js</code></td>
<td><code>GET /cart</code><br><code>DELETE /cart/:id</code></td>
</tr>
<tr>
<td><code>order.js</code></td>
<td><code>config.js</code><br><code>auth.js</code><br><code>modal.js</code></td>
<td><code>POST /order</code></td>
</tr>
<tr>
<td><code>signin.js</code></td>
<td><code>config.js</code><br><code>auth.js</code><br><code>modal.js</code></td>
<td><code>POST /accounts/signin</code><br><code>POST /accounts/token/refresh</code></td>
</tr>
<tr>
<td><code>signup.js</code></td>
<td><code>config.js</code><br><code>validation.js</code><br><code>modal.js</code></td>
<td><code>POST /accounts/buyer/signup</code><br><code>POST /accounts/validate-username</code></td>
</tr>
<tr>
<td><code>seller-main.js</code></td>
<td><code>config.js</code><br><code>auth.js</code></td>
<td><code>GET /products/seller</code></td>
</tr>
<tr>
<td><code>seller-center.js</code></td>
<td><code>config.js</code><br><code>auth.js</code><br><code>modal.js</code></td>
<td><code>POST /products</code><br><code>PUT /products/:id</code></td>
</tr>
</table>

**🔗 공통 모듈 간 의존성**
```
auth.js → config.js (API Base URL)
header.js → auth.js (로그인 상태), modal.js (로그아웃 확인)
layout.js → header.js, footer 컴포넌트 로드
```

## 🧭 프로젝트 개요

- 목표: 구매자·판매자가 모두 쓸 수 있는 반응형 오픈마켓 서비스 플랫폼

- 구성: 정적 웹(web/) + Express+json-server API(server/server.js) + Swagger(/api-docs)
- 배포: 로컬/배포 환경에 따라 API Base URL 자동 분기(config.js)

## 🛠️ 기술 스택

### 개발 환경
<div>
<img width="90" src="https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white">
<img width="80" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
<img width="95" src="https://img.shields.io/badge/Sourcetree-0052CC?style=for-the-badge&logo=sourcetree&logoColor=white">
<img width="75" src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white">
</div>

### Front-End
<div>
<img width="58" src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> 
<img width="45" src="https://img.shields.io/badge/CSS-0078D7?style=for-the-badge&logo=CSS3&logoColor=white"> 
<img width="85" src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
</div>

### Back-End / API
<div>
<img width="80" src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white"> 
<img width="96" src="https://img.shields.io/badge/json%20server-ff6c37?style=for-the-badge&logo=json&logoColor=white">
<img width="90" src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white">
<img width="90" src="https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">
</div>

### 라이브러리 / 도구
<div>
<img width="100" src="https://img.shields.io/badge/http%20server-FF6C37?style=for-the-badge&logo=npm&logoColor=white">
<img width="90" src="https://img.shields.io/badge/Swiper.js-6332F6?style=for-the-badge&logo=swiper&logoColor=white">
</div>

## 📦 기본 데이터 (server/db.json)
- 샘플 계정: 구매자 buyer@test.com / 1234, 판매자 seller@test.com / 1234
- 상품 5종, 장바구니·주문은 초기 빈 배열

## 🚀 핵심 기능 (요약표)
| 영역 | 주요 기능 | 설명 |
| --- | --- | --- |
| 회원 | 로그인/로그아웃 | JWT 기반 인증, 만료 시 refresh 재발급 |
|  | 회원가입 | 구매자/판매자 분기, 아이디·사업자번호 중복 확인 |
| 상품 | 상품 목록/검색 | /products 페이지네이션·검색, 판매자별 목록 |
|  | 상품 상세 | 이미지·가격·배송비·재고 표시, 수량 조절/총액 계산 |
| 장바구니 | 담기/삭제/수량 | 선택/합계/배송비 계산, 세션 스토리지 기반 UI |
| 주문 | 바로구매/카트주문 | 재고·총액 검증 후 주문 데이터 적재(프론트) |

## 🧩 프론트 흐름 (web/js/pages)
- index.js: /products로 카드 렌더링, 클릭 시 detail 이동
- detail.js: 상세/수량/총액 계산, cartData·orderData 세션 저장, 장바구니·바로구매 모달
- cart.js: cartData 렌더링, 수량/선택/삭제, 선택 항목을 orderData로 전달 후 order.html 이동
- order.js: 로그인 필수, orderData 요약 후 결제 완료 모달(실제 주문 API 호출 없음)
- signin.js: 구매/판매 탭 로그인, user_type 불일치 안내, 토큰·user 저장 후 redirectAfterLogin 이동
- signup.js: 구매/판매 탭 회원가입, 이메일·비밀번호·전화 검증, 아이디·사업자번호 중복확인

## 🧰 공통 유틸 (web/js/common)
- config.js: API_BASE_URL (로컬 3000 / 배포 도메인)
- auth.js: 토큰 저장/로그인 여부, 401 시 refresh 재발급, 미로그인 접근 시 모달 후 redirect
- modal.js: 공통 모달 컴포넌트 로딩/표시
- validation.js: 이메일·전화 등 입력 검증 헬퍼
- header.js: 로고 이동, 검색(현재 알림만), 장바구니 이동, 사용자 아이콘(로그아웃 모달 또는 로그인 이동)

## 🌐 API 요약

| 기능 | Method | Endpoint | 인증 |
| --- | --- | --- | --- |
| 구매자 회원가입 | POST | /accounts/buyer/signup | ❌ |
| 판매자 회원가입 | POST | /accounts/seller/signup | ❌ |
| 아이디 중복 확인 | POST | /accounts/validate-username | ❌ |
| 사업자번호 확인 | POST | /accounts/seller/validate-registration-number | ❌ |
| 로그인 | POST | /accounts/signin | ❌ |
| 액세스 토큰 리프레시 | POST | /accounts/token/refresh | ❌ |
| 상품 목록 | GET | /products | ❌ |
| 판매자별 상품 목록 | GET | /{seller_name}/products | ❌ |
| 상품 상세 | GET | /products/{product_id} | ❌ |
| 상품 수정 | PUT | /products/{product_id} | ❌ |
| 상품 삭제 | DELETE | /products/{product_id} | ✅ |
| 장바구니 목록 | GET | /cart/ | ❌ |
| 장바구니 추가 | POST | /cart/ | ✅ |
| 장바구니 전체 삭제 | DELETE | /cart/ | ✅ |
| 장바구니 상세 | GET | /cart/{cart_item_id} | ✅ |
| 장바구니 수정 | PUT | /cart/{cart_item_id}/ | ✅ |
| 장바구니 삭제 | DELETE | /cart/{cart_item_id}/ | ✅ |
| 주문 생성(바로/카트) | POST | /order/ | ✅ |
| 주문 목록 | GET | /order/ | ✅ |
| 주문 상세 | GET | /order/{order_pk}/ | ✅ |
| 주문 취소 | DELETE | /order/{order_pk}/ | ✅ |

## 🗂️ 파일 구조
```text
web/      # 정적 자원(HTML, CSS, JS, 이미지, 컴포넌트)
server/   # 서버 엔트리(server.js), 데이터베이스(db.json)
package.json
```

## 🤝 역할 & 협업
- Front: 페이지 스크립트, 공통 모달/유효성, 장바구니·주문 UX
- Back(API): json-server 데이터 시드, JWT 인증, Swagger 문서화
- 툴: GitHub / PR 리뷰, VS Code, Swagger UI로 스펙 공유

## 🔧 한계 / 개선
- 세션스토리지 기반 장바구니·주문과 API 장바구니·주문을 일원화 필요
- 검색 UI는 알림만 표시 → /products?search=… 연동 필요
- SECRET_KEY 하드코딩 → 환경변수 분리 필요
- 주문/결제 페이지에 실제 주문 API 연동 및 예외 처리 강화 필요


