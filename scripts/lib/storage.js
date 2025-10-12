const STORAGE_KEYS = {
  CART: 'myntra_cart',
  WISHLIST: 'myntra_wishlist'
};

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  keys: STORAGE_KEYS,
  getCart() { return readJson(STORAGE_KEYS.CART, []); },
  setCart(items) { writeJson(STORAGE_KEYS.CART, items); },
  getWishlist() { return readJson(STORAGE_KEYS.WISHLIST, []); },
  setWishlist(items) { writeJson(STORAGE_KEYS.WISHLIST, items); }
};
