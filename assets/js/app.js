/* Kalaakar Frontend App - High verbosity, mobile-first, colorful UI */
(function () {
	// Global App State
	const appState = {
		language: load('kk_language', 'en'),
		currency: load('kk_currency', 'INR'),
		currencyRates: { INR: 1, USD: 0.012, EUR: 0.011 },
		products: [],
		filters: { categories: new Set(), sizes: new Set(), colors: new Set(), maxPrice: 7999, sort: 'popularity' },
		searchIndex: null,
		wishlist: load('kk_wishlist', []),
		cart: load('kk_cart', []),
		coupon: null,
		user: load('kk_user', null),
		orders: load('kk_orders', []),
		reviews: load('kk_reviews', {}),
		i18n: {
			en: {
				title: 'Wear Your Colors',
				subtitle: 'Bold. Joyful. Sustainable. Designed in India, loved everywhere.',
				filters: 'Filters',
				featured: 'Featured Products',
				cart: 'My Cart',
				checkout: 'Checkout',
				payNow: 'Pay Now',
			},
			hi: {
				title: 'अपने रंग पहनें',
				subtitle: 'दमदार. आनंदमय. टिकाऊ. भारत में डिज़ाइन, दुनिया भर में पसंद।',
				filters: 'फ़िल्टर',
				featured: 'चयनित उत्पाद',
				cart: 'मेरा कार्ट',
				checkout: 'भुगतान',
				payNow: 'अभी भुगतान करें',
			}
		}
	};

	const EL = {
		languageSelect: document.getElementById('languageSelect'),
		currencySelect: document.getElementById('currencySelect'),
		searchInput: document.getElementById('searchInput'),
		autocomplete: document.getElementById('searchAutocomplete'),
		productGrid: document.getElementById('productGrid'),
		productListTitle: document.getElementById('productListTitle'),
		priceRange: document.getElementById('priceRange'),
		priceRangeValue: document.getElementById('priceRangeValue'),
		sortSelect: document.getElementById('sortSelect'),
		filterCategories: document.getElementById('filterCategories'),
		filterSizes: document.getElementById('filterSizes'),
		filterColors: document.getElementById('filterColors'),
		clearFilters: document.getElementById('clearFilters'),
		cartBtn: document.getElementById('cartBtn'),
		cartDrawer: document.getElementById('cartDrawer'),
		cartItems: document.getElementById('cartItems'),
		checkoutBtn: document.getElementById('checkoutBtn'),
		couponInput: document.getElementById('couponInput'),
		applyCoupon: document.getElementById('applyCoupon'),
		subtotal: document.getElementById('subtotal'),
		discount: document.getElementById('discount'),
		grandTotal: document.getElementById('grandTotal'),
		cartBadge: document.getElementById('cartBadge'),
		loginBtn: document.getElementById('loginBtn'),
		orderTrackBtn: document.getElementById('orderTrackBtn'),
		openAdmin: document.getElementById('openAdmin'),
		wishlistBtn: document.getElementById('wishlistBtn'),
		// Product modal
		productModal: document.getElementById('productModal'),
		pdMain: document.getElementById('pdMain'),
		pdThumbs: document.getElementById('pdThumbs'),
		pdTitle: document.getElementById('pdTitle'),
		pdPrice: document.getElementById('pdPrice'),
		pdStock: document.getElementById('pdStock'),
		pdRating: document.getElementById('pdRating'),
		pdColors: document.getElementById('pdColors'),
		pdSizes: document.getElementById('pdSizes'),
		openSizeChart: document.getElementById('openSizeChart'),
		addToCart: document.getElementById('addToCart'),
		addToWishlist: document.getElementById('addToWishlist'),
		pdDesc: document.getElementById('pdDesc'),
		reviewsList: document.getElementById('reviewsList'),
		reviewForm: document.getElementById('reviewForm'),
		reviewRating: document.getElementById('reviewRating'),
		reviewComment: document.getElementById('reviewComment'),
		suggestGrid: document.getElementById('suggestGrid'),
		// Modals/drawers
		sizeChartModal: document.getElementById('sizeChartModal'),
		checkoutModal: document.getElementById('checkoutModal'),
		loginModal: document.getElementById('loginModal'),
		profileArea: document.getElementById('profileArea'),
		logoutBtn: document.getElementById('logoutBtn'),
		orderHistory: document.getElementById('orderHistory'),
		trackModal: document.getElementById('trackModal'),
		trackInput: document.getElementById('trackInput'),
		trackNow: document.getElementById('trackNow'),
		trackResult: document.getElementById('trackResult'),
		adminModal: document.getElementById('adminModal'),
		adminOrders: document.getElementById('adminOrders'),
		// Creative
		designCanvas: document.getElementById('designCanvas'),
		brushSize: document.getElementById('brushSize'),
		colorPalette: document.getElementById('colorPalette'),
		uploadInput: document.getElementById('uploadInput'),
		clearCanvas: document.getElementById('clearCanvas'),
		saveDesign: document.getElementById('saveDesign'),
		designGallery: document.getElementById('designGallery'),
		// Hero
		heroTitle: document.getElementById('heroTitle'),
		heroSubtitle: document.getElementById('heroSubtitle'),
	};

	// Utilities
	function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
	function load(key, fallback) {
		try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
	}
	function formatMoney(amountInINR) {
		const rate = appState.currencyRates[appState.currency] || 1;
		const amount = amountInINR * rate;
		const symbols = { INR: '₹', USD: '$', EUR: '€' };
		return `${symbols[appState.currency]}${amount.toFixed(2)}`;
	}
	function closeOnBackdrop(dialog) {
		dialog.addEventListener('click', (e) => {
			const rect = dialog.querySelector('.modal__body').getBoundingClientRect();
			if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
		});
	}
	function openDrawer(drawer) { drawer.classList.add('show'); drawer.setAttribute('aria-hidden', 'false'); }
	function closeDrawer(drawer) { drawer.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true'); }
	function rr(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

	// Sample Product Data
	const SAMPLE_PRODUCTS = [
		{
			id: 'kk-tee-aurora', title: 'Aurora Gradient Tee', category: 'Women',
			price: 1299, stock: 18, rating: 4.7,
			colors: ['#ff3d68','#7c3aed','#06b6d4'], sizes: ['XS','S','M','L','XL'],
			images: [
				'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop',
				'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1200&auto=format&fit=crop',
			],
			description: 'Soft organic cotton tee with vibrant aurora gradient.'
		},
		{
			id: 'kk-hood-sunburst', title: 'Sunburst Hoodie', category: 'Men',
			price: 2499, stock: 9, rating: 4.5,
			colors: ['#f59e0b','#ef4444','#111827'], sizes: ['S','M','L','XL'],
			images: [
				'https://images.unsplash.com/photo-1503342452485-86ff0a255b3e?q=80&w=1200&auto=format&fit=crop',
				'https://images.unsplash.com/photo-1520975732797-5f63a543054b?q=80&w=1200&auto=format&fit=crop',
			],
			description: 'Cozy fleece hoodie in bold sunburst palette.'
		},
		{
			id: 'kk-dress-rainbow', title: 'Rainbow Flow Dress', category: 'Women',
			price: 3299, stock: 6, rating: 4.8,
			colors: ['#ec4899','#22d3ee','#a3e635'], sizes: ['XS','S','M','L'],
			images: [
				'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop',
				'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
			],
			description: 'Lightweight dress with flowing, colorful print.'
		},
		{
			id: 'kk-cap-neon', title: 'Neon Pop Cap', category: 'Accessories',
			price: 899, stock: 32, rating: 4.3,
			colors: ['#22d3ee','#06b6d4','#0ea5e9'], sizes: ['One Size'],
			images: [
				'https://images.unsplash.com/photo-1618355776468-8e2f4d1f81ae?q=80&w=1200&auto=format&fit=crop'
			],
			description: 'Statement cap to top your look.'
		},
		{
			id: 'kk-kids-galaxy', title: 'Kids Galaxy Tee', category: 'Kids',
			price: 999, stock: 22, rating: 4.6,
			colors: ['#7c3aed','#60a5fa','#22d3ee'], sizes: ['XS','S','M'],
			images: [
				'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop'
			],
			description: 'For little stars who love big colors.'
		}
	];

	// Initialize
	function init() {
		appState.products = SAMPLE_PRODUCTS;
		buildSearchIndex();
		renderFilters();
		renderProducts();
		wireNav();
		wireFilters();
		wireCart();
		wireModals();
		wireAuth();
		wireTracking();
		wireAdmin();
		initCreativeStudio();
		applyI18n();
		updateCartBadge();
	}

	function buildSearchIndex() {
		if (!window.Fuse) return;
		appState.searchIndex = new window.Fuse(appState.products, {
			keys: ['title', 'category', 'description'], threshold: 0.35
		});
	}

	function applyI18n() {
		const l = appState.i18n[appState.language];
		if (!l) return;
		EL.heroTitle.textContent = l.title;
		EL.heroSubtitle.textContent = l.subtitle;
		EL.productListTitle.textContent = l.featured;
	}

	// Rendering
	function renderFilters() {
		// Categories
		const cats = ['Men','Women','Kids','Accessories'];
		EL.filterCategories.innerHTML = cats.map(c => `<button data-v="${c}">${c}</button>`).join('');
		// Sizes
		const sizes = ['XS','S','M','L','XL'];
		EL.filterSizes.innerHTML = sizes.map(s => `<button data-v="${s}">${s}</button>`).join('');
		// Colors
		const colors = ['#ff3d68','#7c3aed','#06b6d4','#f59e0b','#10b981','#22d3ee','#ec4899','#111827'];
		EL.filterColors.innerHTML = colors.map(clr => `<button title="${clr}" data-v="${clr}" style="background:${clr}"></button>`).join('');
	}

	function filteredProducts() {
		let list = [...appState.products];
		const f = appState.filters;
		if (f.categories.size) list = list.filter(p => f.categories.has(p.category));
		if (f.sizes.size) list = list.filter(p => p.sizes.some(s => f.sizes.has(s)));
		if (f.colors.size) list = list.filter(p => p.colors.some(c => f.colors.has(c)));
		list = list.filter(p => p.price <= f.maxPrice);
		switch (f.sort) {
			case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
			case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
			case 'rating-desc': list.sort((a,b)=>b.rating-a.rating); break;
			default: list.sort((a,b)=>b.rating - a.rating + (b.stock - a.stock)/100); // pseudo popularity
		}
		return list;
	}

	function renderProducts() {
		const list = filteredProducts();
		EL.productGrid.innerHTML = list.map(cardHTML).join('');
	}

	function cardHTML(p) {
		const wishActive = appState.wishlist.includes(p.id) ? 'active' : '';
		return `
		<div class="card" data-id="${p.id}">
			<img src="${p.images[0]}" alt="${p.title}" loading="lazy">
			<div class="card__body">
				<div class="title">${p.title}</div>
				<div class="rating">★ ${p.rating.toFixed(1)}</div>
				<div class="price">${formatMoney(p.price)}</div>
				<div class="actions">
					<button class="btn btn--primary" data-action="view">View</button>
					<button class="btn btn--ghost" data-action="wish" aria-pressed="${wishActive? 'true':'false'}">❤</button>
				</div>
			</div>
		</div>`;
	}

	// Wiring
	function wireNav() {
		// Category links
		[...document.querySelectorAll('[data-category]')].forEach(btn => {
			btn.addEventListener('click', () => {
				setActiveCategory(btn.getAttribute('data-category'));
			});
		});

		EL.languageSelect.value = appState.language;
		EL.currencySelect.value = appState.currency;
		EL.languageSelect.addEventListener('change', () => {
			appState.language = EL.languageSelect.value; save('kk_language', appState.language); applyI18n();
		});
		EL.currencySelect.addEventListener('change', () => {
			appState.currency = EL.currencySelect.value; save('kk_currency', appState.currency); renderProducts(); updateCartUI();
		});

		// Search autocomplete
		EL.searchInput.addEventListener('input', onSearchInput);
		EL.searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Escape') EL.autocomplete.classList.remove('show'); });
		document.addEventListener('click', (e)=>{ if(!EL.autocomplete.contains(e.target) && e.target!==EL.searchInput){ EL.autocomplete.classList.remove('show'); }});

		// Product card actions (event delegation)
		EL.productGrid.addEventListener('click', (e) => {
			const card = e.target.closest('.card'); if (!card) return;
			const id = card.getAttribute('data-id');
			if (e.target.matches('[data-action="view"]')) openProduct(id);
			if (e.target.matches('[data-action="wish"]')) toggleWishlist(id);
		});
	}

	function setActiveCategory(category) {
		appState.filters.categories = new Set([category]);
		renderProducts();
		window.scrollTo({ top: document.querySelector('.layout').offsetTop - 80, behavior: 'smooth' });
	}

	function onSearchInput() {
		const q = EL.searchInput.value.trim();
		if (!q) { EL.autocomplete.classList.remove('show'); return; }
		if (!appState.searchIndex) return;
		const results = appState.searchIndex.search(q).slice(0, 7).map(x => x.item);
		EL.autocomplete.innerHTML = results.map(r => `<button role="option" data-id="${r.id}">🔎 ${r.title}</button>`).join('');
		EL.autocomplete.classList.add('show');
		EL.autocomplete.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
			openProduct(btn.getAttribute('data-id'));
			EL.autocomplete.classList.remove('show');
		}));
	}

	function wireFilters() {
		EL.priceRange.addEventListener('input', () => { appState.filters.maxPrice = Number(EL.priceRange.value); EL.priceRangeValue.textContent = formatMoney(EL.priceRange.value); renderProducts(); });
		EL.sortSelect.addEventListener('change', () => { appState.filters.sort = EL.sortSelect.value; renderProducts(); });
		EL.clearFilters.addEventListener('click', () => { appState.filters = { categories: new Set(), sizes: new Set(), colors: new Set(), maxPrice: 7999, sort: 'popularity' }; EL.priceRange.value = 7999; EL.priceRangeValue.textContent = formatMoney(7999); highlightFilterChips(); renderProducts(); });

		EL.filterCategories.addEventListener('click', (e)=>{ if(e.target.tagName!=='BUTTON') return; toggleFilterSet(appState.filters.categories, e.target.getAttribute('data-v')); highlightFilterChips(); renderProducts(); });
		EL.filterSizes.addEventListener('click', (e)=>{ if(e.target.tagName!=='BUTTON') return; toggleFilterSet(appState.filters.sizes, e.target.getAttribute('data-v')); highlightFilterChips(); renderProducts(); });
		EL.filterColors.addEventListener('click', (e)=>{ if(e.target.tagName!=='BUTTON') return; toggleFilterSet(appState.filters.colors, e.target.getAttribute('data-v')); highlightFilterChips(); renderProducts(); });
		EL.priceRangeValue.textContent = formatMoney(EL.priceRange.value);
	}

	function toggleFilterSet(set, value) { if (set.has(value)) set.delete(value); else set.add(value); }
	function highlightFilterChips() {
		EL.filterCategories.querySelectorAll('button').forEach(b => b.classList.toggle('active', appState.filters.categories.has(b.getAttribute('data-v'))));
		EL.filterSizes.querySelectorAll('button').forEach(b => b.classList.toggle('active', appState.filters.sizes.has(b.getAttribute('data-v'))));
		EL.filterColors.querySelectorAll('button').forEach(b => b.classList.toggle('active', appState.filters.colors.has(b.getAttribute('data-v'))));
	}

	// Product detail
	let currentProductId = null;
	function openProduct(id) {
		const p = appState.products.find(x => x.id === id); if (!p) return;
		currentProductId = id;
		EL.pdTitle.textContent = p.title;
		EL.pdPrice.textContent = formatMoney(p.price);
		EL.pdStock.textContent = p.stock > 0 ? `In stock (${p.stock})` : 'Out of stock';
		EL.pdRating.textContent = `★ ${p.rating.toFixed(1)}`;
		EL.pdDesc.textContent = p.description;
		EL.pdMain.src = p.images[0];
		EL.pdMain.alt = p.title;
		EL.pdThumbs.innerHTML = p.images.map((src, i) => `<img src="${src}" data-i="${i}" alt="Thumb ${i+1}">`).join('');
		EL.pdThumbs.querySelectorAll('img').forEach(img => img.addEventListener('click', () => { EL.pdMain.src = img.src; }));
		EL.pdMain.classList.remove('zoomed');
		EL.pdMain.addEventListener('click', ()=> EL.pdMain.classList.toggle('zoomed'), { once: false });
		EL.pdColors.innerHTML = p.colors.map(c => `<button style="background:${c}" data-v="${c}"></button>`).join('');
		EL.pdSizes.innerHTML = p.sizes.map(s => `<button data-v="${s}">${s}</button>`).join('');
		EL.reviewsList.innerHTML = (appState.reviews[id] || []).map(r => `<div>★${r.rating} — ${r.comment}</div>`).join('');
		EL.suggestGrid.innerHTML = appState.products.filter(x => x.category === p.category && x.id !== id).slice(0,4).map(cardHTML).join('');
		EL.productModal.showModal();
	}

	EL.openSizeChart.addEventListener('click', ()=> EL.sizeChartModal.showModal());
	EL.addToCart.addEventListener('click', ()=> { if(!currentProductId) return; addToCart(currentProductId, 1); });
	EL.addToWishlist.addEventListener('click', ()=> { if(!currentProductId) return; toggleWishlist(currentProductId); });
	EL.reviewForm.addEventListener('submit', (e)=>{
		e.preventDefault(); if(!currentProductId) return;
		const r = { rating: Number(EL.reviewRating.value), comment: EL.reviewComment.value.trim() };
		if(!r.comment) return;
		const list = appState.reviews[currentProductId] || []; list.push(r); appState.reviews[currentProductId] = list; save('kk_reviews', appState.reviews);
		EL.reviewComment.value = '';
		EL.reviewsList.innerHTML = list.map(x => `<div>★${x.rating} — ${x.comment}</div>`).join('');
	});

	// Wishlist
	function toggleWishlist(id) {
		const i = appState.wishlist.indexOf(id);
		if (i >= 0) appState.wishlist.splice(i,1); else appState.wishlist.push(id);
		save('kk_wishlist', appState.wishlist);
		renderProducts();
	}

	// Cart
	function wireCart() {
		EL.cartBtn.addEventListener('click', ()=> openDrawer(EL.cartDrawer));
		EL.cartDrawer.querySelector('[data-close]').addEventListener('click', ()=> closeDrawer(EL.cartDrawer));
		EL.checkoutBtn.addEventListener('click', ()=> { EL.checkoutModal.showModal(); });
		EL.applyCoupon.addEventListener('click', applyCoupon);
		document.getElementById('payNow').addEventListener('click', mockPayNow);
		closeOnBackdrop(EL.checkoutModal);
	}

	function addToCart(id, qty) {
		const item = appState.cart.find(x => x.id === id);
		if (item) item.qty += qty; else appState.cart.push({ id, qty });
		save('kk_cart', appState.cart); updateCartUI();
		openDrawer(EL.cartDrawer);
	}

	function updateCartBadge() { const count = appState.cart.reduce((s,i)=>s+i.qty,0); EL.cartBadge.textContent = String(count); }

	function updateCartUI() {
		const items = appState.cart.map(ci => {
			const p = appState.products.find(x => x.id === ci.id);
			return { ...ci, product: p, line: p.price * ci.qty };
		});
		EL.cartItems.innerHTML = items.map(ci => `
			<div class="cartitem" data-id="${ci.id}">
				<img src="${ci.product.images[0]}" alt="${ci.product.title}">
				<div>
					<div>${ci.product.title}</div>
					<div class="muted">${formatMoney(ci.product.price)}</div>
					<div class="qty">
						<button data-q="-1">−</button>
						<span>${ci.qty}</span>
						<button data-q="1">＋</button>
						<button data-remove class="link">Remove</button>
					</div>
				</div>
				<div><strong>${formatMoney(ci.line)}</strong></div>
			</div>
		`).join('');
		EL.cartItems.querySelectorAll('.cartitem').forEach(row => {
			row.addEventListener('click', (e)=>{
				const id = row.getAttribute('data-id');
				if (e.target.matches('[data-q]')) { changeQty(id, Number(e.target.getAttribute('data-q'))); }
				if (e.target.matches('[data-remove]')) { removeFromCart(id); }
			});
		});
		const sub = items.reduce((s,i)=>s+i.line,0);
		const disc = appState.coupon?.type==='percent' ? sub * (appState.coupon.value/100) : (appState.coupon?.value || 0);
		const total = Math.max(0, sub - disc);
		EL.subtotal.textContent = formatMoney(sub);
		EL.discount.textContent = appState.coupon ? `− ${formatMoney(disc)}` : formatMoney(0);
		EL.grandTotal.textContent = formatMoney(total);
		updateCartBadge();
	}

	function changeQty(id, delta) {
		const it = appState.cart.find(x => x.id === id); if(!it) return;
		it.qty = Math.max(0, it.qty + delta);
		if (it.qty === 0) appState.cart = appState.cart.filter(x => x.id !== id);
		save('kk_cart', appState.cart); updateCartUI();
	}
	function removeFromCart(id) { appState.cart = appState.cart.filter(x => x.id !== id); save('kk_cart', appState.cart); updateCartUI(); }

	function applyCoupon() {
		const code = EL.couponInput.value.trim().toUpperCase();
		if (!code) return;
		const map = { 'WELCOME10': { type: 'percent', value: 10 }, 'FESTIVE500': { type: 'flat', value: 500 } };
		appState.coupon = map[code] || null;
		updateCartUI();
	}

	function mockPayNow() {
		// Validate address
		const name = document.getElementById('addrName').value.trim();
		const addr = document.getElementById('addrLine').value.trim();
		if (!name || !addr) { alert('Please enter shipping details'); return; }
		const orderId = 'ORD' + Date.now().toString().slice(-6) + rr(100,999);
		const totalInINR = appState.cart.reduce((s,ci)=>{
			const p = appState.products.find(x=>x.id===ci.id); return s + p.price*ci.qty; }, 0);
		const order = {
			id: orderId,
			items: appState.cart,
			total: totalInINR,
			status: 'Processing',
			createdAt: new Date().toISOString(),
			address: { name, addr }
		};
		appState.orders.push(order); save('kk_orders', appState.orders);
		appState.cart = []; save('kk_cart', appState.cart);
		updateCartUI(); EL.checkoutModal.close(); closeDrawer(EL.cartDrawer);
		alert(`Payment successful! Your Order ID is ${orderId}`);
	}

	// Modals & dialogs
	function wireModals() {
		[EL.productModal, EL.sizeChartModal, EL.checkoutModal, EL.loginModal, EL.trackModal, EL.adminModal].forEach(closeOnBackdrop);
		document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', (e) => {
			const dialog = e.target.closest('dialog'); if (dialog) dialog.close();
		}));
	}

	// Auth
	function wireAuth() {
		EL.loginBtn.addEventListener('click', () => { EL.loginModal.showModal(); updateProfileUI(); });
		EL.loginModal.querySelectorAll('[data-social]').forEach(btn => btn.addEventListener('click', () => {
			// Mock social login
			appState.user = { id: 'user_' + rr(1000,9999), name: 'Kalaakar User' };
			save('kk_user', appState.user); updateProfileUI();
		}));
		EL.logoutBtn.addEventListener('click', ()=>{ appState.user = null; save('kk_user', appState.user); updateProfileUI(); });
	}
	function updateProfileUI() {
		if (appState.user) {
			EL.profileArea.hidden = false;
			EL.loginModal.querySelector('.social').style.display = 'none';
			renderOrderHistory();
		} else {
			EL.profileArea.hidden = true;
			EL.loginModal.querySelector('.social').style.display = 'grid';
		}
	}
	function renderOrderHistory() {
		EL.orderHistory.innerHTML = appState.orders.map(o => `<div><strong>${o.id}</strong> — ${o.items.length} items — ${formatMoney(o.total)}</div>`).join('') || '<div class="muted">No orders yet</div>';
	}

	// Tracking
	function wireTracking() {
		EL.orderTrackBtn.addEventListener('click', ()=> EL.trackModal.showModal());
		EL.trackNow.addEventListener('click', () => {
			const id = EL.trackInput.value.trim();
			const o = appState.orders.find(x => x.id === id);
			EL.trackResult.textContent = o ? `Status: ${o.status}` : 'Order not found';
		});
	}

	// Admin
	function wireAdmin() {
		EL.openAdmin.addEventListener('click', ()=> { EL.adminModal.showModal(); renderAdmin(); });
	}
	function renderAdmin() {
		EL.adminOrders.innerHTML = appState.orders.map(o => `
			<div class="card">
				<div class="card__body">
					<div><strong>${o.id}</strong> — ${o.items.length} items — ${formatMoney(o.total)}</div>
					<select data-id="${o.id}">
						<option ${o.status==='Processing'?'selected':''}>Processing</option>
						<option ${o.status==='Packed'?'selected':''}>Packed</option>
						<option ${o.status==='Shipped'?'selected':''}>Shipped</option>
						<option ${o.status==='Delivered'?'selected':''}>Delivered</option>
						<option ${o.status==='Refunded'?'selected':''}>Refunded</option>
					</select>
				</div>
			</div>
		`).join('') || '<div class="muted">No orders to manage</div>';
		EL.adminOrders.querySelectorAll('select').forEach(sel => sel.addEventListener('change', () => {
			const o = appState.orders.find(x => x.id === sel.getAttribute('data-id'));
			if (o) { o.status = sel.value; save('kk_orders', appState.orders); }
		}));
	}

	// Creative Studio (Canvas Drawing)
	function initCreativeStudio() {
		// Palette colors
		const colors = ['#ffffff','#000000','#ff3d68','#7c3aed','#06b6d4','#10b981','#f59e0b','#ec4899','#22d3ee'];
		EL.colorPalette.innerHTML = colors.map(c => `<button style="background:${c}" data-c="${c}"></button>`).join('');
		let brushColor = '#ffffff'; let brushWidth = Number(EL.brushSize.value);
		EL.colorPalette.addEventListener('click', (e)=>{ if(e.target.dataset.c){ brushColor = e.target.dataset.c; }});
		EL.brushSize.addEventListener('input', ()=> brushWidth = Number(EL.brushSize.value));

		const ctx = EL.designCanvas.getContext('2d');
		ctx.fillStyle = '#0a0a10'; ctx.fillRect(0,0,EL.designCanvas.width, EL.designCanvas.height);

		let drawing = false; let last = null; const history = [];
		function startDraw(x,y){ drawing = true; last = {x,y}; history.push(ctx.getImageData(0,0,EL.designCanvas.width, EL.designCanvas.height)); }
		function moveDraw(x,y){ if(!drawing) return; ctx.strokeStyle = brushColor; ctx.lineWidth = brushWidth; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(x,y); ctx.stroke(); last = {x,y}; }
		function endDraw(){ drawing=false; }
		EL.designCanvas.addEventListener('mousedown', (e)=>{ const r = EL.designCanvas.getBoundingClientRect(); startDraw(e.clientX-r.left, e.clientY-r.top); });
		EL.designCanvas.addEventListener('mousemove', (e)=>{ const r = EL.designCanvas.getBoundingClientRect(); moveDraw(e.clientX-r.left, e.clientY-r.top); });
		window.addEventListener('mouseup', endDraw);
		// Touch
		EL.designCanvas.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; const r=EL.designCanvas.getBoundingClientRect(); startDraw(t.clientX-r.left, t.clientY-r.top); });
		EL.designCanvas.addEventListener('touchmove', (e)=>{ const t=e.touches[0]; const r=EL.designCanvas.getBoundingClientRect(); moveDraw(t.clientX-r.left, t.clientY-r.top); });
		EL.designCanvas.addEventListener('touchend', endDraw);

		EL.clearCanvas.addEventListener('click', ()=>{ ctx.fillStyle='#0a0a10'; ctx.fillRect(0,0,EL.designCanvas.width, EL.designCanvas.height); });
		EL.saveDesign.addEventListener('click', ()=>{
			const url = EL.designCanvas.toDataURL('image/png');
			const img = new Image(); img.src = url; img.alt = 'Your design';
			img.loading = 'lazy'; EL.designGallery.prepend(img);
		});
		EL.uploadInput.addEventListener('change', (e)=>{
			const file = e.target.files && e.target.files[0]; if(!file) return; const img = new Image();
			img.onload = () => { ctx.drawImage(img, 0,0, EL.designCanvas.width, EL.designCanvas.height); };
			img.src = URL.createObjectURL(file);
		});
	}

	// Helpers
	window.addEventListener('load', init);

})();

