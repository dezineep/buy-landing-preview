/* Modulus BUY — page interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { Doll, PAL, map, svg } = window.PX;

  /* ---------- pixel icons (12 x 12 grid). Shared with js/story.js through window.PXI — no emoji anywhere ---------- */
  const ICPAL = { d: '#2a211c', r: '#a52226', l: '#e46a6e', s: '#b9b6c3', y: '#f2b233', o: '#e07a1f', p: '#f4c8c9', w: '#ffffff', f: '#ff8a3d', g: '#6fa96f', n: '#261f8e', b: '#7fb7c9', c: '#f4e8d8', e: '#e0a24a', k: '#a86a1d' };
  const ICONS = {
    pot: ['..s...s.....', '...s...s....', '..s...s.....', '............', '..dddddddd..', 'ddrrrrrrrrdd', '.drrrrrrrrd.', '.drllrrrrrd.', '.drrrrrrrrd.', '.drrrrrrrrd.', '..dddddddd..', '............'],
    bowl: ['....s..s....', '.....s..s...', '....s..s....', '............', 'yyyyyyyyyyyy', 'dyyoyyyoyyyd', '.drrrrrrrrd.', '.drrllrrrrd.', '..drrrrrrd..', '...dddddd...', '....dddd....', '............'],
    cake: ['.....f......', '.....y......', '....dddd....', '.dddddddddd.', '.dppppppppd.', '.dwwwwwwwwd.', '.dppppppppd.', '.dpprpprppd.', '.dppppppppd.', 'dddddddddddd', '............', '............'],
    dress: ['...dd..dd...', '..drrddrrd..', '.drrrrrrrrd.', 'drrrrrrrrrrd', 'dddrryyrrddd', '..drrrrrrd..', '..drrrrrrd..', '.drrrrrrrrd.', '.drrryyrrrd.', 'drrrrrrrrrrd', 'dddddddddddd', '............'],
    jar: ['...dddddd...', '...dyyyyd...', '..dddddddd..', '.dwwwwwwwwd.', '.dggoggggod.', '.dgggoggggd.', '.drrrrrrrrd.', '.drwwwwwwrd.', '.drrrrrrrrd.', '.dggggogggd.', '..dddddddd..', '............'],
    phone: ['..dddddddd..', '..dwwwwwwd..', '..drwrwrwd..', '..drrrrrrd..', '..dwwwwwwd..', '..dwyyyywd..', '..dwyddywd..', '..dwyddywd..', '..dwwwwwwd..', '..dddddddd..', '..dddwwddd..', '..dddddddd..'],
    receipt: ['.dddddddddd.', '.dwwwwwwwwd.', '.dwrrrrwwwd.', '.dwwwwwwwwd.', '.dwddddddwd.', '.dwwwwwwwwd.', '.dwddddwggd.', '.dwwwwwwggd.', '.dwddddwwwd.', '.dwwwwwwwwd.', '.dwdwdwdwdd.', '............'],
    coin: ['...oooooo...', '..oyyyyyyo..', '.oyyyyyyyyo.', '.oyddddddyo.', '.oyyyyddyyo.', '.oyddddddyo.', '.oyyddyyyyo.', '.oyyyddyyyo.', '.oyyyyddyyo.', '..oyyyyyyo..', '...oooooo...', '............'],
    refund: ['............', '....r.......', '...rr.......', '..rrrrrrrr..', '...rr....rr.', '....r.....rr', '..........rr', '..ggg....rr.', '..gggrrrrr..', '..ggg.......', '............', '............'],
    scooter: ['............', '........dd..', '.oooo....d..', '.oyyo....d..', '.oooorrrrd..', '..rrrrrrrrr.', '.rrrrrrrrrr.', '.rrwwwwrrrr.', 'ddd.....ddd.', 'dsd.....dsd.', 'ddd.....ddd.', '............'],
    gift: ['.....dd.....', '..dd.rr.dd..', '..drrrrrrd..', '...dd..dd...', 'dddddddddddd', 'dpppprrppppd', 'dddddrrddddd', '.dppprrpppd.', '.dppprrpppd.', '.dppprrpppd.', '.dppprrpppd.', '.dddddddddd.'],
    bread: ['............', '............', '...dddddd...', '..dcceeeed..', '.dceekekeed.', '.deekekeeed.', '.deeeeeeeed.', '.dkkkkkkkkd.', '..dddddddd..', '............', '............', '............'],
    cart: ['............', 'dd..........', '.d.rrrrrrrr.', '.d.rwwwwwwr.', '..drrrrrrrr.', '..drwwwwwr..', '...drrrrrr..', '...ddddddd..', '....d...d...', '...ddd.ddd..', '............', '............'],
    sweet: ['............', '....dddd....', '..ddyyyydd..', '.dyywyyoyyd.', '.dywyyoyyyd.', 'dyyyyyyyoyyd', 'dyyoyyyyyyyd', '.dyyyyoyyyd.', '..ddyyyydd..', 'ssssddddssss', '.ssssssssss.', '............'],
    tiffin: ['...dddddd...', '...d....d...', '.dddddddddd.', '.dswssssssd.', '.dddddddddd.', '.dswssssssd.', '.dddddddddd.', '.dswssssssd.', '.dswssssssd.', '.dddddddddd.', '............', '............'],
    flower: ['............', '...dddddd...', '..dllpplld..', '.dlpprrppld.', '.dlprrrrpld.', '.dlpprrppld.', '..dllpplld..', '...dddddd...', '.....dg.....', '...ggdg.....', '....gdg.....', '.....dg.....'],
    lock: ['............', '....dddd....', '...dd..dd...', '...d....d...', '...d....d...', '.dddddddddd.', '.dyyyyyyyyd.', '.dyyyddyyyd.', '.dyyyddyyyd.', '.dooooooood.', '.dddddddddd.', '............'],
    call: ['ddd.........', 'drrd........', 'drrd........', '.drd........', '.drrd.......', '..drrd......', '...drrd.....', '....drrd....', '.....drrddd.', '......drrrrd', '.......ddrrd', '.........ddd'],
    clock: ['............', '...rrrrrr...', '..rwwwwwwr..', '.rwwwdwwwwr.', '.rwwwdwwwwr.', '.rwwwdwwwwr.', '.rwwwddddwr.', '.rwwwwwwwwr.', '.rwwwwwwwwr.', '..rwwwwwwr..', '...rrrrrr...', '............'],
    bell: ['............', '.....dd.....', '....dyyd....', '...dywyyd...', '...dywyyd...', '..dyyyyyyd..', '..dyyyyyyd..', '.dyyyyyyyyd.', 'dddddddddddd', '.....dd.....', '............', '............'],
  };
  const pxIcon = name => { const s = svg(12, 12); map(s, ICONS[name] || [], ICPAL); return s; };
  window.PXI = { el: pxIcon, html: (name, cls = 'pxi') => (ICONS[name] ? `<span class="${cls}" aria-hidden="true">${pxIcon(name).outerHTML}</span>` : '') };

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.__lenis = lenis;
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id.length > 1 && $(id);
    if (!target) return;
    e.preventDefault();
    document.body.classList.remove('menu-open');
    lenis && lenis.start();
    lenis ? lenis.scrollTo(target, { offset: id === '#story' ? 0 : -80 }) : target.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- header ---------- */
  const header = $('.site-header');
  const wm = $('.footer-wordmark');
  const onScroll = () => {
    header.classList.toggle('is-stuck', scrollY > 160);
    if (wm) {
      const r = wm.parentElement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (r.height + 120)));
      wm.style.setProperty('--wm', `${(1 - p) * 60}px`);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const toggle = $('.menu-toggle');
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  // highlight the nav item for the section in view
  const navMap = new Map($$('.main-nav .nav-link').map(a => [a.getAttribute('href').slice(1), a]));
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    const a = navMap.get(e.target.id);
    if (a && e.isIntersecting) { navMap.forEach(x => x.classList.remove('is-active')); a.classList.add('is-active'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  navMap.forEach((a, id) => { const s = document.getElementById(id); s && navIO.observe(s); });

  /* ---------- split headings ---------- */
  $$('[data-split]').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            w.append(s); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.classList.add('split-words');
  });

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal], [data-split]').forEach(el => io.observe(el));
  if (new URLSearchParams(location.search).has('shot')) $$('[data-reveal], [data-split]').forEach(el => el.classList.add('is-in'));

  /* ---------- word rotators ---------- */
  $$('.chip-word').forEach((el, k) => {
    const words = el.dataset.words.split(',');
    let i = 0;
    // measure a word's natural width so the pill can glide between sizes
    const measure = w => { const m = el.cloneNode(); m.textContent = w; m.className = 'chip-word'; m.style.cssText = 'position:absolute;visibility:hidden;width:auto;white-space:nowrap'; el.parentElement.append(m); const x = m.getBoundingClientRect().width; m.remove(); return x; };
    const fit = () => { el.style.width = measure(el.textContent) + 'px'; };
    fit(); document.fonts && document.fonts.ready.then(fit); addEventListener('resize', fit);
    setTimeout(() => setInterval(() => {
      if (document.hidden) return;
      el.classList.add('out');
      const nxt = words[(i + 1) % words.length];
      el.style.width = measure(nxt) + 'px';
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove('out'); el.classList.add('in');
        setTimeout(() => el.classList.remove('in'), 600);
      }, 380);
    }, 2600), k * 1300);
  });

  /* ---------- toast ---------- */
  const toast = msg => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2800);
  };
  window.__toast = toast;

  /* ---------- HERO ---------- */
  const stage = $('#heroStage');
  const heroDoll = new Doll({ size: 12, label: 'BUY doll' });
  $('#heroDoll').append(heroDoll.root);
  const tip = $('#heroTip');
  const cards = $$('.hc', stage);
  const wires = $('#heroWires');
  const NS = 'http://www.w3.org/2000/svg';
  const drawWires = () => {
    wires.innerHTML = '';
    const d = $('#heroDoll');
    const dx = d.offsetLeft + d.offsetWidth / 2, dy = d.offsetTop + d.offsetHeight * .62;
    cards.forEach(c => {
      if (getComputedStyle(c).display === 'none') return;
      const left = c.offsetLeft + c.offsetWidth / 2 < dx;
      const ax = left ? c.offsetLeft + c.offsetWidth : c.offsetLeft;
      const ay = c.offsetTop + c.offsetHeight / 2;
      const ex = dx + (left ? -40 : 40);
      const p = document.createElementNS(NS, 'path');
      const k = (ex - ax) * .55;
      p.setAttribute('d', `M${ax} ${ay} C${ax + k} ${ay} ${ex - k} ${dy} ${ex} ${dy}`);
      p.dataset.k = c.dataset.k;
      wires.append(p);
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', ax); dot.setAttribute('cy', ay); dot.setAttribute('r', 4);
      wires.append(dot);
    });
  };
  const fit = () => {
    const vw = document.documentElement.clientWidth;
    const z = vw <= 960 ? Math.min(1, (vw - 24) / 460) : Math.min(1, (vw - 40) / 1220);
    $('.hero-stage-wrap').style.setProperty('--hz', z.toFixed(4));
    drawWires();
    // footer wordmark spans the width
    if (wm) {
      wm.style.fontSize = '100px';
      const natural = [...wm.children].reduce((a, c) => a + c.getBoundingClientRect().width, 0) + 40;
      wm.style.fontSize = `${Math.floor(100 * (vw - 16) / natural)}px`;
    }
  };
  addEventListener('resize', fit);
  fit();
  document.fonts && document.fonts.ready.then(fit);
  cards.forEach((c, i) => setTimeout(() => c.classList.add('in'), 300 + i * 140));
  setTimeout(() => heroDoll.face('happy', 'open').wave(4).then(() => heroDoll.face('open', 'none')), 900);

  // eyes follow the pointer
  addEventListener('pointermove', e => {
    const r = $('#heroDoll').getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .55);
    heroDoll.look(Math.abs(dx) > 60 ? Math.sign(dx) : 0, Math.abs(dy) > 80 ? Math.sign(dy) : 0);
  }, { passive: true });
  const heroReact = async () => {
    tip.classList.add('hide');
    const moods = [['happy', 'open', 'heart'], ['wide', 'o', 'spark'], ['happy', 'smile', 'note']];
    const [f, m, em] = moods[Math.floor(Math.random() * moods.length)];
    heroDoll.face(f, m).emote(em, 1200);
    await heroDoll.jump(1 + Math.floor(Math.random() * 2), 46, 600);
    heroDoll.face('open', 'none');
  };
  $('#heroDoll').addEventListener('click', heroReact);
  // hovering a card: the doll looks at it and its wire lights up
  cards.forEach(c => {
    c.addEventListener('mouseenter', () => {
      const left = c.offsetLeft < 600;
      heroDoll.look(left ? -1 : 1, c.offsetTop < 150 ? -1 : 0).face('open', 'smile');
      const p = wires.querySelector(`path[data-k="${c.dataset.k}"]`);
      p && p.classList.add('hot');
    });
    c.addEventListener('mouseleave', () => {
      heroDoll.mouth('none');
      $$('path.hot', wires).forEach(p => p.classList.remove('hot'));
    });
  });
  // idle antics
  setInterval(() => {
    if (document.hidden) return;
    const r = $('#heroDoll').getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    Math.random() < .5 ? heroDoll.wave(2) : heroDoll.jump(1, 24, 520);
  }, 5200);

  /* ---------- bento bits ---------- */
  const qtyVal = $('.qty-val'), qtyPrice = $('.qty-price');
  let typeT = null;
  $$('.var').forEach(b => b.addEventListener('click', () => {
    $$('.var').forEach(x => x.classList.toggle('on', x === b));
    clearInterval(typeT);
    qtyVal.classList.remove('typing');
    if (b.dataset.p === 'custom') {
      const target = '800 g';
      let i = 0;
      qtyVal.textContent = ''; qtyVal.classList.add('typing'); qtyPrice.textContent = '₹—';
      typeT = setInterval(() => {
        qtyVal.textContent = target.slice(0, ++i);
        if (i >= target.length) { clearInterval(typeT); qtyPrice.textContent = '₹520'; setTimeout(() => qtyVal.classList.remove('typing'), 900); }
      }, 160);
    } else {
      qtyVal.textContent = b.textContent.replace('Best Value', '').trim();
      qtyPrice.textContent = '₹' + b.dataset.p;
    }
  }));
  $$('.addb').forEach(b => b.addEventListener('click', () => b.classList.toggle('on')));
  $('.ag-again') && $('.ag-again').addEventListener('click', () => toast('3 items added back to your cart'));

  /* ---------- number counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / 1300);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      p < 1 && requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    cio.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- stores panel: drifting pixels + a waving owner ---------- */
  const px = $('.stores-pixels');
  if (px) for (let i = 0; i < 26; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = -Math.random() * 3 + 's';
    const z = 6 + Math.round(Math.random() * 3) * 4; s.style.width = s.style.height = z + 'px';
    px.append(s);
  }
  const sd = document.createElement('div'); sd.className = 'stores-doll';
  $('.stores-panel').append(sd);
  const storeDoll = new Doll({ size: 5, hatColor: PAL.navy, prop: null, label: 'Store owner' });
  sd.append(storeDoll.root);
  storeDoll.face('happy', 'open');
  const loopWave = async (d, every, side = 'R') => {
    for (;;) {
      await new Promise(r => setTimeout(r, every));
      if (document.hidden) continue;
      d.face('happy', 'open'); await d.wave(3, side); await d.jump(1, 18, 500); d.face('open', 'smile');
    }
  };
  loopWave(storeDoll, 4200, 'both');

  /* ---------- pixel icons on cards ---------- */
  $$('.hb-ic, .feat-ic[data-icon]').forEach(h => h.append(pxIcon(h.dataset.icon)));
  $$('[data-px]').forEach(h => h.append(pxIcon(h.dataset.px)));

  /* ---------- marketplace map ---------- */
  const mkMap = $('#mkMap');
  const PINS = [
    { x: 16, y: 30, ic: 'bread', lb: 'Pune Bakes', t: ['near', 'open'] },
    { x: 42, y: 24, ic: 'cart', lb: 'Sharma Kirana', t: ['near', 'open'] },
    { x: 78, y: 40, ic: 'bowl', lb: 'Amma’s Kitchen', t: ['home', 'online', 'open'] },
    { x: 58, y: 74, ic: 'dress', lb: 'Insta Threads', t: ['online'] },
    { x: 20, y: 76, ic: 'cake', lb: 'Cake Corner', t: ['near', 'open'] },
    { x: 88, y: 78, ic: 'sweet', lb: 'Mithai Ghar', t: ['open'] },
    { x: 36, y: 54, ic: 'tiffin', lb: 'Tiffin Box', t: ['home', 'online', 'near'] },
    { x: 64, y: 18, ic: 'flower', lb: 'Bloom Florist', t: [] },
  ];
  const pins = PINS.map(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mk-pin' + (p.t.includes('online') ? ' online' : '');
    b.style.left = p.x + '%'; b.style.top = p.y + '%';
    b.setAttribute('aria-label', `${p.lb}${p.t.includes('online') ? ', online-only' : ''}`);
    b.innerHTML = `<span class="pin-ic">${pxIcon(p.ic).outerHTML}</span><span class="pin-lb">${p.lb}</span>${p.t.includes('online') ? '<span class="pin-tag">ONLINE-ONLY</span>' : ''}`;
    b.addEventListener('click', () => toast(`${p.lb} is coming soon to the BUY Marketplace`));
    b._t = p.t;
    b.style.opacity = 0;
    mkMap.append(b);
    return b;
  });
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return;
    pins.forEach((b, i) => setTimeout(() => { b.style.opacity = ''; b.classList.add('pop'); }, i * 140));
    o.disconnect();
  }), { threshold: .3 }).observe(mkMap);
  $$('.mk-filters button').forEach(btn => btn.addEventListener('click', () => {
    $$('.mk-filters button').forEach(x => x.classList.toggle('on', x === btn));
    const f = btn.dataset.f;
    pins.forEach(p => p.classList.toggle('dim', f !== 'all' && !p._t.includes(f)));
  }));
  // a little shopper wanders between stores
  const walker = document.createElement('div'); walker.className = 'mk-walker';
  mkMap.append(walker);
  const wd = new Doll({ size: 3 });
  walker.append(wd.root);
  let wx = 47, wy = 62, legT;
  const placeW = () => { walker.style.left = `calc(${wx}% - 33px)`; walker.style.top = `calc(${wy}% - 60px)`; };
  placeW();
  setInterval(() => {
    if (document.hidden) return;
    const vis = pins.filter(p => !p.classList.contains('dim'));
    const t = PINS[pins.indexOf(vis[Math.floor(Math.random() * vis.length)])];
    if (!t) return;
    wd.setDir(t.x > wx ? 1 : -1);
    wx = t.x + (t.x > 50 ? -6 : 6); wy = t.y + 10;
    let f = 0; clearInterval(legT);
    legT = setInterval(() => wd.legs(f++ % 2 ? 'a' : 'b'), 150);
    placeW();
    setTimeout(() => { clearInterval(legT); wd.legs('stand'); wd.emote(Math.random() < .5 ? 'heart' : 'spark', 1000); }, 2200);
  }, 3600);
  $('.lp-copy').addEventListener('click', () => toast('Your BUY link is ready to share'));
  // a decorative pixel QR for the counter standee
  const qrHost = $('#mkQr');
  if (qrHost) {
    const N = 21, q = svg(N, N);
    const finder = (x, y) => PX.rects(q, [[x, y, 7, 7]], '#2a211c') || PX.rects(q, [[x + 1, y + 1, 5, 5]], '#fff') || PX.rects(q, [[x + 2, y + 2, 3, 3]], '#2a211c');
    let seed = 17;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inFinder && rnd() < .48) PX.rects(q, [[x, y]], '#2a211c');
    }
    finder(0, 0); finder(14, 0); finder(0, 14);
    PX.rects(q, [[8, 8, 5, 5]], '#fff'); PX.rects(q, [[9, 9, 3, 3]], '#a52226');
    qrHost.prepend(q);
  }

  /* ---------- coming next: live BUY screens in a swipeable carousel ---------- */
  const nxRow = $('#nextRow');
  if (nxRow && window.BuyApp) {
    const screens = $$('.nx-screen', nxRow);
    // data-screen delivered | report | report-window | store  ->  presets next-delivered | report | report-window | store
    screens.forEach(el => { el.innerHTML = ''; const d = document.createElement('div'); el.append(d); BuyApp.mountStatic(d, el.dataset.screen, { sat: 0 }); });
    const fitScreens = () => screens.forEach(el => { const ba = el.firstElementChild; if (ba) ba.style.transform = `scale(${el.clientWidth / 412})`; });
    const wrap = nxRow.parentElement, dotsEl = $('#nextDots');
    const cards = $$('.nx', nxRow);
    dotsEl.innerHTML = cards.map((_, i) => `<button type="button" aria-label="Show screen ${i + 1}"></button>`).join('');
    const dots = $$('button', dotsEl);
    const prev = $('.next-arrow.nx-prev', wrap), next = $('.next-arrow.nx-next', wrap);
    const idx = () => { const x = nxRow.scrollLeft; let best = 0, d = 1e9; cards.forEach((c, i) => { const dd = Math.abs(c.offsetLeft - nxRow.offsetLeft - x - parseFloat(getComputedStyle(nxRow).paddingLeft)); if (dd < d) { d = dd; best = i; } }); return best; };
    const goTo = i => { const c = cards[Math.max(0, Math.min(cards.length - 1, i))]; nxRow.scrollTo({ left: c.offsetLeft - nxRow.offsetLeft - parseFloat(getComputedStyle(nxRow).paddingLeft), behavior: 'smooth' }); };
    const sync = () => {
      const fits = nxRow.scrollWidth <= nxRow.clientWidth + 4;
      wrap.classList.toggle('fits', fits); nxRow.classList.toggle('fits', fits);
      const i = idx();
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      prev.disabled = nxRow.scrollLeft < 8;
      next.disabled = nxRow.scrollLeft + nxRow.clientWidth >= nxRow.scrollWidth - 8;
    };
    prev.addEventListener('click', () => goTo(idx() - 1));
    next.addEventListener('click', () => goTo(idx() + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    nxRow.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    // desktop: drag to scroll with the mouse too
    let drag = null;
    nxRow.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, l: nxRow.scrollLeft }; nxRow.style.scrollSnapType = 'none'; });
    addEventListener('pointermove', e => { if (drag) nxRow.scrollLeft = drag.l - (e.clientX - drag.x); });
    addEventListener('pointerup', () => { if (!drag) return; drag = null; nxRow.style.scrollSnapType = ''; goTo(idx()); });
    const onResize = () => { fitScreens(); sync(); };
    addEventListener('resize', onResize);
    new ResizeObserver(onResize).observe(nxRow);
    onResize();
  }

  /* ---------- ecosystem dolls ---------- */
  const ecoSell = new Doll({ size: 4, hatColor: PAL.navy, prop: null });
  const ecoBuy = new Doll({ size: 4 });
  [[ecoSell, '.eco-node.sell'], [ecoBuy, '.eco-node.buy']].forEach(([d, sel]) => {
    const w = document.createElement('div'); w.className = 'eco-doll'; w.append(d.root); $(sel).append(w);
  });
  ecoSell.face('happy'); ecoBuy.setDir(-1).face('happy');
  (async () => {
    for (;;) {
      await new Promise(r => setTimeout(r, 2600));
      if (document.hidden) continue;
      await ecoSell.wave(2, 'R'); await ecoBuy.wave(2, 'R');
      await Promise.all([ecoSell.jump(1, 16, 480), ecoBuy.jump(1, 16, 480)]);
    }
  })();

  /* ---------- FAQ ---------- */
  const tabs = $$('.faq-tabs button');
  const ind = $('.faq-ind');
  const moveInd = b => { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft - 5}px)`; };
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    $$('.faq-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === b.dataset.tab));
    moveInd(b);
  }));
  moveInd(tabs[0]);
  document.fonts && document.fonts.ready.then(() => moveInd($('.faq-tabs button.on')));
  $$('.qa').forEach(qa => $('.qa-q', qa).addEventListener('click', () => {
    const open = !qa.classList.contains('is-open');
    $$('.qa.is-open', qa.parentElement).forEach(o => { o.classList.remove('is-open'); $('.qa-q', o).setAttribute('aria-expanded', 'false'); });
    qa.classList.toggle('is-open', open);
    $('.qa-q', qa).setAttribute('aria-expanded', open);
  }));
  $$('.faq-panel').forEach(p => { const f = $('.qa', p); f.classList.add('is-open'); $('.qa-q', f).setAttribute('aria-expanded', 'true'); });

  /* ---------- final CTA: the whole cast ---------- */
  const cast = [
    new Doll({ size: 4, hatColor: PAL.navy, prop: null }),
    new Doll({ size: 4 }),
    new Doll({ size: 4, hat: 'helmet', prop: 'crate' }),
  ];
  cast.forEach(d => { const w = document.createElement('div'); w.append(d.root); $('#ctaDolls').append(w); d.face('happy', 'open'); });
  cast[2].setDir(-1);
  (async () => {
    for (;;) {
      await new Promise(r => setTimeout(r, 2400));
      if (document.hidden) continue;
      for (const d of cast) { d.jump(1, 26, 520); await new Promise(r => setTimeout(r, 160)); }
      await new Promise(r => setTimeout(r, 900));
      cast[1].wave(2);
    }
  })();
  $('#ctaDolls').addEventListener('pointerenter', () => cast.forEach((d, i) => setTimeout(() => d.jump(1, 30, 520), i * 90)));
})();
