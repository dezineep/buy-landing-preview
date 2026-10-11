/* BUY · PRODUCT group — Figma: Product details 694-1251, footer after add 698-1473, quick-view modal 1217-2705 / 1217-2734
   Registers: R.product (screen), R.pdFoot / R.qvCtl (parts), SH.quick (modal)
   CSS: css/buy/product.css (scope rules under .bp-* classes)
   Reuses: K.R.ctl (home group part) for the + / stepper on the "Add more to your order" cards. */
(() => {
  const K = BuyKit;
  const { esc, inr, off, PRODUCTS, ICO, P, head, priceRow, calcBill } = K;
  const selVid = (S, pid) => { const p = P(pid); return S.sel[pid] || (p.variants.find(v => v.best) || p.variants[0]).id; };
  const priceBox = v => `<div class="ba-pricebox">${priceRow(v.price, v.mrp, true)}${v.mrp > v.price ? `<span class="ba-off">${off(v.price, v.mrp)}% OFF</span>` : ''}</div>`;
  const dots = (n, cls) => n > 1 ? `<div class="${cls}">${Array.from({ length: n }, (_, i) => `<i data-dot class="${i ? '' : 'on'}"></i>`).join('')}</div>` : '';
  const bigStep = line => `<span class="ba-step big"><button data-act="dec" data-key="${line.key}" aria-label="Remove one">${ICO.minusW}</button><b>${line.qty}</b><button data-act="inc" data-key="${line.key}" aria-label="Add one">${ICO.plusW}</button></span>`;

  /* "Add more to your order" card (Figma 694:1362): 160 wide, image 140 with the + pill over its bottom-left corner */
  const mini = (S, o) => {
    const v0 = o.variants[0];
    const tag = o.variants.length > 1 ? `${o.variants.length} Options` : v0.label;
    return `<div class="bp-mini" data-incart="${o.id}">
      <div class="bp-mini-img" data-act="quick" data-pid="${o.id}"><img src="${o.img[0]}" alt="${esc(o.name)}" loading="lazy"><span class="bp-mini-ctl" data-part="ctl" data-arg="${o.id}">${K.R.ctl(S, o.id)}</span></div>
      <span class="ba-tag">${tag}</span>
      <p class="bp-mini-name" data-act="product" data-pid="${o.id}">${esc(o.name)}</p>
      <div data-act="product" data-pid="${o.id}">${priceRow(v0.price, v0.mrp)}<span class="ba-off">${off(v0.price, v0.mrp)}% OFF</span></div>
    </div>`;
  };

  K.R.product = (S, entry) => {
    const pid = entry.pid, p = P(pid), vid = selVid(S, pid);
    const v = p.variants.find(x => x.id === vid) || p.variants[0];
    const others = PRODUCTS.filter(x => x.id !== pid);
    const pills = p.variants.map(x => `<button class="bp-vpill${x.id === vid ? ' on' : ''}" data-act="selv" data-pid="${pid}" data-vid="${x.id}">${x.best ? '<em>Best Value</em>' : ''}${x.label}</button>`).join('')
      + (p.perKg ? `<button class="bp-vpill" data-act="custom" data-pid="${pid}">Custom</button>` : '');
    return `<div class="bp">
      ${head('Product Details')}
      <div class="bp-body">
        <div class="bp-gal"><div class="bp-track" data-gal>${p.img.map(i => `<img src="${i}" alt="${esc(p.name)}">`).join('')}</div>${p.img.length > 1 ? dots(p.img.length, 'bp-dots') : ''}</div>
        <div class="bp-info">
          <div class="bp-row">
            <div class="bp-nm"><p class="bp-name">${esc(p.name)}</p>${priceBox(v)}</div>
            <button class="ba-rbtn soft" data-act="share" aria-label="Share">${ICO.share}</button>
          </div>
          <div class="bp-var"><p class="bp-lbl">Select quantity variant</p><div class="bp-vpills">${pills}</div></div>
          <div class="bp-dsc" data-desc-wrap>
            <div class="bp-dsc-t"><p class="bp-h">Description</p><p class="bp-desc" data-desc>${esc(p.desc)}</p></div>
            <button class="bp-more" data-act="readmore">${ICO.down}<span data-label>Read more</span></button>
          </div>
        </div>
        <div class="bp-addmore"><p class="bp-h2">Add more to your order</p>
          <div class="bp-hlist">${others.map(o => mini(S, o)).join('')}</div></div>
      </div>
      <div class="ba-foot bp-foot" data-part="pdFoot" data-arg="${pid}">${K.R.pdFoot(S, pid)}</div>
    </div>`;
  };

  /* footer: Add to Cart (694:1483) -> View cart + count badge | red stepper (698:1473) */
  K.R.pdFoot = (S, pid) => {
    const vid = selVid(S, pid);
    const line = S.cart.find(l => l.pid === pid && l.vid === vid);
    if (!line) return `<button class="ba-btn wide" data-act="vadd" data-pid="${pid}" data-vid="${vid}">Add to Cart</button>`;
    const n = calcBill(S.cart).count;
    return `<button class="ba-btn soft grow" data-act="cart">${ICO.cart}View cart<em>${n}</em></button>${bigStep(line).replace('ba-step big', 'ba-step big grow')}`;
  };

  /* quick-view control (1217:2729 / 1217:2758): 39px pill button, never wraps */
  K.R.qvCtl = (S, pid) => {
    const v = P(pid).variants[0];
    const line = S.cart.find(l => l.pid === pid && l.vid === v.id);
    return line ? bigStep(line) : `<button class="ba-btn" data-act="vadd" data-pid="${pid}" data-vid="${v.id}">Add to Cart</button>`;
  };

  /* quick-view modal (1217:2705): 348x347 image, white close 60x42 top-right, fade to white, dots, name, price + control */
  K.SH.quick = (S, pid) => {
    const p = P(pid), v = p.variants[0];
    return `<div class="bp-qv">
      <div class="bp-qv-media"><div class="bp-track" data-gal>${p.img.map(i => `<img src="${i}" alt="${esc(p.name)}">`).join('')}</div>
        <i class="bp-qv-fade"></i><button class="bp-qv-x" data-act="close" aria-label="Close">${ICO.close}</button>
        <div class="bp-qv-dots">${Array.from({ length: Math.max(1, p.img.length) }, (_, i) => `<i data-dot class="${i ? '' : 'on'}"></i>`).join('')}</div></div>
      <div class="bp-qv-info">
        <p class="bp-qv-name" data-act="product" data-pid="${pid}">${esc(p.name)} - ${v.label}</p>
        <div class="bp-qv-b">${priceBox(v)}<span class="bp-qv-ctl" data-part="qvCtl" data-arg="${pid}">${K.R.qvCtl(S, pid)}</span></div>
      </div>
    </div>`;
  };
  K.SH.quick.kind = 'modal';
})();
