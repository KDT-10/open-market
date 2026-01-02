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

export async function loadProductElem(parent, url, productInfo, append = true) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTML 불러오기 실패');

    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const productCard = doc.getElementsByClassName("product-card")[0];
    const productImgWrapper = doc.getElementsByClassName("product-img-wrapper")[0];
    const productSeller = doc.getElementsByClassName("product-seller")[0];
    const productName = doc.getElementsByClassName("product-name")[0];
    const productPriceText = doc.getElementsByClassName("product-price-text")[0];
    const productImg = productImgWrapper.querySelector('img');
    productImg.src = productInfo.img;
    productSeller.textContent = productInfo.seller;
    productName.textContent = productInfo.name;
    productPriceText.textContent = productInfo.price;

    append ? parent.append(...doc.body.children) : parent.prepend(...doc.body.children);

    return productCard;
  } catch (err) {
    console.error(err);
  }
}

export async function loadCartItemElem(url, data) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTML 불러오기 실패');

    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const cartItem = doc.getElementsByClassName("cart-item")[0];
    const productImgWrapper = doc.getElementsByClassName("product-img-wrapper")[0];
    const brand = doc.getElementsByClassName("main-text-brand")[0];
    const name = doc.getElementsByClassName("main-text-name")[0];
    const priceUnit = doc.getElementsByClassName("main-text-price-unit")[0];
    const delivery = doc.getElementsByClassName("secondary-text-delivery")[0];
    const priceRed = doc.getElementsByClassName("price-red")[0];
    const productImg = productImgWrapper.querySelector('img');
    productImg.src = data.image;
    brand.textContent = data.seller.store_name;
    name.textContent = data.name;
    priceUnit.textContent = `${data.price.toLocaleString()}원`;
    delivery.textContent = data.shipping_method;
    priceRed.textContent = `${(data.shipping_fee + data.price).toLocaleString()}원`;

    return cartItem;
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