/* BUY · STORE DETAILS group — Figma: Store details 1073-2453
   Registers: R.store (screen)
   CSS: css/buy/store.css (scope rules under .bs-* classes) */
(() => {
  const K = BuyKit;
  const { inr, FG, STORE, OFFERS, DAYS, head, ICO } = K;
  const S = FG + 'store/';
  const OI = { del: 'of-del.svg', pct: 'of-pct.svg', gift: 'of-gift.svg' };

  K.R.store = () => `<div class="bs">${head('Store Details', '', `<button class="ba-back bs-share" data-act="share" aria-label="Share"><img src="${S}share-send.svg" alt="" width="20" height="20"></button>`)}
    <div class="bs-body">
      <div class="bs-ban"><img src="${STORE.banners[0]}" alt=""></div>
      <div class="bs-id"><img class="bs-logo" src="${STORE.logo}" alt=""><div class="bs-idt"><div class="bs-nm"><b>${STORE.name}</b>${ICO.verified}</div><small class="bs-cat">${STORE.category}</small><small class="bs-loc"><img src="${S}pin.svg" alt="" width="10" height="10">${STORE.area}</small></div></div>
      <div class="bs-two"><button class="bs-ob" data-act="directions">Get Directions</button><button class="bs-ob" data-act="whatsapp">Whatsapp</button></div>
      <section><p class="bs-sub">Store open Days</p>
      <div class="bs-days">${STORE.days.map(([d, a, b]) => `<span class="${a ? '' : 'off'}"><b>${d}</b><small>${a ? `${a} -<br>${b}` : 'Closed'}</small></span>`).join('')}</div></section>
      <section><p class="bs-sub">Store Location</p>
      <div class="bs-map"><img src="${K.F}map.jpg" alt="Map"><img class="bs-pin" src="${S}map-pin.svg" alt="" width="36" height="39"><button class="bs-ob bs-dir" data-act="directions">Get Directions</button></div></section>
      <section><p class="bs-sub">Offers Provided</p>
      ${OFFERS.map(o => `<div class="bs-of"><img src="${S}${OI[o.kind]}" alt="" class="bs-oi ${o.kind}"><div><b>${o.title}</b><small>For cart total <strong>${inr(o.min)}</strong> and more</small></div></div>`).join('')}</section>
      <section><p class="bs-sub">About</p><p class="bs-about">At ${STORE.name}, we make every sweet fresh each morning with pure ghee, real khoya and saffron. Traditional recipes. Honest ingredients. Happy celebrations.</p></section>
    </div></div>`;
})();
