/* BUY · SHEETS group — Figma: More Options 537-1987, Amount Summary 1710-4493 (+ offers list sheet, no frame: styled as Figma offer cards)
   Registers: SH.more, SH.amount, SH.offers
   CSS: css/buy/sheets.css (every rule scoped under .bsh / .bsh-*). Icons: assets/figma/sheets/ */
(() => {
  const K = BuyKit;
  const { esc, inr, OFFERS, calcBill, ring, sheetHead, FG } = K;
  // preload icons so they are decoded before the sheet first slides in
  ['address','cart','chev-right','line-dash','logout','orders','refunds','support','user'].forEach(f => { const i = new Image(); i.src = `${FG}sheets/${f}.svg`; (K._pre = K._pre || []).push(i); });
  const ic = (f, s = 24) => `<img src="${FG}sheets/${f}.svg" width="${s}" height="${s}" alt="">`;

  // one 3x2 grid tile; soon = Figma "Coming Soon" state (icon artwork already ships at 50% opacity)
  const tile = (act, icon, l1, l2, soon) => `<button class="bsh-tile${soon ? ' soon' : ''}" data-act="${act}">
      <span class="bsh-tile-i">${ic(icon)}${soon ? '<em>Coming Soon</em>' : ''}</span>
      <span class="bsh-tile-l">${l1}<br>${l2}</span></button>`;

  K.SH.more = S => {
    const u = S.user;
    return `<div class="bsh bsh-more">${sheetHead('More Options', 'Profile &amp; Options')}
      <div class="bsh-body">
        <div class="bsh-prof">
          <span class="bsh-av">${ic('user')}</span>
          <span class="bsh-who"><b>${u ? esc(u.name) : 'Guest Shopper'}</b><small>${u ? '+91 ' + esc(u.phone) : 'Add details at checkout'}</small></span>
          <button class="bsh-edit" data-act="details">${u ? 'Edit Details' : 'Add Details'}${ic('chev-right', 18)}</button>
        </div>
        <div class="bsh-grid">
          ${tile('myorders', 'orders', 'My', 'Orders')}
          ${tile('cart', 'cart', 'View', 'Cart Items')}
          ${tile('soon', 'address', 'Saved', 'Addresses', 1)}
          ${tile('soon', 'refunds', 'My', 'Refunds', 1)}
          ${tile('soon', 'support', 'Store', 'Support', 1)}
          ${u ? tile('logout', 'logout', 'Log Out', 'Now') : tile('details', 'logout', 'Log In', 'Now')}
        </div>
      </div></div>`;
  };

  K.SH.offers = S => {
    const b = calcBill(S.cart);
    return `<div class="bsh bsh-offers">${sheetHead('Offers', 'Available offers on this store')}
      <div class="bsh-body bsh-ofl">${OFFERS.map(o => {
        const ok = b.sub >= o.min;
        return `<div class="ba-of bsh-of${ok ? ' done' : ''}">${ring(b.sub / o.min, o.kind)}<div><b>${ok ? o.done : o.title}</b><small>${ok ? 'Applied to your cart' : `Shop for <strong>${inr(o.min - b.sub)}</strong> more`}</small></div></div>`;
      }).join('')}</div></div>`;
  };

  K.SH.amount = S => {
    const b = calcBill(S.cart);
    const disc = b.disc + (b.mrp - b.sub);
    const row = (l, v, cls = '') => `<div class="bsh-row"><span>${l}</span><span${cls ? ` class="${cls}"` : ''}>${v}</span></div>`;
    return `<div class="bsh bsh-amount">${sheetHead('Amount Summary', 'View charges and discount applied')}
      <div class="bsh-body"><div class="bsh-amt">
        <div class="bsh-rows">
          ${row(`Subtotal (${b.count} item${b.count === 1 ? '' : 's'})`, inr(b.sub))}
          ${row('Delivery Charge', b.delivery ? inr(b.delivery) : 'FREE', b.delivery ? '' : 'g')}
          ${row('GST applied', inr(b.gst))}
          ${row('Discount', '- ' + inr(disc), 'g')}
        </div>
        <img class="bsh-dash" src="${FG}sheets/line-dash.svg" alt="">
        <div class="bsh-tot"><span>Total Amount to Pay</span><b>${inr(b.total)}</b></div>
      </div></div></div>`;
  };
})();
