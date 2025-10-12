import { h, $ } from '/scripts/lib/dom.js';
import { products } from '/scripts/data/products.js';
import { productCard } from '/scripts/app/render-common.js';

function renderFeatured() {
  const container = $('#featured-grid');
  const featured = products.slice(0, 4);
  for (const p of featured) container.appendChild(productCard(p));
}

document.addEventListener('DOMContentLoaded', renderFeatured);
