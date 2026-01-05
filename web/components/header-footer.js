// header
loadHTMLToBody('/components/header.html', false)
  .then(() => {
    // 장바구니 버튼
    const headerCartBtn = document.querySelector(
      'header .icon-group .icon-item[aria-label="장바구니"]'
    );
    if (headerCartBtn) {
      headerCartBtn.addEventListener('click', requireLogin(() => {
        openCartConfirmModal(); // 기존 상품 페이지 JS 함수 그대로 사용
      }));
    }

    // 마이페이지 버튼
    const mypageBtn = document.querySelector(
      'header .icon-group .icon-item[aria-label="마이페이지"]'
    );
    if (mypageBtn) {
      mypageBtn.addEventListener('click', () => {
        if (!getAccessToken()) {
          //TODO: 로그인 페이지로 이동
          window.location.href = '/pages/login.html';
        } else {
          //TODO: 마이페이지로 이동
          window.location.href = '/pages/404.html';
        }
      });
    }
  });

// footer
loadHTMLToBody('/components/footer.html', true);
loadCSS('/components/footer.css');

// HTML 불러오기
async function loadHTMLToBody(url, append = false) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTML 불러오기 실패');

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    append
      ? document.body.append(...doc.body.children)
      : document.body.prepend(...doc.body.children);
  } catch (err) {
    console.error(err);
  }
}

// CSS 불러오기
function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}
