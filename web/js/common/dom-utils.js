export async function loadHTMLElem(parent, url, append = true) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTML 불러오기 실패');

    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    append ? parent.append(...doc.body.children) : parent.prepend(...doc.body.children);
  } catch (err) {
    console.error(err);
  }
}

// async/await 불필요
// css는 브라우저에서 link 태그를 비동기로 로드함
export function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}