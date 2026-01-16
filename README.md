# Open Market 프로젝트 발표 자료

<div align="center">
  <h1>고양이가 짜준 코드 팀 프로젝트</h1>
  <img src="./web/assets/images/cat.gif" alt="팀 배너">
  <p>구매자·판매자 모두를 위한 오픈마켓 플랫폼</p>
  <p>
    <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
    <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
    <img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white">
    <img src="https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">
  </p>
</div>

## 프로젝트 개요

이 문서는 '고양이가 짜준 코드' 팀이 진행한 오픈 마켓 서비스 프로젝트의 목표, 기능, 팀원 역할 등을 기술한 문서입니다.

### 1. 목표 및 기능

#### 1.1. 목표

프레임워크나 라이브러리 없이 순수 HTML, CSS, JavaScript만을 활용하여 오픈 마켓 웹 서비스를 구현하고, 상품 조회, 장바구니, 결제 등 실제 상거래 기능을 직접 설계하고 개발하는 것을 목표로 합니다.

#### 1.2. 주요 기능

- 공통
  - 공용 컴포넌트(헤더, 푸터, 탭, 모달)
  - 공용 기능(Validation, Auth)
  - 검색(API 연동)
- 메인
  - 캐러셀(Swiper.js 활용)
  - 상품 목록 렌더링(API 연동)
- 로그인
  - API 연동 JWT 발급
- 회원가입
  - API 연동을 통한 validation
  - API 연동 회원가입
- 상품 상세
  - API 연동 상품 정보 렌더링
  - 상품 수량 수정, 가격 계산
  - SessionStorage로 장바구니/주문 데이터 유지
- 장바구니
  - SessionStorage, API 연동 상품 정보 렌더링
  - 상품 수량 수정, 가격 계산
  - 상품 선택하여 SessionStorage로 주문 데이터 유지
- 주문/결제
  - SessionStorage, API 연동 상품 정보 렌더링
  - 모든 입력에 대한 validation
- 판매자 센터
  - LocalStorage 데이터를 토대로 사용자 타입을 판단하여 판매자 센터/장바구니 버튼 hidden 토글

#### 1.3. 팀 구성

- **팀명**: 고양이가 짜준 코드
- **팀원**: 신영환, 신지수, 박철우, 김동희, 강은성

---

### 2. 개발 환경 및 실행 방법

#### 2.1. 개발 환경

- **언어**:
  <div>
  <img  width=58 src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img  width=45 src="https://img.shields.io/badge/CSS-0078D7?style=for-the-badge&logo=CSS&logoColor=white"> <img width=85 src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img  width=64 src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">
  </div>
- **방식**: MPA (Multi-Page Application)
- **협업 도구**: Git, GitHub, Discord, Notion
- **코드 스타일**: Prettier

#### 2.2. 실행 방법

- 로컬 환경에서의 실행 방법

