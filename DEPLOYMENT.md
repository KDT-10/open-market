# 배포 가이드

이 문서는 ZADU 오픈마켓 프로젝트를 GitHub Pages(프론트엔드)와 Vercel(백엔드 API)에 배포하는 방법을 설명합니다.

## 📋 목차

- [배포 구조](#-배포-구조)
- [사전 준비](#-사전-준비)
- [백엔드 API 배포 (Vercel)](#-백엔드-api-배포-vercel)
- [프론트엔드 배포 (GitHub Pages)](#-프론트엔드-배포-github-pages)
- [배포 후 설정](#-배포-후-설정)
- [문제 해결](#-문제-해결)

## 🏗 배포 구조

```
┌─────────────────┐         ┌─────────────────┐
│  GitHub Pages   │ ───────>│   Vercel API    │
│  (프론트엔드)    │  API 호출 │   (백엔드)       │
│                 │         │                 │
│ https://        │         │ https://        │
│ username.       │         │ your-api.       │
│ github.io       │         │ vercel.app/api  │
└─────────────────┘         └─────────────────┘
```

- **프론트엔드**: GitHub Pages에서 정적 파일 호스팅
- **백엔드**: Vercel에서 Node.js API 서버 실행
- **통신**: CORS가 설정된 RESTful API

## 📦 사전 준비

### 1. GitHub 계정 및 저장소
- GitHub 계정이 있어야 합니다
- 프로젝트를 저장할 GitHub 저장소를 생성합니다

### 2. Vercel 계정
- [Vercel 회원가입](https://vercel.com/signup) (GitHub 계정으로 간편 가입 가능)
- Vercel CLI 설치 (선택사항)
  ```bash
  npm install -g vercel
  ```

### 3. 필수 파일 확인
현재 프로젝트에 다음 파일들이 있는지 확인하세요:
- ✅ `vercel.json` - Vercel 배포 설정
- ✅ `web/scripts/config.js` - API URL 자동 전환 설정
- ✅ `.env.example` - 환경 변수 예시
- ✅ `server/server.js` - 백엔드 API 서버
- ✅ `server/db.json` - 데이터베이스

## 🚀 백엔드 API 배포 (Vercel)

### 방법 1: Vercel 웹사이트에서 배포 (추천)

#### Step 1: Vercel에 프로젝트 연결

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. **"New Project"** 또는 **"Add New..."** → **"Project"** 클릭
3. GitHub 저장소 연결
   - "Import Git Repository" 클릭
   - GitHub 계정 연동 (처음이라면)
   - 배포할 저장소 선택 → **"Import"** 클릭

#### Step 2: 프로젝트 설정

배포 설정 화면에서 다음과 같이 입력:

```
Framework Preset: Other
Root Directory: ./
Build Command: (비워두기)
Output Directory: (비워두기)
Install Command: npm install
```

#### Step 3: 환경 변수 설정

"Environment Variables" 섹션에서 다음 변수들을 추가:

| Key | Value | 설명 |
|-----|-------|------|
| `SECRET_KEY` | `your-very-secure-secret-key-here` | JWT 서명용 비밀키 (랜덤 문자열) |
| `NODE_ENV` | `production` | 프로덕션 환경 설정 |

**중요**: `SECRET_KEY`는 반드시 복잡한 랜덤 문자열로 설정하세요!

#### Step 4: 배포 시작

1. **"Deploy"** 버튼 클릭
2. 배포가 완료될 때까지 기다림 (약 1-2분)
3. 배포 완료 후 제공되는 URL 확인 (예: `https://your-project.vercel.app`)

#### Step 5: API 테스트

배포된 API가 정상 작동하는지 확인:

```bash
# 상품 목록 조회 테스트
curl https://your-project.vercel.app/api/products
```

또는 브라우저에서 직접 접속:
```
https://your-project.vercel.app/api/products
```

### 방법 2: Vercel CLI로 배포

```bash
# 1. Vercel CLI로 로그인
vercel login

# 2. 프로젝트 루트에서 배포
vercel

# 3. 프로덕션 배포
vercel --prod

# 4. 환경 변수 설정
vercel env add SECRET_KEY
vercel env add NODE_ENV
```

### Vercel 배포 완료 후

배포가 완료되면 다음과 같은 URL을 받게 됩니다:
```
https://your-project-name.vercel.app
```

이 URL을 **복사**해두세요. 다음 단계에서 사용합니다!

## 🌐 프론트엔드 배포 (GitHub Pages)

### Step 1: config.js 파일 수정

`web/scripts/config.js` 파일을 열어 Vercel API URL로 수정:

```javascript
const API_CONFIG = {
  // 로컬 개발 환경
  local: 'http://localhost:3000/api',

  // GitHub Pages 배포 환경 - 여기에 Vercel URL 입력
  production: 'https://your-project-name.vercel.app/api',  // ← 이 부분을 수정!

  // 현재 환경에 맞는 API URL 반환
  getBaseURL() {
    return isLocalhost ? this.local : this.production;
  }
};
```

### Step 2: GitHub에 커밋 및 푸시

```bash
# 변경사항 커밋
git add .
git commit -m "Update API URL for production"
git push origin main
```

### Step 3: GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. "Source" 섹션에서 다음과 같이 설정:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (또는 `master`)
   - **Folder**: `/ (root)` 또는 `/web` (프로젝트 구조에 따라)
5. **Save** 버튼 클릭

### Step 4: GitHub Pages URL 확인

설정 후 약 1-2분 뒤 페이지 상단에 다음과 같은 메시지가 표시됩니다:

```
Your site is published at https://username.github.io/repository-name/
```

이 URL로 접속하여 사이트가 정상 작동하는지 확인하세요!

### (옵션) 커스텀 도메인 설정

GitHub Pages에서 커스텀 도메인을 사용하려면:

1. GitHub Pages 설정 페이지에서 "Custom domain" 입력
2. DNS 설정에서 CNAME 레코드 추가
   ```
   www.yourdomain.com → username.github.io
   ```

## ⚙ 배포 후 설정

### 1. CORS 설정 확인

Vercel API에 CORS가 올바르게 설정되어 있는지 확인하세요. `vercel.json` 파일에 다음 내용이 있어야 합니다:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

**보안 강화를 위해** `"value": "*"` 대신 특정 도메인만 허용할 수 있습니다:
```json
"value": "https://username.github.io"
```

### 2. 환경 변수 확인

Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인:
- Project → Settings → Environment Variables

### 3. 로그 확인

배포 후 에러가 발생하면 Vercel 대시보드에서 로그 확인:
- Project → Deployments → (최신 배포 클릭) → Functions 탭

## 🔍 문제 해결

### 1. API 호출 시 CORS 에러

**증상**: 브라우저 콘솔에 다음과 같은 에러 표시
```
Access to fetch at 'https://api.vercel.app/api/products' from origin 'https://username.github.io' has been blocked by CORS policy
```

**해결 방법**:
1. `vercel.json`의 CORS 설정 확인
2. Vercel에 재배포: `vercel --prod`
3. 또는 `server/server.js`에 CORS 미들웨어 추가:
   ```javascript
   const cors = require('cors');
   server.use(cors({
     origin: ['https://username.github.io', 'http://localhost:3000'],
     credentials: true
   }));
   ```

### 2. GitHub Pages에서 404 에러

**증상**: 페이지 새로고침 시 404 에러

**해결 방법**:
1. 프로젝트 루트에 `404.html` 파일 생성 (이미 있음)
2. 또는 SPA 라우팅을 위해 `404.html`을 `index.html`로 리다이렉트

### 3. API 응답이 없음

**체크리스트**:
- [ ] Vercel 배포가 완료되었는가?
- [ ] `config.js`의 `production` URL이 올바른가?
- [ ] 브라우저 개발자 도구 → Network 탭에서 API 요청 확인
- [ ] Vercel 로그에서 에러 확인

### 4. 로그인/인증이 작동하지 않음

**확인 사항**:
- [ ] Vercel 환경 변수에 `SECRET_KEY`가 설정되었는가?
- [ ] LocalStorage에 토큰이 저장되고 있는가?
- [ ] Authorization 헤더가 올바르게 전송되는가?

### 5. 데이터가 저장되지 않음

**주의**: Vercel의 Serverless 환경에서는 `db.json` 파일 변경이 **영구적으로 저장되지 않습니다**.

**해결 방법**:
1. 실제 데이터베이스 사용 (MongoDB, PostgreSQL 등)
2. Vercel KV, Vercel Postgres 등 Vercel 제공 데이터베이스 사용
3. Firebase, Supabase 등 외부 BaaS 사용

현재는 **읽기 전용**으로 작동합니다 (상품 조회는 가능, 장바구니/주문 저장은 세션 동안만 유지).

## 📊 배포 상태 확인

### 프론트엔드 (GitHub Pages)
```
✅ 웹사이트: https://username.github.io/repository-name/
✅ 빌드 상태: GitHub → Settings → Pages
```

### 백엔드 (Vercel)
```
✅ API 서버: https://your-project.vercel.app/api
✅ 배포 상태: https://vercel.com/dashboard
✅ API 문서: https://your-project.vercel.app/api-docs (Swagger)
```

## 🔄 업데이트 방법

### 프론트엔드 업데이트
```bash
# 코드 수정 후
git add .
git commit -m "Update frontend"
git push origin main

# GitHub Pages가 자동으로 재배포됩니다 (약 1-2분 소요)
```

### 백엔드 업데이트
```bash
# 코드 수정 후
git add .
git commit -m "Update backend"
git push origin main

# Vercel이 자동으로 재배포됩니다 (약 1-2분 소요)
# 또는 수동 배포: vercel --prod
```

## 🎯 체크리스트

배포 전 마지막 확인:

### 백엔드 (Vercel)
- [ ] `vercel.json` 파일 존재
- [ ] Vercel 환경 변수 설정 (`SECRET_KEY`, `NODE_ENV`)
- [ ] API 테스트 완료 (`https://your-project.vercel.app/api/products`)
- [ ] CORS 설정 확인
- [ ] Swagger 문서 접근 가능 (`/api-docs`)

### 프론트엔드 (GitHub Pages)
- [ ] `config.js`에 Vercel API URL 입력
- [ ] GitHub 저장소에 코드 푸시 완료
- [ ] GitHub Pages 활성화
- [ ] 웹사이트 접속 확인
- [ ] API 연동 테스트 (상품 목록 불러오기)

## 📞 추가 도움말

- [Vercel 공식 문서](https://vercel.com/docs)
- [GitHub Pages 가이드](https://docs.github.com/en/pages)
- [CORS 설정 가이드](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)

---

**배포 완료!** 🎉

문제가 발생하면 위의 [문제 해결](#-문제-해결) 섹션을 참고하거나, GitHub Issues에 질문을 남겨주세요.
