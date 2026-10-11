/* Create-your-store page: pixel icons + the intro scene.
   Everything is drawn with the PX kit (js/pixel.js) on integer grids, so it stays crisp at any size.
   window.SuPx.icon(name) returns a 12×12 pixel icon <svg>; SuPx.fill(root) fills every [data-px] inside root. */
(() => {
  if (!window.PX) return;
  const { div, svg, rects, map, PROPS, Doll, Scope, Cancel, PAL, emoteSvg } = PX;

  /* ---------- 12×12 pixel icons (same palette + style as the home page icons) ---------- */
  const P = {
    d: '#2a211c', r: '#a52226', l: '#e46a6e', s: '#b9b6c3', y: '#f2b233', o: '#e07a1f', p: '#f4c8c9', w: '#ffffff',
    f: '#ff8a3d', g: '#6fa96f', G: '#01ae0f', n: '#261f8e', b: '#7fb7c9', x: '#e0a24a', X: '#a86a1d', t: '#f3dcae', c: '#f4e8d8',
  };
  const I = {
    store: ['............', '.rwrwrwrwrw.', '.rrrrrrrrrr.', '.dwwwwwwwwd.', '.dwyywdddwd.', '.dwyywdwdwd.', '.dwwwwdwdwd.', '.dwwwwdddwd.', '.dddddddddd.', '............', '............', '............'],
    coin: ['...oooooo...', '..oyyyyyyo..', '.oyyyyyyyyo.', '.oyddddddyo.', '.oyyyyddyyo.', '.oyddddddyo.', '.oyyddyyyyo.', '.oyyyddyyyo.', '.oyyyyddyyo.', '..oyyyyyyo..', '...oooooo...', '............'],
    cart: ['............', 'dd..........', '.d.rrrrrrrr.', '.d.rwwwwwwr.', '..drrrrrrrr.', '..drwwwwwr..', '...drrrrrr..', '...ddddddd..', '....d...d...', '...ddd.ddd..', '............', '............'],
    card: ['............', '............', '.nnnnnnnnnn.', '.nnnnnnnnnn.', '.dddddddddd.', '.nnnnnnnnnn.', '.nyynnnnnnn.', '.nyynnwwwnn.', '.nnnnnnnnnn.', '............', '............', '............'],
    phone: ['..dddddddd..', '..dwwwwwwd..', '..drwrwrwd..', '..drrrrrrd..', '..dwwwwwwd..', '..dwyyyywd..', '..dwyddywd..', '..dwyddywd..', '..dwwwwwwd..', '..dddddddd..', '..dddwwddd..', '..dddddddd..'],
    scooter: ['............', '........dd..', '.xxxx....d..', '.xttx....d..', '.xxxxrrrrd..', '..rrrrrrrrr.', '.rrrrrrrrrr.', '.rrwwwwrrrr.', 'ddd.....ddd.', 'dsd.....dsd.', 'ddd.....ddd.', '............'],
    house: ['.....dd.....', '....drrd....', '...drrrrd...', '..drrrrrrd..', '.drrrrrrrrd.', 'dddddddddddd', '.dccccccccd.', '.dcbbcdddcd.', '.dcbbcdrdcd.', '.dccccdrdcd.', '.dddddddddd.', '............'],
    candy: ['............', '............', 'rr..dddd..rr', 'rrrdppppdrrr', '.rdpwppppdr.', '.rdppppppdr.', 'rrrdppppdrrr', 'rr..dddd..rr', '............', '............', '............', '............'],
    bowl: ['....s..s....', '.....s..s...', '....s..s....', '............', 'yyyyyyyyyyyy', 'dyyoyyyoyyyd', '.drrrrrrrrd.', '.drrllrrrrd.', '..drrrrrrd..', '...dddddd...', '....dddd....', '............'],
    cake: ['.....f......', '.....y......', '....dddd....', '.dddddddddd.', '.dppppppppd.', '.dwwwwwwwwd.', '.dppppppppd.', '.dpprpprppd.', '.dppppppppd.', 'dddddddddddd', '............', '............'],
    dress: ['...dd..dd...', '..drrddrrd..', '.drrrrrrrrd.', 'drrrrrrrrrrd', 'dddrryyrrddd', '..drrrrrrd..', '..drrrrrrd..', '.drrrrrrrrd.', '.drrryyrrrd.', 'drrrrrrrrrrd', 'dddddddddddd', '............'],
    cloche: ['............', '.....dd.....', '....dddd....', '..dddddddd..', '.dsswssssd..', '.dswsssssd..', '.dssssssssd.', 'dddddddddddd', '.dddddddddd.', '............', '............', '............'],
    pencil: ['.........dd.', '........dlld', '.......dydld', '......dyyd..', '.....dyyd...', '....dyyd....', '...dyyd.....', '..dyyd......', '.dtyd.......', '.dtd........', '.dd.........', '............'],
    trash: ['....dddd....', '.dddddddddd.', '............', '..dddddddd..', '..dsdssdsd..', '..dsdssdsd..', '..dsdssdsd..', '..dsdssdsd..', '..dsdssdsd..', '..dssssssd..', '...dddddd...', '............'],
    hourglass: ['.dddddddddd.', '..dwwwwwwd..', '..dyyyyyyd..', '...dyyyyd...', '....dyyd....', '.....dd.....', '....dwwd....', '...dwwywd...', '..dwyyyyyd..', '..dyyyyyyd..', '.dddddddddd.', '............'],
    link: ['............', '......dddd..', '.....dbbbbd.', '....dbd..dbd', '....dbd..dbd', '...ddbdddbd.', '.dbdddbdd...', 'dbd..dbd....', 'dbd..dbd....', '.dbbbbd.....', '..dddd......', '............'],
    chat: ['............', '..dddddddd..', '.dGGGGGGGGd.', 'dGGGGGGGGGGd', 'dGGwwwwwwGGd', 'dGGGGGGGGGGd', 'dGGwwwwGGGGd', '.dGGGGGGGGd.', '..dGddddd...', '..dd........', '............', '............'],
    flag: ['..d.........', '..drrrrrrr..', '..drrwwrrrr.', '..drrwwrrr..', '..drrrrrrrr.', '..drrrrrr...', '..d.........', '..d.........', '..d.........', '..d.........', '.ddd........', 'ddddd.......'],
    mega: ['............', '.........dd.', '.......ddrd.', '.....ddrrrd.', '.dddddrrrrd.', '.dwwdrrrrrd.', '.dwwdrrrrrd.', '.dddddrrrrd.', '..dd..ddrrd.', '..dd....ddd.', '..dd........', '............'],
    box: ['............', '.XXXXXXXXXX.', '.XxxxttxxxX.', '.XxxxttxxxX.', '.XXXXttXXXX.', '.XxxxttxxxX.', '.XxxxttxxxX.', '.XxxxttxrrX.', '.XxxxttxrrX.', '.XXXXXXXXXX.', '............', '............'],
    bell: ['.....dd.....', '....dyyd....', '...dyyyyd...', '...dywyyd...', '..dyywyyyd..', '..dyyyyyyd..', '..dyyyyyyd..', '.dyyyyyyyyd.', 'dddddddddddd', '.....dd.....', '............', '............'],
    gift: ['.....dd.....', '..dd.rr.dd..', '..drrrrrrd..', '...dd..dd...', 'dddddddddddd', 'dpppprrppppd', 'dddddrrddddd', '.dppprrpppd.', '.dppprrpppd.', '.dppprrpppd.', '.dppprrpppd.', '.dddddddddd.'],
    lock: ['............', '....dddd....', '...d....d...', '...d....d...', '...d....d...', '..dddddddd..', '..dyyyyyyd..', '..dyyddyyd..', '..dyyddyyd..', '..dyyyyyyd..', '..dddddddd..', '............'],
    unlock: ['....dddd....', '...d....d...', '...d....d...', '...d........', '...d........', '..dddddddd..', '..dyyyyyyd..', '..dyyddyyd..', '..dyyddyyd..', '..dyyyyyyd..', '..dddddddd..', '............'],
    check: ['............', '............', '..........ww', '.........ww.', '........ww..', '.ww....ww...', '..ww..ww....', '...wwww.....', '....ww......', '............', '............', '............'],
    star: ['.....yy.....', '.....yy.....', '....yyyy....', 'yyyyyyyyyyyy', '.yyyyyyyyyy.', '..yyyyyyyy..', '...yyyyyy...', '..yyyyyyyy..', '..yyy..yyy..', '.yy......yy.', '............', '............'],
  };
  const icon = name => {
    const s = svg(12, 12, 'su-px');
    map(s, I[name] || I.star, P);
    return s;
  };
  const fill = (root = document) => root.querySelectorAll('[data-px]').forEach(h => {
    if (h.firstElementChild && h.firstElementChild.classList.contains('su-px')) return;
    h.prepend(icon(h.dataset.px));
  });
  window.SuPx = { icon, fill };

  /* ---------- the intro scene ----------
     A 600×360 world: Madhuram Sweets on the left, the customer's house on the right.
     Loop: shop owner waves → phone pings with the order → parcel goes on the scooter →
     the rider drives over → the customer jumps for joy at the door. */
  const host = document.getElementById('suScene');
  if (!host) return;
  const W = 600, H = 360, GROUND = 300;
  const world = div('sc-world', host);
  const put = (node, x, y, w, h, cls, parent = world) => {
    const d = div('sc-obj ' + (cls || ''), parent);
    Object.assign(d.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    node && d.append(node);
    return d;
  };

  // sky + ground
  put(PROPS.sun(), 270, 26, 40, 40, 'sc-sun');
  put(PROPS.cloud(), 40, 34, 96, 36, 'sc-cloud c1');
  put(PROPS.cloud(), 452, 54, 72, 27, 'sc-cloud c2');
  div('sc-walk', world); div('sc-road', world);
  put(PROPS.tree(), 205, 214, 54, 78, 'sc-tree');

  // shop (owner stands behind the counter)
  const shop = PROPS.shop();
  put(shop.back, 10, 139, 182, 161, 'sc-shop');
  const sign = div('sc-sign', world, 'MADHURAM SWEETS');
  Object.assign(sign.style, { left: '34.5px', top: '142.5px', width: '133px', height: '17.5px' });
  const owner = new Doll({ hat: 'cap', hatColor: PAL.navy, prop: null, size: 3, label: 'Shop owner' });
  world.append(owner.root);
  const counterBox = put(PROPS.box(true), 122, 234, 30, 24, 'sc-cbox');
  put(shop.front, 10, 139, 182, 161, 'sc-shop-front');

  // house + customer
  put(PROPS.house(), 408, 139, 175, 161, 'sc-house');
  const customer = new Doll({ size: 3, label: 'Customer' });
  world.append(customer.root);
  const heldBox = put(PROPS.box(true), 494, 262, 24, 19, 'sc-held');

  // rider on a scooter: one rig moves both
  const rig = div('sc-rig', world);
  const rigFlip = div('sc-rig-flip', rig);
  const scooter = PROPS.scooter();
  put(scooter, 0, 37.5, 102, 60, 'sc-scooter', rigFlip);
  const rider = new Doll({ hat: 'helmet', prop: null, size: 3, label: 'Delivery partner' });
  rider.legs('none');
  rigFlip.append(rider.root);
  rider.place(42, 73.5);
  const puffs = div('sc-puffs', rig);
  const RIG = { x: 0, dir: 1 };
  const rigPlace = (x, ms = 0) => {
    RIG.x = x;
    rig.style.transition = ms ? `transform ${ms}ms cubic-bezier(.4,.1,.3,1)` : 'none';
    rig.style.transform = `translate3d(${x - 51}px, ${344 - 98}px, 0)`;
  };
  const rigDir = d => { RIG.dir = d; rigFlip.style.transform = d < 0 ? 'scaleX(-1)' : ''; };

  // phone in the sky + its order notification
  const PHONE = ['.dddddddddddd.', 'dddddddddddddd', 'ddwwwwwwwwwwdd', 'ddwrrrrrrrrwdd', 'ddwrwwrrrrrwdd', 'ddwwwwwwwwwwdd', 'ddwppwwwwwwwdd', 'ddwppwssssswdd', 'ddwwwwwwwwwwdd', 'ddwppwwwwwwwdd', 'ddwppwssssswdd', 'ddwwwwwwwwwwdd', 'ddwGGGGGGGGwdd', 'ddwGGGGGGGGwdd', 'ddwwwwwwwwwwdd', 'dddddddddddddd', 'ddddddssdddddd', '.dddddddddddd.'];
  const phoneSvg = svg(14, 18, 'px-prop'); map(phoneSvg, PHONE, P);
  const phone = put(phoneSvg, 268, 84, 56, 72, 'sc-phone');
  const waves = div('sc-waves', phone); for (let i = 0; i < 3; i++) div('', waves);
  const note = div('sc-note', world,
    '<span class="sc-note-in"><b><i data-px="bell"></i>New order</b><small>Gulab Jamun · 1 kg</small><em>₹460 · Paid</em></span>');
  fill(note);

  // flying bits (order slip, parcel) + delivered stamp
  const slip = put(icon('chat'), 0, 0, 24, 24, 'sc-fly');
  const flyBox = put(PROPS.box(true), 0, 0, 30, 24, 'sc-fly');
  const stamp = div('sc-stamp', world, '<span>DELIVERED</span>');
  stamp.prepend(emoteSvg('check'));

  /* ---------- layout ---------- */
  const layout = () => {
    const s = host.clientWidth / W;
    world.style.transform = `scale(${s})`;
    // keep the little cards readable on phones
    const ui = Math.min(1, Math.max(.78, s * 1.08));
    world.style.setProperty('--inv', (ui / s).toFixed(4));
  };
  new ResizeObserver(layout).observe(host);
  layout();

  /* ---------- helpers ---------- */
  const steps = [...document.querySelectorAll('#scSteps li')];
  const step = k => steps.forEach(li => li.classList.toggle('on', li.dataset.k === k));
  const fly = async (S, node, [x0, y0], [x1, y1], ms = 800, lift = 70) => {
    node.style.display = 'block';
    node.getAnimations().forEach(a => a.cancel());
    node.animate([
      { transform: `translate(${x0}px, ${y0}px) rotate(0deg)` },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - lift}px) rotate(-14deg)`, offset: .5 },
      { transform: `translate(${x1}px, ${y1}px) rotate(0deg)` },
    ], { duration: ms, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
    await S.wait(ms);
  };
  const hideFly = n => { n.getAnimations().forEach(a => a.cancel()); n.style.display = 'none'; };
  const rigTo = async (S, x, ms) => {
    if (x !== RIG.x) rigDir(x > RIG.x ? 1 : -1);
    rigPlace(x, ms);
    let k = 0;
    const t = S.every(110, () => {
      scooter._hubs[0].style.display = k % 2 ? 'none' : '';
      scooter._hubs[1].style.display = k % 2 ? '' : 'none';
      rider.bob.style.translate = k % 4 < 2 ? '0 0' : '0 -2px';
      if (k++ % 3 === 0) {
        const p = div('sc-puff', puffs);
        p.style.left = (RIG.dir > 0 ? 2 : 92) + 'px';
        setTimeout(() => p.remove(), 700);
      }
    });
    await S.wait(ms);
    clearInterval(t);
    rider.bob.style.translate = '';
  };
  const crate = () => [RIG.x - 51 + (RIG.dir > 0 ? 2 : 70), 344 - 98 + 30];

  const bg = p => p.catch(() => {});
  const reset = S => {
    [owner, customer, rider].forEach(d => { d.scope = S; d.reset(); });
    rider.legs('none');
    owner.at(101, 270).setDir(1).face('happy', 'smile');
    customer.at(527, 302).setDir(-1).face('open', 'smile');
    rigPlace(262); rigDir(1);
    counterBox.classList.remove('on'); heldBox.classList.remove('on');
    phone.classList.remove('on', 'ring'); note.classList.remove('on'); stamp.classList.remove('on');
    hideFly(slip); hideFly(flyBox);
  };

  const play = async S => {
    reset(S);
    // 1 — the sweet shop opens
    step('shop');
    await S.wait(300);
    owner.face('happy', 'open');
    await owner.wave(2, 'both');
    rider.face('happy', 'smile'); bg(rider.wave(1));
    await S.wait(300);
    // 2 — the customer orders, the phone rings, the shop accepts
    step('order');
    customer.face('happy', 'open').emote('heart', 800);
    await customer.jump(1, 16, 480);
    await fly(S, slip, [515, 230], [288, 104], 800, 60);
    hideFly(slip);
    phone.classList.add('on', 'ring');
    note.classList.add('on');
    await S.wait(1100);
    phone.classList.remove('ring');
    await fly(S, slip, [288, 104], [118, 200], 700, 40);
    hideFly(slip);
    owner.face('wide', 'o').emote('excl', 800);
    await owner.jump(1, 18, 480);
    owner.face('happy', 'open');
    counterBox.classList.add('on');
    await S.wait(700);
    // 3 — packed, onto the scooter, off it goes
    step('ride');
    note.classList.remove('on'); phone.classList.remove('on');
    counterBox.classList.remove('on');
    await fly(S, flyBox, [122, 234], crate(), 650, 50);
    hideFly(flyBox);
    rider.face('happy', 'open');
    await rigTo(S, 418, 2000);
    // 4 — at the door
    step('door');
    await fly(S, flyBox, crate(), [494, 262], 600, 40);
    hideFly(flyBox);
    heldBox.classList.add('on');
    stamp.classList.add('on');
    customer.face('happy', 'open').emote('heart', 1200);
    bg(rider.wave(2));
    bg(owner.wave(2, 'both'));
    await customer.jump(2, 22, 520);
    await S.wait(1300);
    // ride back for the next order
    stamp.classList.remove('on');
    rider.face('happy', 'smile');
    await rigTo(S, 262, 1500);
    rigDir(1);
    await S.wait(400);
  };

  let scope = null;
  const active = () => document.body.dataset.stage === 'intro' && !document.hidden;
  const run = async () => {
    for (;;) {
      if (!active()) { await PX.sleep(400); continue; }
      scope = new Scope();
      try { await play(scope); } catch (e) { if (!(e instanceof Cancel)) { console.error(e); await PX.sleep(1000); } }
    }
  };
  new MutationObserver(() => { if (!active() && scope) scope.kill(); }).observe(document.body, { attributes: true, attributeFilter: ['data-stage'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden && scope) scope.kill(); });
  run();
})();
