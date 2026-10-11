/* Experience BUY — the BUY customer app next to a live pixel sweet shop (js/delivery-scene.js).
   Flow: you shop in the app → the order lands at Madhuram Sweets → the shop accepts, prepares, packs and dispatches it
   (the app gets "packed" / "dispatched" updates) → Suresh walks up to the screen and asks for your OTP → only then the
   OTP pad opens → the right OTP marks the order delivered.
   Layout: desktop = phone (scaled to the viewport height) + guide + stage card side by side.
           ≤ 640px = full-width app without a bezel, the stage as a picture-in-picture card, the OTP pad as a bottom sheet.
   ?speed=2 plays the shop faster (handy for reviews). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { Doll, Scope, Cancel } = PX;
  const { inr, PARTNER } = BuyApp;
  const icon = DeliveryScene.icon;
  const q = new URLSearchParams(location.search);
  const SPEED = Math.min(8, Math.max(.25, +q.get('speed') || 1));
  const mq = matchMedia('(max-width: 640px)');
  const isMob = () => mq.matches;
  const FIRST = PARTNER.name.split(' ')[0];
  const body = document.body, main = $('.xp-main'), stage = $('#xpStage'), guide = $('#xpGuide'), view = $('#xsView');

  /* ---------- steps + guide ---------- */
  const STEPS = [
    { k: 'browse', who: 'you', label: 'Add sweets',
      text: () => 'Hi! I’m your BUY guide. Tap <b>+</b> on any sweet to add it — try one with sizes, or tap a photo for a quick look.',
      short: () => 'Hi! Tap <b>+</b> on any sweet to add it to your cart.' },
    { k: 'cart', who: 'you', label: 'Checkout',
      text: () => 'Yum! Watch the offer pill — add more to unlock <b>free delivery</b>, <b>50% off</b> and a <b>free gift</b>. Then tap the pill to open your cart.',
      short: () => 'Unlock <b>free delivery</b>, <b>50% off</b> and a <b>gift</b>, then tap the cart pill.' },
    { k: 'pay', who: 'you', label: 'Address & pay',
      text: () => 'Tap <b>Continue with Phone No.</b> — no login needed. Add your address (try <b>Use Current Location</b>) and pay online.',
      short: () => 'No login: add your name, phone and address, then pay online.' },
    { k: 'watch', who: 'shop', label: 'Watch the shop',
      text: () => 'Order placed! Watch <b>Madhuram Sweets</b> accept, prepare and pack it on the right — your app gets an update at every step.',
      short: () => 'Order placed! Watch <b>Madhuram Sweets</b> make it, live below.' },
    { k: 'otp', who: 'shop', label: 'Enter OTP',
      text: () => `${FIRST} is at your door! Find the <b>4-digit OTP</b> on your order screen and enter it to receive your sweets.`,
      short: () => `<b>${FIRST}</b> is at your door. Enter the OTP from your order screen.` },
    { k: 'done', who: 'both', label: 'Delivered',
      text: () => 'Delivered safely with OTP! The store gets paid in T+2 days with 0% commission. Want a BUY store of your own?',
      short: () => 'Delivered with OTP! Want a BUY store of your own?' },
  ];
  let step = 0;
  const stepsEl = $('#xpSteps'), mBar = $('#xpMStepBar'), mN = $('#xpMStepN');
  stepsEl.innerHTML = STEPS.map((s, i) => `<li class="s-${s.who}"><i>${i + 1}</i><span>${s.label}</span></li>`).join('');
  mBar.innerHTML = STEPS.map(() => '<i></i>').join('');
  const guideText = $('#guideText'), guideStep = $('#guideStep'), guideGo = $('#guideGo'), bubble = $('.xp-guide-bubble');
  const guideDoll = new Doll({ size: 3 });
  $('#guideDoll').append(guideDoll.root);
  const paintGuide = () => {
    const s = STEPS[step];
    guideStep.textContent = `Step ${step + 1} of ${STEPS.length}`;
    guideText.innerHTML = isMob() ? s.short() : s.text();
    syncGo();
  };
  const setStep = (i, force) => {
    const next = force ? i : Math.max(step, i);
    const changed = next !== step;
    step = next;
    $$('li', stepsEl).forEach((li, k) => { li.classList.toggle('done', k < step); li.classList.toggle('on', k === step); });
    $$('i', mBar).forEach((b, k) => { b.className = k < step ? 'done' : k === step ? 'on' : ''; });
    mN.textContent = `${step + 1}/${STEPS.length}`;
    paintGuide();
    if (changed || force) {
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      guideDoll.face('happy', 'open');
      guideDoll.jump(1, 14, 480).then(() => guideDoll.face('open', 'smile')).catch(() => {});
    }
    const li = $$('li', stepsEl)[step];
    if (li && stepsEl.scrollWidth > stepsEl.clientWidth) stepsEl.scrollTo({ left: li.offsetLeft - stepsEl.clientWidth / 2 + li.offsetWidth / 2, behavior: 'smooth' });
  };
  const syncGo = () => {
    const k = STEPS[step].k;
    let label = '', fn = null;
    if (k === 'done' && $('#xsCta').hidden === false) { label = 'Create my BUY store'; fn = () => (location.href = 'setup.html'); }
    else if (k === 'otp' && otpOpen && otpPeek) { label = 'Enter OTP'; fn = () => peekOtp(false); }
    else if ((k === 'watch' || k === 'otp' || k === 'done') && isMob() && stageMode === 'compact' && !otpOpen) { label = 'Watch live'; fn = () => setStageMode('full'); }
    guideGo.hidden = !label;
    guideGo.textContent = label;
    guideGo.onclick = fn;
  };

  /* ---------- the live stage (mobile: hidden / compact picture-in-picture / full card) ---------- */
  let stageMode = 'hidden';
  const setStageMode = m => {
    stageMode = m;
    ['hidden', 'compact', 'full'].forEach(x => body.classList.toggle('xs-' + x, x === m));
    stage.setAttribute('aria-hidden', isMob() && m === 'hidden' ? 'true' : 'false');
    syncGo();
  };
  const autoFull = () => { if (isMob() && stageMode === 'compact' && !otpOpen) setStageMode('full'); };
  $('#xsPip').addEventListener('click', () => setStageMode('full'));
  $('#xsMin').addEventListener('click', () => setStageMode('compact'));

  const PH = [
    { k: 'accepted', label: 'Accepted', ic: 'ticket' },
    { k: 'preparing', label: 'Preparing', ic: 'kadhai' },
    { k: 'packing', label: 'Packing', ic: 'box' },
    { k: 'dispatched', label: 'On the way', ic: 'scooter' },
    { k: 'door', label: 'At your door', ic: 'house' },
    { k: 'delivered', label: 'Delivered', ic: 'check' },
  ];
  const chipsEl = $('#xsChips');
  chipsEl.innerHTML = PH.map(p => `<li data-k="${p.k}">${icon(p.ic)}<span>${p.label}</span></li>`).join('');
  $('#xsShopIc').innerHTML = icon('shop');
  const count = o => o.items.reduce((a, i) => a + (i.qty || 1), 0);
  const CAP = {
    idle: () => ['Madhuram Sweets is open', `The halwai is frying a fresh batch of gulab jamun. Place an order in the BUY app ${isMob() ? '' : 'on the left '}and watch the shop make it happen.`],
    accepted: o => ['New order — accepted', `#${o.id} · ${count(o)} item${count(o) > 1 ? 's' : ''} · ${inr(o.bill.total)}. It’s already paid online, so the shop starts right away.`],
    preparing: () => ['Preparing your sweets', 'Fresh from the kadhai — every sweet in your order is weighed and arranged on the tray.'],
    packing: () => ['Packing your box', 'Into the Madhuram box, sealed with tape and tagged with your order ID.'],
    dispatched: () => [`${FIRST} is on the way`, 'Picked up from the shop. Your delivery OTP is on your BUY order screen — keep it handy.'],
    door: () => [`${FIRST} is at your door`, 'He hands over the box only after you share the 4-digit OTP from your order screen.'],
    delivered: o => ['Delivered with OTP', `Right order, right hands. ${inr(o.bill.total)} settles to Madhuram Sweets in T+2 days, with 0% commission.`],
  };
  let phaseK = 'idle';
  const phase = (k, o) => {
    phaseK = k;
    const i = PH.findIndex(p => p.k === k);
    $$('li', chipsEl).forEach((li, n) => {
      li.classList.toggle('done', i >= 0 && (n < i || k === 'delivered'));
      li.classList.toggle('on', n === i && k !== 'delivered');
    });
    const [t, x] = CAP[k](o);
    $('#xsTitle').textContent = t;
    $('#xsText').textContent = x;
    const p = PH[i];
    $('#xsPip').innerHTML = `<span class="xs-pip-l">${icon(p ? p.ic : 'shop')}<b>${p ? p.label : 'Live shop'}</b></span>`;
    stage.dataset.phase = k;
  };

  /* ---------- the customer app ---------- */
  const appRoot = $('#buyApp');
  const app = BuyApp.create(appRoot, {
    sat: isMob() ? 0 : 30,
    onEvent: (type, data) => {
      if (type === 'cart' && data.count > 0 && step === 0) setStep(1);
      if ((type === 'checkout' || (type === 'sheet' && data === 'details')) && step >= 0 && step <= 1) setStep(2);
      if (type === 'order') start(data);
    },
  });
  const scene = DeliveryScene.create(view, { speed: SPEED });

  /* ---------- sizing ---------- */
  const phone = $('#xpPhone');
  const fit = () => {
    const mob = isMob();
    body.classList.toggle('xp-m', mob);
    const barH = $('.xp-bar').offsetHeight;
    if (mob) {
      const vw = document.documentElement.clientWidth;
      const s = vw / 412;
      const top = barH + guide.offsetHeight;
      const lh = Math.max(560, Math.floor((innerHeight - top) / s));
      phone.style.setProperty('--ps', s.toFixed(5));
      phone.style.setProperty('--ah', lh + 'px');
      appRoot.style.height = lh + 'px';
      appRoot.style.setProperty('--sat', '0px');
    } else {
      const vw = document.documentElement.clientWidth;
      const labelH = $('.xp-label').offsetHeight + 8;
      const availH = innerHeight - barH - 34 - labelH;
      const s = Math.max(.5, Math.min(1, availH / 914, (vw - 80 - 340) / 434));
      phone.style.setProperty('--ps', s.toFixed(4));
      phone.style.setProperty('--ah', '892px');
      appRoot.style.height = '';
      appRoot.style.setProperty('--sat', '30px');
      const colW = Math.min(620, vw - 80 - 434 * s);
      const budget = innerHeight - barH - 34 - guide.offsetHeight - 14;
      const maxW = (budget - 222) / .5625;
      main.style.setProperty('--sw', Math.round(Math.max(320, Math.min(colW, maxW))) + 'px');
      main.style.setProperty('--top', (barH + 14) + 'px');
    }
    if (otpOpen) placeOtp();
  };
  let fitRaf = 0;
  const fitSoon = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fit); };
  addEventListener('resize', fitSoon);
  new ResizeObserver(fitSoon).observe(guide);
  mq.addEventListener('change', () => {
    fit(); paintGuide(); phase(phaseK, run && run.o);
    if (isMob()) setStageMode(otpOpen ? 'hidden' : run ? 'full' : 'hidden');
    else setStageMode('full');
    if (otpOpen) placeOtp();
  });

  /* ---------- OTP pad (desktop: pops up inside the stage · mobile: bottom sheet) ---------- */
  const xo = $('#xpOtp'), xoSheet = $('#xoSheet'), xoIn = $('#xoIn'), xoMsg = $('#xoMsg'), xoBtn = $('#xoBtn');
  xoIn.innerHTML = [0, 1, 2, 3].map(i => `<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="${i ? 'off' : 'one-time-code'}" aria-label="OTP digit ${i + 1}">`).join('');
  const ins = $$('input', xoIn);
  $('.xo-btn-ic').innerHTML = icon('checkw');
  $('.xo-view-ic').innerHTML = icon('eye');
  const peekDoll = new Doll({ hat: 'helmet', prop: null, size: 6, label: '' });
  $('#xoPeekDoll').append(peekDoll.root);
  peekDoll.place(66, 132);
  let otpOpen = false, otpPeek = false, wrong = 0;
  const peekSay = $('.xo-peek-say');
  const PEEK_HI = peekSay.innerHTML;
  const peekLine = (html, mood) => { peekSay.innerHTML = html; peekSay.classList.remove('pop'); void peekSay.offsetWidth; peekSay.classList.add('pop'); peekDoll.face(...mood); };

  const findOtpEl = (scr, otp) => [...scr.querySelectorAll('*')].find(e => { const t = e.textContent.replace(/\s/g, ''); return t.includes(otp) && t.length <= 24; }) || null;
  const showOtpInApp = (scroll = true) => {
    if (!run) return;
    const st = app.state.stack, top = st[st.length - 1];
    if (!(top && top.n === 'order' && top.id === run.o.id)) app.api.act('openorder', { dataset: { id: run.o.id } });
    setTimeout(() => {
      const scr = app.scroller();
      if (!scr) return;
      if (scroll) scr.scrollTo({ top: 0, behavior: 'smooth' });
      const el = findOtpEl(scr, run.o.otp);
      if (el) { el.classList.remove('xp-otp-glow'); void el.offsetWidth; el.classList.add('xp-otp-glow'); }
    }, 450);
    if (!isMob()) { phone.classList.remove('xp-nudge'); void phone.offsetWidth; phone.classList.add('xp-nudge'); }
  };
  const placeOtp = () => {
    const mob = isMob();
    if (mob && xo.parentElement !== body) body.append(xo);
    if (!mob && xo.parentElement !== stage) stage.append(xo);
    xo.classList.toggle('is-sheet', mob);
    if (!mob) {
      if (otpPeek) { otpPeek = false; xo.classList.remove('peek'); }
      // wide stage: the pad sits on the right of the picture and Suresh stays fully visible on the left
      const vw = view.clientWidth, cardW = Math.min(400, Math.round(vw * .64));
      const side = vw - cardW - 28 >= 180;
      xo.classList.toggle('side', side);
      xo.style.setProperty('--xo-w', cardW + 'px');
      xo.style.setProperty('--xo-top', (view.offsetTop + 12) + 'px');
      requestAnimationFrame(() => scene.setPose(side ? { side: vw - cardW - 18 } : { band: Math.max(90, xoSheet.offsetTop - view.offsetTop) }, 450));
    } else xo.classList.remove('side');
  };
  const openOtp = () => {
    otpOpen = true; otpPeek = false; wrong = 0;
    ins.forEach(i => (i.value = ''));
    xo.classList.remove('bad', 'ok', 'peek', 'on');
    xoMsg.className = 'xo-msg'; xoMsg.textContent = '';
    xoBtn.disabled = true; xoBtn.classList.remove('pulse');
    xo.hidden = false;
    placeOtp();
    if (isMob()) setStageMode('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => xo.classList.add('on')));
    if (!isMob()) setTimeout(() => otpOpen && ins[0].focus({ preventScroll: true }), 500);
    peekSay.innerHTML = PEEK_HI;
    peekDoll.face('happy', 'open'); peekDoll.wave(2).then(() => peekDoll.face('open', 'smile')).catch(() => {});
    showOtpInApp(false);
    syncGo();
  };
  const closeOtp = instant => {
    if (!otpOpen && xo.hidden) return;
    otpOpen = false; otpPeek = false;
    if (xo.contains(document.activeElement)) document.activeElement.blur();
    xo.classList.remove('on', 'peek');
    if (instant) xo.hidden = true;
    else setTimeout(() => { if (!otpOpen) xo.hidden = true; }, 450);
    syncGo();
  };
  const peekOtp = on => {
    if (!otpOpen || !isMob()) return;
    otpPeek = on;
    xo.classList.toggle('peek', on);
    if (xo.contains(document.activeElement)) document.activeElement.blur();
    if (on) showOtpInApp();
    syncGo();
  };
  $('#xoView').addEventListener('click', () => (isMob() ? peekOtp(true) : showOtpInApp()));
  $('#xoGrab').addEventListener('click', () => peekOtp(!otpPeek));
  $('#xoCard').addEventListener('click', e => { if (otpPeek && !e.target.closest('#xoGrab')) { e.preventDefault(); peekOtp(false); } });
  $('#xoDim').addEventListener('click', () => isMob() && peekOtp(true));

  const check = () => {
    const v = ins.map(i => i.value).join('');
    xo.classList.remove('bad', 'ok');
    xoMsg.className = 'xo-msg'; xoMsg.innerHTML = '';
    xoBtn.disabled = true; xoBtn.classList.remove('pulse');
    if (v.length < 4 || !run) return;
    if (v === run.o.otp) {
      xo.classList.add('ok'); xoMsg.classList.add('ok');
      xoMsg.innerHTML = `${icon('check')}OTP verified — hand over the parcel`;
      xoBtn.disabled = false; xoBtn.classList.add('pulse');
      scene.verified();
      peekLine('OTP verified! Here are your <b>sweets</b>.', ['happy', 'open']);
      if (isMob()) document.activeElement && document.activeElement.blur();
      else xoBtn.focus({ preventScroll: true });
    } else {
      wrong++;
      void xo.offsetWidth;
      xo.classList.add('bad'); xoMsg.classList.add('bad');
      xoMsg.textContent = wrong > 1 ? 'Still not it. Tap “View OTP in app” to see the right one.' : 'Wrong OTP. Check the order screen in the BUY app.';
      scene.puzzled();
      peekLine('Hmm, that doesn’t match. Check the OTP in your <b>BUY app</b>?', ['sad', 'wobble']);
      setTimeout(() => { if (!otpOpen || xo.classList.contains('ok')) return; ins.forEach(i => (i.value = '')); ins[0].focus({ preventScroll: true }); }, 650);
    }
  };
  const spread = (d, from) => {
    d.split('').slice(0, 4 - from).forEach((c, k) => (ins[from + k].value = c));
    ins[Math.min(3, from + d.length)].focus({ preventScroll: true });
    check();
  };
  ins.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      const d = inp.value.replace(/\D/g, '');
      if (d.length > 1) return spread(d, i);
      inp.value = d;
      if (d && ins[i + 1]) ins[i + 1].focus({ preventScroll: true });
      check();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && ins[i - 1]) { e.preventDefault(); ins[i - 1].value = ''; ins[i - 1].focus(); check(); }
      if (e.key === 'ArrowLeft' && ins[i - 1]) ins[i - 1].focus();
      if (e.key === 'ArrowRight' && ins[i + 1]) ins[i + 1].focus();
      if (e.key === 'Enter' && !xoBtn.disabled) deliver();
    });
    inp.addEventListener('focus', () => inp.select());
    inp.addEventListener('paste', e => { const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4); if (!d) return; e.preventDefault(); spread(d, 0); });
  });
  xoBtn.addEventListener('click', () => deliver());

  /* ---------- director ---------- */
  let run = null;
  const start = async o => {
    if (run) run.S.kill();
    closeOtp(true);
    const S = new Scope();
    run = { S, o };
    const wait = ms => S.wait(ms / SPEED);
    scene.reset();
    body.classList.add('xp-live');
    $('#xsCta').hidden = true;
    setStep(3, true);
    phase('accepted', o);
    if (isMob()) setStageMode('full');
    try {
      await wait(700);
      await scene.receive(S, o);
      phase('preparing', o);
      await scene.prepare(S, o);
      phase('packing', o);
      await scene.pack(S);
      app.setStatus(o.id, 'packed');
      await wait(700);
      phase('dispatched', o); autoFull();
      await scene.pickup(S);
      app.setStatus(o.id, 'dispatched');
      await scene.ride(S);
      phase('door', o); autoFull(); setStep(4);
      await scene.door(S);
      await scene.forward(S);
      await wait(1500);
      openOtp();
    } catch (e) { if (!(e instanceof Cancel)) console.error(e); }
  };
  const deliver = async () => {
    if (!run || xoBtn.disabled) return;
    xoBtn.disabled = true;
    const { S, o } = run;
    closeOtp();
    app.setStatus(o.id, 'delivered');
    phase('delivered', o);
    setStep(5);
    if (isMob()) setStageMode('full');
    try {
      await scene.handover(S);
      await scene.outro(S);
    } catch (e) { if (!(e instanceof Cancel)) console.error(e); return; }
    $('#xsCta').hidden = false;
    syncGo();
  };
  const again = () => {
    if (run) run.S.kill();
    run = null;
    closeOtp(true);
    scene.reset();
    phase('idle');
    $('#xsCta').hidden = true;
    body.classList.remove('xp-live');
    setStageMode(isMob() ? 'hidden' : 'full');
    setStep(0, true);
    app.go('home');
  };
  $('#xsAgain').addEventListener('click', again);
  $('#xpReset').addEventListener('click', () => location.reload());

  /* ---------- boot ---------- */
  phase('idle');
  setStageMode(isMob() ? 'hidden' : 'full');
  fit();
  setStep(0, true);
  document.fonts && document.fonts.ready.then(fit);
})();
