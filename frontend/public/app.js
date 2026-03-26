const API_BASE = window.location.origin;

function getAuthToken() {
  return localStorage.getItem('sg_token') || '';
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('sg_user') || 'null');
}

function setAuthSession(user, token) {
  localStorage.setItem('sg_user', JSON.stringify(user));
  localStorage.setItem('sg_token', token);
  pushCartToServer(getCart());
}

async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  let payload = {};
  try {
    payload = await res.json();
  } catch {
    payload = {};
  }

  if (!res.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

/* ── CART (localStorage + backend sync) ── */
function getCart() {
  return JSON.parse(localStorage.getItem('sg_cart') || '[]');
}

async function pushCartToServer(cart) {
  if (!getAuthToken()) {
    return;
  }

  try {
    await apiRequest('/api/cart', {
      method: 'PUT',
      body: JSON.stringify({ items: cart })
    });
  } catch {
    // Keep local cart if network/API fails.
  }
}

async function syncCartFromServer() {
  if (!getAuthToken()) {
    return;
  }

  try {
    const response = await apiRequest('/api/cart');
    const serverCart = Array.isArray(response.data) ? response.data : [];
    localStorage.setItem('sg_cart', JSON.stringify(serverCart));
  } catch {
    // Ignore sync errors and keep local data.
  }
}

function saveCart(cart) {
  localStorage.setItem('sg_cart', JSON.stringify(cart));
  updateCartBadge();
  pushCartToServer(cart);
}

function updateCartBadge() {
  const c = document.getElementById('cartCount');
  if (!c) return;
  c.textContent = getCart().reduce((s, i) => s + i.qty, 0);
}

function addToCartItem(product, qty = 1) {
  const cart = getCart();
  const ex = cart.find((i) => i.id === product.id);
  if (ex) ex.qty += qty;
  else cart.push({ ...product, qty });
  saveCart(cart);
  showToast(`✓ ${product.title.substring(0, 30)}… added to cart`);
}

/* ── TOAST ── */
function showToast(msg, dur=2500) {
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.remove('hidden'); t.classList.add('show');
  setTimeout(()=>{t.classList.remove('show');t.classList.add('hidden');},dur);
}

/* ── SHARED NAVBAR HTML ── */
function loadNavbar() {
  const user = getCurrentUser();
  const cartCount = getCart().reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('navbar-placeholder'); if(!el) return;
  el.innerHTML = `
  <div class="top-strip">
    <span>🚚 Free delivery on orders above ₹499</span>
    <span>Use code <strong>GRID10</strong> for 10% off</span>
    <span>📞 1800-123-4567</span>
  </div>
  <header class="navbar" id="navbar">
    <div class="nav-inner">
      <a href="index.html" class="logo">Shop<em>Grid</em></a>
      <div class="location-box">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <div><span class="loc-label">Deliver to</span><strong class="loc-city">Bhilai, CG 490001</strong></div>
      </div>
      <div class="search-box" role="search">
        <select class="search-cat" aria-label="Category">
          <option>All</option><option>Books</option><option>Electronics</option>
          <option>Furniture</option><option>Notes</option><option>Watches</option>
          <option>Clothing</option><option>Footwear</option><option>Beauty</option><option>Bags</option>
        </select>
        <input type="text" id="navSearch" placeholder="Search products, brands and more…" autocomplete="off"
          onkeydown="if(event.key==='Enter'){const q=this.value.trim();if(q)location.href='shop.html?q='+encodeURIComponent(q);}"/>
        <button class="search-btn" onclick="const q=document.getElementById('navSearch').value.trim();if(q)location.href='shop.html?q='+encodeURIComponent(q);" aria-label="Search">
          <svg width="18" height="18" fill="none" stroke="#111" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>
      <div class="nav-actions">
        <a href="${user?'#':'login.html'}" class="nav-link-group" onclick="${user?'showUserMenu(event)':''}">
          <span class="nav-link-sub">${user?'Hello, '+user.firstName:'Hello, Sign in'}</span>
          <strong class="nav-link-main">Account ▾</strong>
        </a>
        <a href="cart.html" class="nav-link-group">
          <span class="nav-link-sub">Returns</span>
          <strong class="nav-link-main">&amp; Orders</strong>
        </a>
        <a href="cart.html" class="cart-btn" aria-label="Cart">
          <span class="cart-badge" id="cartCount">${cartCount}</span>
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          <span>Cart</span>
        </a>
      </div>
    </div>
  </header>
  <nav class="subnav">
    <div class="subnav-inner">
      <span class="snav bold">☰ All</span>
      <a href="shop.html" class="snav">Today's Deals</a>
      <a href="shop.html?sort=rating" class="snav">Best Sellers</a>
      <a href="shop.html?filter=new" class="snav">New Arrivals</a>
      <a href="shop.html?cat=Electronics" class="snav">Electronics</a>
      <a href="shop.html?cat=Books" class="snav">Books</a>
      <a href="shop.html?cat=Furniture" class="snav">Furniture</a>
      <a href="shop.html?filter=sale" class="snav accent">🔥 Flash Sale</a>
    </div>
  </nav>
  <div id="user-menu" class="user-menu hidden">
    ${user?`
      <div class="user-menu-head">Hello, ${user.firstName} ${user.lastName}</div>
      <a href="#">My Orders</a><a href="#">My Wishlist</a><a href="#">My Account</a>
      <div class="user-menu-divider"></div>
      <a href="#" onclick="logout()">Logout</a>`
    :`<a href="login.html">Login</a><a href="login.html">Register</a>`}
  </div>`;

  // Handle search from URL
  const q = new URLSearchParams(location.search).get('q');
  if(q && document.getElementById('navSearch')) document.getElementById('navSearch').value=q;

  window.addEventListener('scroll',()=>{
    const nb=document.getElementById('navbar'); if(!nb) return;
    nb.style.boxShadow=window.scrollY>10?'0 4px 20px rgba(0,0,0,.35)':'0 2px 10px rgba(0,0,0,.3)';
  });

  syncCartFromServer().then(() => {
    updateCartBadge();
    renderCartDrawer();
  });
}

function showUserMenu(e) {
  e.preventDefault();
  const m=document.getElementById('user-menu'); if(!m) return;
  m.classList.toggle('hidden');
  document.addEventListener('click',()=>m.classList.add('hidden'),{once:true});
}
function logout() {
  localStorage.removeItem('sg_user');
  localStorage.removeItem('sg_token');
  location.href='index.html';
}

/* ── FOOTER ── */
function loadFooter() {
  const el=document.getElementById('footer-placeholder'); if(!el) return;
  el.innerHTML=`
  <footer class="footer">
    <div class="footer-top-link" onclick="window.scrollTo({top:0,behavior:'smooth'})">▲ Back to top</div>
    <div class="footer-cols">
      <div class="footer-col">
        <div class="logo" style="font-size:1.4rem;margin-bottom:10px">Shop<em>Grid</em></div>
        <p style="font-size:.82rem;color:rgba(255,255,255,.5);line-height:1.6">Premium products delivered fast to Bhilai & across India.</p>
      </div>
      <div class="footer-col"><h4>Shop</h4>
        <a href="shop.html?cat=Electronics">Electronics</a><a href="shop.html?cat=Books">Books</a>
        <a href="shop.html?cat=Furniture">Furniture</a><a href="shop.html?cat=Watches">Watches</a>
        <a href="shop.html?filter=sale">Today's Deals</a>
      </div>
      <div class="footer-col"><h4>Account</h4>
        <a href="login.html">Login / Register</a><a href="cart.html">My Cart</a>
        <a href="#">My Orders</a><a href="#">My Wishlist</a>
      </div>
      <div class="footer-col"><h4>Help</h4>
        <a href="#">Help Centre</a><a href="#">Track Order</a>
        <a href="#">Returns</a><a href="#">Contact Us</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 ShopGrid India Pvt. Ltd. All rights reserved.</span>
      <span><a href="#">Terms</a> · <a href="#">Privacy</a> · <a href="#">Cookies</a></span>
    </div>
  </footer>`;
}

/* ── CART DRAWER (for pages that need it) ── */
function loadCartDrawer() {
  const el=document.getElementById('cart-drawer-placeholder'); if(!el) return;
  el.innerHTML=`
  <div class="drawer-overlay hidden" id="cartOverlay" onclick="toggleCartDrawer()"></div>
  <div class="cart-drawer" id="cartDrawer">
    <div class="drawer-head"><h3>My Cart (<span id="drawerCount">0</span>)</h3><button class="drawer-close" onclick="toggleCartDrawer()">✕</button></div>
    <div class="drawer-body" id="drawerItems"></div>
    <div class="drawer-foot">
      <div class="cart-total-row"><span>Subtotal</span><span id="drawerTotal">₹0</span></div>
      <p class="cart-savings" id="drawerSavings"></p>
      <a href="cart.html" class="btn btn-primary full-w" style="display:flex;justify-content:center;margin-top:10px">View Cart & Checkout →</a>
    </div>
  </div>`;
  renderCartDrawer();
}

function toggleCartDrawer() {
  document.getElementById('cartDrawer')?.classList.toggle('open');
  document.getElementById('cartOverlay')?.classList.toggle('hidden');
}

function renderCartDrawer() {
  const cart=getCart();
  const dc=document.getElementById('drawerCount'); if(dc) dc.textContent=cart.reduce((s,i)=>s+i.qty,0);
  const di=document.getElementById('drawerItems'); if(!di) return;
  const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
  if(!cart.length){di.innerHTML='<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p></div>';return;}
  di.innerHTML=cart.map(item=>`
    <div class="cart-item">
      <img src="${item.img}" alt="${item.title}" onerror="this.style.display='none'"/>
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">${inr(item.price)}</div>
        <div class="cart-item-qty">
          <button onclick="drawerQty(${item.id},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="drawerQty(${item.id},1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="drawerRemove(${item.id})">Remove</button>
      </div>
    </div>`).join('');
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const savings=cart.reduce((s,i)=>s+(i.was?(i.was-i.price)*i.qty:0),0);
  const dt=document.getElementById('drawerTotal'); if(dt) dt.textContent=inr(total);
  const ds=document.getElementById('drawerSavings'); if(ds) ds.textContent=savings>0?`You save ${inr(savings)}!`:'';
}

function drawerQty(id,d){const cart=getCart();const item=cart.find(i=>i.id===id);if(!item)return;item.qty=Math.max(1,item.qty+d);saveCart(cart);renderCartDrawer();}
function drawerRemove(id){saveCart(getCart().filter(i=>i.id!==id));renderCartDrawer();}

window.setAuthSession = setAuthSession;
window.getAuthToken = getAuthToken;
window.getCurrentUser = getCurrentUser;
window.apiRequest = apiRequest;
window.syncCartFromServer = syncCartFromServer;
