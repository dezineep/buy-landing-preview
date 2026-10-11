/* BUY pixel kit — the pixel doll + tiny world props.
   Every sprite lives on an integer grid (1 unit = 1 pixel-art cell) and is scaled with CSS,
   so motion and poses always snap to whole "pixels". */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const PAL = {
    cream: '#f4e8d8', chin: '#e5d5bf', red: '#a52226', dred: '#6f1418', ink: '#2a211c',
    blush: '#f2a0a4', white: '#ffffff', tear: '#7cc4ff', sweat: '#9fd8ff',
    navy: '#261f8e', navyD: '#17125c', amber: '#f2b233', amberD: '#c98512', amberL: '#ffd77a',
    box: '#e0a24a', boxD: '#a86a1d', boxL: '#f3dcae', gold: '#f2c14e', goldD: '#c48f1a',
  };

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.append(n);
    return n;
  };
  const div = (cls, parent, html) => {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    parent && parent.append(d);
    return d;
  };
  const svg = (w, h, cls) => el('svg', { viewBox: `0 0 ${w} ${h}`, 'shape-rendering': 'crispEdges', class: cls || '', 'aria-hidden': 'true' });
  // rect list → <rect>s in one colour
  const rects = (g, list, fill) => list.forEach(([x, y, w = 1, h = 1]) => el('rect', { x, y, width: w, height: h, fill }, g));
  // string map → merged row runs. pal maps chars to colours; '.' is empty
  const map = (g, rows, pal, ox = 0, oy = 0) => {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        const ch = row[x];
        if (!pal[ch]) { x++; continue; }
        let w = 1;
        while (row[x + w] === ch) w++;
        el('rect', { x: ox + x, y: oy + y, width: w, height: 1, fill: pal[ch] }, g);
        x += w;
      }
    });
  };

  /* ---------- cancellable timing ---------- */
  class Cancel extends Error {}
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // A scope hands out waits that reject once the scope is killed (chapter changes etc.)
  class Scope {
    constructor() { this.alive = true; this.timers = new Set(); }
    wait(ms) {
      return new Promise((res, rej) => {
        if (!this.alive) return rej(new Cancel());
        const t = setTimeout(() => { this.timers.delete(t); this.alive ? res() : rej(new Cancel()); }, ms);
        this.timers.add(t);
      });
    }
    every(ms, fn) { const t = setInterval(() => this.alive && fn(), ms); this.timers.add(t); return t; }
    kill() { this.alive = false; this.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); this.timers.clear(); }
  }

  /* ---------- emotes (little pixel icons above heads) ---------- */
  const EMOTES = {
    heart: { rows: ['.hh.hh.', 'hhhhhhh', 'hhhhhhh', '.hhhhh.', '..hhh..', '...h...'], pal: { h: '#e2464c' } },
    q: { rows: ['.qqq.', 'q...q', '....q', '..qq.', '..q..', '.....', '..q..'], pal: { q: '#3f4ee3' } },
    excl: { rows: ['ee', 'ee', 'ee', 'ee', '..', 'ee'], pal: { e: '#e2464c' } },
    anger: { rows: ['.a...a.', 'aa...aa', '.......', '.......', '.......', 'aa...aa', '.a...a.'], pal: { a: '#e2464c' } },
    spark: { rows: ['..s..', '..s..', 'sssss', '..s..', '..s..'], pal: { s: '#f2b233' } },
    dots: { rows: ['d.d.d'], pal: { d: '#6b6b6b' } },
    check: { rows: ['.....g', '....gg', 'g..gg.', 'gggg..', '.gg...'], pal: { g: '#01ae0f' } },
    note: { rows: ['..nnn', '..n.n', '..n.n', 'nnn.n', 'nn.nn'], pal: { n: '#a52226' } },
  };
  const emoteSvg = kind => {
    const e = EMOTES[kind];
    const w = Math.max(...e.rows.map(r => r.length)), h = e.rows.length;
    const s = svg(w, h, 'px-emote-svg');
    s.style.setProperty('--w', w); s.style.setProperty('--h', h);
    map(s, e.rows, e.pal);
    return s;
  };

  /* ---------- the doll ----------
     Grid is 22×22. It faces right (eyes sit right of centre), wears its tall cap on the left
     and carries the BUY bag in its left hand — straight from the reference sprite. */
  const DOLL = {
    body: [[6, 9, 10, 1], [5, 10, 12, 1], [4, 11, 14, 6], [5, 17, 12, 1]],
    chin: [[6, 18, 10, 1]],
    blush: [[9, 14], [17, 14]],
    cap: { line: [[5, 1, 4, 1], [4, 2, 1, 7], [9, 2], [10, 3, 1, 4], [11, 7, 1, 2]], fill: [[5, 2, 4, 1], [5, 3, 5, 4], [5, 7, 6, 2]] },
    helmet: { fill: [[8, 6, 6, 1], [6, 7, 10, 1], [5, 8, 12, 2], [5, 10, 8, 1]], dark: [[13, 10, 7, 1]], light: [[8, 7, 2, 1]] },
    bag: { dark: [[2, 13, 2, 1], [1, 14], [4, 14]], cream: [[2, 14, 2, 1]], fill: [[1, 15, 4, 4]], win: [[2, 16, 2, 1]] },
    crate: { dark: [[0, 10, 6, 7]], fill: [[1, 11, 4, 5]], tape: [[2, 10, 1, 7]] },
    eyes: {
      open: [[11, 11, 1, 4], [15, 11, 1, 4]],
      blink: [[10, 13, 3, 1], [14, 13, 3, 1]],
      happy: [[10, 13], [11, 12], [12, 13], [14, 13], [15, 12], [16, 13]],
      sad: [[11, 13, 1, 2], [15, 13, 1, 2], [10, 11], [11, 10], [15, 10], [16, 11]],
      angry: [[11, 12, 1, 3], [15, 12, 1, 3], [10, 10], [11, 11], [15, 11], [16, 10]],
      dizzy: [[10, 11], [12, 11], [11, 12], [10, 13], [12, 13], [14, 11], [16, 11], [15, 12], [14, 13], [16, 13]],
      wide: [[11, 10, 1, 5], [15, 10, 1, 5], [12, 10], [16, 10]],
      down: [[11, 12, 1, 3], [15, 12, 1, 3]],
    },
    mouth: {
      none: [],
      smile: [[12, 15], [13, 16], [14, 15]],
      open: [[12, 15, 3, 1], [13, 16]],
      o: [[13, 15], [13, 16]],
      frown: [[12, 16], [13, 15], [14, 16]],
      wobble: [[12, 16], [13, 15], [14, 16], [15, 15]],
    },
    armR: { rest: [[18, 14, 2, 2]], up: [[18, 12, 2, 2], [19, 10, 2, 2]], up2: [[18, 12, 2, 2], [18, 10, 2, 2]], out: [[18, 13, 3, 2]], none: [] },
    armL: { rest: [[2, 14, 2, 2]], up: [[2, 12, 2, 2], [1, 10, 2, 2]], up2: [[2, 12, 2, 2], [2, 10, 2, 2]], out: [[1, 13, 3, 2]], none: [] },
    legs: {
      stand: [[6, 19, 2, 3], [14, 19, 2, 3]],
      a: [[5, 19, 2, 3], [14, 19, 2, 2]],
      b: [[6, 19, 2, 2], [15, 19, 2, 3]],
      tuck: [[6, 19, 2, 2], [14, 19, 2, 2]],
      tapA: [[6, 19, 2, 3], [14, 19, 2, 2]],
      none: [],
    },
  };

  const frameSet = (parent, defs, fill, cls) => {
    const out = {};
    for (const k in defs) {
      const g = el('g', { class: cls, style: 'display:none' }, parent);
      rects(g, defs[k], fill);
      out[k] = g;
    }
    return out;
  };
  const showFrame = (set, key) => {
    for (const k in set) set[k].style.display = k === key ? '' : 'none';
  };

  class Doll {
    constructor(opts = {}) {
      this.o = Object.assign({ hat: 'cap', hatColor: PAL.red, prop: 'bag', propColor: PAL.red, size: 5, arms: null, label: '' }, opts);
      const o = this.o;
      this.root = div('px-doll');
      this.root.style.setProperty('--s', o.size);
      if (o.label) this.root.setAttribute('aria-label', o.label);
      this.shadow = div('px-doll-shadow', this.root);
      this.bob = div('px-doll-bob', this.root);
      this.flipper = div('px-doll-flip', this.bob);
      this.fx = div('px-doll-fx', this.root);
      const s = this.svg = svg(22, 22, 'px-doll-svg');
      this.flipper.append(s);

      const C = PAL;
      const back = el('g', {}, s);
      // left arm only when the hand is free
      const leftFree = o.prop !== 'bag';
      this.armLSet = leftFree ? frameSet(back, DOLL.armL, C.cream) : null;
      if (o.prop === 'crate') {
        const g = el('g', {}, back);
        rects(g, DOLL.crate.dark, PAL.boxD); rects(g, DOLL.crate.fill, PAL.box); rects(g, DOLL.crate.tape, PAL.boxL);
      }
      // hat behind the head
      if (o.hat === 'cap') {
        const g = this.hat = el('g', { class: 'px-hat' }, s);
        rects(g, DOLL.cap.line, C.cream);
        rects(g, DOLL.cap.fill, o.hatColor);
      }
      const body = el('g', {}, s);
      rects(body, DOLL.body, C.cream);
      rects(body, DOLL.chin, C.chin);
      this.legSet = frameSet(s, DOLL.legs, C.cream);
      this.blushG = el('g', {}, s); rects(this.blushG, DOLL.blush, C.blush);
      this.eyesG = el('g', { class: 'px-eyes' }, s);
      this.eyeSet = frameSet(this.eyesG, DOLL.eyes, C.ink);
      this.mouthSet = frameSet(this.eyesG, DOLL.mouth, C.ink);
      if (o.hat === 'helmet') {
        const g = this.hat = el('g', { class: 'px-hat' }, s);
        rects(g, DOLL.helmet.fill, o.hatColor || C.amber);
        rects(g, DOLL.helmet.dark, o.hatShade || C.amberD);
        rects(g, DOLL.helmet.light, C.amberL);
      }
      this.armRSet = frameSet(s, DOLL.armR, C.cream);
      if (o.prop === 'bag') {
        const g = this.bagG = el('g', {}, s);
        rects(g, DOLL.bag.dark, o.propDark || C.dred);
        rects(g, DOLL.bag.cream, C.cream);
        rects(g, DOLL.bag.fill, o.propColor);
        rects(g, DOLL.bag.win, C.white);
      }
      // sweat + tear layers
      this.sweatG = el('g', { class: 'px-sweat', style: 'display:none' }, s);
      rects(this.sweatG, [[19, 7], [18, 8, 2, 2]], C.sweat);
      this.tearG = el('g', { class: 'px-tears', style: 'display:none' }, s);
      rects(this.tearG, [[11, 15], [15, 15]], C.tear);

      this.x = 0; this.y = 0; this.dir = 1; this._face = 'open'; this.scope = null;
      this.reset();
      this._blink();
    }
    /* --- poses --- */
    face(name = 'open', mouth) {
      this._face = name;
      showFrame(this.eyeSet, name);
      if (mouth !== undefined) this.mouth(mouth);
      return this;
    }
    mouth(name = 'none') { showFrame(this.mouthSet, name); return this; }
    arm(name = 'rest', side = 'R') {
      if (side === 'R' || side === 'both') showFrame(this.armRSet, name);
      if ((side === 'L' || side === 'both') && this.armLSet) showFrame(this.armLSet, name);
      return this;
    }
    legs(name = 'stand') { showFrame(this.legSet, name); return this; }
    look(dx = 0, dy = 0) { this.eyesG.setAttribute('transform', `translate(${dx} ${dy})`); return this; }
    blush(on = true) { this.blushG.style.display = on ? '' : 'none'; return this; }
    sweat(on = true) { this.sweatG.style.display = on ? '' : 'none'; return this; }
    tears(on = true) { this.tearG.style.display = on ? '' : 'none'; return this; }
    reset() {
      this.face('open', 'none'); this.arm('rest', 'both'); this.legs('stand'); this.look(0, 0);
      this.sweat(false); this.tears(false); this.blush(true);
      this.root.classList.remove('is-shaking', 'is-tapping');
      this.fx.innerHTML = '';
      this.bob.getAnimations().forEach(a => a.cancel());
      return this;
    }
    _blink() {
      const loop = () => {
        setTimeout(() => {
          if (this._face === 'open') {
            showFrame(this.eyeSet, 'blink');
            setTimeout(() => { if (this._face === 'open') showFrame(this.eyeSet, 'open'); }, 130);
          }
          loop();
        }, 2200 + Math.random() * 2600);
      };
      loop();
    }
    /* --- placement --- */
    w() { return 22 * this.o.size; }
    place(x, y) {
      this.x = x; this.y = y;
      this.root.style.transform = `translate3d(${x - 11 * this.o.size}px, ${y - 22 * this.o.size}px, 0)`;
      return this;
    }
    at(x, y = this.y) { this.root.style.transition = 'none'; this.place(x, y); this.root.offsetWidth; return this; }
    setDir(d) { this.dir = d; this.flipper.style.transform = d < 0 ? 'scaleX(-1)' : ''; return this; }
    _wait(ms) { return this.scope ? this.scope.wait(ms) : sleep(ms); }
    async to(x, y = this.y, ms = 600, ease = 'cubic-bezier(.45,.05,.35,1)') {
      this.root.style.transition = `transform ${ms}ms ${ease}`;
      this.place(x, y);
      await this._wait(ms);
    }
    async walk(x, ms, y = this.y) {
      if (x !== this.x) this.setDir(x > this.x ? 1 : -1);
      let f = 0;
      const legT = setInterval(() => { this.legs(f++ % 2 ? 'a' : 'b'); this.bob.style.translate = f % 2 ? '0 -2px' : '0 0'; }, 150);
      try { await this.to(x, y, ms, 'linear'); }
      finally { clearInterval(legT); this.legs('stand'); this.bob.style.translate = ''; }
    }
    /* --- actions --- */
    async jump(n = 1, h = 34, dur = 560) {
      for (let i = 0; i < n; i++) {
        this.legs('tuck');
        this.bob.animate([
          { transform: 'translateY(0) scale(1,1)' },
          { transform: 'translateY(3px) scale(1.08,.9)', offset: .14 },
          { transform: `translateY(-${h}px) scale(.95,1.07)`, offset: .48, easing: 'cubic-bezier(.3,0,.6,1)' },
          { transform: 'translateY(0) scale(1.07,.93)', offset: .86 },
          { transform: 'translateY(0) scale(1,1)' },
        ], { duration: dur, easing: 'cubic-bezier(.33,.8,.5,1)' });
        this.shadow.animate([{ transform: 'scaleX(1)', opacity: 1 }, { transform: 'scaleX(.6)', opacity: .5, offset: .48 }, { transform: 'scaleX(1)', opacity: 1 }], { duration: dur });
        await this._wait(dur * .8);
        this.legs('stand');
        await this._wait(dur * .2 + 40);
      }
    }
    async wave(n = 3, side = 'R', speed = 190) {
      for (let i = 0; i < n * 2; i++) {
        this.arm(i % 2 ? 'up2' : 'up', side);
        await this._wait(speed);
      }
      this.arm('rest', side);
    }
    shake(on = true) { this.root.classList.toggle('is-shaking', on); return this; }
    tap(on = true) {
      clearInterval(this._tapT);
      if (on) { let f = 0; this._tapT = setInterval(() => this.legs(f++ % 2 ? 'tapA' : 'stand'), 220); }
      else this.legs('stand');
      return this;
    }
    emote(kind, ms = 1400) {
      const e = div('px-emote');
      e.append(emoteSvg(kind));
      this.fx.append(e);
      setTimeout(() => e.classList.add('out'), ms);
      setTimeout(() => e.remove(), ms + 400);
      return e;
    }
  }

  /* ---------- world props ---------- */
  const PROPS = {};
  // a shop front split in two layers so the owner can stand behind the counter
  PROPS.shop = () => {
    const back = svg(52, 46, 'px-prop');
    const C = { post: '#8a5a3b', wall: '#f7d6c6', wall2: '#efc3b0', shelf: '#b07a52', sign: '#a52226', signD: '#6f1418', aw: '#a52226', aw2: '#fff4e8', door: '#5e3a2c', doorF: '#8a5a3b' };
    rects(back, [[4, 13, 44, 33]], C.wall);
    rects(back, [[4, 13, 44, 2]], C.wall2);
    rects(back, [[2, 7, 2, 39], [48, 7, 2, 39]], C.post);
    // dark back doorway so the shopkeeper stands out
    rects(back, [[12, 16, 18, 20]], C.doorF);
    rects(back, [[13, 17, 16, 19]], C.door);
    rects(back, [[13, 17, 16, 1]], 'rgba(255,255,255,.08)');
    // shelves + goods either side of the doorway
    const goods = ['#e3b04b', '#6fa96f', '#d0574e', '#4f78c4', '#f2c14e', '#c9708f', '#7fb7c9', '#e07a1f'];
    [[21, 0], [29, 1]].forEach(([sy, k]) => {
      rects(back, [[5, sy, 6, 1], [32, sy, 14, 1]], C.shelf);
      [6, 8, 33, 36, 39, 42].forEach((x, i) => {
        const h = 2 + ((i * 7 + k * 3) % 3);
        rects(back, [[x, sy - h, 2, h]], goods[(i + k * 3) % goods.length]);
        rects(back, [[x, sy - h, 2, 1]], 'rgba(255,255,255,.35)');
      });
    });
    // fairy lights
    for (let i = 0; i < 11; i++) rects(back, [[6 + i * 4, 14 + (i % 2)]], ['#f2c14e', '#e2464c', '#7fb7c9'][i % 3]);
    // sign board
    rects(back, [[6, 0, 40, 7]], C.signD);
    rects(back, [[7, 1, 38, 5]], C.sign);
    // awning stripes + scallops
    for (let x = 0, i = 0; x < 52; x += 4, i++) {
      const c = i % 2 ? C.aw2 : C.aw;
      rects(back, [[x, 7, 4, 5], [x + 1, 12, 2, 1]], c);
    }
    rects(back, [[0, 7, 52, 1]], 'rgba(0,0,0,.12)');
    const front = svg(52, 46, 'px-prop');
    rects(front, [[3, 34, 46, 2]], '#8a5a3b');
    rects(front, [[4, 36, 44, 9]], '#c08a5f');
    rects(front, [[4, 36, 44, 1], [18, 37, 1, 8], [33, 37, 1, 8]], '#a87348');
    rects(front, [[3, 45, 46, 1]], '#8a5a3b');
    return { back, front };
  };
  PROPS.house = () => {
    const s = svg(50, 46, 'px-prop');
    rects(s, [[36, 1, 5, 8]], '#8a5a3b'); rects(s, [[35, 0, 7, 2]], '#6e4329');
    for (let r = 0; r < 13; r++) {
      const w = 12 + r * 3, x = Math.round(25 - w / 2);
      rects(s, [[x, r, w, 1]], r % 3 === 2 ? '#63231f' : '#7a2e2a');
    }
    rects(s, [[13, 0, 24, 1]], '#9c3d37');
    rects(s, [[3, 13, 44, 33]], '#fff3e6');
    rects(s, [[3, 13, 1, 33], [46, 13, 1, 33], [3, 13, 44, 1]], '#ead6bf');
    // window
    rects(s, [[7, 18, 13, 11]], '#d9c3a8'); rects(s, [[8, 19, 11, 9]], '#bfe3f5');
    rects(s, [[13, 19, 1, 9], [8, 23, 11, 1]], '#ffffff'); rects(s, [[9, 20, 2, 2]], 'rgba(255,255,255,.7)');
    rects(s, [[6, 29, 15, 2]], '#a52226');
    rects(s, [[7, 28], [10, 27], [13, 28], [16, 27], [19, 28]], '#e2464c');
    rects(s, [[8, 28], [11, 28], [14, 28], [17, 28]], '#6fa96f');
    // door
    rects(s, [[27, 21, 14, 25]], '#6f1418'); rects(s, [[28, 22, 12, 24]], '#a52226');
    rects(s, [[30, 24, 8, 8], [30, 34, 8, 9]], '#8d1c20');
    rects(s, [[37, 33]], '#f2c14e');
    rects(s, [[25, 45, 18, 1]], '#c9b8a6');
    rects(s, [[42, 24, 3, 2]], '#ffffff');
    return s;
  };
  PROPS.scooter = () => {
    const s = svg(34, 20, 'px-prop');
    // delivery box
    rects(s, [[0, 0, 11, 9]], PAL.boxD); rects(s, [[1, 1, 9, 7]], PAL.box); rects(s, [[5, 0, 1, 9]], PAL.boxL);
    // body
    rects(s, [[3, 11, 10, 1]], '#6f1418');
    rects(s, [[9, 9, 10, 2]], '#2a211c');
    rects(s, [[6, 11, 21, 4]], '#a52226');
    rects(s, [[6, 11, 21, 1]], '#c63a3e');
    rects(s, [[24, 3, 4, 10]], '#a52226'); rects(s, [[25, 3, 1, 9]], '#c63a3e');
    rects(s, [[25, 0, 5, 2]], '#2a211c'); rects(s, [[28, 4, 2, 2]], '#ffd75e');
    rects(s, [[12, 14, 11, 2]], '#6f1418');
    // wheels (hub drawn in its own group so it can spin)
    [[4, 14], [23, 14]].forEach(([x, y]) => {
      rects(s, [[x + 1, y, 5, 1], [x, y + 1, 7, 4], [x + 1, y + 5, 5, 1]], '#2a211c');
    });
    const hubs = el('g', { class: 'px-hubs' }, s);
    const hubA = el('g', {}, hubs), hubB = el('g', { style: 'display:none' }, hubs);
    [[4, 14], [23, 14]].forEach(([x, y]) => {
      rects(hubA, [[x + 2, y + 2, 3, 2]], '#b9b6c3'); rects(hubA, [[x + 3, y + 1, 1, 1]], '#b9b6c3');
      rects(hubB, [[x + 2, y + 2, 3, 2]], '#b9b6c3'); rects(hubB, [[x + 3, y + 4, 1, 1]], '#b9b6c3');
    });
    s._hubs = [hubA, hubB];
    return s;
  };
  PROPS.box = (sticker = false) => {
    const s = svg(10, 8, 'px-prop');
    rects(s, [[0, 0, 10, 8]], PAL.boxD); rects(s, [[1, 1, 8, 6]], PAL.box);
    rects(s, [[4, 0, 2, 8]], PAL.boxL); rects(s, [[1, 2, 3, 1], [6, 2, 3, 1]], '#cf8f3e');
    if (sticker) rects(s, [[6, 4, 3, 2]], '#a52226');
    return s;
  };
  PROPS.coin = () => {
    const s = svg(6, 6, 'px-prop');
    rects(s, [[1, 0, 4, 1], [0, 1, 6, 4], [1, 5, 4, 1]], PAL.goldD);
    rects(s, [[1, 1, 4, 4]], PAL.gold); rects(s, [[2, 2, 1, 2]], '#fff1b8');
    return s;
  };
  PROPS.cloud = (c = '#ffffff', c2 = 'rgba(0,0,0,.05)') => {
    const s = svg(24, 9, 'px-prop');
    rects(s, [[7, 0, 7, 2], [4, 2, 14, 2], [1, 4, 22, 3], [0, 7, 24, 2]], c);
    rects(s, [[0, 8, 24, 1]], c2);
    return s;
  };
  PROPS.sun = () => {
    const s = svg(18, 18, 'px-prop');
    rects(s, [[8, 0, 2, 2], [8, 16, 2, 2], [0, 8, 2, 2], [16, 8, 2, 2], [3, 3], [14, 3], [3, 14], [14, 14]], '#ffcf5a');
    rects(s, [[6, 4, 6, 1], [5, 5, 8, 1], [4, 6, 10, 6], [5, 12, 8, 1], [6, 13, 6, 1]], '#ffcf5a');
    rects(s, [[6, 6, 3, 2]], '#ffe9a3');
    return s;
  };
  PROPS.tree = () => {
    const s = svg(18, 26, 'px-prop');
    rects(s, [[8, 14, 2, 12]], '#8a5a3b');
    rects(s, [[5, 0, 8, 2], [2, 2, 14, 4], [0, 6, 18, 6], [2, 12, 14, 3], [5, 15, 8, 1]], '#6fa96f');
    rects(s, [[4, 3, 3, 2], [3, 7, 3, 2], [10, 5, 2, 2]], '#8cc48c');
    rects(s, [[2, 13, 14, 2]], '#5a9160');
    return s;
  };
  PROPS.lamp = () => {
    const s = svg(8, 40, 'px-prop');
    rects(s, [[3, 4, 2, 36]], '#4c4949'); rects(s, [[1, 0, 6, 4]], '#4c4949'); rects(s, [[2, 1, 4, 2]], '#ffe08a');
    rects(s, [[2, 38, 4, 2]], '#3c3c3c');
    return s;
  };
  PROPS.standee = () => {
    const s = svg(9, 12, 'px-prop');
    rects(s, [[0, 0, 9, 10]], '#2a211c'); rects(s, [[1, 1, 7, 8]], '#ffffff');
    rects(s, [[2, 2, 2, 2], [5, 2, 2, 2], [2, 5, 2, 2], [5, 6, 1, 1], [6, 5, 1, 1]], '#2a211c');
    rects(s, [[1, 7, 7, 2]], '#a52226');
    rects(s, [[3, 10, 3, 2]], '#2a211c');
    return s;
  };
  PROPS.bird = () => {
    const s = svg(7, 3, 'px-prop');
    rects(s, [[0, 0], [1, 1], [2, 2, 3, 1], [5, 1], [6, 0]], '#7d7891');
    return s;
  };

  window.PX = { PAL, el, div, svg, rects, map, Doll, PROPS, Scope, Cancel, sleep, emoteSvg };
})();
