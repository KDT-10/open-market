import { API_BASE_URL } from "./config.js";

// GET /api/products 호출하여 상품 목록 표시
export async function fetchProducts(searchTerm = "") {
  const url = `${API_BASE_URL}/products?page=1&page_size=20${searchTerm ? `&search=${searchTerm}` : ""}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}