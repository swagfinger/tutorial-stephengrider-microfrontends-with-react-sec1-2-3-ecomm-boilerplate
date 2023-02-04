import faker from 'faker';

const mount = (el) => {
  let products = '';

  for (let i = 0; i < 5; i++) {
    const name = faker.commerce.productName();
    products += `<div>${name}</div>`;
  }
  el.innerHTML = products;
};

//dev mode - mount content to dom node
if (process.env.NODE_ENV === 'development') {
  const el = document.querySelector('#dev-products');

  if (el) {
    mount(el);
  }
}

//production - export
export { mount };
