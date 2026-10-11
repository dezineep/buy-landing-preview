/* BUY · ADDRESS group — Figma: Address selection 730-2743 ("Address Details Screen")
   Registers: R.address (screen). Inputs use data-input="addr" data-k=street|road|area|pin|city|state; errors go into [data-err].
   Actions used: back (header), locate ("Use Current Location"), saveaddr (footer button).
   Icons/illustrations: assets/figma/address/ (map.jpg, map-pin.svg, locate.svg, chevron-down.svg, delivery-scooter.svg, info.svg)
   CSS: css/buy/address.css (every rule scoped under .bd) */
(() => {
  const K = BuyKit;
  const { esc, inr, head, calcBill, ICO, FG, STORE, OFFERS, DELIVERY } = K;
  const A = FG + 'address/';
  const STATES = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'West Bengal', 'Telangana', 'Kerala', 'Gujarat'];

  K.R.address = S => {
    const a = S.draft || S.addr || {};
    const b = calcBill(S.cart);
    const freeAt = OFFERS[0].min;
    const box = (k, ph, extra = '') => `<input class="bd-in" data-input="addr" data-k="${k}" value="${esc(a[k] || '')}" placeholder="${ph}" ${extra}>`;
    const field = (k, label, ph, extra) => `<label class="bd-f"><span class="bd-l">${label}</span>${box(k, ph, extra)}</label>`;
    const state = a.state || 'Karnataka';
    return `<div class="bd">${head('Delivery Address', 'Enter the address details to get the order delivery')}
      <div class="bd-body">
        <div class="bd-top">
          <label class="ba-search bd-search">${ICO.search}<input placeholder="Search your area for delivery" data-input="none"></label>
          <div class="bd-map">
            <div class="bd-map-img"><img src="${A}map.jpg" alt="Map"><img class="bd-pin${S.located ? ' drop' : ''}" src="${A}map-pin.svg" width="36" height="39" alt=""></div>
            <button class="bd-loc" data-act="locate"><span class="bd-loc-ic"><img src="${A}locate.svg" width="16.875" height="16.875" alt=""></span>Use Current Location</button>
          </div>
        </div>
        <div class="bd-form">
          ${field('street', 'Street / Building No.', 'e.g. Flat 12, Queenz Merian Tower')}
          ${field('road', 'Road Name/ Landmark', 'e.g. MG Road')}
          ${field('area', 'Area / Locality', 'e.g., Near BDA Complex')}
          <div class="bd-two">${field('pin', 'Pincode', '560102', 'inputmode="numeric" maxlength="6"')}${field('city', 'City', 'Bengaluru')}</div>
          <label class="bd-f"><span class="bd-l">State or Union Territory</span>
            <span class="bd-sel"><select class="bd-in" data-input="addr" data-k="state">${STATES.map(s => `<option${state === s ? ' selected' : ''}>${s}</option>`).join('')}</select><img src="${A}chevron-down.svg" width="18" height="18" alt=""></span></label>
          <p class="ba-err" data-err></p>
        </div>
        <div class="bd-del">
          <div class="bd-del-l"><img src="${A}delivery-scooter.svg" width="51.5455" height="54" alt="">
            <div class="bd-del-t"><span class="bd-tag">Delivery Charge</span>
              <div class="bd-del-v"><b>${b.delivery ? inr(b.delivery) : 'FREE'}</b><small>3.2 km from ${esc(STORE.name)}</small></div></div></div>
          <div class="bd-del-r"><img src="${A}info.svg" width="12" height="12" alt=""><p>${inr(DELIVERY)} flat (below ${inr(freeAt)})<br>Free on orders ${inr(freeAt)}+</p></div>
        </div>
      </div>
      <div class="ba-foot bd-foot"><div class="ba-amt"><b>${inr(b.total)}</b><small>${b.delivery ? 'Delivery Charge Included' : 'Free delivery applied'}</small></div>
        <button class="ba-btn" data-act="saveaddr">${S.cart.length && S.checkout ? 'Proceed to Payment' : 'Save Address'}</button></div>
    </div>`;
  };
})();
