/* =============================================
   WE BARE BEARS — Main JavaScript
   script.js
   ============================================= */

(function () {
  'use strict';

  /* ── Page Loader (Task 2.1) ── */
  const loader = document.getElementById('page-loader');
  if (loader) {
    window.addEventListener('load', () => loader.classList.add('hidden'));
    setTimeout(() => loader.classList.add('hidden'), 3000);
  }

  /* ── Module-level lightbox reference (Task 3.5) ── */
  let _openLightbox = null;

  /* ── Frame Array (96 frames) ── */
  const TOTAL_FRAMES = 96;
  const frames = Array.from({ length: TOTAL_FRAMES }, (_, i) =>
    `Asset/Frame/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`
  );

  /* =============================================
     1. BUBBLES BACKGROUND
     ============================================= */
  function initBubbles() {
    const container = document.querySelector('.bubbles-bg');
    if (!container) return;
    const colors = ['#A8D8EA', '#FFE59E', '#FF8C69', '#C8E6C9', '#F8BBD0'];
    for (let i = 0; i < 18; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = 40 + Math.random() * 120;
      b.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        animation-duration: ${8 + Math.random() * 14}s;
        animation-delay: ${-Math.random() * 14}s;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
      `;
      container.appendChild(b);
    }
  }

  /* =============================================
     2. NAVBAR — scroll + active + hamburger (Task 6.1)
     ============================================= */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
    if (window.scrollY > 50) navbar.classList.add('scrolled');

    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, #mobile-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open');
        const isOpen = hamburger.classList.contains('open');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      mobileNav.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        })
      );
    }
  }

  /* =============================================
     3. FLIPBOOK ANIMATION (Task 3.4 — preloader)
     ============================================= */
  function initFlipbook() {
    const img = document.getElementById('flipbook-img');
    if (!img) return;
    let idx = 0;

    function preloadAhead(currentIdx) {
      for (let j = 1; j <= 5; j++) {
        const preloadImg = new Image();
        preloadImg.src = frames[(currentIdx + j) % TOTAL_FRAMES];
      }
    }

    preloadAhead(0);

    setInterval(() => {
      idx = (idx + 1) % frames.length;
      img.src = frames[idx];
      if (idx % 10 === 0) preloadAhead(idx);
    }, 80);
  }

  /* =============================================
     4. LIGHTBOX (exposes _openLightbox for film reel)
     ============================================= */
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    if (!lightbox) return;

    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    _openLightbox = openLightbox;

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    document.querySelectorAll('.ep-card-img, .lightbox-trigger').forEach(el => {
      el.addEventListener('click', () => openLightbox(el.src || el.dataset.src));
    });
  }

  /* =============================================
     5. CART (localStorage) — Task 3.2: delegated events
     ============================================= */
  const CART_KEY = 'wbb_cart';
  let cart = [];

  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
  }
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const total = cart.reduce((s, i) => s + i.qty, 0);
    badges.forEach(b => {
      b.textContent = total;
      b.classList.add('bump');
      setTimeout(() => b.classList.remove('bump'), 350);
    });
  }

  function changeQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
    updateCartBadge();
    renderCartItems();
  }

  function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    if (cart.length === 0) {
      container.innerHTML = '<div class="cart-empty">🛒 Your cart is empty!<br><small>Add some bear goodies 🐻</small></div>';
    } else {
      container.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.img}" alt="${item.name}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" data-action="dec" data-idx="${idx}" aria-label="Decrease quantity">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-idx="${idx}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      `).join('');
    }
    const subtotalEl = document.getElementById('cart-subtotal-val');
    if (subtotalEl) {
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      subtotalEl.textContent = `$${total.toFixed(2)}`;
    }
  }

  function addToCart(name, price, img) {
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.qty++; }
    else { cart.push({ name, price, img, qty: 1 }); }
    saveCart();
    updateCartBadge();
    renderCartItems();
    showStamp();
  }

  function showStamp() {
    let stamp = document.getElementById('ice-bear-stamp');
    if (!stamp) {
      stamp = document.createElement('div');
      stamp.id = 'ice-bear-stamp';
      stamp.className = 'stamp';
      stamp.textContent = '🧊 Ice Bear approved!';
      document.body.appendChild(stamp);
    }
    stamp.style.display = 'block';
    clearTimeout(stamp._timer);
    stamp._timer = setTimeout(() => { stamp.style.display = 'none'; }, 2200);
  }

  function initCart() {
    loadCart();
    updateCartBadge();
    renderCartItems();

    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutClose = document.getElementById('checkout-modal-close');
    const cartItemsContainer = document.getElementById('cart-items');

    function openCart() {
      cartDrawer?.classList.add('open');
      cartOverlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeCart() {
      cartDrawer?.classList.remove('open');
      cartOverlay?.classList.remove('open');
      document.body.style.overflow = '';
    }

    cartBtn?.addEventListener('click', openCart);
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);

    if (cartItemsContainer) {
      cartItemsContainer.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const idx = parseInt(btn.dataset.idx, 10);
        const delta = btn.dataset.action === 'inc' ? 1 : -1;
        changeQty(idx, delta);
      });
    }

    checkoutBtn?.addEventListener('click', () => {
      closeCart();
      if (cart.length === 0) { alert('Your cart is empty! 🐻'); return; }
      checkoutModal?.classList.add('open');
    });
    checkoutClose?.addEventListener('click', () => {
      checkoutModal?.classList.remove('open');
      cart = [];
      saveCart();
      updateCartBadge();
      renderCartItems();
    });
    checkoutModal?.addEventListener('click', e => {
      if (e.target === checkoutModal) checkoutModal.classList.remove('open');
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name  = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const img   = btn.dataset.img;
        addToCart(name, price, img);
        btn.classList.add('success');
        const orig = btn.textContent;
        btn.textContent = '✅ Added!';
        setTimeout(() => {
          btn.classList.remove('success');
          btn.textContent = orig;
        }, 1400);
      });
    });
  }

  /* =============================================
     6. PRODUCT FILTER (shop page)
     ============================================= */
  function initFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-card');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        products.forEach(p => {
          if (cat === 'all' || p.dataset.category === cat) {
            p.classList.remove('hidden');
            p.style.animation = 'fadeInUp 0.4s both';
          } else {
            p.classList.add('hidden');
          }
        });
      });
    });
  }

  /* =============================================
     7. SCROLL REVEAL
     ============================================= */
  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
  }

  /* =============================================
     8. CONTACT FORM (Task 6.4 — aria-invalid)
     ============================================= */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach(field => {
        const err = field.parentElement.querySelector('.form-error');
        if (!field.value.trim()) {
          if (err) err.style.display = 'block';
          field.setAttribute('aria-invalid', 'true');
          valid = false;
        } else {
          if (err) err.style.display = 'none';
          field.setAttribute('aria-invalid', 'false');
        }
      });
      const emailEl = form.querySelector('#email');
      if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
        const err = emailEl.parentElement.querySelector('.form-error');
        if (err) { err.textContent = 'Please enter a valid email.'; err.style.display = 'block'; }
        emailEl.setAttribute('aria-invalid', 'true');
        valid = false;
      }

      if (valid) {
        form.style.display = 'none';
        document.getElementById('form-success').style.display = 'block';
      }
    });
  }

  /* =============================================
     9. FILM REEL — IntersectionObserver (Tasks 3.5 + 6.3)
     ============================================= */
  function initFilmReel() {
    const track = document.getElementById('filmreel-track');
    const section = document.querySelector('.filmreel-section');
    if (!track || !section) return;

    let loaded = false;

    const reelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !loaded) {
          loaded = true;
          reelObserver.disconnect();

          frames.forEach((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'reel-frame';
            img.alt = `We Bare Bears scene frame ${i + 1}`;
            img.loading = 'lazy';
            img.tabIndex = 0;
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', `Scene frame ${i + 1} — click to enlarge`);
            img.addEventListener('click', () => { if (_openLightbox) _openLightbox(img.src); });
            img.addEventListener('keydown', e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (_openLightbox) _openLightbox(img.src);
              }
            });
            track.appendChild(img);
          });

          document.querySelectorAll('.sprocket-row').forEach(row => {
            for (let i = 0; i < 40; i++) {
              const hole = document.createElement('div');
              hole.className = 'sprocket-hole';
              row.appendChild(hole);
            }
          });
        }
      });
    }, { threshold: 0.05 });

    reelObserver.observe(section);
  }

  /* =============================================
     10. POLAROID GRID
     ============================================= */
  function initPolaroidGrid() {
    const grid = document.getElementById('polaroid-grid');
    if (!grid) return;
    const picks = [0, 5, 10, 15, 20, 30, 40, 50, 60];
    picks.forEach(i => {
      const div = document.createElement('div');
      div.className = 'polaroid reveal';
      div.innerHTML = `<img src="${frames[i % frames.length]}" alt="Bear moment" loading="lazy">`;
      grid.appendChild(div);
    });
  }

  /* =============================================
     11. WATERMARK FRAMES (Task 1.3 — dynamic)
     ============================================= */
  function initWatermarks() {
    const marks = document.querySelectorAll('.watermark-frame');
    const count = marks.length;
    if (!count) return;
    marks.forEach((el, i) => {
      const frameIdx = Math.floor(i * TOTAL_FRAMES / count);
      el.src = frames[frameIdx];
      el.onerror = () => { el.style.display = 'none'; };
    });
  }

  /* =============================================
     12. EPISODE CARDS
     ============================================= */
  function initEpisodeCards() {
    const cards = document.querySelectorAll('.ep-card-img');
    const picks = [1, 12, 24, 36, 48, 72];
    cards.forEach((img, i) => {
      img.src = frames[picks[i % picks.length]];
      img.addEventListener('click', () => {
        if (_openLightbox) _openLightbox(img.src);
      });
    });
  }

  /* =============================================
     13. CHARACTER CARD BGs
     ============================================= */
  function initCharBgs() {
    const bgs = document.querySelectorAll('.char-bg img');
    const picks = [3, 30, 65];
    bgs.forEach((img, i) => { img.src = frames[picks[i % picks.length]]; });
  }

  /* =============================================
     14. PRODUCT CARD FRAMES
     ============================================= */
  function initProductFrames() {
    const imgs = document.querySelectorAll('.product-frame-img');
    const picks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
    imgs.forEach((img, i) => { img.src = frames[picks[i % picks.length]]; });
  }

  /* =============================================
     15. WISHLIST (CRUD) — Tasks 5.1–5.7
     ============================================= */
  const WISHLIST_KEY = 'wbb_wishlist';

  function loadWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
    catch { return []; }
  }
  function saveWishlist(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const statsEl = document.getElementById('wishlist-stats');
    if (!grid) return;

    const searchTerm = (document.getElementById('wishlist-search')?.value || '').toLowerCase();
    const filterCat = document.getElementById('wishlist-filter')?.value || 'all';
    const items = loadWishlist();

    const filtered = items.filter(item => {
      const matchSearch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm) ||
        (item.note && item.note.toLowerCase().includes(searchTerm));
      const matchCat = filterCat === 'all' || item.category === filterCat;
      return matchSearch && matchCat;
    });

    const totalQty = filtered.reduce((s, it) => s + it.qty, 0);
    if (statsEl) {
      statsEl.textContent = filtered.length > 0
        ? `${filtered.length} item${filtered.length !== 1 ? 's' : ''} · ${totalQty} total qty`
        : '';
    }

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="wishlist-empty"><span class="wishlist-empty-bear">🐻</span>${
        items.length === 0 ? 'No wishlist items yet — add something above!' : 'No items match your search/filter.'
      }</div>`;
      return;
    }

    const catEmoji = { stickers: '🌟', tshirts: '👕', diaries: '📓', accessories: '🎒', other: '🐻' };
    grid.innerHTML = filtered.map(item => `
      <article class="wishlist-card" role="listitem" data-id="${item.id}">
        <div class="wishlist-card-name">${escapeHtml(item.name)}</div>
        <span class="wishlist-cat-badge">${catEmoji[item.category] || '🐻'} ${item.category}</span>
        <div class="wishlist-card-qty">Qty: <strong>${item.qty}</strong></div>
        ${item.note ? `<div class="wishlist-card-note">"${escapeHtml(item.note)}"</div>` : ''}
        <div class="wishlist-card-date">Added ${new Date(item.created).toLocaleDateString()}</div>
        <div class="wishlist-card-actions">
          <button class="btn btn-outline wl-edit-btn" data-id="${item.id}" aria-label="Edit ${escapeHtml(item.name)}">✏️ Edit</button>
          <button class="btn btn-outline wl-delete-btn" data-id="${item.id}" aria-label="Delete ${escapeHtml(item.name)}">🗑 Delete</button>
          <button class="btn btn-secondary wl-atc-btn" data-id="${item.id}" aria-label="Add ${escapeHtml(item.name)} to cart">🛒 Add to Cart</button>
        </div>
      </article>
    `).join('');

    attachWishlistCardHandlers();
  }

  function attachWishlistCardHandlers() {
    document.querySelectorAll('.wl-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const item = loadWishlist().find(it => it.id === id);
        if (item && initWishlist._openModal) initWishlist._openModal(item);
      });
    });

    document.querySelectorAll('.wl-delete-btn').forEach(btn => {
      let deleteTimer = null;
      btn.addEventListener('click', () => {
        if (btn.dataset.confirm === 'true') {
          clearTimeout(deleteTimer);
          const id = parseInt(btn.dataset.id, 10);
          saveWishlist(loadWishlist().filter(it => it.id !== id));
          renderWishlist();
        } else {
          btn.dataset.confirm = 'true';
          btn.textContent = 'Sure?';
          deleteTimer = setTimeout(() => {
            btn.textContent = '🗑 Delete';
            delete btn.dataset.confirm;
          }, 2000);
        }
      });
    });

    document.querySelectorAll('.wl-atc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const item = loadWishlist().find(it => it.id === id);
        if (item) {
          addToCart(item.name, 0, '');
          const orig = btn.textContent;
          btn.textContent = 'Added! ✓';
          btn.disabled = true;
          setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
        }
      });
    });
  }

  function initWishlist() {
    const form = document.getElementById('wishlist-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const nameInput = document.getElementById('wishlist-name');
      const nameError = document.getElementById('wishlist-name-error');
      const name = nameInput.value.trim();

      if (!name) {
        nameError.style.display = 'block';
        nameInput.setAttribute('aria-invalid', 'true');
        nameInput.focus();
        return;
      }
      nameError.style.display = 'none';
      nameInput.setAttribute('aria-invalid', 'false');

      const category = document.getElementById('wishlist-category').value;
      const qty = Math.max(1, Math.min(99, parseInt(document.getElementById('wishlist-qty').value, 10) || 1));
      const note = document.getElementById('wishlist-note').value.trim();

      const item = { id: Date.now(), name, category, qty, note, created: new Date().toISOString() };
      const items = loadWishlist();
      items.push(item);
      saveWishlist(items);
      renderWishlist();
      form.reset();
      nameInput.setAttribute('aria-invalid', 'false');
    });

    document.getElementById('wishlist-search')?.addEventListener('input', renderWishlist);
    document.getElementById('wishlist-filter')?.addEventListener('change', renderWishlist);

    const clearAllBtn = document.getElementById('wishlist-clear-all');
    if (clearAllBtn) {
      let clearTimer = null;
      clearAllBtn.addEventListener('click', () => {
        if (clearAllBtn.dataset.confirm === 'true') {
          clearTimeout(clearTimer);
          localStorage.removeItem(WISHLIST_KEY);
          renderWishlist();
          clearAllBtn.textContent = '🗑 Clear All';
          delete clearAllBtn.dataset.confirm;
        } else {
          clearAllBtn.dataset.confirm = 'true';
          clearAllBtn.textContent = 'Clear All? Tap again';
          clearTimer = setTimeout(() => {
            clearAllBtn.textContent = '🗑 Clear All';
            delete clearAllBtn.dataset.confirm;
          }, 3000);
        }
      });
    }

    const modal = document.getElementById('wishlist-modal');
    const editForm = document.getElementById('wishlist-edit-form');
    const cancelBtn = document.getElementById('wishlist-modal-cancel');

    function openModal(item) {
      document.getElementById('edit-id').value = item.id;
      document.getElementById('edit-name').value = item.name;
      document.getElementById('edit-category').value = item.category;
      document.getElementById('edit-qty').value = item.qty;
      document.getElementById('edit-note').value = item.note;
      modal.removeAttribute('hidden');
      document.getElementById('edit-name').focus();
    }
    function closeModal() {
      modal.setAttribute('hidden', '');
      const editNameErr = document.getElementById('edit-name-error');
      if (editNameErr) editNameErr.style.display = 'none';
      const editNameInput = document.getElementById('edit-name');
      if (editNameInput) editNameInput.setAttribute('aria-invalid', 'false');
    }

    initWishlist._openModal = openModal;

    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeModal();
    });

    editForm?.addEventListener('submit', e => {
      e.preventDefault();
      const editNameInput = document.getElementById('edit-name');
      const editNameErr = document.getElementById('edit-name-error');
      const editName = editNameInput.value.trim();
      if (!editName) {
        editNameErr.style.display = 'block';
        editNameInput.setAttribute('aria-invalid', 'true');
        return;
      }
      editNameErr.style.display = 'none';
      editNameInput.setAttribute('aria-invalid', 'false');

      const id = parseInt(document.getElementById('edit-id').value, 10);
      const items = loadWishlist();
      const idx = items.findIndex(it => it.id === id);
      if (idx !== -1) {
        items[idx] = {
          ...items[idx],
          name: editName,
          category: document.getElementById('edit-category').value,
          qty: Math.max(1, Math.min(99, parseInt(document.getElementById('edit-qty').value, 10) || 1)),
          note: document.getElementById('edit-note').value.trim()
        };
        saveWishlist(items);
      }
      closeModal();
      renderWishlist();
    });

    renderWishlist();
  }

  /* =============================================
     INIT ALL
     ============================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initBubbles();
    initNavbar();
    initFlipbook();
    initFilmReel();
    initPolaroidGrid();
    initEpisodeCards();
    initCharBgs();
    initProductFrames();
    initWatermarks();
    initLightbox();
    initCart();
    initFilter();
    initScrollReveal();
    initContactForm();
    initWishlist();
  });

})();
