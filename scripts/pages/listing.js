import { h, $, $all } from '/scripts/lib/dom.js';
import { products } from '/scripts/data/products.js';
import { productCard } from '/scripts/app/render-common.js';

let activeFilters = { category: new Set(), brand: new Set(), price: null, rating: null };
let sortBy = 'relevance';

function renderFilters() {
  // Category
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  const categoryRoot = $('#filter-category');
  categoryRoot.innerHTML = '';
  for (const c of categories) {
    categoryRoot.appendChild(
      h(
        'label',
        {},
        h('input', {
          type: 'checkbox',
          value: c,
          onchange: function (e) {
            if (e.target.checked) activeFilters.category.add(c);
            else activeFilters.category.delete(c);
            update();
          },
        }),
        ' ',
        c
      )
    );
  }

  // Brand
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const brandRoot = $('#filter-brand');
  brandRoot.innerHTML = '';
  for (const b of brands) {
    brandRoot.appendChild(
      h(
        'label',
        {},
        h('input', {
          type: 'checkbox',
          value: b,
          onchange: function (e) {
            if (e.target.checked) activeFilters.brand.add(b);
            else activeFilters.brand.delete(b);
            update();
          },
        }),
        ' ',
        b
      )
    );
  }

  // Price (simple ranges)
  const priceRoot = $('#filter-price');
  priceRoot.innerHTML = '';
  const ranges = [
    { id: 'lt-1000', label: 'Under ₹1000', test: function (p) { return p.price < 1000; } },
    { id: '1000-2000', label: '₹1000-₹2000', test: function (p) { return p.price >= 1000 && p.price <= 2000; } },
    { id: 'gt-2000', label: 'Over ₹2000', test: function (p) { return p.price > 2000; } },
  ];
  for (const r of ranges) {
    priceRoot.appendChild(
      h(
        'label',
        {},
        h('input', {
          name: 'price',
          type: 'radio',
          onchange: function () {
            activeFilters.price = r;
            update();
          },
        }),
        ' ',
        r.label
      )
    );
  }

  // Rating
  const ratingRoot = $('#filter-rating');
  ratingRoot.innerHTML = '';
  for (const r of [4, 3, 2]) {
    ratingRoot.appendChild(
      h(
        'label',
        {},
        h('input', {
          name: 'rating',
          type: 'radio',
          onchange: function () {
            activeFilters.rating = r;
            update();
          },
        }),
        ' ' + r + '★ & above'
      )
    );
  }
}

function applyFilters(list, query) {
  let result = list;
  if (activeFilters.category.size) {
    result = result.filter((p) => activeFilters.category.has(p.category));
  }
  if (activeFilters.brand.size) {
    result = result.filter((p) => activeFilters.brand.has(p.brand));
  }
  if (activeFilters.price) {
    result = result.filter(activeFilters.price.test);
  }
  if (activeFilters.rating) {
    result = result.filter((p) => p.rating >= activeFilters.rating);
  }
  if (query) {
    const q = query.toLowerCase();
    result = result.filter((p) => (p.brand + ' ' + p.title).toLowerCase().includes(q));
  }
  return result;
}

function applySort(list) {
  const arr = list.slice();
  if (sortBy === 'price-asc') return arr.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') return arr.sort((a, b) => b.price - a.price);
  if (sortBy === 'rating-desc') return arr.sort((a, b) => b.rating - a.rating);
  if (sortBy === 'new') return arr.reverse();
  return arr;
}

function renderGrid(list) {
  const grid = $('#product-grid');
  grid.innerHTML = '';
  for (const p of list) grid.appendChild(productCard(p));
}

function renderChips(query) {
  const chips = $('#chips');
  chips.innerHTML = '';
  if (query) chips.appendChild(h('span', { class: 'chip' }, 'Search: ' + query));
  activeFilters.category.forEach((c) => chips.appendChild(h('span', { class: 'chip' }, c)));
  activeFilters.brand.forEach((b) => chips.appendChild(h('span', { class: 'chip' }, b)));
  if (activeFilters.price) chips.appendChild(h('span', { class: 'chip' }, activeFilters.price.label));
  if (activeFilters.rating) chips.appendChild(h('span', { class: 'chip' }, activeFilters.rating + '★ & up'));
}

function update() {
  const queryInput = $('#search');
  const query = queryInput ? queryInput.value.trim() : '';
  const filtered = applyFilters(products, query);
  const sorted = applySort(filtered);
  renderGrid(sorted);
  renderChips(query);
}

function initListing() {
  renderFilters();
  const search = $('#search');
  if (search) search.addEventListener('input', update);
  const sort = $('#sort');
  if (sort) sort.addEventListener('change', function (e) { sortBy = e.target.value; update(); });
  update();
}

document.addEventListener('DOMContentLoaded', initListing);
