import { h, $ } from '/scripts/lib/dom.js';
import { products } from '/scripts/data/products.js';
import { formatPrice } from '/scripts/app/render-common.js';
import { storage } from '/scripts/lib/storage.js';

function mapCartItems() {
  const cart = storage.getCart();
  return cart
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.id),
    }))
    .filter((i) => i.product);
}

function renderCartItems() {
  const root = $('#cart-items');
  root.innerHTML = '';
  for (const item of mapCartItems()) {
    const p = item.product;
    const row = h(
      'div',
      { class: 'cart__item' },
      h('img', {
        src: p.images[0],
        alt: p.title,
        width: 96,
        height: 128,
        style: 'object-fit:cover;border-radius:6px;',
      }),
      h(
        'div',
        {},
        h('div', { style: 'font-weight:600' }, p.brand + ' - ' + p.title),
        h('div', {}, formatPrice(p.price)),
        h(
          'div',
          {},
          'Qty: ',
          h('button', { onclick: function () { changeQty(p.id, -1); } }, '−'),
          ' ' + item.qty + ' ',
          h('button', { onclick: function () { changeQty(p.id, +1); } }, '+')
        )
      ),
      h('button', { onclick: function () { removeItem(p.id); } }, 'Remove')
    );
    root.appendChild(row);
  }
}

function totals() {
  const items = mapCartItems();
  const itemTotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const mrpTotal = items.reduce((sum, i) => sum + i.product.mrp * i.qty, 0);
  const discount = mrpTotal - itemTotal;
  return { itemTotal, mrpTotal, discount, payable: itemTotal };
}

function renderSummary() {
  const t = totals();
  const root = $('#cart-summary');
  root.innerHTML = '';
  root.appendChild(h('div', { style: 'font-weight:700;margin-bottom:8px;' }, 'Price Details'));
  root.appendChild(h('div', {}, 'Total MRP: ' + formatPrice(t.mrpTotal)));
  root.appendChild(h('div', {}, 'Discount: -' + formatPrice(t.discount)));
  root.appendChild(h('div', { style: 'font-weight:700;margin-top:8px;' }, 'Total: ' + formatPrice(t.payable)));
  root.appendChild(h('button', { class: 'btn btn--primary', style: 'width:100%;margin-top:12px;' }, 'Place Order'));
}

function changeQty(id, delta) {
  const cart = storage.getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    const idx = cart.findIndex((i) => i.id === id);
    cart.splice(idx, 1);
  }
  storage.setCart(cart);
  renderCartItems();
  renderSummary();
}

function removeItem(id) {
  const cart = storage.getCart().filter((i) => i.id !== id);
  storage.setCart(cart);
  renderCartItems();
  renderSummary();
}

function initCart() {
  renderCartItems();
  renderSummary();
}

document.addEventListener('DOMContentLoaded', initCart);
