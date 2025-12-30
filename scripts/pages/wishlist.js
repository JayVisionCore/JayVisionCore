import { $ } from '/scripts/lib/dom.js';
import { products } from '/scripts/data/products.js';
import { productCard } from '/scripts/app/render-common.js';
import { storage } from '/scripts/lib/storage.js';

function renderWishlist() {
  const ids = new Set(storage.getWishlist());
  const list = products.filter((p) => ids.has(p.id));
  const root = $('#wishlist-items');
  root.innerHTML = '';
  for (const p of list) root.appendChild(productCard(p));
}

document.addEventListener('DOMContentLoaded', renderWishlist);
