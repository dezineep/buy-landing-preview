/* BUY · NEXT LAUNCH group — Figma: Delivered with "Received damaged product?" card 851-1528,
   Report a problem 862-3008, Report window notice 862-3266. Shown read-only in the landing page "Coming Next" phones.
   Registers: R.nextDelivered, R.report, R.reportWindow (screens; use S.orders[0] as the delivered order)
   CSS: css/buy/next.css (scope rules under .bn-* classes) */
(() => {
  const K = BuyKit;
  const { STORE, P, ICO, IMG, head, fmtShort } = K;
  const N = K.FG + 'next/';

  K.R.nextDelivered = S => {
    const o = S.orders[0];
    return `<div class="bn">${head('Order Delivered')}
      <div class="bn-body">
        <div class="bn-info"><img class="bn-box" src="${N}delivered-box.svg" alt=""><span class="bn-chip">Order #${o.id}</span>
          <div class="bn-msg"><h3>Your order has been delivered!</h3><p>Your sweets from ${STORE.name} have reached you. We hope you enjoy every bite. Thank you for ordering with us!</p></div></div>
        <div class="bn-dmg"><div class="bn-dmg-t"><img src="${N}damaged-box.png" alt=""><div><b>Received Damaged Product ?</b><p>Have you received damaged product? You can report to the store, upload the proof and request for refund</p></div></div>
          <div class="bn-dmg-b"><button data-act="soon"><img src="${N}ic-report.svg" alt="">Report Here</button><button data-act="callstore"><img src="${N}ic-call.svg" alt="">Call Directly</button></div></div>
        ${K.R.orderSummary ? K.R.orderSummary(S, o.id) : ''}
      </div></div>`;
  };
  const report = (S, withWindow) => {
    const o = S.orders[0];
    const rows = [['gj', 1], ['rg', 2], ['mp', 1], ['rb', 0], ['ml', 0], ['mb', 0]];
    return `<div class="bn">${head('Report a Problem', `Order #${o.id} • Delivered ${fmtShort(o.placedAt)}`)}
      <div class="bn-body bn-rep">
        ${withWindow ? `<div class="bn-warn"><img src="${N}clock.png" alt=""><div><b>Report window may have passed</b><p>This order was delivered 6 days ago. The store's <i>Report Window</i> is <em>${STORE.reportWindowHours} hours</em>. You can still submit a report, but the store may not be able to take action.</p></div></div>` : ''}
        <div class="bn-fld"><p class="bn-lbl">Reason <span>(Required)</span></p><div class="bn-select">Items Damaged <img src="${N}ic-down.svg" alt=""></div></div>
        <div class="bn-fld"><div class="bn-lbl2">Select Affected Items <u>Select All</u></div>
        ${rows.map(([id, n]) => { const p = P(id); return `<div class="bn-row${n ? ' on' : ''}"><img src="${p.img[0]}" alt=""><div><span class="ba-tag">${p.variants[0].label}</span><p>${p.name}</p><small>${STORE.name}</small></div>${n ? `<span class="ba-ostep"><button>${ICO.minus}</button><b>${n}</b><button>${ICO.plus}</button></span>` : `<span class="ba-oplus">${ICO.plus}</span>`}</div>`; }).join('')}</div>
        <div class="bn-fld"><p class="bn-lbl sm">Upload Product Photos as Proof <span>(Required)</span></p>
        <div class="bn-uploads"><img src="${IMG}gulab-jamun.jpg" alt=""><img src="${IMG}rasgulla.jpg" alt=""><span class="bn-upl"><img src="${N}ic-upload.svg" alt=""></span></div></div>
      </div>
      <div class="ba-foot"><button class="ba-btn wide">Submit Report</button></div></div>`;
  };
  K.R.report = S => report(S, false);
  K.R.reportWindow = S => report(S, true);
})();
