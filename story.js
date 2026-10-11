/* "Life before BUY, and after" — a scroll-driven pixel story.
   Scroll picks the chapter; each chapter is a little looping play staged in a 1000×560 world. */
(() => {
  const host = document.getElementById('storyWorld');
  if (!host || !window.PX) return;
  const { div, PROPS, Doll, Scope, Cancel, PAL } = PX;
  const $ = (s, r = document) => r.querySelector(s);
  const W = 1000, H = 560, GROUND = 442;
  // pixel icons from js/main.js (window.PXI) — the story uses no emoji
  const ic = (name, cls) => (window.PXI ? PXI.html(name, cls) : '');

  /* ---------- build the world ---------- */
  const world = div('world is-before', host);
  const sky = div('w-sky', world);
  div('w-sky-before', sky); div('w-sky-after', sky);
  const far = div('w-far', world);
  const props = div('w-props', world);
  const actors = div('w-actors', world);
  const ui = div('w-ui', world);

  const put = (node, parent, x, y, w, h, cls) => {
    const d = div('w-obj ' + (cls || ''), parent);
    Object.assign(d.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    node && d.append(node);
    return d;
  };

  // sky furniture
  const sun = put(PROPS.sun(), far, 840, 34, 72, 72, 'w-sun');
  put(PROPS.cloud(), far, 120, 60, 120, 45, 'w-cloud c1');
  put(PROPS.cloud(), far, 600, 110, 96, 36, 'w-cloud c2');
  put(PROPS.cloud(), far, 380, 40, 72, 27, 'w-cloud c3');
  const storm = put(PROPS.cloud('#8d8a9b', 'rgba(0,0,0,.18)'), far, 340, 28, 320, 120, 'w-storm');
  const rain = div('w-rain', storm);
  for (let i = 0; i < 26; i++) {
    const r = div('', rain);
    r.style.left = (6 + i * 3.6) + '%';
    r.style.animationDelay = (-Math.random()) + 's';
    r.style.animationDuration = (.55 + Math.random() * .35) + 's';
  }
  const birds = div('w-birds', far);
  [[0, 0], [26, 10], [52, 2]].forEach(([x, y]) => put(PROPS.bird(), birds, x, y, 21, 9));

  // ground
  const ground = div('w-ground');
  world.insertBefore(ground, props);
  div('w-sidewalk', ground); div('w-road', ground);

  // props + the shop owner (stands behind the counter)
  put(PROPS.tree(), props, 560, 312, 90, 130, 'w-tree');
  put(PROPS.lamp(), props, 318, 282, 32, 160, 'w-lamp');
  const shop = PROPS.shop();
  put(shop.back, props, 20, 210, 260, 230, 'w-shop');
  const sign = div('w-sign', props, 'Meena Sweets');
  const owner = new Doll({ hat: 'cap', hatColor: PAL.navy, prop: null, size: 5, label: 'Store owner' });
  props.append(owner.root);
  const counterBox = put(PROPS.box(true), props, 196, 348, 40, 32, 'w-box');
  put(shop.front, props, 20, 210, 260, 230, 'w-shop-front');
  const standee = put(PROPS.standee(), props, 44, 332, 36, 48, 'w-standee');
  div('w-standee-tag', standee, 'BUY');
  put(PROPS.house(), props, 730, 212, 250, 230, 'w-house');

  // actors
  const customer = new Doll({ size: 5, label: 'Customer' });
  actors.append(customer.root);
  const crowd = [
    new Doll({ size: 4, hatColor: '#2f8f4e', propColor: '#2f8f4e', propDark: '#1f5e33' }),
    new Doll({ size: 4, hatColor: '#6a3fb5', propColor: '#6a3fb5', propDark: '#442775' }),
    new Doll({ size: 4, hatColor: '#e07a1f', propColor: '#e07a1f', propDark: '#9b5212' }),
  ];
  crowd.forEach(d => actors.append(d.root));

  // the delivery partner rides a scooter: one "rig" moves both
  const rig = div('w-rig', actors);
  const rigFlip = div('w-rig-flip', rig);
  const scooter = PROPS.scooter();
  put(scooter, rigFlip, 0, 50, 136, 80, 'w-scooter');
  const rider = new Doll({ hat: 'helmet', prop: null, size: 4, label: 'Delivery partner' });
  rider.legs('none');
  rigFlip.append(rider.root);
  rider.place(56, 98);
  const puffs = div('w-puffs', rig);
  const rigState = { x: -200, dir: 1 };
  const rigPlace = (x, ms = 0, ease = 'cubic-bezier(.45,.05,.35,1)') => {
    rigState.x = x;
    rig.style.transition = ms ? `transform ${ms}ms ${ease}` : 'none';
    rig.style.transform = `translate3d(${x - 68}px, ${GROUND + 86 - 130}px, 0)`;
  };
  const rigDir = d => { rigState.dir = d; rigFlip.style.transform = d < 0 ? 'scaleX(-1)' : ''; };

  // flying parcel used for hand-overs
  const flyBox = put(PROPS.box(true), ui, 0, 0, 40, 32, 'w-flybox');
  const heldBox = put(PROPS.box(true), actors, 770, 380, 36, 29, 'w-heldbox');

  /* ---------- UI bubbles & cards (counter-scaled so text stays readable) ---------- */
  const items = {};
  const card = (name, x, y, cls = '', html = '') => {
    const o = div('w-ui-item ' + cls, ui);
    Object.assign(o.style, { left: x + 'px', top: y + 'px' });
    const inner = div('w-ui-in', o, html);
    items[name] = { o, inner };
    return items[name];
  };
  const show = (name, html) => { const it = items[name]; if (html != null) it.inner.innerHTML = html; it.o.classList.add('on'); return it; };
  const hide = name => items[name] && items[name].o.classList.remove('on');
  const hideAll = () => Object.keys(items).forEach(hide);
  const set = (name, html) => { items[name].inner.innerHTML = html; };
  const pulse = name => { const i = items[name].inner; i.classList.remove('bump'); i.offsetWidth; i.classList.add('bump'); };

  card('ownerSay', 150, 272, 'bub');
  card('custSay', 815, 322, 'bub');
  card('riderSay', 0, 0, 'bub');
  card('chat', 150, 196, 'chat-card');
  card('shot', 815, 318, 'bub');
  card('badge', 500, 290, 'buy-badge');
  card('pills', 500, 300, 'buy-pills');
  card('phone', 790, 316, 'phone-card');
  card('order', 150, 200, 'bcard order-card');
  card('tracker', 500, 16, 'bcard tracker top');
  card('custCard', 815, 318, 'bcard mini');
  card('settle', 150, 200, 'bcard mini settle');
  card('refund', 815, 318, 'bcard mini refund');
  card('crowdSay', 150, 272, 'bub');
  card('limbo', 500, 330, 'limbo');

  /* ---------- camera (only zooms on narrow screens) ---------- */
  const stage = host;
  let camX = 500, zoom = 1, ws = 1;
  const FOCUS = { shop: 210, house: 790, mid: 500, all: 500, road: 470 };
  const layout = () => {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const narrow = sw < 640;
    // phones: fit the full world height and pan sideways; wider screens see the whole world
    ws = narrow ? Math.max(sh / H, sw / W) : sw / W;
    zoom = ws * W / sw;
    world.classList.toggle('is-narrow', narrow);
    const vis = W / zoom;
    const cx = Math.min(W - vis / 2, Math.max(vis / 2, camX));
    const tx = -(cx - vis / 2) * ws;
    const ty = sh - H * ws;
    world.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${ws})`;
    const uiScale = Math.min(1, Math.max(.62, ws * 1.12));
    world.style.setProperty('--inv', (uiScale / ws).toFixed(4));
  };
  const cam = where => { camX = typeof where === 'number' ? where : FOCUS[where]; layout(); };
  addEventListener('resize', layout);
  new ResizeObserver(layout).observe(stage);

  const mood = m => {
    world.classList.toggle('is-before', m === 'before');
    world.classList.toggle('is-after', m === 'after');
  };

  /* ---------- helpers ---------- */
  const rigTo = async (S, x, ms, ease) => {
    if (x !== rigState.x) rigDir(x > rigState.x ? 1 : -1);
    rigPlace(x, ms, ease || 'cubic-bezier(.4,.1,.3,1)');
    let k = 0;
    const t = S.every(110, () => {
      scooter._hubs[0].style.display = k % 2 ? 'none' : '';
      scooter._hubs[1].style.display = k % 2 ? '' : 'none';
      rider.bob.style.translate = k % 4 < 2 ? '0 0' : '0 -2px';
      if (k++ % 3 === 0) {
        const p = div('w-puff', puffs);
        p.style.left = (rigState.dir > 0 ? 4 : 126) + 'px';
        setTimeout(() => p.remove(), 700);
      }
    });
    await S.wait(ms);
    clearInterval(t);
    rider.bob.style.translate = '';
  };
  // move a node between two world points along an arc
  const fly = async (S, node, [x0, y0], [x1, y1], ms = 900, lift = 90) => {
    node.style.display = 'block';
    const a = node.animate([
      { transform: `translate(${x0}px, ${y0}px) rotate(0deg)` },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - lift}px) rotate(-12deg)`, offset: .5 },
      { transform: `translate(${x1}px, ${y1}px) rotate(0deg)` },
    ], { duration: ms, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
    await S.wait(ms);
    return a;
  };
  const tapOn = (inner, sel) => {
    const t = inner.querySelector(sel);
    if (!t) return;
    t.classList.remove('tapped'); t.offsetWidth; t.classList.add('tapped');
  };
  const confetti = (x, y, n = 36) => {
    const colors = ['#a52226', '#f2b233', '#3f4ee3', '#01ae0f', '#f2a0a4', '#261f8e'];
    for (let i = 0; i < n; i++) {
      const c = div('w-confetti', ui);
      c.style.left = x + 'px'; c.style.top = y + 'px';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--dx', (Math.random() * 520 - 260) + 'px');
      c.style.setProperty('--dy', (Math.random() * -260 - 40) + 'px');
      c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      c.style.animationDelay = Math.random() * .15 + 's';
      setTimeout(() => c.remove(), 2200);
    }
  };

  const msgs = [
    ['P', '#e2464c', 'Priya', 'Is the 1kg pack available?'],
    ['R', '#3f4ee3', 'Rahul', 'Price for kaju katli??'],
    ['+', '#6fa96f', '+91 98xxx', 'Send QR pls'],
    ['A', '#e07a1f', 'Anita', 'Deliver to HSR Layout?'],
    ['K', '#6a3fb5', 'Kiran', 'Hello?? Anyone?'],
    ['N', '#261f8e', 'Neha', 'Same as last time, 2 kg'],
  ];
  const chatHTML = n => `
    <div class="chat-head"><span class="chat-title">Chats</span><span class="chat-badge">${n} unread</span></div>
    <div class="chat-list"></div>`;
  const chatRow = ([i, c, name, text]) => `<div class="chat-row"><span class="chat-av" style="background:${c}">${i}</span><span class="chat-txt"><b>${name}</b>${text}</span><span class="chat-time">now</span></div>`;

  const ICON = p => `assets/fig/${p}`;
  const phoneHTML = `
    <div class="ph" data-step="0">
      <div class="ph-head"><img src="assets/sweets/logo.jpg" alt=""><div><b>Meena Sweets <img class="vf" src="${ICON('ic-verified.svg')}" alt=""></b><small>Koramangala, Bengaluru</small></div></div>
      <div class="ph-body">
        <div class="ph-list">
          <div class="ph-item"><img src="assets/sweets/rasgulla.jpg" alt=""><div><b>Bengali Rasgulla</b><small>1 kg · ₹420</small></div><span class="ph-add a1"><img src="${ICON('ic-plus-red.svg')}" alt=""></span></div>
          <div class="ph-item"><img src="assets/sweets/gulab-jamun.jpg" alt=""><div><b>Gulab Jamun</b><small>1 kg · ₹460</small></div><span class="ph-add a2"><img src="${ICON('ic-plus-red.svg')}" alt=""></span></div>
        </div>
        <div class="ph-pill"><span><b>CART</b> 2 items</span><span class="ph-amt">₹880 ›</span></div>
        <div class="ph-pay">
          <div class="ph-pay-row"><span class="chip on">UPI</span><span class="chip">Card</span><span class="chip">Netbanking</span></div>
          <div class="ph-btn">Pay ₹880</div>
        </div>
        <div class="ph-ok"><img src="${ICON('ic-check-green.svg')}" alt=""><b>Payment successful</b><small>₹880 · paid via UPI</small></div>
      </div>
    </div>`;
  const orderHTML = `
    <div class="oc-top">${ic('bell', 'pxi oc-bell')}<b>New order</b><span class="oc-id">#ORD4121</span></div>
    <div class="oc-lines"><span>1× Bengali Rasgulla · 1 kg</span><span>1× Gulab Jamun · 1 kg</span></div>
    <div class="oc-row"><span class="oc-amt">₹880</span><span class="tag green">Paid online</span></div>
    <div class="oc-step s1"><span class="oc-btn">Accept order</span></div>
    <div class="oc-step s2"><span class="tag pink">Packed</span><span class="oc-assign"><img src="assets/m17/avatar-delivery-sq.png" alt="">Suresh assigned</span></div>`;
  const trackHTML = `
    <div class="tr-steps">
      <span class="tr-step done"><i></i>Placed</span><span class="tr-step done"><i></i>Packed</span><span class="tr-step now"><i></i>On the way</span><span class="tr-step"><i></i>Delivered</span>
    </div><div class="tr-bar"><span></span></div>`;

  /* ---------- chapters ---------- */
  const reset = (S, m) => {
    hideAll();
    mood(m);
    [owner, customer, rider, ...crowd].forEach(d => { d.scope = S; d.reset(); });
    rider.legs('none');
    owner.at(120, 392).setDir(1);
    customer.at(815, GROUND).setDir(-1);
    crowd.forEach((d, i) => d.at(1080 + i * 60, GROUND + 4).setDir(-1));
    rigPlace(-200); rigDir(1); rig.classList.remove('is-wobbly');
    counterBox.classList.remove('on'); heldBox.classList.remove('on');
    flyBox.getAnimations().forEach(a => a.cancel()); flyBox.style.display = 'none';
    storm.classList.toggle('gone', m !== 'before');
    standee.classList.toggle('on', m === 'after');
    items.badge.o.classList.remove('land');
    items.tracker.o.style.left = '500px';
    ui.querySelectorAll('.w-confetti').forEach(c => c.remove());
  };

  const CH = [
    { tag: 'before', label: 'Before BUY', nav: 'Lost in DMs',
      title: 'Orders Lost in the <em>DMs</em>',
      text: 'Every order arrives as an Instagram DM or a WhatsApp message. Prices, sizes, addresses and “is this available?” pile up in one endless chat — and orders slip through the cracks.',
      async run(S) {
        reset(S, 'before');
        cam('shop');
        show('chat', chatHTML(0));
        const list = items.chat.inner.querySelector('.chat-list');
        const badge = items.chat.inner.querySelector('.chat-badge');
        let n = 0;
        for (let i = 0; i < msgs.length; i++) {
          list.insertAdjacentHTML('afterbegin', chatRow(msgs[i]));
          n += 6 + i * 2; badge.textContent = `${n} unread`;
          pulse('chat');
          if (i === 1) owner.face('wide', 'o').emote('excl');
          if (i === 3) owner.face('dizzy', 'wobble').sweat().shake();
          await S.wait(620);
          if (i === 2) {
            cam('house');
            customer.face('open');
            show('custSay', 'Hi! Is 1 kg rasgulla available?');
            await S.wait(1300);
            show('custSay', '<span class="muted">Seen 2h ago · no reply</span>');
            customer.face('sad', 'frown').emote('q');
            await S.wait(1200);
            customer.face('angry', 'frown').tap();
            show('custSay', 'Hello?? Anyone there?');
            customer.emote('anger');
            await S.wait(1100);
            cam('shop');
          }
        }
        owner.emote('anger', 1600);
        await S.wait(2000);
        customer.tap(false);
      } },
    { tag: 'before', label: 'Before BUY', nav: 'Delivery juggle',
      title: 'The Delivery <em>Juggle</em>',
      text: 'Is the delivery boy free? Did he pick up the parcel? Which lane is the customer in? Endless calls for the store owner, endless waiting for the customer.',
      async run(S) {
        reset(S, 'before');
        counterBox.classList.add('on');
        cam('shop');
        owner.sweat();
        show('ownerSay', `${ic('call')}Calling Raju…`);
        await S.wait(1200);
        show('ownerSay', '<span class="bad">No answer</span>'); owner.face('sad', 'frown');
        await S.wait(900);
        show('ownerSay', `${ic('call')}Calling again…`);
        await S.wait(1000);
        show('ownerSay', '<span class="bad">Busy</span>'); owner.face('angry', 'frown').shake().emote('anger');
        await S.wait(900);
        hide('ownerSay');
        cam('road');
        rig.classList.add('is-wobbly');
        await rigTo(S, 420, 2200, 'cubic-bezier(.2,.6,.4,1)');
        rider.emote('q');
        items.riderSay.o.style.left = '420px'; items.riderSay.o.style.top = '380px';
        show('riderSay', 'Which lane is it??');
        rigDir(-1); await S.wait(600); rigDir(1); await S.wait(600); rigDir(-1);
        await rigTo(S, 300, 1100);
        hide('riderSay');
        cam('house');
        customer.face('angry', 'frown').tap();
        show('custSay', `${ic('clock')}Waiting 2 hours…<br>Where is my order?!`);
        customer.emote('anger', 1800);
        await S.wait(2200);
        customer.tap(false);
      } },
    { tag: 'before', label: 'Before BUY', nav: 'Payment mess',
      title: 'Payment & Refund <em>Headaches</em>',
      text: 'Payment screenshots as proof, “not received” replies, refunds promised over chat. Nobody is sure what’s paid, pending or owed — and trust takes the hit.',
      async run(S) {
        reset(S, 'before');
        cam('house');
        show('custSay', `<div class="shot"><span class="shot-ok"></span><b>₹1,250 paid</b><small>UPI · screenshot.jpg</small></div>`);
        customer.face('open', 'smile');
        await S.wait(1300);
        hide('custSay');
        cam('mid');
        show('limbo', `<div class="coins"><span></span><span></span><span></span></div><b>₹1,250 … where?</b>`);
        await S.wait(1300);
        cam('shop');
        show('ownerSay', 'Not received yet… let me check');
        owner.face('sad', 'frown').emote('q');
        await S.wait(1600);
        hide('limbo');
        cam('house');
        show('custSay', 'Item came damaged.<br>Refund kab milega?');
        customer.face('sad', 'wobble').tears();
        await S.wait(1600);
        cam('shop');
        show('ownerSay', 'Will see…'); owner.sweat().face('dizzy', 'wobble');
        await S.wait(1800);
      } },
    { tag: 'switch', label: 'The turning point', nav: 'Then came BUY',
      title: 'Then Came <em>BUY</em>',
      text: 'One link for every store. One simple app for every customer. Orders, payments, delivery and refunds — finally in one calm, connected place.',
      async run(S) {
        reset(S, 'before');
        owner.face('sad'); customer.face('sad');
        cam('mid');
        await S.wait(500);
        storm.classList.add('gone');
        show('badge', `<img src="assets/m17/logo-buy.svg" alt="BUY">`);
        items.badge.o.classList.add('land');
        await S.wait(560);
        confetti(500, 240, 28);
        mood('after');
        owner.face('wide', 'o').emote('excl'); customer.face('wide', 'o').emote('excl');
        await S.wait(700);
        standee.classList.add('on');
        show('pills', `<span>Orders</span><span>Payments</span><span>Delivery</span><span>Refunds</span>`);
        owner.face('happy', 'open'); customer.face('happy', 'open');
        await Promise.all([owner.jump(2), customer.jump(2)]);
        owner.wave(3, 'both'); customer.wave(3);
        await S.wait(2600);
      } },
    { tag: 'after', label: 'With BUY · Customers', nav: 'Explore & order',
      title: 'Explore, Tap, <em>Order</em>',
      text: 'Customers open their favourite store on BUY, browse real products with prices and pack sizes, add to cart and pay online in seconds — UPI, card or net banking.',
      async run(S) {
        reset(S, 'after');
        cam('house');
        customer.face('down');
        const ph = show('phone', phoneHTML).inner.querySelector('.ph');
        await S.wait(1000);
        tapOn(ph, '.a1'); ph.querySelector('.a1').classList.add('added');
        await S.wait(800);
        tapOn(ph, '.a2'); ph.querySelector('.a2').classList.add('added');
        ph.dataset.step = '1';
        await S.wait(1100);
        tapOn(ph, '.ph-pill');
        await S.wait(300);
        ph.dataset.step = '2';
        await S.wait(1100);
        tapOn(ph, '.ph-btn');
        await S.wait(700);
        ph.dataset.step = '3';
        customer.face('happy', 'open');
        await customer.jump(2);
        customer.emote('heart', 1600);
        await S.wait(2000);
      } },
    { tag: 'after', label: 'With BUY · Stores', nav: 'Orders arrive',
      title: 'Orders Arrive <em>Neatly</em>',
      text: 'The store sees every order in one list — already paid, with items and address. Pack it, assign your own delivery partner from SELL, done. No DMs to dig through.',
      async run(S) {
        reset(S, 'after');
        cam('shop');
        const oc = show('order', orderHTML).inner;
        oc.dataset.step = '1';
        owner.face('wide', 'o').emote('excl');
        await S.wait(1200);
        tapOn(oc, '.oc-btn');
        await S.wait(350);
        oc.dataset.step = '2';
        owner.face('happy', 'open');
        await owner.jump(1);
        counterBox.classList.add('on');
        await S.wait(900);
        cam('road');
        rigDir(1);
        await rigTo(S, 300, 1700, 'cubic-bezier(.2,.7,.3,1)');
        owner.wave(2, 'both'); rider.wave(2);
        await S.wait(500);
        counterBox.classList.remove('on');
        await fly(S, flyBox, [196, 348], [252, 415], 800, 70);
        flyBox.style.display = 'none';
        rider.face('happy');
        await S.wait(1600);
      } },
    { tag: 'after', label: 'With BUY · Delivery', nav: 'OTP delivery',
      title: 'Tracked & <em>OTP-Assured</em>',
      text: 'Customers watch their order move from packed to on-the-way. The parcel is handed over only when the customer shares their delivery OTP — right order, right hands, every time.',
      async run(S) {
        reset(S, 'after');
        rigPlace(300); rigDir(1);
        cam('road');
        const tr = show('tracker', trackHTML).inner;
        tr.dataset.step = '2';
        if (!world.classList.contains('is-narrow')) show('custCard', `<div class="mc"><img src="${ICON('ic-scooter-red.svg')}" alt=""><div><b>Suresh is on the way</b><small>Share OTP only at delivery</small></div><span class="otp-chip">OTP · 4125</span></div>`);
        await rigTo(S, 660, 3000, 'cubic-bezier(.35,.1,.3,1)');
        cam('house');
        if (world.classList.contains('is-narrow')) items.tracker.o.style.left = '730px';
        hide('custCard');
        items.riderSay.o.style.left = '640px'; items.riderSay.o.style.top = '398px';
        show('riderSay', 'Your delivery OTP, please');
        await S.wait(1200);
        show('custSay', `<div class="otp"><span>4</span><span>1</span><span>2</span><span>5</span></div>`);
        customer.face('happy', 'smile');
        await S.wait(1300);
        show('riderSay', '<span class="good">OTP verified</span>');
        hide('custSay');
        tr.dataset.step = '3';
        await fly(S, flyBox, [628, 412], [770, 380], 800, 60);
        flyBox.style.display = 'none';
        heldBox.classList.add('on');
        customer.face('happy', 'open').emote('heart', 1600);
        rider.face('happy');
        await Promise.all([customer.jump(2), rider.wave(3)]);
        await S.wait(1800);
      } },
    { tag: 'after', label: 'With BUY · Everyone', nav: 'Everyone grows',
      title: 'Settled, Refunded, <em>Growing</em>',
      text: 'We collect payments and settle them to the store in T+2 days with zero commission. If an order is cancelled, we refund the customer within 3 days. Happy customers come back — and bring friends.',
      async run(S) {
        reset(S, 'after');
        rigPlace(620); rigDir(-1);
        cam('shop');
        show('settle', `<div class="mc"><img src="${ICON('ic-check-green.svg')}" alt=""><div><b>₹880 settled to your bank</b><small>T+2 days · 0% commission</small></div></div>`);
        owner.face('happy', 'open').emote('spark');
        await owner.jump(1);
        await S.wait(700);
        cam('house');
        show('refund', `<div class="mc"><img src="${ICON('ic-refund-orange.svg')}" alt=""><div><b>Order cancelled? Refund ₹450</b><small>Credited in 3 days · handled by BUY</small></div></div>`);
        customer.face('happy', 'smile');
        await S.wait(1500);
        hide('settle'); hide('refund');
        cam('mid');
        const spots = [380, 456, 532];
        await Promise.all(crowd.map(async (d, i) => {
          await S.wait(i * 380);
          d.face('happy');
          await d.walk(spots[i], 2300 - i * 120);
          d.emote('heart', 1400);
        }));
        cam('shop');
        show('crowdSay', '+3 new customers today!');
        owner.face('happy', 'open');
        confetti(300, 260, 40);
        await Promise.all([owner.jump(2), customer.jump(2), ...crowd.map(d => d.jump(2, 26)), rider.wave(3)]);
        await S.wait(2200);
      } },
  ];

  /* ---------- director: auto-plays chapter after chapter (no scroll lock) ---------- */
  const track = document.getElementById('storyTrack');
  const capEl = $('.story-cap');
  const tagEl = $('.sc-tag', capEl), numEl = $('.sc-num', capEl), titleEl = $('.sc-title', capEl), textEl = $('.sc-text', capEl);
  const nav = $('.story-nav');
  const prog = $('.story-progress');
  const moodChip = $('.story-mood');
  const playBtn = $('#storyPlay'), skipBtn = $('#storySkip');
  // rough running time of each chapter, used to fill its progress segment
  const DUR = [9800, 11200, 8400, 6400, 8800, 8400, 10000, 9800];
  prog.innerHTML = CH.map(() => '<i><b></b></i>').join('');
  const segs = [...prog.children];
  CH.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sn-item sn-' + c.tag;
    b.innerHTML = `<span class="sn-dot"></span><span class="sn-label">${c.nav}</span>`;
    b.setAttribute('aria-label', `Play chapter ${i + 1}: ${c.nav}`);
    b.addEventListener('click', () => { paused = false; syncPlayBtn(); go(i); });
    nav.append(b);
  });
  const navBtns = [...nav.children];

  let cur = 0, scope = null, inView = false, paused = false;
  const syncPlayBtn = () => {
    playBtn.classList.toggle('is-paused', paused);
    playBtn.setAttribute('aria-label', paused ? 'Play story' : 'Pause story');
  };
  const paintSegs = (i, running) => segs.forEach((s, k) => {
    const b = s.firstChild;
    b.style.animation = 'none';
    b.style.transform = `scaleX(${k < i ? 1 : 0})`;
    if (k === i && running) { b.offsetWidth; b.style.animation = `seg ${DUR[i]}ms linear forwards`; }
  });
  const caption = i => {
    const c = CH[i];
    capEl.classList.remove('swap'); capEl.offsetWidth; capEl.classList.add('swap');
    tagEl.textContent = c.label;
    tagEl.className = 'sc-tag ' + c.tag;
    numEl.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(CH.length).padStart(2, '0');
    titleEl.innerHTML = c.title;
    textEl.textContent = c.text;
    navBtns.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.classList.toggle('is-past', k < i); });
    moodChip.textContent = c.tag === 'before' ? 'Before BUY' : c.tag === 'switch' ? 'BUY arrives' : 'With BUY';
    moodChip.className = 'story-mood ' + c.tag;
  };
  const go = i => {
    cur = (i + CH.length) % CH.length;
    scope && scope.kill();
    scope = new Scope();
    caption(cur);
    const running = inView && !paused;
    paintSegs(cur, running);
    if (running) play(cur, scope);
  };
  const play = async (i, S) => {
    try {
      await CH[i].run(S);
      segs[i].firstChild.style.animation = 'none';
      segs[i].firstChild.style.transform = 'scaleX(1)';
      await S.wait(1500);
      if (S.alive) go(i + 1);
    } catch (e) { if (!(e instanceof Cancel)) console.error(e); }
  };
  skipBtn.addEventListener('click', () => { paused = false; syncPlayBtn(); go(cur + 1); });
  playBtn.addEventListener('click', () => {
    paused = !paused; syncPlayBtn();
    if (paused) { scope && scope.kill(); segs[cur].firstChild.style.animationPlayState = 'paused'; }
    else go(cur);
  });
  // play only while the story is on screen; restart the current scene on return
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting === inView) return;
    inView = e.isIntersecting;
    if (inView) go(cur);
    else { scope && scope.kill(); paintSegs(cur, false); }
  }), { threshold: .35 }).observe($('.story-frame'));

  layout();
  // ?ch=N starts at a chapter (handy for reviews / screenshots)
  const q = new URLSearchParams(location.search).get('ch');
  if (q != null) {
    cur = +q;
    setTimeout(() => { const f = $('.story-frame'); scrollTo(0, f.getBoundingClientRect().top + scrollY - 120); }, 50);
  }
  caption(cur);
  paintSegs(cur, false);
})();
