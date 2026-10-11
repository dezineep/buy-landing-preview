/* Create your BUY store — demo onboarding. Everything stays in the browser:
   uploaded images are previewed locally and never sent anywhere.
   Pixel icons + the intro animation live in js/setup-scene.js (window.SuPx). */
(() => {
  // Replace with the real store listings when they're live.
  const APP_STORE_URL = 'https://apps.apple.com/in/search?term=modulus%20sell';
  const PLAY_STORE_URL = 'https://play.google.com/store/search?q=modulus%20sell&c=apps';
  const TAKEN = ['coastal-catch-blr', 'coastal-catch', 'pearl-sweets', 'madhuram-sweets', 'sharma-kirana', 'buy', 'sell', 'admin', 'modulus', 'store', 'shop'];

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const { Doll, PAL } = PX;
  const body = document.body;
  const ic = name => `<i data-px="${name}"></i>`;
  const paint = root => window.SuPx && SuPx.fill(root);
  paint(document);

  /* ---------- dolls ---------- */
  const mk = (host, opts) => { const d = new Doll(opts); const w = document.createElement('div'); w.append(d.root); host.append(w); return d; };
  const guide = mk($('#guideDoll'), { size: 3, hatColor: PAL.navy, prop: null });
  guide.face('happy', 'open');
  const guideSay = $('#guideSay');
  let lastSay = '';
  const say = (t, mood = 'happy') => {
    if (t === lastSay) return;
    lastSay = t; guideSay.textContent = t;
    guideSay.classList.remove('pop'); guideSay.offsetWidth; guideSay.classList.add('pop');
    guide.face(mood, mood === 'happy' ? 'open' : 'frown');
    if (mood === 'happy') guide.jump(1, 14, 480); else guide.emote('q', 1000);
  };

  /* ---------- stages ---------- */
  const prog = $$('.su-prog li');
  const stage = s => {
    body.dataset.stage = s;
    const k = ['intro', 'form', 'done'].indexOf(s);
    prog.forEach((li, i) => { li.classList.toggle('on', i === k); li.classList.toggle('done', i < k); });
    scrollTo({ top: 0, behavior: 'smooth' });
  };
  $('#startBtn').addEventListener('click', () => { stage('form'); setTimeout(() => $('#nameIn').focus({ preventScroll: true }), 500); });

  /* ---------- form state ---------- */
  const st = { name: '', url: '', urlEdited: false, urlOk: false, phone: '', logo: null, banner: null, cat: 'Sweet Shop' };
  const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 40);
  const initials = n => (n.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2) || '?').toUpperCase();

  const readFile = (input, cb) => input.addEventListener('change', () => {
    const f = input.files && input.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { say('That doesn’t look like an image. Try a JPG or PNG.', 'sad'); return; }
    cb(URL.createObjectURL(f));
    input.value = '';
  });
  readFile($('#bannerIn'), url => { st.banner = url; $('#bannerImg').src = url; $('#bannerBox').classList.add('has'); say('What a banner! Customers will love it.'); update(); });
  readFile($('#logoIn'), url => {
    st.logo = url; $('#logoImg').src = url; $('#logoBox').classList.add('has');
    const n = $('#logoNote'); n.textContent = 'Logo added'; n.classList.add('ok');
    say('Looking sharp! Great logo.'); update();
  });
  $('#bannerChange').addEventListener('click', e => { e.preventDefault(); $('#bannerIn').click(); });
  $('#bannerRemove').addEventListener('click', e => { e.preventDefault(); st.banner = null; $('#bannerBox').classList.remove('has'); update(); });

  $('#nameIn').addEventListener('input', e => {
    st.name = e.target.value;
    if (!st.urlEdited) { $('#urlIn').value = slug(st.name); checkUrl(); }
    if (st.name.trim().length >= 3) say(`“${st.name.trim()}” — love the name! Now add your logo.`);
    update();
  });
  $('#urlIn').addEventListener('input', e => {
    const clean = slug(e.target.value.replace(/\s/g, '-')).replace(/^-/, '');
    if (clean !== e.target.value) e.target.value = clean;
    st.urlEdited = true; checkUrl();
  });
  $('#phoneIn').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    st.phone = e.target.value;
    const m = $('#phoneMsg');
    if (st.phone.length === 10 && !/^[6-9]/.test(st.phone)) { m.textContent = 'Indian mobile numbers start with 6, 7, 8 or 9'; m.className = 'su-hint bad'; }
    else if (st.phone.length === 10) { m.textContent = 'Customers can call this number for help'; m.className = 'su-hint ok'; }
    else { m.textContent = ''; m.className = 'su-hint'; }
    update();
  });
  $$('#cats button').forEach(b => {
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', b.classList.contains('on'));
    b.addEventListener('click', () => {
      $$('#cats button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
      st.cat = b.dataset.c; update();
    });
  });

  let urlT;
  const checkUrl = () => {
    const v = $('#urlIn').value;
    st.url = v; st.urlOk = false;
    const box = $('#urlBox'), icn = $('#urlIc'), msg = $('#urlMsg');
    clearTimeout(urlT);
    box.classList.remove('ok', 'bad'); icn.className = 'su-url-ic';
    if (!v) { msg.className = 'su-hint'; msg.textContent = 'This will be your unique store link on BUY'; update(); return; }
    if (v.length < 3) { msg.className = 'su-hint'; msg.textContent = 'At least 3 characters'; update(); return; }
    icn.classList.add('wait'); msg.className = 'su-hint'; msg.textContent = 'Checking availability…';
    urlT = setTimeout(() => {
      icn.classList.remove('wait');
      if (TAKEN.includes(v)) {
        box.classList.add('bad'); icn.classList.add('bad');
        const alt = `${v}-${['blr', 'online', 'store', 'official'][Math.floor(Math.random() * 4)]}`;
        msg.className = 'su-hint bad';
        msg.innerHTML = `Sorry! This URL is already taken. Try <button type="button" data-alt="${alt}">${alt}</button>`;
        msg.querySelector('button').addEventListener('click', ev => { $('#urlIn').value = ev.target.dataset.alt; st.urlEdited = true; checkUrl(); });
        say('Oops, that link is taken. Pick another one?', 'sad');
      } else {
        st.urlOk = true; box.classList.add('ok'); icn.classList.add('ok');
        msg.className = 'su-hint ok'; msg.textContent = 'Wohooo! This URL is available';
        say('Great link — short and easy to share!');
      }
      update();
    }, 450);
    update();
  };

  /* ---------- validation ---------- */
  const missingList = () => {
    const m = [];
    if (!st.logo) m.push('logo');
    if (st.name.trim().length < 3) m.push('store name');
    if (!st.urlOk) m.push('an available URL');
    if (!/^[6-9]\d{9}$/.test(st.phone)) m.push('helpline number');
    return m;
  };
  const update = () => {
    const miss = missingList();
    $('#submitBtn').disabled = miss.length > 0;
    const m = $('#missing');
    m.classList.toggle('ok', !miss.length);
    m.textContent = miss.length ? `Still needed: ${miss.join(', ')}` : 'All set — your store is ready to submit';
    if (!miss.length) say('Everything looks perfect. Hit Submit!');
  };

  $('#suForm').addEventListener('submit', e => {
    e.preventDefault();
    const miss = missingList();
    if (miss.length) { if (!st.logo) { $('#logoBox').classList.remove('err'); $('#logoBox').offsetWidth; $('#logoBox').classList.add('err'); } return; }
    const btn = $('#submitBtn'); btn.disabled = true; btn.textContent = 'Setting up your store…';
    setTimeout(() => { btn.textContent = 'Submit Details'; celebrate(); }, 900);
  });

  /* ---------- celebration + quests ---------- */
  const QUESTS = [
    { k: 'create', ic: 'store', t: 'Create your BUY store', s: 'Name, logo and link — done!', xp: 100, done: true },
    { k: 'link', ic: 'flag', t: 'Claim your store link', s: 'Your own address on the internet', xp: 50, done: true },
    { k: 'share', ic: 'mega', t: 'Share your link with customers', s: 'Instagram bio, WhatsApp status or a counter QR', xp: 50, btn: 'Share now' },
    { k: 'install', ic: 'phone', t: 'Install the Modulus SELL app', s: 'Your store’s control room — orders, products, payouts', xp: 150, btn: 'Get the app' },
    { k: 'product', ic: 'box', t: 'Add your first product', s: 'Unlocks inside the SELL app', xp: 100, lock: true },
    { k: 'order', ic: 'gift', t: 'Receive your first order', s: 'Paid online, delivered with OTP', xp: 150, lock: true },
  ];
  const LEVELS = [[0, 'Level 1 · New Shop'], [150, 'Level 2 · Rising Store'], [300, 'Level 3 · Local Favourite'], [450, 'Level 4 · Neighbourhood Star']];
  const MAXXP = QUESTS.reduce((a, q) => a + q.xp, 0);
  let xp = 0;
  const renderQuests = () => {
    const nextIdx = QUESTS.findIndex(q => !q.done && !q.lock);
    $('#qlist').innerHTML = QUESTS.map((q, i) => `<li class="su-q${q.done ? ' done' : q.lock ? ' lock' : ''}${i === nextIdx ? ' next' : ''}" data-k="${q.k}">
      <span class="ic">${ic(q.done ? 'check' : q.lock ? 'lock' : q.ic)}</span><div><b>${q.t}</b><small>${q.s}</small></div>
      ${q.done ? `<span class="xp">+${q.xp} XP</span>` : q.btn ? `<button type="button" data-q="${q.k}">${q.btn} · +${q.xp} XP</button>` : `<span class="xp">+${q.xp} XP</span>`}</li>`).join('');
    paint($('#qlist'));
    $$('#qlist button').forEach(b => b.addEventListener('click', () => questAction(b.dataset.q, b)));
  };
  const setXp = v => {
    xp = v;
    $('#xpTxt').textContent = `${xp} / ${MAXXP} XP`;
    $('#xpBar').style.width = (xp / MAXXP * 100) + '%';
    $('#lvlName').textContent = LEVELS.filter(([m]) => xp >= m).pop()[1];
  };
  const xpFly = (el, n) => {
    const r = el.getBoundingClientRect();
    const f = document.createElement('span'); f.className = 'su-xpfly'; f.textContent = `+${n} XP`;
    f.style.left = r.left + r.width / 2 - 30 + 'px'; f.style.top = r.top - 10 + 'px';
    document.body.append(f); setTimeout(() => f.remove(), 1300);
  };
  const complete = (k, el) => {
    const q = QUESTS.find(x => x.k === k);
    if (!q || q.done) return;
    const before = LEVELS.filter(([m]) => xp >= m).length;
    q.done = true; xpFly(el, q.xp);
    renderQuests();
    const li = $(`#qlist [data-k="${k}"]`); li && li.classList.add('pop');
    setTimeout(() => {
      setXp(xp + q.xp);
      if (LEVELS.filter(([m]) => xp >= m).length > before) { confetti(60); doneDolls.forEach((d, i) => setTimeout(() => d.jump(2, 26, 520), i * 120)); }
    }, 300);
  };
  const link = () => `https://modulusbuy.com/${st.url}`;
  const questAction = (k, el) => {
    if (k === 'share') {
      if (navigator.share) navigator.share({ title: st.name, text: `Order from ${st.name} on BUY`, url: link() }).catch(() => {});
      else navigator.clipboard && navigator.clipboard.writeText(link()).catch(() => {});
      complete('share', el);
    }
    if (k === 'install') { document.querySelector('.su-sell').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  };
  ['#appStore', '#playStore'].forEach(id => $(id).addEventListener('click', e => complete('install', e.currentTarget)));
  $('#appStore').href = APP_STORE_URL; $('#playStore').href = PLAY_STORE_URL;

  const confetti = (n = 120) => {
    const host = $('#conf'), colors = ['#a52226', '#f2b233', '#261f8e', '#01ae0f', '#f2a0a4', '#3f4ee3'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      c.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
      c.style.animationDuration = 2 + Math.random() * 2 + 's';
      c.style.animationDelay = Math.random() * .6 + 's';
      host.append(c); setTimeout(() => c.remove(), 5000);
    }
  };
  const doneDolls = [];
  [{ size: 4, hatColor: PAL.navy, prop: null }, { size: 4 }, { size: 4, hat: 'helmet', prop: 'crate' }].forEach(o => { const d = mk($('#doneDolls'), o); d.face('happy', 'open'); doneDolls.push(d); });
  doneDolls[2].setDir(-1);
  const sellDoll = mk($('#sellDoll'), { size: 4 });
  sellDoll.face('happy', 'open');
  setInterval(() => { if (body.dataset.stage === 'done' && !document.hidden) { sellDoll.wave(3); doneDolls.forEach((d, i) => setTimeout(() => d.jump(1, 20, 500), i * 140)); } }, 3600);

  const celebrate = () => {
    stage('done');
    $('#dLogo').innerHTML = st.logo ? `<img src="${st.logo}" alt="">` : initials(st.name);
    $('#dName').textContent = st.name.trim();
    $('#dCat').textContent = st.cat;
    $('#dUrl').textContent = st.url;
    $('#dPhone').textContent = `+91 ${st.phone}`;
    $('#waBtn').href = `https://wa.me/?text=${encodeURIComponent(`Now you can order from ${st.name.trim()} online! ${link()}`)}`;
    $('#waBtn').onclick = () => complete('share', $('#waBtn'));
    $('#copyBtn').onclick = () => {
      navigator.clipboard && navigator.clipboard.writeText(link()).catch(() => {});
      const b = $('#copyBtn'); b.classList.add('copied'); b.querySelector('span').textContent = 'Copied';
      b.firstElementChild.dataset.px = 'check'; b.firstElementChild.innerHTML = ''; paint(b);
      complete('share', b);
    };
    renderQuests(); setXp(0);
    setTimeout(() => setXp(150), 500);
    confetti();
    doneDolls.forEach((d, i) => setTimeout(() => d.jump(2, 30, 520), i * 160));
  };

  // ?demo jumps straight to the filled-in celebration (handy for previews)
  if (new URLSearchParams(location.search).has('demo')) {
    st.name = 'Madhuram Sweets'; st.url = 'madhuram-sweets-blr'; st.urlOk = true; st.phone = '9876543210'; st.logo = 'assets/sweets/logo.jpg'; st.banner = 'assets/sweets/banner-1.jpg';
    celebrate();
  }
  update();
})();
