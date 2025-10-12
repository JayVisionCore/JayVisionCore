import { h, $ } from '/scripts/lib/dom.js';
import { products } from '/scripts/data/products.js';
import { formatPrice } from '/scripts/app/render-common.js';
import { storage } from '/scripts/lib/storage.js';

function getIdFromQuery() {
  const url = new URL(location.href);
  return url.searchParams.get('id');
}

function renderProduct(product) {
  const root = $('#product-detail');
  root.innerHTML = '';
  const image = h('div', { class: 'product-detail__image' }, h('img', { src: product.images[0], alt: product.title }));
  const info = h(
    'div',
    { class: 'product-detail__info' },
    h('h1', {}, product.brand + ' - ' + product.title),
    h(
      'div',
      { class: 'price' },
      h('span', { class: 'price__current' }, formatPrice(product.price)),
      h('span', { class: 'price__mrp' }, formatPrice(product.mrp))
    ),
    h('div', {}, 'Rating: ' + product.rating + '★'),
    h(
      'div',
      { class: 'product-detail__actions' },
      h(
        'button',
        { class: 'btn btn--primary', onclick: function () { addToCart(product.id); } },
        'Add to Bag'
      ),
      h('button', { class: 'btn', onclick: function () { toggleWishlist(product.id); } }, 'Wishlist')
    )
  );
  root.appendChild(image);
  root.appendChild(info);
}

function addToCart(productId) {
  const cart = storage.getCart();
  const existing = cart.find((i) => i.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  storage.setCart(cart);
  alert('Added to Bag');
}

function toggleWishlist(productId) {
  const list = storage.getWishlist();
  const idx = list.indexOf(productId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(productId);
  storage.setWishlist(list);
  alert('Wishlist updated');
}

function initProduct() {
  const id = getIdFromQuery();
  const product = products.find((p) => p.id === id) || products[0];
  renderProduct(product);
}

document.addEventListener('DOMContentLoaded', initProduct);
