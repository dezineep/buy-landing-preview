/* "Place an order yourself" — the real BUY app (js/buy-app.js) running inside a phone frame, with a pixel guide.
   The guide (doll + bubble, step list, explanation panel) follows the app's onEvent stream. After checkout the
   page plays the store's part (packed -> dispatched) and lets the visitor hand the OTP to the delivery partner. */
(() => {
  const host = document.getElementById('tryApp');
  if (!host || !window.BuyApp || !window.PX) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { inr, PARTNER, STORE, OFFERS } = BuyApp;
  const who = PARTNER.name.split(' ')[0];

  /* ---------- phone sizing: the app is 412 x 892; the frame adds 11px per side ---------- */
  const phone = $('#tryPhone');
  let lastW = 0, lastH = 0;
  const fit = force => {
    const vw = document.documentElement.clientWidth, vh = innerHeight;
    // ignore the mobile URL bar showing/hiding (height-only jitter) so the phone does not jump while scrolling
    if (!force && vw === lastW && Math.abs(vh - lastH) < 160) return;
    lastW = vw; lastH = vh;
    const s = Math.max(.6, Math.min(360 / 434, (vw - 40) / 434, (vh - 96) / 914));
    phone.style.setProperty('--ps', s.toFixed(4));
  };
  addEventListener('resize', () => fit());
  fit(true);

  /* ---------- guide: doll, bubble, steps, explanation ---------- */
  const doll = new PX.Doll({ size: 6 });
  $('#tryDoll').append(doll.root);
  const bubble = $('#tryBubble'), explain = $('#tryExplain'), steps = $$('#trySteps li');
  const say = html => { bubble.innerHTML = html; bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop'); };
  const cheer = (n = 1) => { doll.face('happy', 'open'); doll.jump(n, 22, 480).then(() => doll.face('open', 'smile')); };
  const COPY = [
    ['Browse &amp; add', 'This is the real BUY app, running right here. Tap <b>+</b> on a sweet, pick a pack size, or tap a photo for a quick look. The pill at the bottom shows how close you are to the next offer.'],
    ['Review your cart', 'Change quantities, see which offers you have unlocked — free delivery, 50% off, a free gift — and the full bill before you pay.'],
    ['Pay online, safely', 'No login needed: just a name and phone number. Add an address (try <b>Use Current Location</b>), then pay. The money waits in the Modulus Seventeen gateway until the order is done.'],
    ['Track &amp; receive', ''],
  ];
  let step = -1;
  const setStep = (i, html) => {
    const changed = i !== step;
    step = i;
    steps.forEach((li, k) => { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
    explain.innerHTML = `<span class="te-num">Step 0${i + 1}</span><h3>${COPY[i][0]}</h3>${html || `<p>${COPY[i][1]}</p>`}`;
    if (changed) { explain.classList.remove('swap'); void explain.offsetWidth; explain.classList.add('swap'); }
  };

  /* ---------- the order: store simulation + OTP hand-over ---------- */
  let order = null, timers = [], screen = 'home';
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const LABELS = ['Placed', 'Packed', 'On the way', 'Delivered'];
  const ORDER = ['placed', 'packed', 'dispatched', 'delivered'];
  const orderPanel = () => {
    const st = order.status, k = ORDER.indexOf(st);
    const track = `<ol class="te-track${st === 'delivered' ? ' all' : ''}" aria-label="Order progress">${LABELS.map((l, i) => `<li class="${i <= k ? 'done' : i === k + 1 ? 'on' : ''}">${l}</li>`).join('')}</ol>`;
    const otp = `<div class="te-otp"><span><small>Your delivery OTP</small><b>Share it only at the door</b></span><span class="te-otp-d" aria-label="OTP ${order.otp.split('').join(' ')}">${order.otp.split('').map(d => `<span>${d}</span>`).join('')}</span></div>`;
    const partner = `<div class="te-partner"><img src="${PARTNER.img}" alt=""><span><b>${PARTNER.name}</b><small>${st === 'delivered' ? 'Delivered your order' : 'At your door'}</small></span></div>`;
    const wait = t => `<span class="te-wait"><i></i>${t}</span>`;
    const body = {
      placed: `<p><b>${inr(order.bill.total)}</b> paid. ${STORE.name} got the order with items, address and payment — no DMs. They are packing it now; watch the phone for updates.</p>${track}${wait('Store is packing your order…')}`,
      packed: `<p>Packed and ready. The store assigns its own delivery partner from SELL — ${who} is on the way with your sweets.</p>${track}${wait(`${who} is heading to you…`)}`,
      dispatched: `<p>${who} is at the door. Share your OTP only when the parcel is in your hands — that is how BUY knows it reached the right person.</p>${track}${otp}${partner}<div class="te-btns"><button class="te-btn pulse" type="button" data-try="otp">Share OTP with ${who}</button></div>`,
      delivered: `<p>OTP verified — the order is marked delivered. The store is paid in T+2 days with zero commission.</p>${track}<div class="te-btns"><button class="te-btn" type="button" data-try="again">Shop again</button><a class="te-btn soft" href="setup.html">Create my store</a></div>`,
    }[st];
    setStep(3, body);
  };
  const status = s => {
    if (!order) return;
    app.setStatus(order.id, s);
    orderPanel();
    if (s === 'packed') { say(`${STORE.name} packed your order!`); cheer(); }
    if (s === 'dispatched') { say(`${who} is at your door. Share your <b>OTP</b> to receive it.`); doll.face('wide', 'o').emote('excl'); }
    if (s === 'delivered') { say('Delivered safely with OTP!'); doll.face('happy', 'open'); doll.jump(2, 34).then(() => doll.wave(3)); }
  };
  const startOrder = o => {
    clearTimers();
    order = o;
    orderPanel();
    say('Paid! The store has your order.');
    doll.face('happy', 'open'); doll.jump(2, 30).then(() => doll.emote('heart'));
    later(() => status('packed'), 3000);
    later(() => status('dispatched'), 6000);
  };
  const shareOtp = () => {
    if (!order || order.status !== 'dispatched') return;
    if (screen !== 'order') { const t = document.createElement('i'); t.dataset.id = order.id; app.api.act('openorder', t); }
    status('delivered');
  };
  const shopAgain = () => {
    clearTimers();
    order = null;
    app.go('home');
    browse(0);
    doll.face('open', 'none');
  };
  explain.addEventListener('click', e => {
    const b = e.target.closest('[data-try]');
    if (!b) return;
    if (b.dataset.try === 'otp') shareOtp();
    if (b.dataset.try === 'again') shopAgain();
  });

  /* ---------- follow the app ---------- */
  const tracking = () => order && order.status !== 'delivered';
  const browse = count => {
    if (tracking()) return;
    setStep(0);
    say(count ? 'Nice picks! Tap the <b>cart pill</b> when you’re ready.' : 'Tap <b>+</b> to add something tasty!');
  };
  let count = 0;
  const onEvent = (type, d) => {
    if (type === 'screen') {
      screen = d;
      if (d === 'home' || d === 'product' || d === 'store') browse(count);
      else if (d === 'cart') { if (!tracking() || count) { setStep(1); say(count ? 'Looks good? Tap <b>Continue</b> to check out.' : 'Your cart is empty — go add something!'); } }
      else if (d === 'address') { setStep(2); say('Tap <b>Use Current Location</b> to fill this in fast.'); }
      else if ((d === 'order' || d === 'orders') && order) orderPanel();
    }
    if (type === 'sheet') {
      if (d === 'details') { setStep(2); say('Just a name and phone number — no login.'); }
      if (d === 'pay') { setStep(2); say('Pick a payment method and tap <b>Pay</b>.'); }
      if (d === 'variants' && !tracking()) say('Pick a pack size — or type your own quantity.');
    }
    if (type === 'cart') {
      count = d.count;
      if (screen !== 'home' && screen !== 'product' && screen !== 'store') return;
      if (tracking()) return;
      if (d.newly.length) {
        const o = OFFERS.find(x => x.id === d.newly[d.newly.length - 1]);
        say(`${o.done}! Tap the <b>cart pill</b> to check out.`);
        doll.face('happy', 'open'); doll.jump(2, 28).then(() => doll.emote('spark'));
        return;
      }
      const next = OFFERS.find(o => d.sub < o.min);
      if (d.count) { say(next ? `Yum! Add <b>${inr(next.min - d.sub)}</b> more to ${next.title.replace(/^Unlock /, 'unlock ').replace(/^Get /, 'get ')}.` : 'Every offer unlocked! Tap the <b>cart pill</b>.'); cheer(); }
      else browse(0);
    }
    if (type === 'checkout') setStep(2);
    if (type === 'paying') { say('Paying securely…'); doll.face('wide', 'o'); }
    if (type === 'order') startOrder(d);
  };

  let app = null;
  const boot = (tries) => {
    try { app = BuyApp.create(host, { onEvent, sat: 30 }); if (step < 0) browse(0); }
    catch (e) { if (tries > 0) { host.innerHTML = ''; setTimeout(() => boot(tries - 1), 400); } else console.warn('BUY demo failed to start', e); }
  };
  boot(3);
})();
