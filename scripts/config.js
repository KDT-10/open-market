// API 설정 파일

// 환경 감지
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isGitHubPages = window.location.hostname.includes('github.io');

// API Base URL 설정
const API_CONFIG = {
  // 로컬 개발 환경
  local: 'http://localhost:3000/api',

  // GitHub Pages 배포 환경 - JSON 파일 직접 사용
  production: window.location.origin,  // GitHub Pages에서 JSON 파일 직접 읽기

  // 현재 환경에 맞는 API URL 반환
  getBaseURL() {
    return isLocalhost ? this.local : this.production;
  },

  // GitHub Pages용 - db.json 직접 가져오기
  async getProducts() {
    if (isLocalhost) {
      const response = await fetch(`${this.local}/products`);
      return response.json();
    } else {
      // GitHub Pages에서는 db.json 직접 읽기
      const response = await fetch(`${this.production}/db.json`);
      const data = await response.json();
      return data.products;
    }
  },

  // 기타 데이터도 동일하게
  async getDB() {
    if (isLocalhost) {
      return null; // 로컬에서는 API 사용
    } else {
      const response = await fetch(`${this.production}/db.json`);
      return response.json();
    }
  }
};

// 스토리지 키 상수
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  CART_DATA: 'cartData',
  ORDER_DATA: 'orderData'
};

// 유틸리티 함수들
const Utils = {
  // 사용자 정보 가져오기
  getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  // 로그인 상태 확인
  isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  // 숫자 포맷팅 (천단위 콤마)
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // 인증 헤더 생성
  getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  },

  // API 호출 공통 함수 (인증 포함)
  async fetchWithAuth(url, options = {}) {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`
      }
    });

    // 401 에러 (토큰 만료)
    if (response.status === 401) {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      // Refresh Token으로 새 Access Token 발급
      const refreshResponse = await fetch(`${API_CONFIG.getBaseURL()}/accounts/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);

        // 원래 요청 재시도
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${data.access}`
          }
        });
      } else {
        // Refresh Token도 만료 -> 로그인 페이지로 이동
        localStorage.clear();
        window.location.href = '/pages/login/login.html';
      }
    }

    return response;
  },

  // 로그아웃
  logout() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.clear();
    window.location.href = '/pages/login/login.html';
  }
};

// 반응형 브레이크포인트
const BREAKPOINTS = {
  MOBILE: 320,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1440
};

// Export (모듈로 사용할 경우)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, STORAGE_KEYS, Utils, BREAKPOINTS };
}