import faker from 'faker';

const cartText = `<div> you have ${faker.random.number()} items in your cart`;

document.querySelector('#cart-dev').innerHTML = cartText;
