// 전역 변수
let allProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let currentCategory = "all";

// 환경 감지
const isGitHubPages = window.location.hostname.includes("github.io");

// 데이터 경로 - 상대 경로 사용 (로컬과 GitHub Pages 모두 작동)
function getDataPath() {
  return "./db.json";
}

function getProductDetailPath(productId) {
  return `./pages/product-details/product-details.html?id=${productId}`;
}

// DOM 로드 후 초기화
document.addEventListener("DOMContentLoaded", async () => {
  initSwiper();
  initTabs();
  await loadProducts();
  initSearch();
});

// Swiper 초기화 (슬라이드/캐러셀)
function initSwiper() {
  const swiper = new Swiper(".swiper", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    // 터치 스와이프 지원 (기본값: true)
    touchRatio: 1,
  });
}

// 탭 UI 초기화
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");

  tabButtons.forEach((button, index) => {
    // 클릭 이벤트
    button.addEventListener("click", () => {
      switchTab(button);
    });

    // 키보드 이벤트
    button.addEventListener("keydown", (e) => {
      let targetIndex = index;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          targetIndex = index > 0 ? index - 1 : tabButtons.length - 1;
          break;
        case "ArrowRight":
          e.preventDefault();
          targetIndex = index < tabButtons.length - 1 ? index + 1 : 0;
          break;
        case "Home":
          e.preventDefault();
          targetIndex = 0;
          break;
        case "End":
          e.preventDefault();
          targetIndex = tabButtons.length - 1;
          break;
        default:
          return;
      }

      tabButtons[targetIndex].focus();
      switchTab(tabButtons[targetIndex]);
    });
  });
}

// 탭 전환 함수
function switchTab(selectedButton) {
  const tabButtons = document.querySelectorAll(".tab-button");

  // 모든 탭 비활성화
  tabButtons.forEach((button) => {
    button.classList.remove("active");
    button.setAttribute("aria-selected", "false");
  });

  // 선택된 탭 활성화
  selectedButton.classList.add("active");
  selectedButton.setAttribute("aria-selected", "true");

  // 카테고리 변경
  currentCategory = selectedButton.dataset.category;
  currentPage = 1;
  renderProducts();
}

// 상품 목록 로드
async function loadProducts() {
  const loadingSkeleton = document.getElementById("loading-skeleton");
  const errorMessage = document.getElementById("error-message");
  const productGrid = document.getElementById("product-grid");

  try {
    // 로딩 스켈레톤 표시
    loadingSkeleton.style.display = "grid";
    errorMessage.style.display = "none";
    productGrid.style.display = "none";

    // db.json에서 상품 데이터 가져오기
    const response = await fetch(getDataPath());
    if (!response.ok) throw new Error("데이터 로드 실패");

    const data = await response.json();
    allProducts = data.products || [];

    // 상품 렌더링
    renderProducts();

    // 로딩 완료
    loadingSkeleton.style.display = "none";
    productGrid.style.display = "grid";
  } catch (error) {
    console.error("상품 로드 실패:", error);

    // 에러 표시
    loadingSkeleton.style.display = "none";
    errorMessage.style.display = "flex";

    // 재시도 버튼 이벤트
    const retryButton = document.querySelector(".retry-button");
    retryButton.onclick = loadProducts;
  }
}

// 상품 렌더링
function renderProducts() {
  const productGrid = document.getElementById("product-grid");

  // 카테고리 필터링 (현재는 전체 상품만 표시, 필요시 확장 가능)
  let filteredProducts = allProducts;

  // 페이지네이션 계산
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // 상품 카드 렌더링
  productGrid.innerHTML = paginatedProducts
    .map(
      (product) => `
    <article class="product-card" data-product-id="${product.id}">
      <a href="${getProductDetailPath(product.id)}" class="product-link">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
        </div>
        <div class="product-info">
          <p class="product-seller">${product.seller.store_name}</p>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">
            <strong>${product.price.toLocaleString()}</strong>원
          </p>
        </div>
      </a>
    </article>
  `
    )
    .join("");

  // 페이지네이션 렌더링
  renderPagination(filteredProducts.length);
}

// 페이지네이션 렌더링
function renderPagination(totalItems) {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // 이전 버튼
  if (currentPage > 1) {
    paginationHTML += `<button class="page-button" data-page="${
      currentPage - 1
    }" aria-label="이전 페이지">‹</button>`;
  }

  // 페이지 번호
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      paginationHTML += `
        <button
          class="page-button ${i === currentPage ? "active" : ""}"
          data-page="${i}"
          aria-label="페이지 ${i}"
          ${i === currentPage ? 'aria-current="page"' : ""}>
          ${i}
        </button>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += '<span class="page-ellipsis">...</span>';
    }
  }

  // 다음 버튼
  if (currentPage < totalPages) {
    paginationHTML += `<button class="page-button" data-page="${
      currentPage + 1
    }" aria-label="다음 페이지">›</button>`;
  }

  pagination.innerHTML = paginationHTML;

  // 페이지 버튼 이벤트 연결
  const pageButtons = pagination.querySelectorAll(".page-button");
  pageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = parseInt(button.dataset.page);
      renderProducts();

      // 페이지 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// 검색 기능 초기화
function initSearch() {
  const searchForm = document.querySelector(".search-form");
  const searchInput = searchForm.querySelector('input[name="q"]');

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (!query) {
      // 검색어가 없으면 전체 상품 표시
      await loadProducts();
      return;
    }

    try {
      const loadingSkeleton = document.getElementById("loading-skeleton");
      const productGrid = document.getElementById("product-grid");

      loadingSkeleton.style.display = "grid";
      productGrid.style.display = "none";

      // db.json에서 검색
      const response = await fetch(getDataPath());
      if (!response.ok) throw new Error("데이터 로드 실패");

      const data = await response.json();
      const products = data.products || [];

      // 클라이언트 측 검색 (이름 포함)
      allProducts = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );

      currentPage = 1;
      renderProducts();

      loadingSkeleton.style.display = "none";
      productGrid.style.display = "grid";
    } catch (error) {
      console.error("검색 실패:", error);
    }
  });
}
