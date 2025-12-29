# Open Market API

Open Market 오픈마켓 프로젝트의 백엔드 API 서버입니다. JSON Server와 JWT 인증을 사용하여 구현되었습니다.

## 📋 목차

- [기술 스택](#-기술-스택)
- [Node.js란?](#-nodejs란)
  - [개요](#개요)
  - [주요 특징](#주요-특징)
  - [Node.js로 할 수 있는 것](#nodejs로-할-수-있는-것)
  - [사용 사례](#nodejs-사용-사례)
- [Node.js 설치 방법](#-nodejs-설치-방법)
  - [Windows 설치](#windows-설치)
  - [macOS 설치](#macos-설치)
  - [Linux 설치](#linux-ubuntudebian-설치)
  - [첫 번째 프로그램](#첫-번째-nodejs-프로그램-실행해보기)
- [설치 방법](#-설치-방법) (API 서버)
- [실행 방법](#-실행-방법)
- [API 문서](#-api-문서)
- [주요 기능](#-주요-기능)
- [API 엔드포인트](#-api-엔드포인트)
- [JWT (JSON Web Token)란?](#-jwt-json-web-token란)
  - [개요](#개요-1)
  - [JWT의 특징](#jwt의-특징)
  - [JWT의 구조](#jwt의-구조)
  - [JWT 동작 원리](#jwt-동작-원리)
  - [Access Token vs Refresh Token](#access-token-vs-refresh-token)
  - [JWT의 장점](#jwt의-장점)
  - [JWT의 단점 및 주의사항](#jwt의-단점-및-주의사항)
  - [보안 Best Practices](#보안-best-practices)
  - [JWT 디버깅](#jwt-디버깅)
  - [이 프로젝트의 JWT 구현](#이-프로젝트의-jwt-구현)
- [인증 방법](#-인증-방법)
- [사용 예시](#-사용-예시)
- [프론트엔드 구현 가이드](#-프론트엔드-구현-가이드)

## 🛠 기술 스택

- **Node.js** - 런타임 환경
- **JSON Server** - RESTful API 서버
- **JWT (jsonwebtoken)** - 인증/인가
- **Swagger** - API 문서화
- **Nodemon** - 개발 서버 자동 재시작

## 📘 Node.js란?

### 개요

**Node.js**는 Chrome V8 JavaScript 엔진으로 빌드된 JavaScript 런타임 환경입니다. 기존에는 JavaScript를 브라우저에서만 실행할 수 있었지만, Node.js 덕분에 **서버 사이드에서도 JavaScript를 실행**할 수 있게 되었습니다.

### 주요 특징

| 특징               | 설명                                             |
| ------------------ | ------------------------------------------------ |
| **비동기 I/O**     | Non-blocking 방식으로 동시에 여러 작업 처리 가능 |
| **이벤트 기반**    | 이벤트 루프를 사용하여 효율적인 리소스 관리      |
| **단일 언어**      | 프론트엔드와 백엔드 모두 JavaScript 사용         |
| **NPM 생태계**     | 세계 최대의 오픈소스 라이브러리 저장소           |
| **빠른 실행 속도** | V8 엔진 기반으로 고성능                          |

### Node.js로 할 수 있는 것

✅ **웹 서버 / API 서버 개발**

```javascript
// 간단한 웹 서버 예제
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<h1>안녕하세요! Node.js 서버입니다.</h1>");
});

server.listen(3000, () => {
  console.log("서버가 http://localhost:3000 에서 실행 중입니다.");
});
```

✅ **RESTful API 서버 (Express 사용)**

```javascript
// Express를 사용한 API 서버
const express = require("express");
const app = express();

app.use(express.json());

// GET 요청
app.get("/api/users", (req, res) => {
  res.json({ users: ["홍길동", "김철수", "이영희"] });
});

// POST 요청
app.post("/api/users", (req, res) => {
  const { name } = req.body;
  res.json({ message: `${name}님이 추가되었습니다.` });
});

app.listen(3000, () => {
  console.log("API 서버가 실행 중입니다.");
});
```

✅ **파일 시스템 작업**

```javascript
// 파일 읽기/쓰기
const fs = require("fs");

// 파일 읽기
fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 파일 쓰기
fs.writeFile("output.txt", "안녕하세요!", (err) => {
  if (err) throw err;
  console.log("파일이 저장되었습니다.");
});
```

✅ **실시간 채팅 애플리케이션 (Socket.io)**

```javascript
// 실시간 채팅 서버
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  console.log("사용자 접속");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // 모든 클라이언트에게 메시지 전송
  });
});

http.listen(3000);
```

✅ **데이터베이스 연동**

```javascript
// MongoDB 연결 예제
const { MongoClient } = require("mongodb");

async function connectDB() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  const db = client.db("mydb");
  const users = await db.collection("users").find().toArray();

  console.log(users);
}
```

✅ **커맨드 라인 도구 (CLI) 개발**

```javascript
// 간단한 CLI 도구
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("이름을 입력하세요: ", (name) => {
  console.log(`안녕하세요, ${name}님!`);
  rl.close();
});
```

### Node.js 사용 사례

- 🌐 **웹 애플리케이션**: Netflix, LinkedIn, PayPal
- 🚀 **실시간 서비스**: 채팅, 게임, 협업 도구
- 📦 **API 서버**: RESTful API, GraphQL
- 🛠️ **개발 도구**: Webpack, Babel, ESLint
- 🤖 **자동화 스크립트**: 배포, 테스트, 데이터 처리

## 💻 Node.js 설치 방법

프로젝트를 실행하기 전에 Node.js를 먼저 설치해야 합니다.

### Windows 설치

#### 방법 1: 공식 웹사이트에서 설치 (권장)

1. **다운로드**

   - [Node.js 공식 웹사이트](https://nodejs.org/) 접속
   - **LTS (Long Term Support)** 버전 다운로드 (안정적인 버전)
   - 또는 **Current** 버전 (최신 기능 포함)

2. **설치**

   - 다운로드한 `.msi` 파일 실행
   - 설치 마법사 따라 진행 (기본 설정 권장)
   - "Automatically install necessary tools" 체크박스 선택 (선택사항)

3. **설치 확인**

   ```bash
   # CMD 또는 PowerShell에서 실행
   node --version
   # 출력: v20.x.x (버전 번호)

   npm --version
   # 출력: 10.x.x (버전 번호)
   ```

#### 방법 2: Chocolatey 사용 (선택사항)

```bash
# PowerShell (관리자 권한)
choco install nodejs-lts
```

### macOS 설치

#### 방법 1: 공식 웹사이트에서 설치

1. **다운로드**

   - [Node.js 공식 웹사이트](https://nodejs.org/) 접속
   - **LTS** 버전 다운로드

2. **설치**

   - 다운로드한 `.pkg` 파일 실행
   - 설치 마법사 따라 진행

3. **설치 확인**
   ```bash
   # Terminal에서 실행
   node --version
   npm --version
   ```

#### 방법 2: Homebrew 사용 (권장)

```bash
# Homebrew 설치 (없는 경우)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node

# 특정 버전 설치 (LTS)
brew install node@20

# 설치 확인
node --version
npm --version
```

#### 방법 3: NVM (Node Version Manager) 사용 (권장 - 여러 버전 관리)

```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 터미널 재시작 후

# 최신 LTS 버전 설치
nvm install --lts

# 특정 버전 설치
nvm install 20.10.0

# 설치된 버전 확인
nvm list

# 사용할 버전 선택
nvm use 20.10.0

# 기본 버전 설정
nvm alias default 20.10.0
```

### Linux (Ubuntu/Debian) 설치

```bash
# APT를 통한 설치
sudo apt update
sudo apt install nodejs npm

# 또는 최신 버전 설치 (NodeSource 저장소 사용)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 설치 확인
node --version
npm --version
```

### 버전 확인 및 업데이트

```bash
# 현재 설치된 Node.js 버전 확인
node --version
node -v

# npm 버전 확인
npm --version
npm -v

# npm 업데이트
npm install -g npm@latest

# 전역 패키지 목록 확인
npm list -g --depth=0
```

### 첫 번째 Node.js 프로그램 실행해보기

1. **파일 생성** (`hello.js`)

   ```javascript
   console.log("🎉 Node.js 설치 완료!");
   console.log("Node.js 버전:", process.version);
   console.log("현재 디렉토리:", process.cwd());
   ```

2. **실행**

   ```bash
   node hello.js
   ```

3. **출력**
   ```
   🎉 Node.js 설치 완료!
   Node.js 버전: v20.10.0
   현재 디렉토리: /Users/username/projects
   ```

### NPM (Node Package Manager)이란?

NPM은 Node.js의 패키지 관리자로, JavaScript 라이브러리와 도구를 설치하고 관리합니다.

```bash
# 패키지 설치
npm install express          # 로컬 설치
npm install -g nodemon       # 전역 설치

# package.json 생성
npm init                     # 대화형
npm init -y                  # 기본값으로 자동 생성

# 패키지 제거
npm uninstall express

# 의존성 패키지 모두 설치 (package.json 기반)
npm install
```

### 🎯 추천 버전

- **프로덕션 환경**: LTS (Long Term Support) 버전 권장
- **현재 LTS**: Node.js 20.x
- **최소 요구 버전**: Node.js 18.x 이상

## 📦 설치 방법(API 서버)

### 1. 저장소 클론 및 디렉토리 이동

```bash
cd project/open-market
```

### 2. 의존성 패키지 설치

```bash
npm install
```

## 🚀 실행 방법

### 개발 서버 시작

```bash
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 포트 변경 (선택사항)

`server/server.js` 파일의 마지막 부분에서 포트 번호를 변경할 수 있습니다:

```javascript
server.listen(3000, () => {
  console.log("Custom JSON Server is running on port 3000");
});
```

## 📚 API 문서

### Swagger UI 접속

서버 실행 후 브라우저에서 다음 URL로 접속하세요:

```
http://localhost:3000/api-docs
```

### Swagger JSON

OpenAPI 스펙 JSON 파일:

```
http://localhost:3000/api-docs.json
```

Swagger UI에서 다음 기능을 제공합니다:

- ✅ 모든 API 엔드포인트 확인
- ✅ 요청/응답 스키마 확인
- ✅ 인터랙티브 API 테스트
- ✅ JWT 토큰 인증 테스트

## ⚡ 주요 기능

### 1. 계정 관리 (Accounts)

- 구매자 회원가입
- 판매자 회원가입
- 아이디 중복 검증
- 사업자등록번호 검증
- 로그인 (JWT 토큰 발급)
- Access Token 갱신

### 2. 상품 관리 (Products)

- 상품 목록 조회 (페이지네이션, 검색)
- 판매자별 상품 조회
- 상품 상세 조회
- 상품 수정
- 상품 삭제

### 3. 장바구니 (Cart)

- 장바구니 목록 조회
- 장바구니 상품 추가
- 장바구니 상품 상세 조회
- 장바구니 상품 수량 수정
- 장바구니 상품 삭제
- 장바구니 전체 비우기

### 4. 주문 (Order)

- 주문하기 (바로구매/장바구니 주문)
- 주문 목록 조회
- 주문 상세 조회
- 주문 취소

## 🔗 API 엔드포인트

### 계정 관리

| Method | Endpoint                                            | 설명                | 인증 필요 |
| ------ | --------------------------------------------------- | ------------------- | --------- |
| POST   | `/api/accounts/buyer/signup`                        | 구매자 회원가입     | ❌        |
| POST   | `/api/accounts/seller/signup`                       | 판매자 회원가입     | ❌        |
| POST   | `/api/accounts/validate-username`                   | 아이디 중복 검증    | ❌        |
| POST   | `/api/accounts/seller/validate-registration-number` | 사업자등록번호 검증 | ❌        |
| POST   | `/api/accounts/signin`                              | 로그인              | ❌        |
| POST   | `/api/accounts/token/refresh`                       | Access Token 갱신   | ❌        |

### 상품 관리

| Method | Endpoint                     | 설명               | 인증 필요 |
| ------ | ---------------------------- | ------------------ | --------- |
| GET    | `/api/products`              | 상품 목록 조회     | ❌        |
| GET    | `/api/products/:product_id`  | 상품 상세 조회     | ❌        |
| GET    | `/api/:seller_name/products` | 판매자별 상품 조회 | ❌        |
| PUT    | `/api/products/:product_id`  | 상품 수정          | ✅        |
| DELETE | `/api/products/:product_id`  | 상품 삭제          | ✅        |

### 장바구니

| Method | Endpoint                   | 설명                    | 인증 필요 |
| ------ | -------------------------- | ----------------------- | --------- |
| GET    | `/api/cart/`               | 장바구니 목록 조회      | ❌        |
| POST   | `/api/cart/`               | 장바구니 상품 추가      | ✅        |
| GET    | `/api/cart/:cart_item_id`  | 장바구니 상품 상세 조회 | ✅        |
| PUT    | `/api/cart/:cart_item_id/` | 장바구니 상품 수량 수정 | ✅        |
| DELETE | `/api/cart/:cart_item_id/` | 장바구니 상품 삭제      | ✅        |
| DELETE | `/api/cart/`               | 장바구니 전체 비우기    | ✅        |

### 주문

| Method | Endpoint                | 설명           | 인증 필요 |
| ------ | ----------------------- | -------------- | --------- |
| POST   | `/api/order/`           | 주문하기       | ✅        |
| GET    | `/api/order/`           | 주문 목록 조회 | ✅        |
| GET    | `/api/order/:order_pk/` | 주문 상세 조회 | ✅        |
| DELETE | `/api/order/:order_pk/` | 주문 취소      | ✅        |

## 🔑 JWT (JSON Web Token)란?

### 개요

**JWT(JSON Web Token)**는 당사자 간에 정보를 안전하게 전송하기 위한 **토큰 기반 인증 방식**입니다. JSON 객체로 정보를 안전하게 전송할 수 있으며, 디지털 서명되어 있어 신뢰할 수 있고 변조를 방지할 수 있습니다.

### JWT의 특징

| 특징               | 설명                                            |
| ------------------ | ----------------------------------------------- |
| **Self-contained** | 토큰 자체에 사용자 정보를 포함 (DB 조회 불필요) |
| **Stateless**      | 서버가 세션 정보를 저장하지 않음 (확장성 좋음)  |
| **보안성**         | 디지털 서명으로 변조 방지 (HMAC 또는 RSA)       |
| **휴대성**         | URL, HTTP Header, Cookie 등 어디든 전송 가능    |
| **표준**           | RFC 7519 표준 (다양한 언어와 플랫폼에서 지원)   |
| **만료 시간 설정** | 토큰에 유효기간을 설정하여 보안 강화            |

### JWT의 구조

JWT는 `.`(점)으로 구분된 **3개의 부분**으로 구성됩니다:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJ1eWVyMSIsInVzZXJfdHlwZSI6IkJVWUVSIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDAwMDM1OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
│                                      │                                                                                                      │
│            Header                    │                                   Payload                                                             │                Signature
```

#### 1️⃣ Header (헤더)

토큰의 타입과 해싱 알고리즘을 지정합니다.

```json
{
  "alg": "HS256", // 알고리즘 (HMAC SHA-256)
  "typ": "JWT" // 토큰 타입
}
```

이 JSON을 **Base64Url**로 인코딩하여 첫 번째 부분을 생성합니다.

#### 2️⃣ Payload (페이로드)

실제 전달할 정보(클레임)를 담고 있습니다.

**표준 클레임 (Registered Claims):**

| 클레임 | 설명                     | 예시                   |
| ------ | ------------------------ | ---------------------- |
| `iss`  | 토큰 발급자 (Issuer)     | "open-market-api"      |
| `sub`  | 토큰 제목 (Subject)      | "buyer1"               |
| `aud`  | 토큰 대상 (Audience)     | "open-market-client"   |
| `exp`  | 만료 시간 (Expiration)   | 1700003599 (Unix 시간) |
| `iat`  | 발급 시간 (Issued At)    | 1699999999             |
| `nbf`  | 활성화 시간 (Not Before) | 1699999999             |

**커스텀 클레임 (이 프로젝트에서 사용):**

```json
{
  "username": "buyer1",
  "name": "홍길동",
  "phone_number": "010-1234-5678",
  "user_type": "BUYER",
  "iat": 1699999999, // 발급 시간
  "exp": 1700003599 // 만료 시간 (1시간 후)
}
```

⚠️ **주의**: Payload는 Base64Url 인코딩만 되어 있어 **누구나 디코딩 가능**합니다. 따라서 **비밀번호나 민감한 정보는 포함하지 않습니다**.

#### 3️⃣ Signature (서명)

토큰의 무결성을 검증하기 위한 서명입니다.

```javascript
// 서명 생성 방식
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
);
```

서명을 통해:

- ✅ 토큰이 중간에 **변조되지 않았는지** 확인
- ✅ 토큰이 **신뢰할 수 있는 발급자**로부터 왔는지 확인

### JWT 동작 원리

```
┌─────────┐                                      ┌─────────┐
│         │  1. 로그인 (username, password)      │         │
│         │────────────────────────────────────> │         │
│         │                                       │         │
│  Client │  2. JWT 토큰 발급 (access, refresh)  │  Server │
│         │<──────────────────────────────────── │         │
│         │                                       │         │
│         │  3. API 요청 (Authorization: Bearer) │         │
│         │────────────────────────────────────> │         │
│         │                                       │         │
│         │  4. 토큰 검증 후 응답                │         │
│         │<──────────────────────────────────── │         │
└─────────┘                                      └─────────┘
```

#### 상세 흐름

**1단계: 로그인**

```javascript
// 클라이언트
const response = await fetch("/api/accounts/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "buyer1", password: "1234" }),
});

const data = await response.json();
// data = { access: "...", refresh: "...", user: {...} }
```

**2단계: 토큰 저장**

```javascript
// LocalStorage에 저장
localStorage.setItem("access_token", data.access);
localStorage.setItem("refresh_token", data.refresh);
localStorage.setItem("user", JSON.stringify(data.user));
```

**3단계: API 요청 시 토큰 포함**

```javascript
const response = await fetch("/api/cart/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
  body: JSON.stringify({ product_id: 1, quantity: 2 }),
});
```

**4단계: 서버에서 토큰 검증**

```javascript
// 서버 (server.js)
const token = req.headers.authorization?.split(" ")[1];

try {
  const decoded = jwt.verify(token, SECRET_KEY);
  // decoded = { username: "buyer1", user_type: "BUYER", ... }

  // 토큰이 유효하면 요청 처리
  req.user = decoded;
  next();
} catch (error) {
  // 토큰이 유효하지 않으면 401 에러
  res.status(401).json({ detail: "유효하지 않은 토큰입니다." });
}
```

### Access Token vs Refresh Token

이 프로젝트는 **이중 토큰 방식**을 사용합니다.

| 구분          | Access Token      | Refresh Token        |
| ------------- | ----------------- | -------------------- |
| **목적**      | API 인증용        | Access Token 갱신용  |
| **유효 기간** | 짧음 (1시간)      | 길음 (1일)           |
| **저장 위치** | LocalStorage      | LocalStorage         |
| **사용 빈도** | 모든 API 요청마다 | Access Token 만료 시 |
| **보안 수준** | 높음 (자주 갱신)  | 매우 높음 (재발급용) |

#### Access Token 만료 시 처리

```javascript
// API 호출 공통 함수
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("access_token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 401 에러 (토큰 만료)
  if (response.status === 401) {
    // Refresh Token으로 새 Access Token 발급
    const refreshToken = localStorage.getItem("refresh_token");

    const refreshResponse = await fetch("/api/accounts/token/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("access_token", data.access);

      // 원래 요청 재시도
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.access}`,
        },
      });
    } else {
      // Refresh Token도 만료됨 -> 로그인 페이지로 이동
      localStorage.clear();
      window.location.href = "signin.html";
    }
  }

  return response;
}
```

### JWT의 장점

✅ **확장성 (Scalability)**

- 서버가 세션을 저장하지 않아 여러 서버로 쉽게 확장 가능
- 로드 밸런싱에 유리

✅ **보안성 (Security)**

- 디지털 서명으로 변조 방지
- HTTPS와 함께 사용 시 안전

✅ **독립성 (Decoupling)**

- 모바일 앱, 웹, 여러 도메인에서 동일한 토큰 사용 가능
- RESTful API와 완벽한 호환

✅ **성능 (Performance)**

- DB 조회 없이 토큰만으로 인증 가능 (빠른 응답)

### JWT의 단점 및 주의사항

⚠️ **토큰 크기**

- Cookie/Session보다 크기가 큼 (모든 요청에 포함)
- 해결: 필요한 정보만 Payload에 포함

⚠️ **토큰 탈취 시 대응**

- 만료 전까지는 토큰을 강제로 무효화할 수 없음
- 해결: 짧은 만료 시간 + Refresh Token 사용

⚠️ **민감한 정보 노출**

- Payload는 누구나 디코딩 가능
- 해결: 비밀번호 등 민감한 정보는 절대 포함 금지

⚠️ **XSS 공격**

- LocalStorage에 저장 시 XSS 공격에 취약할 수 있음
- 해결: HTTPS 사용, CSP(Content Security Policy) 설정

### 보안 Best Practices

#### 1. HTTPS 사용 (필수)

```javascript
// 프로덕션 환경에서는 반드시 HTTPS 사용
const API_URL = "https://api.example.com"; // ✅ 안전
// const API_URL = 'http://api.example.com';  // ❌ 위험
```

#### 2. 짧은 만료 시간 설정

```javascript
// server.js
const ACCESS_TOKEN_EXPIRES_IN = "1h"; // 1시간
const REFRESH_TOKEN_EXPIRES_IN = "1d"; // 1일
```

#### 3. 민감한 정보 제외

```javascript
// ✅ 좋은 예
const payload = {
  username: "buyer1",
  user_type: "BUYER",
};

// ❌ 나쁜 예
const payload = {
  username: "buyer1",
  password: "hashed_password", // 비밀번호 포함 금지!
  credit_card: "1234-5678-...", // 카드번호 포함 금지!
};
```

#### 4. 토큰 저장소 선택

```javascript
// LocalStorage (이 프로젝트 방식)
localStorage.setItem("access_token", token); // ✅ 새로고침 후에도 유지

// SessionStorage (더 안전하지만 탭 닫으면 삭제)
sessionStorage.setItem("access_token", token); // ✅ 보안성 높음

// Cookie (HttpOnly, Secure 플래그 필수)
// HttpOnly: JavaScript로 접근 불가 (XSS 방지)
// Secure: HTTPS에서만 전송
```

#### 5. 로그아웃 시 토큰 삭제

```javascript
function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  sessionStorage.clear();
  window.location.href = "signin.html";
}
```

### JWT 디버깅

#### 온라인 디코더

- [jwt.io](https://jwt.io/) - JWT 디코딩 및 검증 도구
- 토큰을 붙여넣으면 Header, Payload를 확인 가능

#### 브라우저 DevTools에서 확인

```javascript
// Console에서 실행
const token = localStorage.getItem("access_token");
console.log("Token:", token);

// Base64Url 디코딩 (Payload 확인)
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("Payload:", payload);
console.log("만료 시간:", new Date(payload.exp * 1000));
```

### 이 프로젝트의 JWT 구현

이 프로젝트는 `jsonwebtoken` 라이브러리를 사용하여 JWT를 구현합니다.

```javascript
// server/server.js
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your-secret-key";

// 토큰 생성
const access = jwt.sign(
  { username, name, phone_number, user_type },
  SECRET_KEY,
  { expiresIn: "1h" }
);

// 토큰 검증
jwt.verify(token, SECRET_KEY, (err, decoded) => {
  if (err) {
    return res.status(401).json({ detail: "유효하지 않은 토큰입니다." });
  }
  // decoded = { username, user_type, ... }
});
```

## 🔐 인증 방법

### 1. 로그인하여 토큰 받기

```bash
POST http://localhost:3000/api/accounts/signin
Content-Type: application/json

{
  "username": "buyer1",
  "password": "1234"
}
```

**응답:**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "buyer1",
    "name": "홍길동",
    "phone_number": "010-1234-5678",
    "user_type": "BUYER"
  }
}
```

### 2. API 요청 시 토큰 포함

```bash
GET http://localhost:3000/api/cart/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Swagger UI에서 인증

1. Swagger UI (`http://localhost:3000/api-docs`) 접속
2. 우측 상단 **"Authorize"** 버튼 클릭
3. 로그인으로 받은 `access` 토큰 입력 (Bearer 접두사 제외)
4. **"Authorize"** 버튼 클릭
5. 이제 인증이 필요한 API를 테스트할 수 있습니다

## 💡 사용 예시

### 1. 구매자 회원가입

```bash
POST http://localhost:3000/api/accounts/buyer/signup
Content-Type: application/json

{
  "username": "buyer@example.com",
  "password": "password123",
  "name": "홍길동",
  "phone_number": "010-1234-5678"
}
```

### 2. 상품 검색 (페이지네이션)

```bash
GET http://localhost:3000/api/products?page=1&page_size=10&search=노트북
```

### 3. 장바구니에 상품 추가

```bash
POST http://localhost:3000/api/cart/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

### 4. 바로구매 주문

```bash
POST http://localhost:3000/api/order/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "order_type": "direct_order",
  "product_id": 1,
  "quantity": 1,
  "total_price": 50000,
  "receiver": "홍길동",
  "receiver_phone_number": "010-1234-5678",
  "address": "서울시 강남구 테헤란로 123",
  "address_message": "문 앞에 놔주세요",
  "payment_method": "card"
}
```

### 5. 장바구니 주문

```bash
POST http://localhost:3000/api/order/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "order_type": "cart_order",
  "cart_items": [1, 2, 3],
  "total_price": 150000,
  "receiver": "홍길동",
  "receiver_phone_number": "010-1234-5678",
  "address": "서울시 강남구 테헤란로 123",
  "address_message": "부재 시 경비실에 맡겨주세요",
  "payment_method": "kakaopay"
}
```

### 6. 주문 상세 조회

```bash
GET http://localhost:3000/api/order/1/
Authorization: Bearer <access_token>
```

### 7. 주문 취소

```bash
DELETE http://localhost:3000/api/order/1/
Authorization: Bearer <access_token>
```

**응답:**

```json
{
  "detail": "주문이 성공적으로 취소되었습니다."
}
```

---

## 🎨 프론트엔드 구현 가이드

이 섹션은 프론트엔드 개발자가 백엔드 API를 활용하여 웹 애플리케이션을 구현할 때 참고할 수 있는 가이드입니다.

### 🛠️ 권장 기술 스택

```
Frontend Stack:
├── HTML5 (Semantic HTML)
├── CSS3 (Mobile First, Flexbox/Grid)
├── Vanilla JavaScript (ES6+)
└── 개발 서버: http-server
```

### 📦 데이터 저장 전략

#### LocalStorage (영구 저장)

로그인 정보는 **localStorage**에 저장하여 브라우저를 닫아도 유지되도록 합니다.

```javascript
// 로그인 성공 시
localStorage.setItem("access_token", data.access);
localStorage.setItem("refresh_token", data.refresh);
localStorage.setItem("user", JSON.stringify(data.user));

// 사용 시
const accessToken = localStorage.getItem("access_token");
const user = JSON.parse(localStorage.getItem("user"));

// 로그아웃 시
localStorage.removeItem("access_token");
localStorage.removeItem("refresh_token");
localStorage.removeItem("user");
```

#### SessionStorage (임시 저장)

장바구니 데이터와 주문 데이터는 **sessionStorage**에 저장하여 세션이 유지되는 동안만 보관합니다.

```javascript
// 장바구니 데이터 저장 (배열 형태)
const cartData = [
  {
    product_id: 1,
    product_name: "상품명",
    product_image: "이미지 URL",
    quantity: 2,
    price: 50000,
    shipping_fee: 3000,
    total_price: 100000,
  },
];
sessionStorage.setItem("cartData", JSON.stringify(cartData));

// 주문 데이터 저장 (주문 페이지로 전달)
const orderData = [
  {
    order_type: "direct_order", // 또는 "cart_order"
    product_id: 1,
    quantity: 1,
    // ... 기타 정보
  },
];
sessionStorage.setItem("orderData", JSON.stringify(orderData));

// 주문 완료 후 정리
sessionStorage.removeItem("orderData");
// cart_order인 경우 cartData도 삭제
sessionStorage.removeItem("cartData");
```

### 🔐 인증 처리

#### API Base URL 설정

로컬 개발과 배포 환경에서 다른 API URL을 사용해야 합니다.

```javascript
// API Base URL 설정
const API_BASE_URL = 
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"  // 로컬 개발
    : "https://open-market-jade.vercel.app/api";  // Vercel 배포

// 사용 예시
fetch(`${API_BASE_URL}/products`)
  .then(response => response.json())
  .then(data => console.log(data));
```

> **배포 시 주의사항:**
> - 배포 환경에서는 `https://open-market-jade.vercel.app/api`를 API Base URL로 사용합니다.
> - Vercel의 serverless 환경에서는 데이터 저장 기능이 제한적입니다 (읽기 전용).

#### Authorization Header 설정

모든 인증이 필요한 API 요청에는 Authorization 헤더를 포함해야 합니다.

```javascript
// 인증 헤더 생성 함수
function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// API 호출 예시
fetch(`${API_BASE_URL}/cart/`, {
  method: "POST",
  headers: getAuthHeaders(),
  body: JSON.stringify({
    product_id: 1,
    quantity: 2,
  }),
});
```

#### 로그인 상태 확인

```javascript
function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

function getUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// 사용 예시
if (!isLoggedIn()) {
  alert("로그인이 필요합니다.");
  window.location.href = "signin.html";
  return;
}
```

#### 사용자 타입별 UI 제어

```javascript
const user = getUser();

if (user.user_type === "BUYER") {
  // 구매자: 장바구니 버튼 표시
  document.getElementById("cart-button").style.display = "flex";
  document.getElementById("seller-center-button").style.display = "none";
} else if (user.user_type === "SELLER") {
  // 판매자: 판매자 센터 버튼 표시
  document.getElementById("cart-button").style.display = "none";
  document.getElementById("seller-center-button").style.display = "flex";
}
```

### 📄 페이지 구성 및 데이터 흐름

#### 1. 회원가입 페이지 (signup.html)

**구매회원 회원가입**

```javascript
// 탭 전환 (구매회원/판매회원)
const buyerTab = document.getElementById("buyer-tab");
const sellerTab = document.getElementById("seller-tab");
const sellerFields = document.getElementById("seller-fields");

buyerTab.addEventListener("click", () => {
  buyerTab.classList.add("active");
  sellerTab.classList.remove("active");
  sellerFields.style.display = "none";
});

sellerTab.addEventListener("click", () => {
  sellerTab.classList.add("active");
  buyerTab.classList.remove("active");
  sellerFields.style.display = "block";
});

// 아이디(이메일) 중복 확인
async function checkUsername() {
  const username = document.getElementById("username").value;

  if (!username) {
    Validation.showMessage(
      usernameInput,
      usernameMessage,
      "아이디를 입력해주세요.",
      "error"
    );
    return;
  }

  if (!Validation.isValidEmail(username)) {
    Validation.showMessage(
      usernameInput,
      usernameMessage,
      "올바른 이메일 형식이 아닙니다.",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/validate-username",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      }
    );

    const data = await response.json();

    if (response.ok && data.Success) {
      Validation.showMessage(
        usernameInput,
        usernameMessage,
        "사용 가능한 아이디입니다.",
        "success"
      );
      isUsernameChecked = true;
    } else {
      Validation.showMessage(
        usernameInput,
        usernameMessage,
        "이미 사용 중인 아이디입니다.",
        "error"
      );
      isUsernameChecked = false;
    }
  } catch (error) {
    console.error("아이디 중복 확인 오류:", error);
    alert("아이디 중복 확인에 실패했습니다.");
  }
}

// 비밀번호 Validation
function validatePassword() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  // 비밀번호 길이 체크
  if (password.length < 8) {
    Validation.showMessage(
      passwordInput,
      passwordMessage,
      "비밀번호는 8자 이상이어야 합니다.",
      "error"
    );
    return false;
  }

  // 비밀번호 일치 확인
  if (password !== passwordConfirm) {
    Validation.showMessage(
      passwordConfirmInput,
      passwordConfirmMessage,
      "비밀번호가 일치하지 않습니다.",
      "error"
    );
    return false;
  }

  Validation.showMessage(
    passwordConfirmInput,
    passwordConfirmMessage,
    "비밀번호가 일치합니다.",
    "success"
  );
  return true;
}

// 전화번호 Validation
function validatePhone() {
  const phone1 = document.getElementById("phone1").value;
  const phone2 = document.getElementById("phone2").value;
  const phone3 = document.getElementById("phone3").value;

  if (!Validation.isValidPhone(phone1, phone2, phone3)) {
    Validation.showMessage(
      phoneInput,
      phoneMessage,
      "올바른 전화번호 형식이 아닙니다.",
      "error"
    );
    return false;
  }

  return true;
}

// 구매회원 회원가입 제출
async function handleBuyerSignup(e) {
  e.preventDefault();

  // Validation 체크
  if (!isUsernameChecked) {
    alert("아이디 중복 확인을 해주세요.");
    return;
  }

  if (!validatePassword()) {
    return;
  }

  if (!validatePhone()) {
    return;
  }

  const formData = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    name: document.getElementById("name").value,
    phone_number: `${document.getElementById("phone1").value}-${
      document.getElementById("phone2").value
    }-${document.getElementById("phone3").value}`,
  };

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/buyer/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("회원가입이 완료되었습니다.");
      window.location.href = "signin.html";
    } else {
      throw new Error(data.detail || "회원가입에 실패했습니다.");
    }
  } catch (error) {
    console.error("회원가입 오류:", error);
    alert(error.message);
  }
}
```

**판매회원 회원가입** [옵션]

```javascript
// 사업자등록번호 검증
async function validateRegistrationNumber() {
  const registrationNumber = document
    .getElementById("registration-number")
    .value.replace(/-/g, "");

  if (registrationNumber.length !== 10) {
    Validation.showMessage(
      registrationNumberInput,
      registrationNumberMessage,
      "사업자등록번호는 10자리 숫자입니다.",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/seller/validate-registration-number",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_number: registrationNumber }),
      }
    );

    const data = await response.json();

    if (response.ok && data.Success) {
      Validation.showMessage(
        registrationNumberInput,
        registrationNumberMessage,
        "유효한 사업자등록번호입니다.",
        "success"
      );
      isRegistrationNumberChecked = true;
    } else {
      Validation.showMessage(
        registrationNumberInput,
        registrationNumberMessage,
        "유효하지 않은 사업자등록번호입니다.",
        "error"
      );
      isRegistrationNumberChecked = false;
    }
  } catch (error) {
    console.error("사업자등록번호 검증 오류:", error);
    alert("사업자등록번호 검증에 실패했습니다.");
  }
}

// 판매회원 회원가입 제출
async function handleSellerSignup(e) {
  e.preventDefault();

  // 구매회원 필드 Validation
  if (!isUsernameChecked) {
    alert("아이디 중복 확인을 해주세요.");
    return;
  }

  if (!validatePassword()) {
    return;
  }

  if (!validatePhone()) {
    return;
  }

  // 판매회원 전용 필드 Validation
  if (!isRegistrationNumberChecked) {
    alert("사업자등록번호 검증을 해주세요.");
    return;
  }

  const storeName = document.getElementById("store-name").value;
  if (!storeName) {
    alert("스토어명을 입력해주세요.");
    return;
  }

  const formData = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    name: document.getElementById("name").value,
    phone_number: `${document.getElementById("phone1").value}-${
      document.getElementById("phone2").value
    }-${document.getElementById("phone3").value}`,
    registration_number: document
      .getElementById("registration-number")
      .value.replace(/-/g, ""),
    store_name: storeName,
  };

  try {
    const response = await fetch(
      "http://localhost:3000/api/accounts/seller/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("판매회원 가입이 완료되었습니다.");
      window.location.href = "signin.html";
    } else {
      throw new Error(data.detail || "회원가입에 실패했습니다.");
    }
  } catch (error) {
    console.error("판매회원 가입 오류:", error);
    alert(error.message);
  }
}
```

#### 2. 로그인 페이지 (signin.html)

```javascript
// 탭 전환 (구매회원/판매회원)
const buyerTab = document.getElementById("buyer-tab");
const sellerTab = document.getElementById("seller-tab");
let userType = "BUYER"; // 기본값: 구매회원

buyerTab.addEventListener("click", () => {
  buyerTab.classList.add("active");
  sellerTab.classList.remove("active");
  userType = "BUYER";
});

sellerTab.addEventListener("click", () => {
  sellerTab.classList.add("active");
  buyerTab.classList.remove("active");
  userType = "SELLER";
});

// 로그인 처리
async function handleSignin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // 기본 Validation
  if (!username || !password) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/accounts/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "로그인에 실패했습니다.");
    }

    // 사용자 타입 확인
    if (data.user.user_type !== userType) {
      alert(
        `${
          userType === "BUYER" ? "구매회원" : "판매회원"
        } 계정으로 로그인해주세요.`
      );
      return;
    }

    // LocalStorage에 토큰 및 사용자 정보 저장
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));

    // 사용자 타입에 따라 페이지 이동
    if (data.user.user_type === "BUYER") {
      window.location.href = "index.html";
    } else if (data.user.user_type === "SELLER") {
      window.location.href = "seller-center.html";
    }
  } catch (error) {
    console.error("로그인 오류:", error);
    alert(error.message || "아이디 또는 비밀번호를 확인해주세요.");
  }
}

// 폼 제출 이벤트
const signinForm = document.getElementById("signin-form");
signinForm.addEventListener("submit", handleSignin);
```

**로그인 상태 유지 및 자동 로그인**

```javascript
// 페이지 로드 시 로그인 상태 확인
window.addEventListener("DOMContentLoaded", () => {
  const accessToken = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");

  // 이미 로그인된 상태라면 메인 페이지로 리다이렉트
  if (accessToken && user) {
    const userData = JSON.parse(user);
    if (userData.user_type === "BUYER") {
      window.location.href = "index.html";
    } else if (userData.user_type === "SELLER") {
      window.location.href = "seller-center.html";
    }
  }
});
```

**로그아웃 처리 (공통 - header.js)**

```javascript
// 로그아웃
function handleLogout() {
  // LocalStorage에서 모든 인증 정보 삭제
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  // SessionStorage 정리 (장바구니, 주문 데이터)
  sessionStorage.clear();

  // 로그인 페이지로 이동
  window.location.href = "signin.html";
}

// 로그아웃 버튼 이벤트 (예시)
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}
```

#### 3. 상품 목록 페이지 (index.html)

```javascript
// GET /api/products 호출하여 상품 목록 표시
async function fetchProducts(searchTerm = "") {
  const url = `http://localhost:3000/api/products?page=1&page_size=20${
    searchTerm ? `&search=${searchTerm}` : ""
  }`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

// 상품 카드 클릭 시 querystring으로 product_id 전달
card.addEventListener("click", () => {
  window.location.href = `detail.html?id=${product.id}`;
});
```

#### 4. 상품 상세 페이지 (detail.html)

```javascript
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
```

**탭 UI 구현 (상세정보/리뷰/Q&A 등)**

HTML 구조 - ARIA 속성으로 접근성 확보:

```html
<!-- 탭 메뉴 -->
<div class="tab-menu" role="tablist" aria-label="상품 정보 탭">
  <button
    class="tab-button active"
    data-tab="detail"
    role="tab"
    aria-selected="true"
    aria-controls="detail-content"
    tabindex="0"
  >
    상세정보
  </button>
  <button
    class="tab-button"
    data-tab="review"
    role="tab"
    aria-selected="false"
    aria-controls="review-content"
    tabindex="-1"
  >
    리뷰
  </button>
</div>

<!-- 탭 컨텐츠 -->
<div class="tab-content-wrapper">
  <div
    class="tab-content active"
    id="detail-content"
    role="tabpanel"
    tabindex="0"
  >
    상세 정보 내용
  </div>
  <div
    class="tab-content"
    id="review-content"
    role="tabpanel"
    tabindex="0"
    hidden
  >
    리뷰 내용
  </div>
</div>
```

JavaScript - 탭 전환 및 키보드 네비게이션:

```javascript
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// 탭 활성화 함수
function activateTab(button) {
  const tabName = button.getAttribute("data-tab");

  // 모든 탭 비활성화
  tabButtons.forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
    btn.setAttribute("tabindex", "-1");
  });

  tabContents.forEach((content) => {
    content.classList.remove("active");
    content.setAttribute("hidden", "");
  });

  // 선택된 탭 활성화
  button.classList.add("active");
  button.setAttribute("aria-selected", "true");
  button.setAttribute("tabindex", "0");
  button.focus();

  const targetContent = document.getElementById(`${tabName}-content`);
  targetContent.classList.add("active");
  targetContent.removeAttribute("hidden");
}

// 클릭 이벤트
tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button));
});

// 키보드 네비게이션
tabButtons.forEach((button, index) => {
  button.addEventListener("keydown", (e) => {
    let targetIndex;

    switch (e.key) {
      case "ArrowLeft": // 이전 탭
        e.preventDefault();
        targetIndex = index === 0 ? tabButtons.length - 1 : index - 1;
        activateTab(tabButtons[targetIndex]);
        break;

      case "ArrowRight": // 다음 탭
        e.preventDefault();
        targetIndex = index === tabButtons.length - 1 ? 0 : index + 1;
        activateTab(tabButtons[targetIndex]);
        break;

      case "Home": // 첫 번째 탭
        e.preventDefault();
        activateTab(tabButtons[0]);
        break;

      case "End": // 마지막 탭
        e.preventDefault();
        activateTab(tabButtons[tabButtons.length - 1]);
        break;
    }
  });
});
```

CSS - 마우스 클릭 시 포커스 테두리 제거:

```css
/* 기본 포커스 제거 */
.tab-button:focus {
  outline: none;
}

/* 키보드 네비게이션 시에만 포커스 표시 */
.tab-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.tab-button.active {
  border-bottom: 3px solid var(--color-primary);
}
```

**핵심 포인트:**

- ✅ `role="tablist"`, `role="tab"`, `role="tabpanel"` - 스크린 리더 지원
- ✅ `aria-selected`, `aria-controls` - 탭 상태 명시
- ✅ `tabindex` - 키보드 포커스 관리 (활성 탭: 0, 비활성 탭: -1)
- ✅ `hidden` 속성 - 비활성 컨텐츠 숨김
- ✅ 화살표 키 (←/→) - 탭 간 이동 (순환)
- ✅ `Home`/`End` 키 - 처음/끝 탭으로 바로 이동
- ✅ `:focus-visible` - 키보드 사용 시에만 포커스 표시

#### 5. 장바구니 페이지 (cart.html)

```javascript
// sessionStorage에서 cartData 불러와서 표시
const cartData = JSON.parse(sessionStorage.getItem("cartData")) || [];

// 수량 변경 시 sessionStorage 업데이트
cartData[index].quantity = newQuantity;
sessionStorage.setItem("cartData", JSON.stringify(cartData));

// "주문하기" 클릭 시 선택된 상품만 orderData로 전달
const selectedItems = cartData.filter(
  (item, index) => document.getElementById(`item-${index}`).checked
);
sessionStorage.setItem("orderData", JSON.stringify(selectedItems));
window.location.href = "order.html";
```

#### 6. 주문/결제 페이지 (order.html)

```javascript
// sessionStorage에서 orderData 불러오기
const orderData = JSON.parse(sessionStorage.getItem("orderData"));

// order_type 확인
const orderType = orderData[0]?.order_type; // "direct_order" 또는 "cart_order"

// "결제하기" 클릭 시 POST /api/order/ 호출
const requestBody = {
  order_type: orderType,
  product_id:
    orderType === "direct_order" ? orderData[0].product_id : undefined,
  quantity: orderType === "direct_order" ? orderData[0].quantity : undefined,
  cart_items:
    orderType === "cart_order"
      ? orderData.map((item) => item.product_id)
      : undefined,
  total_price: calculateTotal(),
  receiver: receiverName,
  receiver_phone_number: receiverPhone,
  address: address,
  address_message: message,
  payment_method: selectedMethod,
};

// 주문 성공 시
sessionStorage.removeItem("orderData");
if (orderType === "cart_order") {
  sessionStorage.removeItem("cartData");
}
```

#### 7. 판매자 센터 (seller-center.html) [옵션]

```javascript
// 로그인 확인 및 SELLER 타입 검증
const user = getUser();
if (!user || user.user_type !== "SELLER") {
  alert("판매자만 접근 가능합니다.");
  window.location.href = "index.html";
  return;
}

// GET /api/:seller_name/products 호출
const response = await fetch(
  `http://localhost:3000/api/${user.username}/products`,
  { headers: getAuthHeaders() }
);
const data = await response.json();
renderProducts(data.results);
```

#### 8. 상품 등록/수정 (product-upload.html) [옵션]

```javascript
// 수정 모드: URL에서 product_id 확인
const productId = new URLSearchParams(window.location.search).get("id");

if (productId) {
  // 수정 모드: GET /api/products/:product_id 호출 후 폼 채우기
  const response = await fetch(
    `http://localhost:3000/api/products/${productId}`
  );
  const product = await response.json();
  // 폼 필드에 데이터 채우기

  // 저장 시 PUT /api/products/:product_id
  const response = await fetch(
    `http://localhost:3000/api/products/${productId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    }
  );
} else {
  // 신규 등록 모드: POST /api/products (향후 구현)
}
```

### 🎯 폼 Validation 처리

#### HTML5 기본 Validation 제거

```html
<!-- novalidate 속성으로 브라우저 기본 tooltip 제거 -->
<form novalidate>
  <input type="email" required />
  <button type="submit">제출</button>
</form>
```

#### 커스텀 Validation 구현

```javascript
// Validation 공통 모듈
const Validation = {
  showMessage(inputElement, messageElement, message, type) {
    inputElement.classList.remove("error", "success");
    messageElement.classList.remove("error", "success");

    if (type === "error" || type === "success") {
      inputElement.classList.add(type);
      messageElement.classList.add(type);
    }

    messageElement.textContent = message;
  },

  clearMessage(inputElement, messageElement) {
    inputElement.classList.remove("error", "success");
    messageElement.classList.remove("error", "success");
    messageElement.textContent = "";
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPhone(phone1, phone2, phone3) {
    return (
      /^\d{3}$/.test(phone1) && /^\d{4}$/.test(phone2) && /^\d{4}$/.test(phone3)
    );
  },
};

// 사용 예시
Validation.showMessage(
  inputElement,
  errorElement,
  "이메일 형식이 올바르지 않습니다.",
  "error"
);
```

### 🎨 스타일링 권장사항

#### Mobile First 접근

```css
/* 기본 스타일 (Mobile) */
.container {
  width: 100%;
  padding: 0 16px;
}

/* Tablet (768px 이상) */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding: 0 24px;
  }
}

/* Desktop (1024px 이상) */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 0 32px;
  }
}
```

#### CSS Variables 활용

```css
:root {
  /* Colors */
  --color-primary: #21bf48;
  --color-error: #eb5757;
  --color-border: #c4c4c4;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* Typography */
  --font-size-sm: 12px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
}
```

#### SVG Sprite 활용

모든 아이콘을 하나의 `sprite.svg` 파일에 관리합니다.

**포함된 아이콘 목록:**

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

```html
<!-- 사용 예시 -->
<svg width="32" height="32">
  <use href="assets/icons/sprite.svg#icon-cart"></use>
</svg>

<!-- 장바구니 버튼 -->
<a href="cart.html" class="icon-button">
  <svg width="32" height="32">
    <use href="assets/icons/sprite.svg#icon-cart"></use>
  </svg>
  <span>장바구니</span>
</a>

<!-- 검색 버튼 -->
<button type="button" class="search-button">
  <svg width="24" height="24">
    <use href="assets/icons/sprite.svg#icon-search"></use>
  </svg>
</button>

<!-- 수량 조절 버튼 -->
<button type="button" class="quantity-btn minus">
  <svg width="34" height="34">
    <use href="assets/icons/sprite.svg#icon-order-minus"></use>
  </svg>
</button>
<button type="button" class="quantity-btn plus">
  <svg width="34" height="34">
    <use href="assets/icons/sprite.svg#icon-order-plus"></use>
  </svg>
</button>
```

**장점:**

- ✅ 한 번의 HTTP 요청으로 모든 아이콘 로드
- ✅ 브라우저 캐싱으로 성능 최적화
- ✅ CSS로 색상 변경 가능 (`currentColor` 사용)
- ✅ 확장성 좋음 (새 아이콘 추가 용이)

### 🗂️ 파일 구조 예시

```
web/
├── index.html              # 메인 페이지
├── signin.html             # 로그인
├── signup.html             # 회원가입
├── detail.html             # 상품 상세
├── cart.html               # 장바구니
├── order.html              # 주문/결제
├── seller-center.html      # 판매자 센터
├── product-upload.html     # 상품 등록/수정
├── 404.html                # 404 에러 페이지
│
├── js/
│   ├── common/
│   │   ├── header.js       # 헤더 공통 로직 (로그인 상태별 UI)
│   │   └── validation.js   # Validation 공통 모듈
│   ├── config.js           # API URL, 상수, 유틸리티 함수
│   ├── script.js           # index.html
│   ├── signin.js           # 로그인
│   ├── signup.js           # 회원가입
│   ├── detail.js           # 상품 상세
│   ├── cart.js             # 장바구니
│   ├── order.js            # 주문/결제
│   ├── seller-center.js    # 판매자 센터
│   └── product-upload.js   # 상품 등록/수정
│
├── styles/
│   ├── base/
│   │   ├── reset.css       # CSS 초기화
│   │   ├── variables.css   # CSS 변수
│   │   └── typography.css  # 타이포그래피
│   ├── components/
│   │   ├── button.css      # 버튼 스타일
│   │   ├── form.css        # 폼 스타일
│   │   ├── header.css      # 헤더 스타일
│   │   ├── footer.css      # 푸터 스타일
│   │   └── ...
│   ├── layout/
│   │   ├── container.css   # 컨테이너 레이아웃
│   │   └── grid.css        # 그리드 시스템
│   ├── pages/
│   │   ├── index.css       # 메인 페이지
│   │   ├── signin.css      # 로그인
│   │   └── ...
│   └── utils/
│       └── responsive.css  # 반응형 유틸리티
│
└── assets/
    ├── icons/
    │   └── sprite.svg      # SVG 아이콘 스프라이트
    └── images/
        └── Logo-jadu.png   # 로고 이미지
```

### 🔑 핵심 구현 포인트

#### 1. **공통 모듈화**

```javascript
// js/config.js
const API_URL = "http://localhost:3000/api";
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
};

const Utils = {
  getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
};
```

#### 2. **에러 처리**

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || "요청에 실패했습니다.");
  }

  return data;
} catch (error) {
  console.error("API 오류:", error);
  alert(error.message);
}
```

#### 3. **이미지 Fallback**

```html
<img
  src="${product.image}"
  alt="${product.name}"
  onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'"
/>
```

#### 4. **동적 DOM 생성**

```javascript
// Event Delegation 사용 (동적 요소에 효과적)
document.getElementById("product-grid").addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (card) {
    const productId = card.dataset.productId;
    window.location.href = `detail.html?id=${productId}`;
  }
});
```

### 📱 반응형 디자인 브레이크포인트

```javascript
// config.js에서 관리
const BREAKPOINTS = {
  MOBILE: 320,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1440,
};
```

```css
/* Mobile First */
.header {
  flex-direction: column; /* 모바일: 세로 배치 */
}

@media (min-width: 768px) {
  .header {
    flex-direction: row; /* 태블릿 이상: 가로 배치 */
  }
}
```

### ⚡ 성능 최적화 팁

1. **이미지 최적화**: WebP 포맷 사용, lazy loading
2. **CSS/JS 번들링**: 프로덕션 환경에서는 번들러 사용 고려
3. **API 호출 최소화**: 필요한 데이터만 요청
4. **LocalStorage/SessionStorage 활용**: 불필요한 API 재요청 방지

### 🎓 참고 자료

- [MDN Web Docs - Fetch API](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API)
- [MDN Web Docs - Web Storage API](https://developer.mozilla.org/ko/docs/Web/API/Web_Storage_API)
- [MDN Web Docs - FormData](https://developer.mozilla.org/ko/docs/Web/API/FormData)
- [MDN Web Docs - URLSearchParams](https://developer.mozilla.org/ko/docs/Web/API/URLSearchParams)

---

## 📂 프로젝트 구조

```
open-market/
├── server/
│   ├── server.js      # 메인 서버 파일
│   └── db.json        # JSON 데이터베이스
├── web/               # 프론트엔드 파일 (선택사항)
│   ├── index.html     # 메인 페이지
│   ├── js/            # JavaScript 파일
│   ├── styles/        # CSS 파일
│   └── assets/        # 이미지, 아이콘 등
├── package.json       # 프로젝트 의존성
└── README.md          # 프로젝트 문서
```

## 🔧 데이터베이스 (db.json)

`server/db.json` 파일에 다음 컬렉션들이 포함되어 있습니다:

- **users**: 사용자 정보
- **products**: 상품 정보
- **cart**: 장바구니 정보
- **orders**: 주문 정보

JSON Server가 자동으로 CRUD 작업을 처리하며, 데이터 변경 시 자동으로 파일에 저장됩니다.

## ⚙️ 환경 설정

### JWT Secret Key

`server/server.js` 파일에서 JWT 시크릿 키를 변경할 수 있습니다:

```javascript
const SECRET_KEY = "your-secret-key"; // 실제 프로젝트에서는 환경변수 사용 권장
```

⚠️ **주의**: 프로덕션 환경에서는 환경변수로 관리하세요.

### 토큰 만료 시간

```javascript
const ACCESS_TOKEN_EXPIRES_IN = "1h"; // Access Token 만료 시간
const REFRESH_TOKEN_EXPIRES_IN = "1d"; // Refresh Token 만료 시간
```

## 🐛 트러블슈팅

### 포트가 이미 사용 중인 경우

```bash
# 3000 포트를 사용 중인 프로세스 찾기
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

### npm install 실패 시

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 데이터베이스 초기화

`server/db.json` 파일을 백업 파일로 복원하거나 직접 수정하세요.

## 📝 라이센스

ISC

## 👥 기여

버그 리포트나 기능 제안은 이슈로 등록해 주세요.

---

Made with ❤️ by Open Market Team
