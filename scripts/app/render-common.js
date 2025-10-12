import { h, $ } from '/scripts/lib/dom.js';

function navLink(href, label) {
  return h('a', { href: href }, label);
}

function renderHeader() {
  const header = $('#site-header');
  const nav = h(
    'nav',
    { class: 'nav container' },
    h(
      'a',
      { class: 'nav__logo', href: '/' },
      h('img', {
        src: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png',
        alt: 'Myntra',
        width: 28,
        height: 28,
      }),
      'Myntra'
    ),
    h(
      'div',
      { class: 'nav__links' },
      navLink('/listing.html', 'Men'),
      navLink('/listing.html', 'Women'),
      navLink('/listing.html', 'Kids'),
      navLink('/listing.html', 'Home & Living'),
      navLink('/listing.html', 'Beauty')
    ),
    h('div', { class: 'nav__actions' }, navLink('/wishlist.html', 'Wishlist'), navLink('/cart.html', 'Bag'))
  );
  header.replaceWith(h('header', { class: 'site-header' }, nav));
}

function renderFooter() {
  const footer = $('#site-footer');
  const year = new Date().getFullYear();
  footer.textContent = '© ' + year + ' Myntra Clone (Vanilla JS)';
}

export function formatPrice(value) {
  return '₹' + value.toLocaleString('en-IN');
}

export function productCard(product) {
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  return h(
    'article',
    { class: 'product-card' },
    h(
      'a',
      { href: '/product.html?id=' + product.id },
      h('img', { src: product.images[0], alt: product.title })
    ),
    h(
      'div',
      { class: 'product-card__body' },
      h('div', { class: 'product-card__brand' }, product.brand),
      h('div', { class: 'product-card__title' }, product.title),
      h(
        'div',
        { class: 'price' },
        h('span', { class: 'price__current' }, formatPrice(product.price)),
        h('span', { class: 'price__mrp' }, formatPrice(product.mrp)),
        h('span', { class: 'price__off' }, String(discount) + '% OFF')
      )
    )
  );
}

export function renderCommon() {
  renderHeader();
  renderFooter();
}

document.addEventListener('DOMContentLoaded', renderCommon);
