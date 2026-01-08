// API 기본 설정
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const isGitHubPages = window.location.hostname.includes("github.io");

const API_BASE_URL = isLocalhost
  ? "http://localhost:3000/api"  // 로컬 개발 시
  : "/api";  // Vercel 배포 시

// GitHub Pages는 정적 사이트이므로 API 없음
const USE_STATIC_DATA = isGitHubPages;

// GitHub Pages용 정적 데이터 헬퍼
async function fetchFromStaticData(endpoint) {
  // /products?page_size=1000 -> db.json
  // /products/4 -> db.json에서 id=4 찾기

  const dbPath = '/team1-JADUPAGE/web/db.json';
  const response = await fetch(dbPath);
  if (!response.ok) throw new Error('데이터 로드 실패');

  const data = await response.json();

  // 엔드포인트 파싱
  if (endpoint.startsWith('/products/')) {
    // 단일 상품 조회: /products/4
    const productId = parseInt(endpoint.split('/products/')[1]);
    const product = data.products.find(p => p.id === productId);
    if (!product) throw new Error('상품을 찾을 수 없습니다');
    return new Response(JSON.stringify(product), { status: 200 });
  } else if (endpoint.startsWith('/products')) {
    // 상품 목록 조회: /products?search=...&page_size=1000
    const url = new URL('http://dummy.com' + endpoint);
    const searchQuery = url.searchParams.get('search');

    let products = data.products || [];

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.info.toLowerCase().includes(query)
      );
    }

    return new Response(JSON.stringify({ results: products, count: products.length }), { status: 200 });
  }

  // 그 외 엔드포인트는 지원하지 않음
  throw new Error('GitHub Pages에서는 이 기능을 사용할 수 없습니다');
}

// API 요청 헬퍼 함수
async function fetchAPI(endpoint, options = {}) {
  // GitHub Pages에서는 정적 데이터 사용
  if (USE_STATIC_DATA) {
    return fetchFromStaticData(endpoint);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // localStorage에서 토큰 가져오기
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // 401 에러 시 토큰 갱신 시도
    if (response.status === 401 && endpoint !== '/accounts/token/refresh') {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // 토큰 갱신 성공 시 원래 요청 재시도
        headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers
        });
        return retryResponse;
      } else {
        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/web/pages/login/login.html';
        throw new Error('Authentication failed');
      }
    }

    return response;
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
}

// Access Token 갱신
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/accounts/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return false;
  }
}

// 로그인 상태 확인
function isLoggedIn() {
  return !!localStorage.getItem('accessToken');
}

// 사용자 정보 가져오기
function getUserInfo() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Export
export { API_BASE_URL, fetchAPI, refreshAccessToken, isLoggedIn, getUserInfo };
