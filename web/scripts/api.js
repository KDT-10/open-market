// API 기본 설정
const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const API_BASE_URL = isProduction
  ? "/api"  // Vercel 배포 시
  : "http://localhost:3000/api";  // 로컬 개발 시

// API 요청 헬퍼 함수
async function fetchAPI(endpoint, options = {}) {
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
