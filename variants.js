/* BUY · VARIANTS group — Figma: Select variant sheet 593-1779, Custom quantity sheet 577-1557
   Registers: SH.variants, R.variantRows (part), SH.custom
   CSS: css/buy/variants.css (scope rules under .bv-* classes)
   Assets: assets/figma/variants/ic-key-delete.png (number-pad delete glyph, cropped from the Figma keyboard export);
           every other icon is a shared ICO (close, plus, minus, arrow) or the shared .ba-div fade divider. */
(() => {
  const K = BuyKit;
  const { esc, inr, P, ICO, FG, priceRow, sheetHead } = K;

  /* rows: chip (weight) | price + per-unit rate | "Only n left" ........ + / stepper; fade divider between rows */
  K.R.variantRows = (S, pid) => P(pid).variants.map((v, i) => {
    const line = S.cart.find(l => l.pid === pid && l.vid === v.id);
    const grams = /kg/.test(v.label) ? parseFloat(v.label) * 1000 : /g\b/.test(v.label) ? parseFloat(v.label) : 0;
    const unit = grams ? `₹${(v.price / grams).toFixed(2)}/g` : `₹${Math.round(v.price / (parseFloat(v.label) || 1))}/pc`;
    const ctl = line
      ? `<span class="ba-ostep"><button data-act="dec" data-key="${line.key}" aria-label="Remove one">${ICO.minus}</button><b>${line.qty}</b><button data-act="inc" data-key="${line.key}" aria-label="Add one">${ICO.plus}</button></span>`
      : `<button class="ba-oplus" data-act="vadd" data-pid="${pid}" data-vid="${v.id}" aria-label="Add ${esc(v.label)}">${ICO.plus}</button>`;
    return `${i ? '<i class="ba-div"></i>' : ''}<div class="bv-row"><div class="bv-l"><span class="bv-lab">${esc(v.label)}</span>
      <div class="bv-p">${priceRow(v.price, v.mrp)}<small>${unit}</small></div>${v.left ? `<em class="bv-left">Only ${v.left} left</em>` : ''}</div>${ctl}</div>`;
  }).join('');

  K.SH.variants = (S, pid) => {
    const p = P(pid);
    return `${sheetHead(esc(p.name), 'Select variant')}
      <div class="bv-rows" data-part="variantRows" data-arg="${pid}">${K.R.variantRows(S, pid)}</div>
      ${p.perKg ? `<button class="bv-custom" data-act="custom" data-pid="${pid}"><span class="bv-custom-t"><b>Want to buy custom weight ?</b><small>You can add your custom weight and proceed to buy</small></span><i class="bv-go">${ICO.arrow}</i></button>` : ''}`;
  };

  const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], null, ['0'], ['⌫']];
  const keyHtml = k => !k ? '<span></span>'
    : k[0] === '⌫' ? `<button class="bv-del" data-act="key" data-k="⌫" aria-label="Delete"><img src="${FG}variants/ic-key-delete.png" width="26" height="22" alt=""></button>`
    : `<button class="${k.length > 1 ? '' : 'solo'}" data-act="key" data-k="${k[0]}"><span>${k[0]}</span>${k.length > 1 ? `<small>${k[1]}</small>` : ''}</button>`;

  K.SH.custom = (S, pid) => {
    const p = P(pid), c = S.cq || { v: '', unit: 'g' };
    const grams = c.unit === 'kg' ? (+c.v || 0) * 1000 : +c.v || 0;
    const price = Math.round(p.perKg * grams / 1000);
    const ok = grams >= 100 && grams <= 5000;
    return `${sheetHead('Custom Quantity', `${esc(p.name)} · Minimum Qty: 100g`)}
      <div class="bv-cq">
        <div class="bv-fld"><p class="bv-lbl"><span>Amount Paying</span><b>*</b></p>
          <div class="bv-in"><span class="bv-v">${c.v ? esc(c.v) : '<i>0</i>'}<em class="bv-caret"></em></span>
            <span class="bv-unit"><button class="${c.unit === 'g' ? 'on' : ''}" data-act="unit" data-u="g">Gram</button><button class="${c.unit === 'kg' ? 'on' : ''}" data-act="unit" data-u="kg">Kg</button></span></div></div>
        <div class="bv-tot"><div><small>Total Price</small><b>${inr(price)}</b></div><div class="r"><small>Rate per weight</small><span>₹${(p.perKg / 1000).toFixed(2)}/g</span></div></div>
        <p class="bv-err">${grams && grams < 100 ? 'Minimum quantity is 100 g' : grams > 5000 ? 'Maximum 5 kg per order' : ''}</p>
        <button class="ba-btn wide" data-act="addcustom" data-pid="${pid}" ${ok ? '' : 'disabled'}>Add Quantity</button></div>
      <div class="bv-keys">${KEYS.map(keyHtml).join('')}</div>`;
  };
})();
