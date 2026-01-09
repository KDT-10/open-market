// API 기본 설정
const API_BASE_URL = "http://localhost:3000";

// 기본 fetch 래퍼 함수
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // 204 No Content 처리
    if (response.status === 204) {
      return { isSuccessful: true, detail: "요청이 성공했습니다." };
    }

    const data = await response.json();

    // 에러 처리
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

// API 함수들
export const API = {
  // 전체 상품 목록 조회
  getProducts: async () => {
    return fetchAPI(`${API_BASE_URL}/products`);
  },

  // 상품 상세 조회
  getProduct: async (productId) => {
    return fetchAPI(`${API_BASE_URL}/products/${productId}`);
  },

  // 검색 기능
  searchProducts: async (query) => {
    return fetchAPI(
      `${API_BASE_URL}/products?name_like=${encodeURIComponent(query)}`
    );
  },
};
