/* BUY app kit — shared data, helpers, shared UI atoms and the renderer registries.
   Screen files (js/buy/<group>.js) register renderers into BuyKit.R / BuyKit.SH / BuyKit.mount.
   The engine (js/buy-app.js) owns state + actions and calls these renderers.

   CONTRACT (see each group file header for its own screens)
   - K.R.<screen>(S, entry) -> html     full-screen renderers; entry is the nav stack item ({n, pid, id…})
   - K.R.<part>(S, arg)     -> html     partial renderers, re-rendered by the engine into any element
                                        carrying data-part="<part>" data-arg="<arg>" after every cart change
   - K.SH.<sheet>(S, arg)   -> html     bottom-sheet / modal inner HTML (engine provides the container)
       set K.SH.<sheet>.kind = 'modal' for a centred modal instead of a bottom sheet
   - K.mount.<screen>(el, S, api)       optional; runs after the screen mounts or re-renders; may return a cleanup fn
   - K.mountSheet.<sheet>(box, S, api)  optional; same for sheets
   - elements with data-incart="<pid>" get class .in-cart while that product is in the cart
   - scroll galleries: data-gal on the scroller; [data-dot] elements inside its parent get .on for the visible slide
   - every interactive element uses data-act="<action>" (+ data-* args) — see ACTIONS in js/buy-app.js
*/
window.BuyKit = (() => {
  const IMG = 'assets/sweets/', F = 'assets/fig/', M = 'assets/m17/', FG = 'assets/figma/';
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const off = (p, m) => Math.round((1 - p / m) * 100);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtTime = d => { let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${pad(h)}:${pad(d.getMinutes())} ${ap}`; };
  const fmtDay = d => `${d.getDate()} ${MON[d.getMonth()]}, ${DAYS[d.getDay()]}`;
  const fmtShort = d => `${d.getDate()} ${MON[d.getMonth()]}, ${d.getFullYear()}`;
  const fmtLong = d => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

  /* ---------- store data ---------- */
  const STORE = {
    name: 'Madhuram Sweets', slug: 'madhuram-sweets', category: 'Sweet Shop',
    area: 'Koramangala, Bengaluru - 560034', logo: IMG + 'logo.jpg', phone: '+91 98765 43210',
    banners: [IMG + 'banner-1.jpg', IMG + 'banner-2.jpg', IMG + 'banner-3.jpg'],
    days: [['Sun', '10:30 AM', '09:30 PM'], ['Mon', '10:30 AM', '09:30 PM'], ['Tue', null], ['Wed', '10:30 AM', '09:30 PM'], ['Thu', '11:00 AM', '08:00 PM'], ['Fri', '10:30 AM', '10:00 PM'], ['Sat', '10:30 AM', '10:00 PM']],
    reportWindowHours: 48,
  };
  const PRODUCTS = [
    { id: 'gj', name: 'Gulab Jamun', img: [IMG + 'gulab-jamun.jpg', IMG + 'gulab-bowl.png', IMG + 'banner-3.jpg'], perKg: 460,
      desc: 'Soft khoya dumplings, fried slow till golden and soaked in cardamom & rose sugar syrup. Made fresh every morning in our kitchen — best served warm.',
      variants: [{ id: '500g', label: '500 g', price: 240, mrp: 280 }, { id: '1kg', label: '1 kg', price: 460, mrp: 560, best: true, left: 4 }] },
    { id: 'rg', name: 'Bengali Rasgulla', img: [IMG + 'rasgulla.jpg'], perKg: 420,
      desc: 'Spongy chhena balls simmered in light sugar syrup with a hint of saffron. Chilled, juicy and melt-in-the-mouth.',
      variants: [{ id: '500g', label: '500 g', price: 220, mrp: 260 }, { id: '1kg', label: '1 kg', price: 420, mrp: 520, best: true, left: 2 }] },
    { id: 'mp', name: 'Mysore Pak', img: [IMG + 'mysore-pak.jpg'], perKg: 650,
      desc: 'Rich ghee-roasted gram flour fudge with a porous, melt-away bite. A festive favourite from Karnataka.',
      variants: [{ id: '250g', label: '250 g', price: 180, mrp: 210 }, { id: '500g', label: '500 g', price: 340, mrp: 400, left: 2 }, { id: '1kg', label: '1 kg', price: 650, mrp: 780, best: true }] },
    { id: 'rb', name: 'Kesar Rajbhog', img: [IMG + 'rajbhog.jpg'],
      desc: 'Large saffron-stuffed chhena balls in kesar syrup, filled with chopped pistachio and cardamom.',
      variants: [{ id: '6pc', label: '6 pcs', price: 210, mrp: 250 }, { id: '12pc', label: '12 pcs', price: 399, mrp: 480, best: true }] },
    { id: 'ml', name: 'Malai Malpua', img: [IMG + 'malpua.jpg', IMG + 'banner-2.jpg'],
      desc: 'Golden pancakes soaked in syrup and topped with rabri, pistachio and edible flowers. Packed with care so the malai stays put.',
      variants: [{ id: '4pc', label: '4 pcs', price: 199, mrp: 240 }] },
    { id: 'mb', name: 'Assorted Mithai Box', img: [IMG + 'mithai-box.jpg', IMG + 'banner-1.jpg'],
      desc: 'A festive box of our bestsellers — kaju roll, cham cham, coconut laddoo, gulab jamun and more. Perfect for gifting.',
      variants: [{ id: 'box', label: '750 g box', price: 549, mrp: 650 }] },
  ];
  const P = id => PRODUCTS.find(p => p.id === id);
  const DELIVERY = 40;
  const OFFERS = [
    { id: 'free', min: 499, title: 'Unlock free delivery', unlocked: 'Free Delivery', done: 'Free delivery applied', kind: 'del' },
    { id: 'disc', min: 1499, title: 'Unlock 50% Discount', unlocked: '50% Discount', done: '50% off applied (up to ₹150)', kind: 'pct' },
    { id: 'gift', min: 1999, title: 'Get free Kaju Katli', unlocked: 'a free Kaju Katli', done: 'Free Kaju Katli (100 g) added', kind: 'gift' },
  ];
  const PARTNER = { name: 'Suresh yadav', phone: '+91 98765 22211', img: M + 'avatar-delivery-sq.png' };

  /* ---------- pricing ---------- */
  const lineInfo = l => {
    const p = P(l.pid);
    if (l.grams) {
      const price = Math.round(p.perKg * l.grams / 1000);
      return { p, price, mrp: Math.round(price * 1.18), label: l.grams >= 1000 ? `${+(l.grams / 1000).toFixed(2)} kg` : `${l.grams} g`, custom: true };
    }
    const v = p.variants.find(x => x.id === l.vid) || p.variants[0];
    return { p, v, price: v.price, mrp: v.mrp, label: v.label };
  };
  const calcBill = lines => {
    const sub = lines.reduce((a, l) => a + lineInfo(l).price * l.qty, 0);
    const mrp = lines.reduce((a, l) => a + lineInfo(l).mrp * l.qty, 0);
    const delivery = !sub || sub >= OFFERS[0].min ? 0 : DELIVERY;
    const disc = sub >= OFFERS[1].min ? Math.min(150, Math.round(sub * .5)) : 0;
    const gst = Math.round((sub - disc) * .05);
    return { sub, mrp, delivery, disc, gst, gift: sub >= OFFERS[2].min, total: sub - disc + delivery + gst, count: lines.reduce((a, l) => a + l.qty, 0) };
  };
  const nextOffer = sub => OFFERS.find(o => sub < o.min) || null;
  const qtyInCart = (S, pid) => S.cart.filter(l => l.pid === pid).reduce((a, l) => a + l.qty, 0);
  const sortedProducts = S => {
    let list = PRODUCTS.filter(p => !S.search || p.name.toLowerCase().includes(S.search.toLowerCase()));
    const pr = p => p.variants[0].price;
    if (S.sort === 'low') list = [...list].sort((a, b) => pr(a) - pr(b));
    if (S.sort === 'high') list = [...list].sort((a, b) => pr(b) - pr(a));
    if (S.sort === 'off') list = [...list].sort((a, b) => off(b.variants[0].price, b.variants[0].mrp) - off(a.variants[0].price, a.variants[0].mrp));
    return list;
  };

  /* ---------- demo order history ---------- */
  const seedOrders = () => {
    const d = new Date(); d.setDate(d.getDate() - 6);
    const d2 = new Date(); d2.setDate(d2.getDate() - 14);
    const addr = { street: '23, 4th Cross, 6th Main', road: 'Near BDA Complex', area: 'HSR Layout', pin: '560102', city: 'Bengaluru', state: 'Karnataka' };
    return [
      { id: 'ORD3981KL', otp: '2290', status: 'delivered', placedAt: d, times: { placed: d, delivered: d }, refund: false, past: true, txn: 'T2405161359421107', addr,
        items: [{ pid: 'mb', name: 'Assorted Mithai Box', label: '750 g box', qty: 1, price: 549, img: IMG + 'mithai-box.jpg' }, { pid: 'ml', name: 'Malai Malpua', label: '4 pcs', qty: 2, price: 199, img: IMG + 'malpua.jpg' }, { pid: 'gj', name: 'Gulab Jamun', label: '500 g', qty: 1, price: 240, img: IMG + 'gulab-jamun.jpg' }, { pid: 'rg', name: 'Bengali Rasgulla', label: '500 g', qty: 1, price: 220, img: IMG + 'rasgulla.jpg' }],
        bill: { sub: 1407, mrp: 1670, disc: 0, delivery: 0, gst: 70, total: 1477, count: 5 } },
      { id: 'ORD3710QX', otp: '8812', status: 'delivered', placedAt: d2, times: { placed: d2, delivered: d2 }, refund: true, past: true, txn: 'T2405161359402288', addr,
        items: [{ pid: 'rg', name: 'Bengali Rasgulla', label: '1 kg', qty: 1, price: 420, img: IMG + 'rasgulla.jpg' }],
        bill: { sub: 420, mrp: 520, disc: 0, delivery: 40, gst: 21, total: 481, count: 1 } },
    ];
  };

  /* ---------- shared UI atoms (owned by the foundation pass; screens reuse them) ---------- */
  /* ICO: real Figma icons (assets/figma/base/, exported from file FBuShw2V6BDtlsMePanuS7). Each is an <img> carrying its
     Figma root size, so it renders correctly without extra CSS. Red = #a52226 unless the key says otherwise. */
  const B = FG + 'base/';
  const ic = (file, w, h = w) => `<img src="${B}${file}" width="${w}" height="${h}" alt="" aria-hidden="true">`;
  const ICO = {
    back: ic('ic-back.svg', 20),                    // header back arrow (inside .ba-back)
    close: ic('ic-close.svg', 20),                  // sheet close cross (inside .ba-x)
    plus: ic('ic-plus-red.svg', 20),                // .ba-add / .ba-oplus / .ba-ostep
    minus: ic('ic-minus-red.svg', 20),              // .ba-ostep
    plusW: ic('ic-plus-white.svg', 20),             // .ba-step (filled red stepper)
    minusW: ic('ic-minus-white.svg', 20),           // .ba-step
    chev: ic('ic-chev-right-red.svg', 14),          // small right chevron (rotate 90deg for "Deliver to" dropdown)
    down: ic('ic-chev-down-red.svg', 16),           // "Read more" / select dropdown chevron
    arrow: ic('ic-arrow-right-red.svg', 24),        // "custom weight" arrow button
    copy: `<span class="ba-ic14">${ic('ic-copy.svg', 12.54)}</span>`, // 14px frame, glyph inset like Figma
    call: `<img src="${F}ic-phone-navy.svg" width="26" height="19" alt="" aria-hidden="true">`,
    search: ic('ic-search.svg', 16),
    share: ic('ic-share.svg', 20),                  // inside .ba-rbtn
    more: ic('ic-more.svg', 20),                    // inside .ba-rbtn
    cart: ic('ic-cart-red.svg', 20),                // "View cart" soft button
    star: ic('ic-star-red.svg', 14),
    verified: ic('ic-verified.svg', 16),            // next to store name
    scooterG: ic('ic-scooter-green.svg', 14),       // "2 days" delivery chip
    m17: ic('logo-m17-blue.png', 29, 20),           // inside .ba-rbtn.navy
  };
  /* header row: pink back button 60x42 + title 20px; top padding = --sat + 16 (Figma), 24px gap to content built in */
  const head = (title, sub = '', right = '') => `
    <div class="ba-head"><button class="ba-back" data-act="back" aria-label="Back">${ICO.back}</button>
      <div class="ba-head-t"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>${right}</div>`;
  const priceRow = (price, mrp, big) => `<div class="ba-price${big ? ' big' : ''}"><b>${inr(price)}</b>${mrp > price ? `<s>${inr(mrp)}</s>` : ''}</div>`;
  const sheetHead = (title, sub = '') => `<div class="ba-sh-h"><div class="ba-sh-t"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div><button class="ba-x" data-act="close" aria-label="Close">${ICO.close}</button></div>`;
  /* offer progress ring (Figma "Frame 2147239373"): 42px by default, track #dbdbdb, progress red (green when done).
     Size it from the parent with --ring (e.g. the home pill uses --ring: 31px). Icons are the Figma glyphs used as masks
     so the done state can turn green. */
  const RING_C = 119.38; // 2 * PI * 19
  const ring = (p, kind) => {
    const done = p >= 1, k = kind === 'del' || kind === 'pct' ? kind : 'gift';
    // the gift glyph only exists inside Figma's gift ring export, so that file is masked down to its centre
    const src = k === 'del' ? B + 'ic-scooter-red.svg' : k === 'pct' ? B + 'ic-discount-red.svg' : B + 'ring-gift.svg';
    const layers = k === 'gift' ? `radial-gradient(ellipse 35.3% 34.9% at 50.6% 48.8%, #000 98%, transparent 100%), url(${src})` : `url(${src})`;
    const mask = `-webkit-mask-image:${layers};mask-image:${layers}`;
    const len = Math.max(0, Math.min(1, p)) * RING_C;
    return `<span class="ba-ring${done ? ' done' : ''}" data-kind="${k}"><svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="19" fill="none" stroke="#dbdbdb" stroke-width="4"/><circle cx="21" cy="21" r="19" fill="none" stroke="${done ? '#01ae0f' : '#a52226'}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${len.toFixed(2)} ${RING_C}" transform="rotate(-90 21 21)"${len < .5 ? ' opacity="0"' : ''}/></svg><i class="ba-ring-ic" style="${mask}"></i></span>`;
  };

  return {
    IMG, F, M, FG, inr, off, esc, pad, DAYS, MON, MONTHS, fmtTime, fmtDay, fmtShort, fmtLong,
    STORE, PRODUCTS, P, DELIVERY, OFFERS, PARTNER, lineInfo, calcBill, nextOffer, qtyInCart, sortedProducts, seedOrders,
    ICO, head, priceRow, sheetHead, ring,
    R: {}, SH: {}, mount: {}, mountSheet: {},
  };
})();
