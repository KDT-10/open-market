fetch('http://localhost:3000/products')
  .then(res => res.json())
  .then(data => {
    console.log(data);
  });

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