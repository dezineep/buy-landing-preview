/* BUY · ORDER STATUS group — Figma: Order placed 925-3325, Order packed 781-2949, On the way / dispatched 786-5443,
   Order delivered 983-2725
   Registers: R.order (screen; entry.id = order id; order.status = placed|packed|dispatched|delivered), R.orderSummary(S, id)
   (orderSummary is also reused by the next-launch group, so it is self-contained under .bo-sum)
   CSS: css/buy/order.css (scope rules under .bo-* classes)
   Assets: assets/figma/order/ (illustrations exported from the Figma nodes, summary row icons, partner avatar, call/truck icons) */
(() => {
  const K = BuyKit;
  const { esc, FG, PARTNER, ICO, MON, head, fmtTime, fmtDay, fmtLong } = K;
  const O = FG + 'order/';
  const img = (file, w, h, cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="${O}${file}" width="${w}" height="${h}" alt="" aria-hidden="true">`;

  /* Figma "Order Summary Container" (e.g. 983:2833) */
  K.R.orderSummary = (S, id) => {
    const o = S.orders.find(x => x.id === id);
    if (!o) return '';
    const items = o.items || [];
    const more = items.length > 3 ? items.length - 3 : 0;
    const item = i => `<span class="bo-it"><i>${i.qty}x</i>${esc(i.name)} · ${esc(i.label)}</span>`;
    const shown = items.slice(0, 3).map((i, n) => n === 2 && more ? `<span class="bo-it-row">${item(i)}<em>${more} More</em></span>` : item(i)).join('');
    const a = o.addr;
    const copy = v => `<button class="bo-copy" data-act="copy" data-v="${esc(v)}">${ICO.copy}<span>Copy</span></button>`;
    return `<div class="bo-sum">
      <div class="bo-sum-top"><p class="bo-sum-h">Order Summary</p><div class="bo-items">${shown}</div></div>
      <div class="ba-div dash"></div>
      <div class="bo-row">${img('ic-order-box.svg', 30, 30)}<div class="bo-row-t"><b>Order ID</b><small>#${esc(o.id)}</small></div>${copy(o.id)}</div>
      ${o.txn ? `<div class="ba-div dash"></div>
      <div class="bo-row">${img('ic-txn.svg', 30, 30)}<div class="bo-row-t"><b>Transaction ID</b><small>${esc(o.txn)}</small></div>${copy(o.txn)}</div>` : ''}
      ${a && a.street ? `<div class="ba-div dash"></div>
      <div class="bo-row addr">${img('ic-pin.svg', 30, 30)}<div class="bo-row-t"><b>Delivery Address</b><small>${esc([a.street, a.area].filter(Boolean).join(', '))},<br>${esc([a.road, a.city].filter(Boolean).join(', '))} ${esc(a.pin)}</small></div></div>` : ''}
    </div>`;
  };

  K.R.order = (S, entry) => {
    const o = S.orders.find(x => x.id === entry.id);
    const t = o.times || {}, st = o.status;
    const title = { placed: 'Order Placed', packed: 'Order Packed', dispatched: 'On the Way', delivered: 'Order Delivered' }[st];
    const arrive = new Date(o.placedAt.getTime() + 3600e3);
    const arriveShort = `${arrive.getDate()} ${MON[arrive.getMonth()]}`;
    let ill, h, p, small = '';
    if (st === 'placed') {
      ill = img('ill-placed.png', 130, 104, 'bo-ill placed');
      h = 'Order Placed !';
      p = 'Your order has been placed successfully and the items are yet to be packed soon';
      small = `Order placed on ${fmtTime(o.placedAt)}, ${fmtLong(o.placedAt)}`;
    } else if (st === 'packed' || st === 'dispatched') {
      ill = img('ill-packed.png', 151, 115, 'bo-ill ride');
      h = `Your order is Arriving on<br>${fmtDay(arrive)}!`;
      p = `Your order has been packed and is arriving on ${arriveShort}.<br>${st === 'packed' ? 'Delivery partner is yet to be assigned to your order' : 'Delivery partner has been assigned to your order'}`;
      if (st === 'packed') small = `Order Packed on ${fmtTime(t.packed || new Date())}, ${fmtLong(t.packed || new Date())}`;
    } else {
      ill = img('ill-delivered.png', 191, 124, 'bo-ill box');
      h = 'Your order has been delivered!';
      p = 'Your sweets have reached you safely. Thank you for ordering from Madhuram Sweets, enjoy every bite and come back soon!';
    }
    const at = t.dispatched || new Date();
    const partner = st === 'dispatched' ? `
        <div class="bo-partner">
          <p class="bo-partner-h">Assigned Delivery Partner</p>
          <div class="bo-pcard">
            <div class="bo-pmain">${img('avatar-partner.svg', 56, 77, 'bo-pav')}
              <div class="bo-pinfo">
                <div class="bo-ptop"><div class="bo-pname"><b>${esc(PARTNER.name)}</b><small>${esc(PARTNER.phone)}</small></div>
                  <button class="bo-call" data-act="callp" aria-label="Call delivery partner">${img('ic-call.svg', 24, 24)}</button></div>
                <p class="bo-pat">Assigned at ${fmtTime(at)}</p>
              </div>
            </div>
            <p class="bo-out">${img('ic-truck.svg', 16, 16)}<span>Out for delivery since ${fmtTime(at)}</span></p>
          </div>
        </div>` : '';
    return `<div class="bo st-${st}">${head(title)}
      <div class="bo-body">
        <div class="bo-info">
          ${ill}
          <span class="bo-chip">${st === 'delivered' ? `Order #${esc(o.id)}` : `OTP : ${esc(o.otp)}`}</span>
          <div class="bo-msg"><h3 class="bo-h">${h}</h3><p class="bo-p">${p}</p></div>
          ${small ? `<p class="bo-small">${small}</p>` : ''}
        </div>${partner}
        ${st !== 'delivered' ? `<div class="bo-btns"><button class="ba-btn wide" data-act="myorders">Track Order Status</button>
          <button class="ba-btn wide soft" data-act="home">Continue Shopping</button></div>` : ''}
        ${K.R.orderSummary(S, o.id)}
      </div>
    </div>`;
  };
})();
