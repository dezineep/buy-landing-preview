/* BUY customer app — engine. Owns state, navigation, sheets, cart logic and actions.
   Screens are rendered by js/buy/<group>.js through the BuyKit registries (see js/buy/kit.js).

   BuyApp.create(root, { onEvent, preset, args, static, sat })
     onEvent(type, data)  'screen' | 'sheet' | 'cart' | 'checkout' | 'user' | 'address' | 'paying' | 'order' | 'logout'
     preset               name from PRESETS below (used by lab.html and the landing page phones)
     args                 preset arguments, e.g. { pid: 'gj' }
     static               render only: no listeners, timers or transitions
     sat                  safe-area top in px (camera island clearance); default 30

   ACTIONS (data-act values handled by the engine; extra data-* attributes in brackets)
     navigation : back, home, store, cart, myorders, openorder[id], product[pid], address
     sheets     : close, more, sort, offers, amount, details, quick[pid] (modal), custom[pid]
     cart       : add[pid] (opens variants sheet when >1 variant), pinc[pid], pdec[pid],
                  vadd[pid, vid], inc[key], dec[key], setsort[s], selv[pid, vid]
     custom qty : key[k] (0-9 or ⌫), unit[u = g|kg], addcustom[pid]
     checkout   : checkout, saveuser, locate, saveaddr, paynow
     orders     : ofilter[f = all|prog|done|cancel], again[id], copy[v]
     misc       : readmore, logout, m17, share, callp, callstore, directions, whatsapp, soon
   INPUTS (data-input) : search ; addr[k = street|road|area|pin|city|state] ; user[k = name|phone]
*/
(() => {
  const K = window.BuyKit;
  const { inr, P, OFFERS, PARTNER, STORE, DELIVERY, IMG, lineInfo, calcBill, seedOrders } = K;

  /* ---------- presets: put the app straight into a given state ---------- */
  const SAMPLE_USER = { name: 'Ananya Rao', phone: '9876543210' };
  const SAMPLE_ADDR = { street: 'Flat 23, 4th Cross, 6th Main', road: 'Near BDA Complex', area: 'HSR Layout', pin: '560102', city: 'Bengaluru', state: 'Karnataka' };
  const fill = (S, lines) => { lines.forEach(([pid, vid, qty]) => S.cart.push({ key: `${pid}|${vid}`, pid, vid, qty })); syncUnlocked(S); };
  const syncUnlocked = S => { const b = calcBill(S.cart); S.unlocked = new Set(OFFERS.filter(o => b.sub >= o.min).map(o => o.id)); };
  const CART_SMALL = [['ml', '4pc', 1], ['rg', '500g', 1]];
  const CART_MID = [['gj', '1kg', 2], ['rg', '500g', 1], ['ml', '4pc', 1]];
  const makeOrder = (S, status) => {
    fill(S, CART_MID);
    const now = new Date();
    const o = { id: 'ORD4121RL', otp: '1451', status, placedAt: now, times: { placed: now, packed: now, dispatched: now, delivered: now }, txn: 'T2405161359457890',
      items: S.cart.map(l => { const i = lineInfo(l); return { pid: l.pid, name: i.p.name, label: i.label, qty: l.qty, price: i.price, img: i.p.img[0] }; }),
      bill: calcBill(S.cart), user: { ...SAMPLE_USER }, addr: { ...SAMPLE_ADDR } };
    S.cart = []; syncUnlocked(S);
    S.orders.unshift(o);
    return o;
  };
  const PRESETS = {
    home: () => {},
    'home-cart': S => fill(S, CART_SMALL),
    'home-cart-many': S => fill(S, [['gj', '500g', 1], ['rg', '500g', 1], ['mp', '250g', 1], ['rb', '6pc', 1], ['ml', '4pc', 1]]),
    'home-congrats': S => { fill(S, [['gj', '1kg', 1], ['ml', '4pc', 1]]); S._pill = ['congrats', 'free']; },
    'home-saved': S => { fill(S, [['gj', '1kg', 1], ['ml', '4pc', 1]]); S._pill = ['saved', 'free']; },
    'home-address': S => { fill(S, CART_SMALL); S.addr = { ...SAMPLE_ADDR }; },
    more: S => { S._sheet = ['more']; },
    'more-user': S => { S.user = { ...SAMPLE_USER }; S._sheet = ['more']; },
    sort: S => { S._sheet = ['sort']; },
    amount: S => { fill(S, CART_MID); S.stack.push({ n: 'cart' }); S._sheet = ['amount']; },
    offers: S => { fill(S, CART_MID); S.stack.push({ n: 'cart' }); S._sheet = ['offers']; },
    product: (S, a) => { S.stack.push({ n: 'product', pid: a.pid || 'gj' }); },
    'product-added': (S, a) => { const pid = a.pid || 'gj', p = P(pid); const v = p.variants.find(x => x.best) || p.variants[0]; fill(S, [[pid, v.id, 1], ['ml', '4pc', 1]]); S.stack.push({ n: 'product', pid }); },
    quick: (S, a) => { S._sheet = ['quick', a.pid || 'rg']; },
    'quick-added': (S, a) => { const pid = a.pid || 'rg'; fill(S, [[pid, P(pid).variants[0].id, 1]]); S._sheet = ['quick', pid]; },
    variants: (S, a) => { S._sheet = ['variants', a.pid || 'gj']; },
    'variants-added': (S, a) => { const pid = a.pid || 'gj'; fill(S, [[pid, P(pid).variants[0].id, 2]]); S._sheet = ['variants', pid]; },
    custom: (S, a) => { S.cq = { v: a.v || '800', unit: 'g' }; S._sheet = ['custom', a.pid || 'gj']; },
    cart: S => { fill(S, CART_MID); S.stack.push({ n: 'cart' }); },
    'cart-small': S => { fill(S, CART_SMALL); S.stack.push({ n: 'cart' }); },
    'cart-all': S => { fill(S, [['mb', 'box', 2], ['gj', '1kg', 2], ['mp', '1kg', 1]]); S.stack.push({ n: 'cart' }); },
    'cart-empty': S => { S.stack.push({ n: 'cart' }); },
    details: S => { fill(S, CART_MID); S.checkout = true; S.stack.push({ n: 'cart' }); S._sheet = ['details']; },
    pay: S => { fill(S, CART_MID); S.user = { ...SAMPLE_USER }; S.addr = { ...SAMPLE_ADDR }; S.checkout = true; S.stack.push({ n: 'cart' }, { n: 'address' }); S._sheet = ['pay']; },
    address: S => { fill(S, CART_MID); S.user = { ...SAMPLE_USER }; S.checkout = true; S.draft = {}; S.stack.push({ n: 'cart' }, { n: 'address' }); },
    'address-filled': S => { fill(S, CART_MID); S.user = { ...SAMPLE_USER }; S.checkout = true; S.located = true; S.draft = { ...SAMPLE_ADDR }; S.stack.push({ n: 'cart' }, { n: 'address' }); },
    'order-placed': S => { const o = makeOrder(S, 'placed'); S.stack.push({ n: 'order', id: o.id }); },
    'order-packed': S => { const o = makeOrder(S, 'packed'); S.stack.push({ n: 'order', id: o.id }); },
    'order-dispatched': S => { const o = makeOrder(S, 'dispatched'); S.stack.push({ n: 'order', id: o.id }); },
    'order-delivered': S => { const o = makeOrder(S, 'delivered'); S.stack.push({ n: 'order', id: o.id }); },
    orders: S => { makeOrder(S, 'dispatched'); S.stack.push({ n: 'orders' }); },
    store: S => { S.stack.push({ n: 'store' }); },
    'next-delivered': S => { S.stack = [{ n: 'nextDelivered' }]; },
    report: S => { S.stack = [{ n: 'report' }]; },
    'report-window': S => { S.stack = [{ n: 'reportWindow' }]; },
  };

  function create(root, opts = {}) {
    const isStatic = !!opts.static;
    const emit = (type, data) => opts.onEvent && opts.onEvent(type, data);
    const S = { stack: [{ n: 'home' }], cart: [], sel: {}, search: '', sort: 'rel', user: null, addr: null, orders: seedOrders(), unlocked: new Set(), checkout: false, fresh: {}, heroI: 0 };
    if (opts.preset && PRESETS[opts.preset]) PRESETS[opts.preset](S, opts.args || {});
    root.classList.add('ba');
    if (isStatic) root.classList.add('ba-static');
    root.style.setProperty('--sat', (opts.sat ?? 30) + 'px');
    root.innerHTML = `<div class="ba-screens"></div><div class="ba-pillwrap"><div class="ba-pill"></div></div><div class="ba-layer"></div><div class="ba-notif"></div><div class="ba-toast" role="status"></div>`;
    const $ = s => root.querySelector(s);
    const screens = $('.ba-screens'), pillEl = $('.ba-pill'), layer = $('.ba-layer'), notifEl = $('.ba-notif'), toastEl = $('.ba-toast');

    const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('on'), 2200); };
    const cur = () => S.stack[S.stack.length - 1];
    const api = { root, toast, static: isStatic, act: (name, el, e) => A[name] && A[name](el || root, e || { target: root, stopPropagation() {} }), state: S };
    const renderScreen = s => (K.R[s.n] ? K.R[s.n](S, s) : `<p style="padding:80px 20px">Missing renderer: ${s.n}</p>`);

    /* ---------- mounting ---------- */
    let cleanup = null;
    const runMount = (el, s) => {
      if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
      const fn = K.mount[s.n];
      if (fn) cleanup = fn(el, S, api) || null;
      el.querySelectorAll('[data-gal]').forEach(galDots);
      syncInCart(el);
    };
    const mountScreen = (dir = 0) => {
      const s = cur();
      const el = document.createElement('div');
      el.className = 'ba-scr' + (dir > 0 && !isStatic ? ' in-r' : dir < 0 && !isStatic ? ' in-l' : '');
      el.dataset.n = s.n;
      el.innerHTML = renderScreen(s);
      const old = [...screens.children];
      screens.append(el);
      if (dir && !isStatic) old.forEach(o => { o.classList.add(dir > 0 ? 'out-l' : 'out-r'); setTimeout(() => o.remove(), 380); });
      else old.forEach(o => o.remove());
      requestAnimationFrame(() => el.classList.remove('in-r', 'in-l'));
      runMount(el, s);
      syncPill();
      emit('screen', s.n);
    };
    const rerender = () => {
      const el = screens.lastElementChild;
      if (!el) return mountScreen();
      const y = el.scrollTop;
      const ae = document.activeElement;
      const focus = ae && root.contains(ae) && ae.dataset.input ? [ae.dataset.input, ae.dataset.k, ae.selectionStart] : null;
      el.innerHTML = renderScreen(cur());
      el.scrollTop = y;
      runMount(el, cur());
      if (focus) {
        const f = el.querySelector(`[data-input="${focus[0]}"]${focus[1] ? `[data-k="${focus[1]}"]` : ''}`);
        if (f) { f.focus({ preventScroll: true }); try { f.setSelectionRange(focus[2], focus[2]); } catch {} }
      }
      syncPill();
    };
    const galDots = g => {
      const dots = g.parentElement.querySelectorAll('[data-dot]');
      if (!dots.length) return;
      g.addEventListener('scroll', () => { const i = Math.round(g.scrollLeft / g.clientWidth); dots.forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });
    };
    const syncInCart = (scope = root) => scope.querySelectorAll('[data-incart]').forEach(c => c.classList.toggle('in-cart', S.cart.some(l => l.pid === c.dataset.incart)));
    const refreshParts = (trigger = 'cart') => {
      root.querySelectorAll('[data-part]').forEach(el => {
        const on = (el.dataset.on || 'cart').split(/\s+/);
        if (!on.includes(trigger)) return;
        const fn = K.R[el.dataset.part];
        if (fn) el.innerHTML = fn(S, el.dataset.arg);
      });
      syncInCart();
    };
    const go = (n, extra = {}) => { S.stack.push({ n, ...extra }); mountScreen(1); };
    const back = () => {
      if (S.stack.length > 1) { S.stack.pop(); mountScreen(-1); }
      else if (cur().n !== 'home') { S.stack = [{ n: 'home' }]; mountScreen(-1); }
    };
    const home = () => { S.stack = [{ n: 'home' }]; mountScreen(-1); };

    /* ---------- sheets & modals ---------- */
    let sheet = null, sheetCleanup = null;
    const fillSheet = box => {
      if (sheetCleanup) { try { sheetCleanup(); } catch {} sheetCleanup = null; }
      box.innerHTML = K.SH[sheet.name](S, sheet.arg);
      box.querySelectorAll('[data-gal]').forEach(galDots);
      const fn = K.mountSheet[sheet.name];
      if (fn) sheetCleanup = fn(box, S, api) || null;
      syncInCart(box);
    };
    const openSheet = (name, arg) => {
      if (!K.SH[name]) return toast('Coming soon');
      const kind = K.SH[name].kind || 'sheet';
      sheet = { name, arg, kind };
      layer.innerHTML = `<div class="ba-dim" data-act="close"></div><div class="ba-${kind} ba-sh-${name}" data-sheet="${name}"></div>`;
      fillSheet(layer.lastElementChild);
      if (isStatic) layer.classList.add('on'); else requestAnimationFrame(() => layer.classList.add('on'));
      emit('sheet', name);
    };
    const refreshSheet = () => { if (sheet) fillSheet(layer.querySelector('[data-sheet]')); };
    const closeSheet = () => {
      if (!sheet) return;
      if (sheetCleanup) { try { sheetCleanup(); } catch {} sheetCleanup = null; }
      layer.classList.remove('on');
      const l = layer.lastElementChild; l && l.classList.add('bye');
      sheet = null;
      setTimeout(() => { if (!sheet) layer.innerHTML = ''; }, 320);
    };

    /* ---------- cart ---------- */
    const addLine = (pid, vid, grams) => {
      const key = grams ? `${pid}|c${grams}` : `${pid}|${vid}`;
      const l = S.cart.find(x => x.key === key);
      if (l) l.qty++; else S.cart.push({ key, pid, vid, grams, qty: 1 });
      cartChanged();
    };
    const changeKey = (key, d) => {
      const l = S.cart.find(x => x.key === key);
      if (!l) return;
      l.qty += d;
      if (l.qty <= 0) S.cart = S.cart.filter(x => x !== l);
      cartChanged();
    };
    const cartChanged = () => {
      const b = calcBill(S.cart);
      S.fresh = {};
      const newly = [];
      OFFERS.forEach(o => {
        if (b.sub >= o.min && !S.unlocked.has(o.id)) { S.unlocked.add(o.id); newly.push(o); S.fresh[o.id] = true; }
        if (b.sub < o.min) S.unlocked.delete(o.id);
      });
      if (cur().n === 'cart' && !S.cart.length) rerender(); else refreshParts('cart');
      syncPill(newly);
      emit('cart', { count: b.count, sub: b.sub, newly: newly.map(o => o.id) });
    };

    /* ---------- floating cart pill (home only) ---------- */
    let pillT = null;
    const pillState = (state, offer) => {
      clearTimeout(pillT);
      pillEl.dataset.state = state;
      pillEl.innerHTML = state === 'congrats' ? K.R.pillCongrats(S, offer) : state === 'saved' ? K.R.pillSaved(S, offer) : K.R.pill(S);
    };
    const syncPill = (newly = []) => {
      const show = cur().n === 'home' && S.cart.length > 0;
      $('.ba-pillwrap').classList.toggle('on', show);
      if (newly.length) {
        const o = newly[newly.length - 1];
        pillState('congrats', o);
        burst(pillEl);
        pillT = setTimeout(() => {
          pillState('saved', o);
          pillT = setTimeout(() => pillState('', null), 2200);
        }, 1400);
        if (!show) setTimeout(() => openSheet('unlock', o.id), 250);
        return;
      }
      if (!pillEl.dataset.state) pillEl.innerHTML = K.R.pill(S);
    };
    const burst = el => {
      if (isStatic) return;
      const colors = ['#a52226', '#f2b233', '#01ae0f', '#3f4ee3', '#f2a0a4'];
      for (let i = 0; i < 18; i++) {
        const c = document.createElement('i');
        c.className = 'ba-conf';
        c.style.background = colors[i % colors.length];
        c.style.left = 20 + Math.random() * 60 + '%';
        c.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
        c.style.setProperty('--dy', (-40 - Math.random() * 70) + 'px');
        c.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
        el.append(c);
        setTimeout(() => c.remove(), 1200);
      }
    };

    /* ---------- orders ---------- */
    const placeOrder = () => {
      const b = calcBill(S.cart);
      const now = new Date();
      const L = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const o = {
        id: 'ORD' + (4100 + Math.floor(Math.random() * 899)) + L() + L(),
        otp: String(1000 + Math.floor(Math.random() * 9000)), status: 'placed', placedAt: now, times: { placed: now },
        txn: 'T' + Date.now().toString().slice(-6) + String(Math.floor(Math.random() * 1e10)).padStart(10, '0'),
        items: S.cart.map(l => { const i = lineInfo(l); return { pid: l.pid, name: i.p.name, label: i.label, qty: l.qty, price: i.price, img: i.p.img[0] }; }),
        bill: b, user: { ...S.user }, addr: { ...S.addr },
      };
      if (b.gift) o.items.push({ pid: 'gift', name: 'Kaju Katli (free gift)', label: '100 g', qty: 1, price: 0, img: IMG + 'mysore-pak.jpg' });
      S.orders.unshift(o);
      S.cart = []; S.unlocked.clear(); S.checkout = false;
      S.stack = [{ n: 'home' }, { n: 'order', id: o.id }];
      mountScreen(1);
      emit('order', o);
    };
    const notify = (text, id) => {
      notifEl.innerHTML = `<button data-act="openorder" data-id="${id}"><img src="${STORE.logo}" alt=""><span><b>${STORE.name} · BUY</b><small>${text}</small></span></button>`;
      notifEl.classList.add('on');
      clearTimeout(notifEl._t);
      notifEl._t = setTimeout(() => notifEl.classList.remove('on'), 4200);
    };
    const setStatus = (id, status) => {
      const o = S.orders.find(x => x.id === id);
      if (!o) return;
      o.status = status; o.times[status] = new Date();
      const msg = { accepted: 'The store has accepted your order', packed: 'Your order has been packed', dispatched: `${PARTNER.name} is on the way. Your OTP is ${o.otp}`, delivered: 'Order delivered. Enjoy your sweets!' }[status];
      const c = cur();
      if ((c.n === 'order' && c.id === id) || c.n === 'orders') rerender();
      if (msg) notify(msg, id);
    };

    /* ---------- actions ---------- */
    const A = {
      back, home, close: closeSheet,
      store: () => { closeSheet(); go('store'); },
      m17: () => toast('BUY is a product of Modulus Seventeen'),
      share: () => toast(`Store link copied: modulusbuy.com/${STORE.slug}`),
      more: () => openSheet('more'),
      address: () => { closeSheet(); S.draft = { ...(S.addr || {}) }; S.checkout = false; S.toCart = false; go('address'); },
      sort: () => openSheet('sort'),
      setsort: t => { S.sort = t.dataset.s; closeSheet(); rerender(); },
      add: t => { const p = P(t.dataset.pid); if (p.variants.length > 1) openSheet('variants', p.id); else addLine(p.id, p.variants[0].id); },
      pinc: t => { const p = P(t.dataset.pid); const lines = S.cart.filter(l => l.pid === p.id); if (lines.length !== 1) openSheet('variants', p.id); else changeKey(lines[0].key, 1); },
      pdec: t => { const p = P(t.dataset.pid); const lines = S.cart.filter(l => l.pid === p.id); if (lines.length > 1) openSheet('variants', p.id); else if (lines[0]) changeKey(lines[0].key, -1); },
      vadd: t => addLine(t.dataset.pid, t.dataset.vid),
      inc: t => changeKey(t.dataset.key, 1),
      dec: t => changeKey(t.dataset.key, -1),
      product: t => { closeSheet(); go('product', { pid: t.dataset.pid }); },
      quick: (t, e) => { if (e.target.closest('[data-act]') !== t) return; openSheet('quick', t.dataset.pid); },
      selv: t => { S.sel[t.dataset.pid] = t.dataset.vid; rerender(); },
      readmore: t => { const d = (t.closest('[data-desc-wrap]') || t.parentElement).querySelector('[data-desc]'); if (!d) return; d.classList.toggle('open'); t.classList.toggle('open', d.classList.contains('open')); const lb = t.querySelector('[data-label]'); if (lb) lb.textContent = d.classList.contains('open') ? 'Read less' : 'Read more'; },
      custom: t => { S.cq = { v: '', unit: 'g' }; openSheet('custom', t.dataset.pid); },
      key: t => { const k = t.dataset.k; S.cq.v = k === '⌫' ? S.cq.v.slice(0, -1) : (S.cq.v + k).replace(/^0+/, '').slice(0, 4); refreshSheet(); },
      unit: t => { S.cq.unit = t.dataset.u; refreshSheet(); },
      addcustom: t => { const g = S.cq.unit === 'kg' ? +S.cq.v * 1000 : +S.cq.v; closeSheet(); addLine(t.dataset.pid, null, g); toast(`Added ${g >= 1000 ? g / 1000 + ' kg' : g + ' g'} of ${P(t.dataset.pid).name}`); },
      cart: () => {
        closeSheet();
        if (cur().n === 'cart') return;
        // not logged in yet: ask for details, then address, then land on the cart
        if (!S.user) { S.toCart = true; S.udraft = null; openSheet('details'); emit('checkout'); return; }
        if (!S.addr) { S.toCart = true; S.draft = {}; go('address'); return; }
        go('cart');
      },
      offers: () => openSheet('offers'),
      amount: () => openSheet('amount'),
      checkout: () => {
        S.checkout = true;
        if (!S.user) { S.udraft = null; openSheet('details'); }
        else if (!S.addr) { S.draft = {}; go('address'); }
        else openSheet('pay');
        emit('checkout');
      },
      details: () => { S.udraft = null; openSheet('details'); },
      saveuser: () => {
        const d = { name: S.udraft?.name ?? S.user?.name ?? '', phone: (S.udraft?.phone ?? S.user?.phone ?? '').replace(/\D/g, '') };
        const err = layer.querySelector('[data-err]');
        if (d.name.trim().length < 2) return err && (err.textContent = 'Please enter your name');
        if (!/^[6-9]\d{9}$/.test(d.phone)) return err && (err.textContent = 'Enter a valid 10-digit mobile number');
        S.user = { name: d.name.trim(), phone: d.phone };
        closeSheet();
        if (S.toCart && !S.addr) { S.draft = {}; go('address'); }
        else if (S.toCart) { S.toCart = false; go('cart'); }
        else if (S.checkout && !S.addr) { S.draft = {}; go('address'); }
        else if (S.checkout) openSheet('pay');
        else { toast('Details saved'); if (cur().n === 'home') rerender(); }
        emit('user', S.user);
      },
      locate: () => {
        S.located = true;
        S.draft = { ...SAMPLE_ADDR };
        rerender();
        toast('Location found');
      },
      saveaddr: () => {
        const a = S.draft || {};
        const err = screens.lastElementChild.querySelector('[data-err]');
        const say = m => { if (err) err.textContent = m; else toast(m); };
        const miss = [['street', 'Street / Building'], ['area', 'Area / Locality'], ['city', 'City']].find(([k]) => !(a[k] || '').trim());
        if (miss) return say(`Please fill ${miss[1]}`);
        if (!/^\d{6}$/.test(a.pin || '')) return say('Enter a valid 6-digit pincode');
        S.addr = { state: 'Karnataka', ...a };
        emit('address', S.addr);
        if (S.toCart) { S.toCart = false; S.stack.pop(); go('cart'); }
        else if (S.checkout && S.cart.length) openSheet('pay');
        else { toast('Address saved'); back(); }
      },
      paynow: () => {
        const box = layer.querySelector('[data-sheet]');
        box.classList.add('paying');
        emit('paying');
        setTimeout(() => { box.classList.remove('paying'); box.classList.add('paid'); }, 1500);
        setTimeout(() => { closeSheet(); placeOrder(); }, 2500);
      },
      myorders: () => { closeSheet(); S.stack = [{ n: 'home' }, { n: 'orders' }]; mountScreen(1); },
      openorder: t => { closeSheet(); notifEl.classList.remove('on'); S.stack = [{ n: 'home' }, { n: 'order', id: t.dataset.id }]; mountScreen(1); },
      ofilter: t => { S.ofilter = t.dataset.f; rerender(); },
      again: (t, e) => {
        e.stopPropagation();
        const o = S.orders.find(x => x.id === t.dataset.id);
        o.items.forEach(i => { if (i.pid === 'gift') return; const p = P(i.pid); const v = p.variants.find(x => x.label === i.label) || p.variants[0]; for (let k = 0; k < i.qty; k++) addLine(p.id, v.id); });
        S.stack = [{ n: 'home' }, { n: 'cart' }]; mountScreen(1);
        toast('Items added back to your cart');
      },
      logout: () => { S.user = null; S.addr = null; closeSheet(); rerender(); toast('Logged out. Your cart is still here.'); emit('logout'); },
      copy: t => { navigator.clipboard && navigator.clipboard.writeText(t.dataset.v).catch(() => {}); toast('Copied ' + t.dataset.v); },
      callp: () => toast(`Calling ${PARTNER.name}… (demo)`),
      callstore: () => toast(`Calling ${STORE.name}… (demo)`),
      directions: () => toast('Opening directions… (demo)'),
      whatsapp: () => toast('Opening WhatsApp chat… (demo)'),
      soon: () => toast('Coming in the next launch'),
    };
    if (!isStatic) {
      root.addEventListener('click', e => {
        const t = e.target.closest('[data-act]');
        if (!t || !root.contains(t) || t.disabled) return;
        const fn = A[t.dataset.act];
        if (fn) { e.preventDefault(); fn(t, e); }
      });
      root.addEventListener('input', e => {
        const t = e.target;
        if (t.dataset.input === 'search') { S.search = t.value; refreshParts('search'); }
        if (t.dataset.input === 'addr') { S.draft = S.draft || {}; S.draft[t.dataset.k] = t.dataset.k === 'pin' ? t.value.replace(/\D/g, '') : t.value; }
        if (t.dataset.input === 'user') { S.udraft = S.udraft || { name: S.user?.name || '', phone: S.user?.phone || '' }; S.udraft[t.dataset.k] = t.value; }
      });
      root.addEventListener('change', e => { const t = e.target; if (t.dataset.input === 'addr') { S.draft = S.draft || {}; S.draft[t.dataset.k] = t.value; } });
    }

    mountScreen();
    if (S._pill) { pillState(S._pill[0], OFFERS.find(o => o.id === S._pill[1])); delete S._pill; }
    if (S._sheet) { openSheet(...S._sheet); delete S._sheet; }
    return {
      el: root, state: S, setStatus, toast, api,
      go: n => { closeSheet(); S.stack = [{ n: 'home' }]; if (n !== 'home') S.stack.push({ n }); mountScreen(n === 'home' ? -1 : 1); },
      order: id => S.orders.find(o => o.id === id),
      scroller: () => screens.lastElementChild,
    };
  }

  /* ---------- read-only renders (landing page phones) ---------- */
  const STATIC_ALIAS = { delivered: 'next-delivered', 'report-window': 'report-window', report: 'report', store: 'store', home: 'home' };
  const mountStatic = (el, preset, opts = {}) => create(el, { ...opts, static: true, preset: STATIC_ALIAS[preset] || preset });
  const staticHTML = preset => { const d = document.createElement('div'); mountStatic(d, preset); return d.outerHTML; };

  window.BuyApp = { create, mountStatic, staticHTML, PRESETS: Object.keys(PRESETS), STORE, PRODUCTS: K.PRODUCTS, OFFERS, PARTNER, inr, calcBill };
})();