1.  프로젝트를 로컬에 클론합니다.
2.  VSCode로 프로젝트 루트를 열고 터미널에서 `npm run dev`를 입력하여 프론트엔드 서버를 실행합니다.
3.  VSCode로 프로젝트 루트를 열고 터미널에서 `npm start`를 입력하여 백엔드 서버를 실행합니다.
4.  프론트엔드 서버가 열어준 링크(기본값: http://127.0.0.1:8080)로 이동합니다.

---

### 3. 프로젝트 구조와 개발 일정

#### 3.1. 프로젝트 구조

```text
📂openmarket_project
├ 📂node_modules
├ 📂server
│ ├ 📜db.json
│ └ 📜server.js
├ 📂web
│ ├ 📂assets
│ │ └ 🎨이미지 파일
│ ├ 📂components
│ │ └ 📜html 컴포넌트 파일
│ ├ 📂js
│ │ ├ 📂common
│ │ │ └ 📜공통 기능
│ │ └ 📂pages
│ │   └ 📜각 페이지에 대한 기능
│ └ 📂styles
│   ├ 📂base
│   │ ├ 📜reset.css
│   │ └ 📜variables.css
│   ├ 📂components
│   ├ └ 📜공통 컴포넌트 스타일
│   └ 📂pages
│     └ 📜각 페이지에 대한 스타일
├ 📜index.html
├ 📜기타 페이지들...
├ 📜.gitignore
├ 📜jsconfig.json
├ 📜package-lock.json
├ 📜package.json
└ 📜README.md
```

#### 3.2. 개발 일정

프로젝트의 상세 일정 및 작업 분배는 Notion을 통해 관리되었습니다. 디스코드로 실시간 작업 상황을 공유하며 진행 상황을 추적했습니다.

---

### 4. 역할 분담

각 팀원은 다음과 같은 목표와 의도를 가지고 역할을 수행했습니다.

**신영환 (팀장, 메인/회원가입 페이지 및 인증 유틸)**  
메인 페이지와 회원가입 페이지를 설계 및 구현했습니다. 또한 JWT 기반 인증 관련 유틸리티를 구축하여 로그인, 로그아웃, 사용자 상태 관리 등 핵심 인증 기능의 안정성을 확보했습니다.

**신지수 (팀원, 로그인 로직, 로그인 페이지 및 판매자 센터 페이지)**  
로그인 API 연동 및 인증 로직을 담당했습니다. 또한 판매자 센터 페이지의 HTML과 CSS를 구현하여 화면 레이아웃과 디자인을 구현했습니다.

**박철우 (팀원, 푸터 및 주문/결제 페이지)**  
사이트 전반에서 일관된 푸터를 구현하고, 구매자 관점의 주문/결제 페이지를 개발했습니다. 장바구니에서 온 데이터를 토대로 결제까지의 흐름에 오류 없이 작동하도록 했으며, 결제 UI와 데이터 연동의 안정성을 확보했습니다.

**김동희 (팀원, 헤더 및 상품 상세 페이지)**  
헤더 컴포넌트와 상품 상세 페이지를 설계 및 구현했습니다. 동적인 상품 정보, 탭 등 UI 기능을 개발하고, 상품 상세 정보가 정확히 렌더링되고 API 연동과 데이터 바인딩을 관리했습니다.

**강은성 (팀원, 404 페이지 및 장바구니 페이지)**  
사용자 경험 향상을 위해 404 페이지를 설계하고 구현했으며, 장바구니 페이지의 복잡한 상태 관리와 UI/UX를 담당했습니다. 상품 담기, 수량 변경, 삭제 등 기능을 안정적으로 구현하며 전체 사이트의 사용성을 높이는 데 기여했습니다.

---

### 5. 화면 설계

프로젝트의 전체적인 UI/UX 디자인은 제공된 피그마(Figma) 시안을 기반으로 구현되었습니다.

---

### 6. 협업 방식

- Git-flow 전략: `develop` 브랜치를 중심으로 기능 단위 `feature` 브랜치를 생성하여 개발을 진행했습니다. 모든 변경 사항은 가능하면 Pull Request를 통한 동료 검토 후 `develop` 브랜치로 병합하였으며, 작은 수정 사항은 협의에 따라 바로 `develop` 브랜치에 반영하기도 했습니다.
- 커밋 규칙(Commit Convention): feat:, fix:, style: 등의 접두사 규칙을 적용하여 커밋 기록을 체계적으로 관리하고, 히스토리 가독성을 높였습니다.
- 커뮤니케이션 관리: Notion을 활용해 전체 일정과 업무를 계획하고, Discord를 통해 각자 작업 완료 사항을 실시간 공유하며 진행 상황을 명확하게 관리했습니다.

---

### 7. 프로젝트 종합 자체평가

#### 7-1. 주요 성과

- 높은 디자인 완성도 및 사용자 경험(UX) 구현
- 시장에 즉시 출시해도 손색없을 정도의 높은 시각적 완성도와 퀄리티를 확보했습니다.
- 모바일 환경부터 PC까지 아우르는 반응형 UI를 구현하여 다양한 디바이스 환경에서의 사용성을 높였습니다.
- 장바구니(Cart), 404 오류 페이지 등 필수적인 서비스 페이지들을 꼼꼼하게 구축했습니다.
- 효율적인 협업 체계 및 팀워크
- 팀원 간의 원활한 소통을 통해 우수한 팀워크를 발휘하였으며, 큰 충돌 없이 프로젝트를 안정적으로 진행했습니다.
- 실력 차이가 있는 팀원들 간의 지식 공유와 역할 분담을 통해 함께 성장하는 경험을 쌓았습니다.
- Git(SourceTree)을 활용한 버전 관리의 중요성을 체득하고, 충돌 방지를 위한 전략적 커밋 방식을 학습했습니다.

#### 7-2. 개선점 및 향후 보완 계획

- 기능 구현의 깊이 및 범위 확대
- UI 구현에 집중하느라 상대적으로 부족했던 기능적인 측면(판매자 페이지 상품 등록/수정 등)을 보완할 예정입니다.
- 초기 기획했던 과제 이상의 부가 기능들을 추가로 구현하여 서비스의 실용성을 높일 필요가 있습니다.
- 작업 효율성 및 개발 숙련도 향상
- CSS 작업 속도를 개선하고 프레임워크 활용 능력을 키워, 한정된 기한 내에 더 많은 기능을 완성할 수 있도록 숙련도를 증진하겠습니다.
- 코드 충돌을 최소화하고 이슈를 신속하게 파악할 수 있도록, 작업 단위를 더 작게 쪼개어 자주 커밋하는 습관을 정착시키겠습니다.
- 협업 도구 및 프로세스 최적화
- SourceTree 등 협업 툴에 대한 이해도를 높여 push/pull 과정에서 발생할 수 있는 리스크를 줄이고, 팀원 간의 역할 수행 제한을 극복하기 위한 지속적인 학습을 병행하겠습니다.

---

### Devloper

[신영환](https://github.com/Catailog) [김동희](https://github.com/dongheiKim) [박철우](https://github.com/psh843045) [강은성](https://github.com/rkdtmxj367-cyber) [신지수](https://github.com/Anyarzy)
