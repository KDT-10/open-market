// tab 버튼 //
const tabbtn = document.getElementById('tab-btn');
const tabReview = document.getElementById('tab-review');
const tabQna = document.getElementById('tab-qna');
const tabReturn = document.getElementById('tab-return');

const tabs = [tabbtn, tabReview, tabQna, tabReturn];

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// 로그인 모달 //

const buyBtn = document.querySelector('.buy');
const cartBtn = document.querySelector('.장바구니');

const modal = document.getElementById('loginModal');
const modalNo = document.getElementById('modalNo');
const modalYes = document.getElementById('modalYes');
const overlay = document.querySelector('.modal-overlay');
const closeBtn = document.querySelector('.modal-close');

const isLogin = false; // 임시

function openModal() {
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function handleRequireLogin(e) {
  e.preventDefault();
  if (!isLogin) {
    openModal();
    return;
  }
}

buyBtn.addEventListener('click', handleRequireLogin);
cartBtn.addEventListener('click', handleRequireLogin);

modalNo.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);

modalYes.addEventListener('click', () => {
  window.location.href = '/login.html';
});
