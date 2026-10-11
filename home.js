/* BUY · HOME group — Figma: Home 537-1093, Home with cart pill 1815-3843, pill states 1978-4316 / 759-2114 / 733-3092
   Registers: R.home (screen), R.ctl / R.grid / R.count (parts), R.pill / R.pillCongrats / R.pillSaved, SH.sort, mount.home
   CSS: css/buy/home.css (every rule scoped under .bh / .bh-* classes)

   Scroll behaviour (inside the .ba-scr scroller):
   - .bh-top (store-name bar) is position:sticky from the start and overlays the banner with a transparent background;
     K.mount.home adds .solid once the banner has scrolled up behind it (white background).
   - .bh-deliver and .bh-searchrow are sticky too, each pinning directly below the previous one (white background);
     .pinned is added to the search row once it sticks (soft bottom shadow).
   - In static mode there are no listeners: the classes are computed once from the current scroll position. */
(() => {
  const K = BuyKit;
  const { esc, inr, off, FG, STORE, ICO, priceRow, ring, calcBill, nextOffer, qtyInCart, sortedProducts, P } = K;
  const H = FG + 'home/';
  const BAR = 84;          // store-name bar height below --sat (32 top + 40 buttons + 12 bottom)
  const BANNER = 190;      // banner height below --sat (Figma 537:1096)
  const DELIVER = 41;      // "Deliver to" row block height (32.8 content + 8 gap)

  /* + button / red stepper used on every product card (also reused by the cart and product groups) */
  K.R.ctl = (S, pid) => {
    const p = P(pid), n = qtyInCart(S, pid);
    if (!n) return `<button class="ba-add" data-act="add" data-pid="${p.id}" aria-label="Add ${esc(p.name)}">${ICO.plus}</button>`;
    return `<span class="ba-step"><button data-act="pdec" data-pid="${p.id}" aria-label="Remove one">${ICO.minusW}</button><b>${n}</b><button data-act="pinc" data-pid="${p.id}" aria-label="Add one">${ICO.plusW}</button></span>`;
  };

  /* product card (Figma 537:1129; in-cart state 1815:3906) */
  const card = (S, p) => {
    const v0 = p.variants[0];
    const tag = p.variants.length > 1 ? `${p.variants.length} Options` : v0.label;
    return `<div class="bh-card" data-incart="${p.id}">
      <div class="bh-card-img" data-act="quick" data-pid="${p.id}"><img src="${p.img[0]}" alt="${esc(p.name)}"></div>
      <span class="ba-tag">${tag}</span>
      <p class="bh-card-name" data-act="product" data-pid="${p.id}">${esc(p.name)}</p>
      <div class="ba-pricebox" data-act="product" data-pid="${p.id}">${priceRow(v0.price, v0.mrp)}<span class="ba-off">${off(v0.price, v0.mrp)}% OFF</span></div>
      <span class="bh-card-ctl" data-part="ctl" data-arg="${p.id}">${K.R.ctl(S, p.id)}</span>
    </div>`;
  };
  K.R.grid = S => {
    const list = sortedProducts(S);
    return list.length ? list.map(p => card(S, p)).join('') : `<p class="bh-empty">No sweets match “${esc(S.search)}”. Try “jamun” or “rasgulla”.</p>`;
  };
  K.R.count = S => `${sortedProducts(S).length} Products`;

  K.R.home = S => {
    const a = S.addr;
    const n = STORE.banners.length;
    return `<div class="bh">
      <div class="bh-top">
        <button class="bh-store" data-act="store">
          <img class="bh-logo" src="${STORE.logo}" alt="">
          <span class="bh-store-t"><b>${esc(STORE.name)} ${ICO.verified}</b><small>${esc(STORE.area)}</small></span>
        </button>
        <span class="bh-btns">
          <button class="ba-rbtn navy" data-act="m17" aria-label="Modulus Seventeen">${ICO.m17}</button>
          <button class="ba-rbtn" data-act="share" aria-label="Share store">${ICO.share}</button>
          <button class="ba-rbtn" data-act="more" aria-label="More options">${ICO.more}</button>
        </span>
      </div>
      <div class="bh-hero">
        <div class="bh-hero-track" style="transform:translateX(${-S.heroI * 100}%)">${STORE.banners.map(b => `<img src="${b}" alt="">`).join('')}</div>
        <div class="bh-dots" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i === S.heroI ? 'on' : ''}"></i>`).join('')}</div>
      </div>
      <div class="bh-deliver">
        <button class="bh-addr" data-act="address"><small>Deliver to</small><span><b>${a ? esc(`${a.area}, ${a.city} - ${a.pin}`) : 'Add your delivery address'}</b><i class="bh-chev">${ICO.chev}</i></span></button>
        <span class="bh-days">${ICO.scooterG}2 days</span>
      </div>
      <div class="bh-searchrow">
        <label class="ba-search bh-search">${ICO.search}<input data-input="search" type="search" placeholder="Search for products, categories..." value="${esc(S.search)}" aria-label="Search products"></label>
      </div>
      <div class="bh-grid" data-part="grid" data-on="search">${K.R.grid(S)}</div>
    </div>`;
  };

  /* floating cart pill (Figma 1978:4316 / 537-1093 bottom 1992:3864) */
  let fromMsg = false;      // set by the congrats / saved renders so the default pill animates back in once
  K.R.pill = S => {
    const enter = fromMsg; fromMsg = false;
    const b = calcBill(S.cart);
    const next = nextOffer(b.sub);
    const shown = S.cart.slice(0, 3);
    const thumbs = shown.map(l => `<i><img src="${P(l.pid).img[0]}" alt=""></i>`).join('');
    const more = S.cart.length - shown.length;
    const left = next
      ? `${ring(b.sub / next.min, next.kind)}<span class="bh-pill-t"><b>${next.title}</b><small>Shop for <strong>${inr(next.min - b.sub)}</strong> more</small></span>`
      : `${ring(1, 'gift')}<span class="bh-pill-t"><b>All offers unlocked</b><small>You saved <strong>${inr(b.mrp - b.sub + b.disc + K.DELIVERY)}</strong></small></span>`;
    return `<button class="bh-pill${enter ? ' enter' : ''}" data-act="cart" aria-label="View cart">
      <span class="bh-pill-l">${left}</span><i class="bh-pill-sep" aria-hidden="true"></i>
      <span class="bh-pill-r"><span class="bh-pill-c"><b>CART</b><small>${b.count} ITEM${b.count === 1 ? '' : 'S'}</small></span><span class="bh-thumbs">${thumbs}${more > 0 ? `<em>${more}+</em>` : ''}</span></span>
    </button>`;
  };
  /* Figma 759:2114: green scooter drives across the pill while "Congratulations !" springs in */
  K.R.pillCongrats = () => (fromMsg = true) && `<div class="bh-pill-msg bh-congrats" role="status"><img class="bh-congrats-ic" src="${H}ic-congrats-scooter.svg" width="24" height="24" alt=""><b>Congratulations !</b></div>`;
  /* Figma 733:3092 */
  K.R.pillSaved = (S, o) => {
    fromMsg = true;
    const b = calcBill(S.cart);
    const saved = o && o.id === 'disc' ? b.disc : o && o.id === 'gift' ? 120 : K.DELIVERY;
    return `<button class="bh-pill-msg bh-saved" data-act="cart" role="status"><span>You have unlocked <em>${o ? o.unlocked : ''}</em></span><small>Saved <strong>${inr(saved)}</strong></small></button>`;
  };

  K.SH.sort = S => `${K.sheetHead('Sort By', 'Arrange products')}
    <div class="bh-sortl">${[['rel', 'Relevance'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['off', 'Biggest discount']].map(([k, l]) => `<button class="${(S.sort || 'rel') === k ? 'on' : ''}" data-act="setsort" data-s="${k}"><span>${l}</span><i></i></button>`).join('')}</div>`;

  K.mount.home = (el, S, api) => {
    const root = api.root;
    const top = el.querySelector('.bh-top'), srch = el.querySelector('.bh-searchrow');
    const sync = () => {
      if (!top) return;
      const y = el.scrollTop;
      top.classList.toggle('solid', y >= BANNER - BAR - 2);
      // the search row sticks once its natural top reaches the bottom of the pinned deliver row
      srch.classList.toggle('pinned', srch.offsetTop - y <= parseFloat(getComputedStyle(root).getPropertyValue('--sat') || 0) + BAR + DELIVER + 1);
    };
    sync();
    if (api.static) return;
    el.addEventListener('scroll', sync, { passive: true });
    const track = el.querySelector('.bh-hero-track'), dots = el.querySelectorAll('.bh-dots i');
    const t = setInterval(() => {
      if (!root.isConnected) return clearInterval(t);
      S.heroI = (S.heroI + 1) % STORE.banners.length;
      track.style.transform = `translateX(${-S.heroI * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('on', k === S.heroI));
    }, 3200);
    return () => { clearInterval(t); el.removeEventListener('scroll', sync); };
  };
})();
