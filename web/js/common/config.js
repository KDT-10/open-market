export const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"  // 로컬 개발
    : "https://open-market-jade.vercel.app/api";  // Vercel 배포