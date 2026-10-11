/* BUY · CART group — Figma: Cart 747-1311 (offers block 750-2031 is the Offers sheet, owned by the sheets group)
   Registers: R.cart (screen), R.cartRows / R.offerCard / R.bill / R.cartTotal / R.cartCount / R.cartMore (parts),
              SH.details (name + phone, no login), SH.pay (payment sheet; engine toggles .paying / .paid on the sheet box)
   CSS: css/buy/cart.css (every rule scoped under .bc / .bc-* classes)
   Layout (Figma 747:1311, 412 wide): header (shared) -> 16px side padding, 380 content
     items block: "n Items added" 16/500 + rows (py 16, gap 8, 62px image r12) split by the fading red divider
     8px -> offer card (.ba-of + ring) -> 8px -> "See All Offers" (12/500 red, py 8)
     24px -> bill details (keeps the animated "applied" rows) -> 24px -> "Add more to your order" (16/500) + 160px cards
     sticky foot: 25/600 amount + underlined "Amount Summary", primary button at natural width */
(() => {
  const K = BuyKit;
  const { esc, inr, off, IMG, STORE, PRODUCTS, DELIVERY, ICO, head, priceRow, ring, calcBill, nextOffer, lineInfo, sheetHead } = K;
  const A = K.FG + 'cart/';
  // demo ratings for the "Add more" cards (Figma shows a star + rating next to the size tag)
  const RATING = { gj: 4.8, rg: 4.7, mp: 4.6, rb: 4.7, ml: 4.5, mb: 4.9 };

  const plural = n => `${n} Item${n === 1 ? '' : 's'}`;

  /* ---------- parts ---------- */
  K.R.cartRows = S => S.cart.map((l, i) => {
    const x = lineInfo(l), o = x.mrp > x.price ? off(x.price, x.mrp) : 0;
    return `${i ? '<i class="ba-div"></i>' : ''}<div class="bc-row">
      <img class="bc-row-img" src="${x.p.img[0]}" alt="">
      <div class="bc-row-i"><span class="ba-tag">${x.label}${x.custom ? ' · custom' : ''}</span><p>${esc(x.p.name)}</p>
        <div class="bc-row-p">${priceRow(x.price, x.mrp)}${o ? `<span class="ba-off">${o}% OFF</span>` : ''}</div></div>
      <span class="ba-ostep"><button data-act="dec" data-key="${l.key}" aria-label="Remove one">${ICO.minus}</button><b>${l.qty}</b><button data-act="inc" data-key="${l.key}" aria-label="Add one">${ICO.plus}</button></span></div>`;
  }).join('');
  K.R.cartCount = S => `${plural(calcBill(S.cart).count)} added`;
  K.R.offerCard = S => {
    const b = calcBill(S.cart), next = nextOffer(b.sub);
    if (!next) return `<div class="ba-of done">${ring(1, 'gift')}<div><b>All offers unlocked</b><small>Free delivery, 50% off and a free Kaju Katli</small></div></div>`;
    return `<div class="ba-of">${ring(b.sub / next.min, next.kind)}<div><b>${next.title}</b><small>Shop for <strong>${inr(next.min - b.sub)}</strong> more</small></div></div>`;
  };
  // S.fresh.free / disc / gift is true only for the render right after that offer unlocked -> .fresh plays the "applied" highlight
  K.R.bill = S => {
    const b = calcBill(S.cart), fresh = S.fresh || {};
    const row = (cls, l, r) => `<div class="bc-bill-r${cls}"><span>${l}</span><span>${r}</span></div>`;
    return `<div class="bc-bill">
      <p class="bc-bill-h">Bill Details</p>
      ${row('', `Item total <small>(MRP ${inr(b.mrp)})</small>`, inr(b.sub))}
      ${b.delivery ? row('', 'Delivery charge', inr(b.delivery))
        : row(` ok${fresh.free ? ' fresh' : ''}`, 'Delivery charge <em>FREE</em>', `<s>${inr(DELIVERY)}</s> ₹0`)}
      ${b.disc ? row(` ok${fresh.disc ? ' fresh' : ''}`, '50% discount <em>APPLIED</em>', `- ${inr(b.disc)}`) : ''}
      ${b.gift ? row(` ok${fresh.gift ? ' fresh' : ''}`, 'Free Kaju Katli (100 g) <em>GIFT</em>', '<s>₹120</s> ₹0') : ''}
      ${row('', 'GST (5%)', inr(b.gst))}
      <i class="ba-div dash"></i>
      ${row(' tot', 'To Pay', inr(b.total))}
    </div>`;
  };
  K.R.cartTotal = S => inr(calcBill(S.cart).total);
  K.R.cartMore = S => PRODUCTS.filter(p => !S.cart.some(l => l.pid === p.id)).map(p => {
    const v = p.variants[0];
    return `<div class="bc-mini" data-incart="${p.id}">
      <div class="bc-mini-img" data-act="quick" data-pid="${p.id}"><img src="${p.img[0]}" alt="${esc(p.name)}" loading="lazy"><span class="bc-mini-ctl" data-part="ctl" data-arg="${p.id}">${K.R.ctl(S, p.id)}</span></div>
      <div class="bc-mini-t"><span class="ba-tag">${p.variants.length > 1 ? `${p.variants.length} Options` : v.label}</span><span class="bc-rate">${ICO.star}${RATING[p.id] || 4.6}</span></div>
      <p data-act="product" data-pid="${p.id}">${esc(p.name)}</p>
      <div class="ba-pricebox" data-act="product" data-pid="${p.id}">${priceRow(v.price, v.mrp)}<span class="ba-off">${off(v.price, v.mrp)}% OFF</span></div>
    </div>`;
  }).join('');

  /* ---------- screen ---------- */
  K.R.cart = S => {
    if (!S.cart.length) return `<div class="bc">${head('Cart Items')}
      <div class="bc-empty"><img src="${IMG}gulab-bowl.png" alt=""><b>Your cart is empty</b><p>Add some sweetness from ${esc(STORE.name)}.</p><button class="ba-btn" data-act="home">Browse Sweets</button></div></div>`;
    const more = K.R.cartMore(S);
    const ad = S.addr;
    const where = ad ? esc(`${ad.area || ad.road || ad.street}, ${ad.city} - ${ad.pin}`) : 'Add your delivery address';
    return `<div class="bc">${head('Cart Items')}
      <button class="bc-addr" data-act="address"><img src="${K.F}ic-pin.svg" alt=""><span>Deliver to <b>${where}</b></span><em>Change</em></button>
      <div class="bc-body">
        <section class="bc-top">
          <div class="bc-items"><p class="bc-cnt" data-part="cartCount">${K.R.cartCount(S)}</p><div class="bc-list" data-part="cartRows">${K.R.cartRows(S)}</div></div>
          <div class="bc-offer"><div data-part="offerCard">${K.R.offerCard(S)}</div><button class="bc-link" data-act="offers">See All Offers</button></div>
        </section>
        ${more ? `<section class="bc-more"><p class="bc-h">Add more to your order</p><div class="bc-hlist">${more}</div></section>` : ''}
      </div>
      <div class="ba-foot bc-foot"><div class="ba-amt bc-amt"><b data-part="cartTotal">${K.R.cartTotal(S)}</b><button data-act="amount">Amount Summary</button></div>
        <button class="ba-btn" data-act="checkout">Proceed to Pay</button></div>
    </div>`;
  };

  /* ---------- sheets ---------- */
  K.SH.details = S => `${sheetHead('Your Details', 'So the store can reach you about this order')}
    <div class="bc-sh">
      <label class="bc-field"><span>Full Name</span><input data-input="user" data-k="name" value="${esc(S.udraft?.name ?? S.user?.name ?? '')}" placeholder="e.g. Ananya Rao" autocomplete="name"></label>
      <label class="bc-field"><span>Phone Number</span><span class="bc-phone"><em>+91</em><input data-input="user" data-k="phone" value="${esc(S.udraft?.phone ?? S.user?.phone ?? '')}" inputmode="numeric" maxlength="10" placeholder="98765 43210" autocomplete="tel-national"></span></label>
      <p class="bc-note">No password, no login. We only use this to share order updates. (This is a demo, nothing leaves your browser.)</p>
      <p class="ba-err bc-err" data-err></p>
      <button class="ba-btn wide" data-act="saveuser">${S.checkout ? 'Continue to Address' : 'Save Details'}</button>
    </div>`;
  K.SH.pay = S => {
    const b = calcBill(S.cart);
    const opts = [['UPI', 'Google Pay, PhonePe, Paytm & more', `<img src="${A}ic-upi.svg" width="30" height="30" alt="">`],
      ['Credit / Debit Card', 'Visa, Mastercard, RuPay', ''], ['Net Banking', 'All major banks', '']];
    return `<div class="bc-pay">${sheetHead('Modulus Seventeen Pay', `Paying ${esc(STORE.name)}`)}
      <div class="bc-sh">
        <div class="bc-pay-amt"><small>Amount to pay</small><b>${inr(b.total)}</b><span class="bc-pay-n">${plural(b.count)} · ${esc(STORE.name)}</span></div>
        <div class="bc-pay-o">${opts.map(([t, s, ic], i) => `<label><input type="radio" name="bapm" ${i ? '' : 'checked'}><span class="bc-pay-t"><b>${t}</b><small>${s}</small></span>${ic}</label>`).join('')}</div>
        <p class="bc-note">Your money is held safely in the Modulus Seventeen gateway and settled to the store only after delivery.</p>
        <button class="ba-btn wide" data-act="paynow">Pay ${inr(b.total)}</button>
      </div>
      <div class="bc-paying"><span class="bc-spin"></span><b>Processing payment</b><small>Do not close this window</small></div>
      <div class="bc-paid"><span class="bc-tick"><img src="${A}ic-check-green.svg" width="14" height="14" alt=""></span><b>Payment successful</b><span class="bc-ok"><img src="${A}ic-check-green.svg" width="14" height="14" alt="">${inr(b.total)} paid</span></div>
    </div>`;
  };

  /* offer-unlocked pop-up (Figma 1217-4192 free delivery, 786-5333 discount / gift) */
  K.SH.unlock = (S, id) => {
    const o = K.OFFERS.find(x => x.id === id) || K.OFFERS[0], b = calcBill(S.cart);
    const btn = '<button class="ba-btn outline wide bu-ok" data-act="close">Woohoo! Thanks</button>';
    if (o.id === 'free') return `<div class="bu"><div class="bu-ill"><span class="bu-lines"><i></i><i></i><i></i></span><img src="${K.F}scooter.svg" alt=""></div>
      <span class="bu-chip">Congrats!</span><p class="bu-big"><b>Free</b><s>${inr(DELIVERY)}</s></p><p class="bu-sub">You unlocked Free Delivery</p>${btn}</div>`;
    const saved = o.id === 'disc' ? b.disc : 120;
    return `<div class="bu"><div class="bu-tick"><span class="bu-rays">${'<i></i>'.repeat(10)}</span><span class="bu-c"><svg viewBox="0 0 24 24" width="40" height="40"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
      <p class="bu-t">${o.id === 'disc' ? 'Festive Offer' : 'Free Gift Unlocked'}</p><p class="bu-sub2">${o.id === 'disc' ? '50% Off Applied !' : 'Kaju Katli (100 g) added !'}</p>
      <p class="bu-saved">You saved ${inr(saved)}</p>${btn}<span class="bu-conf">${'<i></i>'.repeat(14)}</span></div>`;
  };
  K.SH.unlock.kind = 'modal';
})();