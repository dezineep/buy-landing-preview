/* BUY · MY ORDERS group — Figma: My orders 857-1943 (file FBuShw2V6BDtlsMePanuS7)
   Registers: R.orders (screen), R.orderCard(S, id)
   CSS: css/buy/orders.css (every rule scoped under .bm / .bm-*). Icons: assets/figma/orders/
   Structure:
     .bm > head('My Orders') + .bm-body
       .bm-tabs > button.bm-tab[.on] (data-act=ofilter data-f)
       .bm-list > (.bm-card + .bm-div)*      card = data-act=openorder; "Order Again" = data-act=again */
(() => {
  const K = BuyKit;
  const { esc, inr, FG, head, fmtShort } = K;
  const O = FG + 'orders/';
  const ic = (f, s = 14) => `<img src="${O}${f}" width="${s}" height="${s}" alt="" aria-hidden="true">`;
  const st = (kind, icon, label) => `<span class="bm-st ${kind}">${ic(icon)}${label}</span>`;

  K.R.orderCard = (S, id) => {
    const o = S.orders.find(x => x.id === id);
    const refund = o.refund ? st('wait', 'ic-refund-orange.svg', 'Refund Pending') : '';
    const chips = {
      placed: st('wait', 'ic-clock-orange.svg', 'Order In Review'),
      packed: st('ok', 'ic-check-green.svg', 'Packed'),
      dispatched: st('ok', 'ic-scooter-green.svg', 'On the Way') + `<span class="bm-otp">OTP: ${esc(o.otp)}</span>`,
      delivered: st('ok', 'ic-check-green.svg', 'Delivered') + refund,
      cancelled: st('no', 'ic-cancel-red.svg', 'Cancelled') + refund,
    }[o.status] || '';
    const n = o.items.reduce((a, i) => a + i.qty, 0);
    const done = o.status === 'delivered';
    const when = `${done ? 'Delivered on' : 'Arriving on'} ${fmtShort(done && o.past ? o.placedAt : new Date(o.placedAt.getTime() + 3600e3))}`;
    const shown = o.items.slice(0, 3), more = o.items.length - shown.length;
    const items = shown.map((i, k) => {
      const row = `<span class="bm-it"><i>${i.qty}<small>&times;</small></i>${esc(i.name)}</span>`;
      return k === shown.length - 1 && more > 0 ? `<span class="bm-row">${row}<em class="bm-more">${more} More</em></span>` : row;
    }).join('');
    return `<div class="bm-card" data-act="openorder" data-id="${o.id}">
      <div class="bm-top"><div class="bm-info"><div class="bm-chips">${chips}</div><small>${when}</small></div><b>${inr(o.bill.total)}</b></div>
      <div class="bm-items">${items}</div>
      <div class="bm-acts"><span class="bm-n"><em>${n}</em>Items</span><button class="bm-again" data-act="again" data-id="${o.id}">Order Again${ic('ic-chev-red.svg', 18)}</button></div>
    </div>`;
  };

  K.R.orders = S => {
    const f = S.ofilter || 'all';
    const list = S.orders.filter(o => f === 'all' || (f === 'prog' && o.status !== 'delivered') || (f === 'done' && o.status === 'delivered') || (f === 'cancel' && o.refund));
    const tabs = [['all', 'All'], ['prog', 'In Progress'], ['done', 'Delivered'], ['cancel', 'Cancelled']]
      .map(([k, l]) => `<button class="bm-tab${f === k ? ' on' : ''}" data-act="ofilter" data-f="${k}">${l}</button>`).join('');
    const cards = list.map(o => K.R.orderCard(S, o.id)).join(`<img class="bm-div" src="${O}divider.svg" width="380" height="1" alt="" aria-hidden="true">`);
    return `<div class="bm">${head('My Orders')}
      <div class="bm-body"><div class="bm-tabs">${tabs}</div>
      ${list.length ? `<div class="bm-list">${cards}</div>` : '<p class="ba-empty">No orders here yet.</p>'}</div></div>`;
  };
})();
