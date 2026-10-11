/* Delivery scene — the live pixel sweet shop on the Experience page.
   Built from the PX kit (js/pixel.js): same dolls, same cell grid, same palette as the landing-page story.

   DeliveryScene.create(viewEl, { speed })  → scene
     viewEl is a 16:9 box; a 1280×360 world lives inside it and a 640-wide camera pans across it:
       x 0…556    the shop, cut away: kitchen (halwai + kadhai), counter (owner + tray), packing counter
       x 556…1280 the street: awning, lamp, tree, the customer's house
     Every beat is async and takes a PX.Scope (kill the scope to cancel):
       receive(S, order) → prepare(S, order) → pack(S) → pickup(S) → ride(S) → door(S) → forward(S)
       … OTP happens on the page …  handover(S) → outro(S)
     helpers: reset(), pose('center' | { band }), sayBig(html), puzzled(), layout(), hasFront()
   DeliveryScene.icon(name, cls) → pixel icon <svg> markup (ticket, kadhai, box, scooter, house, check, shop, bell, otp) */
(() => {
  if (!window.PX) return;
  const { div, svg, rects, map, Doll, PROPS, PAL, emoteSvg } = PX;
  const W = 1280, H = 360, VW = 640;
  const BACK = 252;                       // feet line for people standing behind counters
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- tiny helpers ---------- */
  const put = (parent, node, x, y, w, h, cls = '') => {
    const d = div('ds-o ' + cls, parent);
    Object.assign(d.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    node && d.append(node);
    return d;
  };
  const art = (rows, pal) => { const w = Math.max(...rows.map(r => r.length)); const s = svg(w, rows.length); map(s, rows, pal); return s; };
  const g = (parent, cls) => { const n = document.createElementNS(NS, 'g'); if (cls) n.setAttribute('class', cls); parent.append(n); return n; };

  /* ---------- pixel icons (HTML strings, used by the page UI) ---------- */
  const ICONS = {
    ticket: { rows: ['.kkkkkkkkk.', '.kwwwwwwwk.', '.kwrrrrrwk.', '.kwwwwwwwk.', '.kwkkkkwwk.', '.kwwwwwwwk.', '.kwkkkwwwk.', '.kwwwwwwwk.', '.kwkkkkkwk.', '.kwwwwwwwk.', '.kwkwkwkwk.', '.k.k.k.k.k.'], pal: { k: '#2a211c', w: '#ffffff', r: '#a52226' } },
    kadhai: { rows: ['...s..s..s..', '..s..s..s...', '...s..s..s..', '............', 'hh........hh', '.kkkkkkkkkk.', '.kobooboobk.', '..kkkkkkkk..', '...kkkkkk...', '............', '...f..f..f..', '..fyffyffyf.'], pal: { s: '#b9b6c3', h: '#6b6b75', k: '#33333d', o: '#e8a33c', b: '#7a3418', f: '#e2464c', y: '#f2b233' } },
    box: { rows: ['............', '.DDDDDDDDDD.', '.DLLLttLLLD.', '.DDDDttDDDD.', '.DbbbttbbbD.', '.DbbbttbbbD.', '.DbbbttbrrD.', '.DbbbttbrrD.', '.DbbbttbbbD.', '.DDDDDDDDDD.'], pal: { D: '#a86a1d', b: '#e0a24a', L: '#f0b65c', t: '#f6e7c4', r: '#a52226' } },
    scooter: { rows: ['..........kk..', '...........k..', '.dd........k..', '.dbbd.....rr..', '.dbbd.krrrrr..', '..rrrrrrrrrr..', '.rrrrrrrrrrrr.', '.kk.......kk..', 'kggk.....kggk.', '.kk.......kk..'], pal: { d: '#a86a1d', b: '#e0a24a', r: '#a52226', k: '#2a211c', g: '#b9b6c3' } },
    house: { rows: ['.....rr.....', '....rrrr....', '...rrrrrr...', '..rrrrrrrr..', '.rrrrrrrrrr.', 'rrrrrrrrrrrr', '.cccccccccc.', '.cwwcccddcc.', '.cwwcccddcc.', '.ccccccddcc.', '.ccccccdycc.', '.ccccccddcc.'], pal: { r: '#7a2e2a', c: '#f1d2b4', w: '#7fb7c9', d: '#a52226', y: '#f2c14e' } },
    check: { rows: ['.....g', '....gg', 'g..gg.', 'gggg..', '.gg...'], pal: { g: '#01ae0f' } },
    checkw: { rows: ['.....g', '....gg', 'g..gg.', 'gggg..', '.gg...'], pal: { g: '#ffffff' } },
    shop: { rows: ['rwrwrwrwrwrw', 'rwrwrwrwrwrw', '.r.r.r.r.r.r', '.pppppppppp.', '.pkkpppyyyp.', '.pkkpppyyyp.', '.pkkppppppp.', '.pkkbbbbbbp.', '.pppppppppp.'], pal: { r: '#a52226', w: '#fff4e8', p: '#f1d2b4', k: '#5e3a2c', y: '#7fb7c9', b: '#8a5a3b' } },
    bell: { rows: ['....kk....', '...kyyk...', '..kyyyyk..', '..kyyyyk..', '.kyyyyyyk.', '.kyyyyyyk.', 'kyyyyyyyyk', 'kkkkkkkkkk', '....kk....'], pal: { k: '#2a211c', y: '#f2b233' } },
    otp: { rows: ['kkkkkkkkkkkk', 'kwwwwwwwwwwk', 'kwkwkwkwkwwk', 'kwwwwwwwwwwk', 'kkkkkkkkkkkk'], pal: { k: '#2a211c', w: '#ffffff' } },
    eye: { rows: ['...kkkkk...', '.kk.....kk.', 'k...kkk...k', 'k..kkkkk..k', 'k...kkk...k', '.kk.....kk.', '...kkkkk...'], pal: { k: 'currentColor' } },
  };
  const icon = (name, cls = '') => {
    const ic = ICONS[name]; if (!ic) return '';
    const h = ic.rows.length, w = Math.max(...ic.rows.map(r => r.length));
    let out = '';
    ic.rows.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        const ch = row[x];
        if (!ic.pal[ch]) { x++; continue; }
        let n = 1; while (row[x + n] === ch) n++;
        out += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${ic.pal[ch]}"/>`;
        x += n;
      }
    });
    return `<svg class="pxi ${cls}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true" style="aspect-ratio:${w}/${h}">${out}</svg>`;
  };

  /* ---------- sweets (one sprite per product id; 9×6 cells) ---------- */
  const BOWL = { r: '#f1f1f6', s: '#c4c4d0', d: '#9a9aaa' };
  const ballRows = ['.Bb.Bb.Bb', '.bbybbybb', 'rrrrrrrrr', '.sssssss.', '..sssss..', '...ddd...'];
  const SWEET = {
    gj: { rows: ballRows, pal: { ...BOWL, B: '#b25a2e', b: '#6b2a14', y: '#e8a33c' } },
    rg: { rows: ballRows, pal: { ...BOWL, B: '#ffffff', b: '#e8dcc0', y: '#f3e2b0' } },
    rb: { rows: ballRows, pal: { ...BOWL, B: '#ffe08a', b: '#f2a51e', y: '#f6c35c' } },
    ld: { rows: ballRows, pal: { ...BOWL, B: '#ffd07a', b: '#f0a032', y: '#f0a032' } },
    mp: { rows: ['YYYY.YYYY', 'yyyp.ypyy', 'ypyy.yyyp', 'yyyy.yyyy', 'rrrrrrrrr', '.sssssss.'], pal: { ...BOWL, Y: '#ffe08a', y: '#f2b233', p: '#c98512' } },
    ml: { rows: ['..gccg...', '.OcccccO.', 'oOoOoOoOo', 'ooooooooo', 'rrrrrrrrr', '.sssssss.'], pal: { ...BOWL, c: '#fff4dc', g: '#6fa96f', O: '#f0b04a', o: '#c9761c' } },
    mb: { rows: ['kkkkkkkkk', 'kpkgkokwk', 'kokwkpkgk', 'RRRRRRRRR', 'RRRYYYRRR', 'RRRRRRRRR'], pal: { k: '#6f1418', p: '#f2a0a4', g: '#8cc48c', o: '#f0a032', w: '#fbfbf7', R: '#a52226', Y: '#f2c14e' } },
    gift: { rows: ['.........', '..v...v..', '.vVv.vVv.', '..v...v..', 'rrrrrrrrr', '.sssssss.'], pal: { ...BOWL, v: '#d9c29a', V: '#f7f3ea' } },
  };
  const sweet = pid => { const d = SWEET[pid] || SWEET.ld; return art(d.rows, d.pal); };

  /* ---------- shop interior art ---------- */
  const jar = (s, x, b, fill, dot) => {
    const y = b - 6;
    rects(s, [[x + 1, y, 3, 1]], '#a52226');
    rects(s, [[x, y + 1, 5, 5]], '#cfe6ea');
    rects(s, [[x + 1, y + 2, 3, 4]], fill);
    rects(s, [[x + 1, y + 2, 1, 1], [x + 3, y + 4, 1, 1]], dot);
    rects(s, [[x, y + 1, 1, 3]], 'rgba(255,255,255,.7)');
  };
  const pyramid = (s, x, b) => {
    rects(s, [[x, b - 1, 10, 1]], '#c9c9d6');
    [[4, 0], [3, 1], [2, 2], [1, 3]].forEach(([n, r]) => {
      for (let i = 0; i < n; i++) {
        const bx = x + 1 + r + i * 2, by = b - 3 - r * 2;
        rects(s, [[bx, by, 2, 2]], '#f0a032'); rects(s, [[bx, by, 1, 1]], '#ffd07a'); rects(s, [[bx + 1, by + 1, 1, 1]], '#c97a1c');
      }
    });
  };
  const boxStack = (s, x, b, n) => {
    const cols = [['#a52226', '#6f1418'], ['#f2a0a4', '#c9708f'], ['#a52226', '#6f1418']];
    for (let i = 0; i < n; i++) {
      const y = b - 3 * (i + 1), c = cols[i % cols.length], dx = i % 2;
      rects(s, [[x + dx, y, 9, 3]], c[0]); rects(s, [[x + dx, y, 9, 1]], c[1]); rects(s, [[x + dx + 4, y, 1, 3]], '#f2c14e');
    }
  };
  const diya = (s, x, b) => { rects(s, [[x, b - 2, 3, 2]], '#c98512'); rects(s, [[x + 1, b - 2, 1, 1]], '#f6cf6e'); rects(s, [[x + 1, b - 4, 1, 2]], '#f2b233'); rects(s, [[x + 1, b - 4, 1, 1]], '#e2464c'); };
  const LET = { B: ['bb.', 'b.b', 'bb.', 'b.b', 'bb.'], U: ['b.b', 'b.b', 'b.b', 'b.b', 'bbb'], Y: ['b.b', 'b.b', '.b.', '.b.', '.b.'] };
  const wallArt = () => {
    const s = svg(140, 61, 'ds-svg');
    rects(s, [[0, 0, 140, 61]], '#fde3d4');
    for (let x = 2; x < 140; x += 6) rects(s, [[x, 7, 1, 37]], '#f9d8c6');
    for (let x = 5; x < 140; x += 12) for (let y = 12; y < 42; y += 8) rects(s, [[x, y, 1, 1]], '#f2c0a9');
    rects(s, [[0, 0, 140, 3]], '#7a4a30'); rects(s, [[0, 3, 140, 1]], '#a8744f');
    rects(s, [[0, 5, 140, 1]], '#d9b39a');
    for (let i = 0; i < 28; i++) rects(s, [[2 + i * 5, 6, 1, 1]], ['#f2c14e', '#e2464c', '#7fb7c9', '#6fa96f'][i % 4]);
    // kitchen: tiled backsplash + utensil rail
    rects(s, [[2, 24, 36, 20]], '#d3ebea');
    for (let x = 2; x <= 38; x += 4) rects(s, [[x, 24, 1, 20]], '#b5d8d6');
    for (let y = 24; y <= 44; y += 4) rects(s, [[2, y, 37, 1]], '#b5d8d6');
    rects(s, [[5, 19, 31, 1]], '#6b6b75'); rects(s, [[5, 18, 1, 2], [35, 18, 1, 2]], '#55555f');
    rects(s, [[9, 20, 1, 4]], '#9a9aa6'); rects(s, [[8, 24, 3, 2]], '#7d7d8a');
    rects(s, [[16, 20, 1, 2], [21, 20, 1, 2]], '#55555f'); rects(s, [[15, 22, 8, 1], [16, 23, 6, 1], [17, 24, 4, 1]], '#3f3f49');
    rects(s, [[28, 20, 1, 3]], '#9a9aa6'); rects(s, [[27, 23, 3, 3]], '#7d7d8a'); rects(s, [[28, 24, 1, 1]], '#d3ebea');
    // clock
    rects(s, [[45, 26, 5, 1], [44, 27, 7, 5], [45, 32, 5, 1]], '#7a4a30');
    rects(s, [[45, 27, 5, 5]], '#fffaf0');
    rects(s, [[47, 28, 1, 2], [48, 29, 1, 1]], '#2a211c');
    // shelves behind the counter
    rects(s, [[57, 24, 48, 1], [57, 35, 48, 1]], '#a8744f');
    rects(s, [[57, 25, 48, 1], [57, 36, 48, 1]], 'rgba(122,74,48,.3)');
    jar(s, 59, 24, '#f0a032', '#ffd07a'); jar(s, 65, 24, '#fbfbf7', '#e3dccb'); jar(s, 71, 24, '#8cc48c', '#c4e3c4');
    pyramid(s, 79, 24);
    jar(s, 91, 24, '#f2a0a4', '#fde0e1'); jar(s, 97, 24, '#f2b233', '#c98512');
    boxStack(s, 59, 35, 3);
    jar(s, 72, 35, '#c9761c', '#f0b04a'); jar(s, 78, 35, '#fbfbf7', '#f2a0a4');
    diya(s, 86, 35); diya(s, 91, 35); diya(s, 96, 35);
    // BUY poster above the packing counter
    rects(s, [[108, 13, 18, 23]], '#2a211c'); rects(s, [[109, 14, 16, 21]], '#ffffff');
    rects(s, [[109, 14, 16, 8]], '#a52226');
    ['B', 'U', 'Y'].forEach((L, i) => map(s, LET[L], { b: '#ffffff' }, 112 + i * 4, 15));
    const qr = ['kkk.k.kkk', 'k.k..kk.k', 'kkk.k.kkk', '...kk.k..', 'k.kk.k.kk', '.k..kkk..', 'kkk.k..k.', 'k.k.kk.kk', 'kkk..k.k.'];
    map(s, qr, { k: '#2a211c' }, 113, 24);
    // wainscot
    rects(s, [[0, 44, 140, 17]], '#e4a58b'); rects(s, [[0, 44, 140, 1]], '#c98468');
    for (let x = 6; x < 140; x += 12) rects(s, [[x, 46, 1, 15]], '#d79479');
    return s;
  };
  const stoveArt = () => {
    const s = svg(28, 12, 'ds-svg');
    rects(s, [[0, 0, 28, 12]], '#b4553d');
    for (let y = 2; y < 12; y += 3) rects(s, [[0, y, 28, 1]], '#8f3d2a');
    for (let r = 0; r < 4; r++) for (let x = (r % 2) * 3 + 2; x < 28; x += 6) rects(s, [[x, r * 3, 1, 2]], '#8f3d2a');
    rects(s, [[0, 0, 28, 1]], '#d07055');
    rects(s, [[9, 4, 10, 8]], '#2a1510');
    const a = g(s, 'ds-fl a'), b = g(s, 'ds-fl b');
    rects(a, [[10, 8, 2, 4], [13, 7, 2, 5], [16, 8, 2, 4]], '#e2464c'); rects(a, [[10, 10, 1, 2], [13, 9, 2, 3], [16, 10, 1, 2]], '#f2b233'); rects(a, [[14, 10, 1, 2]], '#ffe08a');
    rects(b, [[10, 7, 2, 5], [13, 8, 2, 4], [16, 7, 2, 5]], '#e2464c'); rects(b, [[11, 9, 1, 3], [13, 10, 2, 2], [17, 9, 1, 3]], '#f2b233'); rects(b, [[11, 10, 1, 2]], '#ffe08a');
    return s;
  };
  const kadhaiArt = () => {
    const s = svg(30, 8, 'ds-svg');
    map(s, ['', '', 'hh..' + 'k'.repeat(22) + '..hh', '.hk' + 'o'.repeat(24) + 'kh.', '..' + 'k'.repeat(26) + '..', '...llll' + 'm'.repeat(20) + '...', '.....' + 'm'.repeat(20) + '.....', '........' + 'k'.repeat(14) + '........'],
      { h: '#6b6b75', k: '#33333d', o: '#e8a33c', m: '#4a4a55', l: '#6e6e7a' });
    [6, 11, 16, 21].forEach((x, i) => {
      const b = g(s, 'ds-ball'); b.style.animationDelay = (-i * .23) + 's';
      rects(b, [[x, 2, 2, 2]], '#6b2a14'); rects(b, [[x, 2, 1, 1]], '#b25a2e');
    });
    return s;
  };
  const jharaArt = () => {
    const s = svg(7, 6, 'ds-svg');
    rects(s, [[0, 0, 1, 1], [1, 1, 1, 1], [2, 2, 1, 1], [3, 3, 1, 1]], '#8a5a3b');
    rects(s, [[3, 4, 4, 2]], '#9a9aa6'); rects(s, [[4, 4, 1, 1], [6, 5, 1, 1]], '#55555f');
    return s;
  };
  const potArt = () => {
    const s = svg(12, 10, 'ds-svg');
    map(s, ['..bbbbbbbb..', '.bssssssssb.', 'bBBBBBBBBBBb', 'bBLBBBBBBBBb', 'bBLBBBBBBBBb', 'bBBBBBBBBBBb', 'bBBBBBBBBBBb', '.bBBBBBBBBb.', '..bbbbbbbb..', '...dddddd...'],
      { b: '#9a640e', B: '#e0a23a', L: '#f6cf6e', s: '#c0621f', d: '#7a4a30' });
    const balls = [3, 5, 7].map(x => { const b = g(s, 'ds-pball'); rects(b, [[x, 0, 2, 2]], '#6b2a14'); rects(b, [[x, 0, 1, 1]], '#b25a2e'); return b; });
    s._balls = balls;
    return s;
  };
  const counterArt = () => {
    const s = svg(48, 15, 'ds-svg');
    rects(s, [[0, 0, 48, 2]], '#8a5a3b'); rects(s, [[0, 0, 48, 1]], '#b07a52');
    rects(s, [[1, 2, 46, 10]], '#7a4a30');
    rects(s, [[2, 3, 44, 8]], '#e6f4f6');
    rects(s, [[2, 7, 44, 1]], '#c9c9d6');
    const lad = (x, y) => { rects(s, [[x, y, 2, 2]], '#f0a032'); rects(s, [[x, y, 1, 1]], '#ffd07a'); };
    const bar = (x, y) => { rects(s, [[x, y, 3, 1]], '#eef6e6'); rects(s, [[x, y + 1, 3, 1]], '#8cc48c'); };
    const jal = (x, y) => { rects(s, [[x, y, 1, 1], [x + 2, y, 1, 1], [x + 1, y + 1, 1, 1], [x + 3, y + 1, 1, 1]], '#f08a24'); rects(s, [[x + 1, y, 1, 1], [x + 2, y + 1, 1, 1]], '#ffb347'); };
    const kaju = (x, y) => { rects(s, [[x + 1, y, 1, 1], [x, y + 1, 3, 1]], '#e6d3b0'); rects(s, [[x + 1, y, 1, 1]], '#fbf6ec'); };
    const ras = (x, y) => { rects(s, [[x, y, 2, 2]], '#fbfbf7'); rects(s, [[x + 1, y + 1, 1, 1]], '#e3dccb'); };
    [4, 6, 8].forEach(x => lad(x, 5)); [12, 16].forEach(x => bar(x, 5)); jal(21, 5); jal(26, 5); [31, 34, 37].forEach(x => kaju(x, 5)); [41, 43].forEach(x => ras(x, 5));
    [4, 7].forEach(x => ras(x, 9)); [11, 15, 19].forEach(x => kaju(x, 9)); jal(23, 9); [29, 31, 33].forEach(x => lad(x, 9)); [37, 41].forEach(x => bar(x, 9));
    rects(s, [[3, 3, 1, 3], [4, 3, 1, 1]], 'rgba(255,255,255,.95)');
    rects(s, [[0, 12, 48, 3]], '#6e4329'); rects(s, [[0, 12, 48, 1]], '#8a5a3b');
    return s;
  };
  const trayArt = () => { const s = svg(28, 2, 'ds-svg'); rects(s, [[0, 0, 28, 1]], '#e2e2ea'); rects(s, [[1, 1, 26, 1]], '#a9a9b6'); return s; };
  const tabletArt = () => {
    const s = svg(6, 6, 'ds-svg');
    rects(s, [[0, 0, 6, 5]], '#2a211c');
    const scr = document.createElementNS(NS, 'rect');
    Object.entries({ x: 1, y: 1, width: 4, height: 3, fill: '#7fb7c9', class: 'ds-scr' }).forEach(([k, v]) => scr.setAttribute(k, v));
    s.append(scr);
    rects(s, [[2, 2, 2, 1]], 'rgba(255,255,255,.75)');
    rects(s, [[2, 5, 2, 1]], '#2a211c');
    return s;
  };
  const packArt = () => {
    const s = svg(26, 15, 'ds-svg');
    rects(s, [[0, 0, 26, 2]], '#b07a52'); rects(s, [[0, 0, 26, 1]], '#c8946a');
    rects(s, [[1, 2, 24, 12]], '#c08a5f');
    rects(s, [[2, 4, 22, 9]], '#9c6a40');
    rects(s, [[3, 9, 10, 4]], '#e0a24a'); rects(s, [[3, 9, 10, 1]], '#f3dcae'); rects(s, [[3, 11, 10, 1]], '#c98a3a');
    rects(s, [[15, 10, 3, 3]], '#f3dcae'); rects(s, [[16, 11, 1, 1]], '#9c6a40');
    rects(s, [[19, 8, 4, 5]], '#a52226'); rects(s, [[19, 8, 4, 1]], '#c63a3e');
    rects(s, [[0, 14, 26, 1]], '#6e4329');
    return s;
  };
  const dispenserArt = () => { const s = svg(5, 3, 'ds-svg'); rects(s, [[0, 1, 5, 2]], '#a52226'); rects(s, [[1, 0, 3, 2]], '#f3dcae'); rects(s, [[2, 1, 1, 1]], '#a52226'); return s; };
  // the parcel: open / closed lid, tape, order tag
  const parcelArt = () => {
    const s = svg(16, 12, 'ds-svg');
    const body = g(s);
    const face = '.DL' + 'b'.repeat(11) + 'D.';
    map(body, ['', '', '', '', '', face, face, face, face, face, face, '.' + 'D'.repeat(14) + '.'],
      { D: '#a86a1d', b: '#e0a24a', L: '#f3dcae' });
    const open = g(s, 'ds-p-open');
    map(open, ['ff............ff', 'fFf..........fFf', '.fFf........fFf.', '.D' + 'k'.repeat(12) + 'D.', '.D' + 'k'.repeat(12) + 'D.'], { f: '#a86a1d', F: '#e0a24a', D: '#a86a1d', k: '#6b3f12' });
    const shut = g(s, 'ds-p-shut');
    map(shut, ['', '', '.' + 'D'.repeat(14) + '.', '.DLLLLLDDLLLLLD.', '.DLLLLLDDLLLLLD.'], { D: '#a86a1d', L: '#f0b65c' });
    const tape = g(s, 'ds-p-tape'); rects(tape, [[7, 2, 2, 10]], '#f6e7c4'); rects(tape, [[7, 2, 2, 1]], '#fff6dc');
    const tag = g(s, 'ds-p-tag'); rects(tag, [[10, 6, 4, 3]], '#a52226'); rects(tag, [[11, 7, 2, 1]], '#ffffff'); rects(tag, [[3, 7, 3, 3]], '#ffffff'); rects(tag, [[3, 8, 3, 1]], '#c9c9d6');
    return s;
  };
  const facadeArt = () => {
    const s = svg(6, 79, 'ds-svg');
    rects(s, [[0, 0, 6, 79]], '#c9705a');
    for (let y = 2; y < 79; y += 3) rects(s, [[0, y, 6, 1]], '#a85a46');
    for (let r = 0; r < 27; r++) rects(s, [[r % 2 ? 1 : 4, r * 3, 1, 2]], '#a85a46');
    rects(s, [[0, 42, 6, 16]], '#fff1e8');
    rects(s, [[0, 41, 6, 1]], '#7a4a30'); rects(s, [[0, 58, 6, 2]], '#8a5a3b'); rects(s, [[0, 58, 6, 1]], '#b07a52');
    return s;
  };
  const awningArt = () => {
    const s = svg(18, 6, 'ds-svg');
    for (let x = 0, i = 0; x < 18; x += 3, i++) rects(s, [[x, 0, 3, 4], [x + 1, 4, 1, 1]], i % 2 ? '#fff4e8' : '#a52226');
    rects(s, [[0, 0, 18, 1]], '#6f1418');
    return s;
  };
  const bushArt = () => {
    const s = svg(14, 6, 'ds-svg');
    rects(s, [[2, 0, 4, 1], [8, 0, 4, 1], [1, 1, 12, 1], [0, 2, 14, 4]], '#5a9160');
    rects(s, [[3, 1, 2, 1], [9, 1, 2, 1], [2, 2, 3, 1]], '#7fb87f');
    rects(s, [[4, 3, 1, 1], [10, 4, 1, 1], [7, 2, 1, 1]], '#e2464c');
    return s;
  };
  const doorOpenArt = () => { const s = svg(12, 24, 'ds-svg'); rects(s, [[0, 0, 12, 24]], '#3a2620'); rects(s, [[0, 0, 12, 1]], '#2a1a14'); rects(s, [[8, 2, 3, 22]], 'rgba(255,215,140,.28)'); return s; };

  /* ---------- the scene ---------- */
  function create(view, opts = {}) {
    let sp = opts.speed || 1;
    const T = ms => ms / sp;
    view.classList.add('ds-view');
    const world = div('ds-world', view);
    const front = div('ds-front', view);

    // backdrop
    div('ds-sky', world);
    put(world, PROPS.sun(), 1166, 22, 72, 72, 'ds-sun');
    put(world, PROPS.cloud(), 690, 34, 96, 36, 'ds-cloud c1');
    put(world, PROPS.cloud(), 930, 70, 72, 27, 'ds-cloud c2');
    put(world, PROPS.cloud(), 1080, 18, 84, 32, 'ds-cloud c3');
    const birds = div('ds-birds', world);
    [[0, 0], [22, 8], [44, 2]].forEach(([x, y]) => put(birds, PROPS.bird(), x, y, 21, 9));
    put(world, wallArt(), 0, 0, 560, 244);
    const sign = div('ds-sign', world, '<span>Madhuram Sweets</span>');
    div('ds-floor', world); div('ds-road', world); div('ds-walk', world);

    // street props
    put(world, PROPS.lamp(), 690, 140, 32, 160);
    put(world, PROPS.tree(), 800, 196, 72, 104);
    put(world, bushArt(), 878, 276, 56, 24);
    put(world, PROPS.house(), 1020, 116, 200, 184);
    const doorOpen = put(world, doorOpenArt(), 1132, 204, 48, 96, 'ds-door');
    put(world, bushArt(), 1222, 276, 56, 24);

    // kitchen: halwai behind the kadhai, a brass pot of syrup, steam
    const pot = potArt(); put(world, pot, 168, 260, 48, 40);
    const halwai = new Doll({ hat: 'cap', hatColor: '#ffffff', prop: null, size: 4, label: 'Halwai' });
    world.append(halwai.root); halwai.legs('none').arm('out').place(76, BACK - 2);
    put(world, stoveArt(), 40, 252, 112, 48);
    put(world, kadhaiArt(), 36, 228, 120, 32);
    put(world, jharaArt(), 108, 212, 28, 24, 'ds-jhara');
    const steam = div('ds-steam', world);
    for (let i = 0; i < 8; i++) { const p = div('', steam); p.style.left = ((i * 23) % 64) + 'px'; p.style.animationDelay = (-i * .33) + 's'; }

    // counter + owner
    const owner = new Doll({ hat: 'cap', hatColor: PAL.navy, prop: null, size: 4, label: 'Shop owner' });
    world.append(owner.root);
    put(world, counterArt(), 224, 240, 192, 60);
    put(world, trayArt(), 232, 232, 112, 8);
    const trayLayer = div('ds-tray', world);
    const tablet = put(world, tabletArt(), 346, 216, 24, 24, 'ds-tab');
    put(world, packArt(), 428, 240, 104, 60);
    put(world, dispenserArt(), 512, 228, 20, 12);
    const parcel = parcelArt();
    const parcelEl = put(world, parcel, 436, 192, 64, 48, 'ds-parcel');

    // shop front
    put(world, facadeArt(), 556, 0, 24, 316);
    put(world, awningArt(), 580, 150, 72, 24);

    // the customer's door + people outside
    const cust = new Doll({ size: 4, prop: 'crate', label: 'Customer' });
    world.append(cust.root); cust.root.classList.add('ds-hide');
    const walker = new Doll({ hat: 'helmet', prop: 'crate', size: 4, label: 'Delivery partner' });
    const walkerFree = new Doll({ hat: 'helmet', prop: null, size: 4 });
    world.append(walker.root, walkerFree.root);

    // the delivery rig (scooter + rider) — same build as the landing-page story
    const rig = div('ds-rig', world);
    const rigFlip = div('ds-rig-flip', rig);
    const scooter = PROPS.scooter();
    put(rigFlip, scooter, 0, 50, 136, 80);
    const rider = new Doll({ hat: 'helmet', prop: null, size: 4 });
    rider.legs('none'); rigFlip.append(rider.root); rider.place(56, 98);
    const puffs = div('ds-puffs', rig);
    const rigS = { x: -300, dir: 1 };
    const rigPlace = (x, ms = 0, ease = 'cubic-bezier(.4,.1,.3,1)') => { rigS.x = x; rig.style.transition = ms ? `transform ${ms}ms ${ease}` : 'none'; rig.style.transform = `translate3d(${x - 68}px, 226px, 0)`; };
    const rigDir = d => { rigS.dir = d; rigFlip.style.transform = d < 0 ? 'scaleX(-1)' : ''; };

    // UI layer: bubbles, ticket, flying things (counter-scaled so text stays readable)
    const ui = div('ds-ui', world);
    const B = {};
    const bubble = (name, cls = 'bub') => { const o = div('ds-it ' + cls, ui); const i = div('ds-in', o); B[name] = { o, i }; return B[name]; };
    ['owner', 'halwai', 'rider', 'walker', 'cust', 'stamp'].forEach(n => bubble(n));
    bubble('ticket', 'ticket');
    const at = (name, x, y) => { B[name].o.style.left = x + 'px'; B[name].o.style.top = y + 'px'; };
    const say = (name, html, ms) => { const b = B[name]; if (html != null) b.i.innerHTML = html; b.o.classList.add('on'); clearTimeout(b.t); if (ms) b.t = setTimeout(() => b.o.classList.remove('on'), T(ms)); };
    const hush = (...names) => names.forEach(n => { clearTimeout(B[n].t); B[n].o.classList.remove('on'); });
    const flyBox = put(ui, PROPS.box(true), 0, 0, 40, 32, 'ds-fly');

    // front layer: the rider who walks up to the screen
    const dim = div('ds-dim', front);
    const bigWrap = div('ds-big', front);
    const big = new Doll({ hat: 'helmet', prop: null, size: 8, label: 'Suresh, your delivery partner' });
    bigWrap.append(big.root);
    const bigBox = put(big.bob, PROPS.box(true), 0, 0, 0, 0, 'ds-bigbox');
    const bigSay = div('ds-say', front);
    const fx = div('ds-fx', front);

    /* ----- camera ----- */
    let camX = 0, camRaf = 0, ws = 1;
    const layout = () => {
      const vw = view.clientWidth, vh = view.clientHeight;
      if (!vw || !vh) return;
      ws = Math.max(vw / VW, vh / H);
      const ty = vh - H * ws;
      world.style.transform = `translate3d(${(-camX * ws).toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${ws.toFixed(5)})`;
      const ui = Math.min(1.05, Math.max(.8, ws));
      world.style.setProperty('--inv', (ui / ws).toFixed(4));
      view.classList.toggle('ds-small', vw < 260);
    };
    const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const camTo = (x, ms = 0) => {
      cancelAnimationFrame(camRaf);
      if (!ms) { camX = x; layout(); return; }
      const x0 = camX, t0 = performance.now();
      const step = now => { const t = Math.min(1, (now - t0) / ms); camX = x0 + (x - x0) * ease(t); layout(); if (t < 1) camRaf = requestAnimationFrame(step); };
      camRaf = requestAnimationFrame(step);
      setTimeout(() => { if (Math.abs(camX - x) > .5 && performance.now() - t0 >= ms) { cancelAnimationFrame(camRaf); camX = x; layout(); } }, ms + 120);
    };
    new ResizeObserver(layout).observe(view);

    /* ----- motion helpers ----- */
    const rigTo = async (S, x, ms, e) => {
      if (x !== rigS.x) rigDir(x > rigS.x ? 1 : -1);
      rigPlace(x, ms, e);
      let k = 0;
      const t = S.every(110, () => {
        scooter._hubs[0].style.display = k % 2 ? 'none' : '';
        scooter._hubs[1].style.display = k % 2 ? '' : 'none';
        rider.bob.style.translate = k % 4 < 2 ? '0 0' : '0 -2px';
        if (k++ % 3 === 0) { const p = div('ds-puff', puffs); p.style.left = (rigS.dir > 0 ? 4 : 122) + 'px'; p.style.setProperty('--pd', rigS.dir > 0 ? -1 : 1); setTimeout(() => p.remove(), 700); }
      });
      try { await S.wait(ms); } finally { clearInterval(t); rider.bob.style.translate = ''; }
    };
    const fly = async (S, node, [x0, y0], [x1, y1], ms, lift = 70) => {
      node.style.display = 'block';
      node.animate([
        { transform: `translate(${x0}px, ${y0}px) rotate(0deg)` },
        { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - lift}px) rotate(-12deg)`, offset: .5 },
        { transform: `translate(${x1}px, ${y1}px) rotate(0deg)` },
      ], { duration: ms, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
      await S.wait(ms);
    };
    const sparkle = (x, y) => { const e = div('ds-spark', ui); e.style.left = x + 'px'; e.style.top = y + 'px'; e.append(emoteSvg('spark')); setTimeout(() => e.remove(), 900); };
    const confetti = (layer, x, y, n = 30, spread = 260) => {
      const colors = ['#a52226', '#f2b233', '#3f4ee3', '#01ae0f', '#f2a0a4', '#261f8e'];
      for (let i = 0; i < n; i++) {
        const c = div('ds-conf', layer);
        c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.background = colors[i % colors.length];
        c.style.setProperty('--dx', (Math.random() * spread * 2 - spread) + 'px');
        c.style.setProperty('--dy', (Math.random() * -spread * .8 - 30) + 'px');
        c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
        c.style.animationDelay = Math.random() * .12 + 's';
        setTimeout(() => c.remove(), 2100);
      }
    };

    /* ----- props state ----- */
    const potFill = n => pot._balls.forEach((b, i) => (b.style.display = i < n ? '' : 'none'));
    let trayEls = [];
    const clearTray = () => { trayEls.forEach(e => e.remove()); trayEls = []; trayLayer.innerHTML = ''; };
    const parcelState = st => {
      parcelEl.classList.toggle('on', st !== 'none');
      parcel.querySelector('.ds-p-open').style.display = st === 'open' ? '' : 'none';
      parcel.querySelector('.ds-p-shut').style.display = st === 'open' ? 'none' : '';
      parcelEl.classList.toggle('taped', st === 'taped' || st === 'tagged');
      parcelEl.classList.toggle('tagged', st === 'tagged');
    };
    const dolls = [owner, halwai, rider, walker, walkerFree, cust, big];

    /* ----- big rider (front layer) ----- */
    let bigS = 8, bigOn = false, pose = 'center';
    const bigSize = () => {
      const vh = view.clientHeight;
      bigS = Math.max(3, Math.min(11, Math.floor(vh * .6 / 22)));
      big.o.size = bigS; big.root.style.setProperty('--s', bigS);
      big.place(11 * bigS, 22 * bigS);
      Object.assign(bigBox.style, { left: 13 * bigS + 'px', top: 13 * bigS + 'px', width: 10 * bigS + 'px', height: 8 * bigS + 'px' });
      bigWrap.style.width = bigWrap.style.height = 22 * bigS + 'px';
    };
    // bottom-centre of the big doll at (px, py), scaled by k
    const bigTf = (px, py, k) => { const D = 22 * bigS; return `translate(${(px - k * D / 2).toFixed(1)}px, ${(py - k * D).toFixed(1)}px) scale(${k.toFixed(4)})`; };
    const poseXY = () => {
      const vw = view.clientWidth, vh = view.clientHeight;
      if (pose && pose.side) {
        // OTP pad on the right: the rider stands in the left column, feet just below the frame
        const col = pose.side, k = Math.max(.55, Math.min(1, (col - 24) / (14 * bigS), (vh - 120) / (16 * bigS)));
        return { px: col / 2, py: vh + 2 * bigS * k, k, col };
      }
      if (pose && pose.band) {
        const band = pose.band, k = Math.min(1, (band - 8) / (15 * bigS));
        return { px: Math.max(11 * bigS * k + 10, vw * .2), py: band + 7 * bigS * k, k };
      }
      return { px: vw * .5, py: vh + 2 * bigS, k: 1 };
    };
    const placeSay = () => {
      const vw = view.clientWidth;
      const { px, py, k } = poseXY();
      const D = 22 * bigS * k, headTop = py - D + 6 * bigS * k;
      const right = px + 8 * bigS * k;
      const room = vw - right - 12;
      if (pose && pose.side) {
        const w = Math.max(150, pose.side - 20);
        Object.assign(bigSay.style, { left: Math.max(8, px - w / 2) + 'px', maxWidth: w + 'px', width: w + 'px', transform: '' });
        bigSay.dataset.tail = 'down';
        bigSay.style.top = Math.max(8, headTop - bigSay.offsetHeight - 14) + 'px';
        return;
      }
      bigSay.style.width = '';
      if (room >= 170) {
        Object.assign(bigSay.style, { left: right + 'px', top: Math.max(8, headTop) + 'px', maxWidth: Math.min(300, room) + 'px', transform: '' });
        bigSay.dataset.tail = 'left';
      } else {
        Object.assign(bigSay.style, { left: Math.max(10, Math.min(vw - 10 - Math.min(260, vw - 20), px - 130)) + 'px', top: '10px', maxWidth: Math.min(260, vw - 20) + 'px', transform: '' });
        bigSay.dataset.tail = 'down';
      }
    };
    const sayBig = (html, cls = '') => { bigSay.innerHTML = html; bigSay.className = 'ds-say on ' + cls; placeSay(); bigSay.classList.remove('pop'); bigSay.offsetWidth; bigSay.classList.add('pop'); };
    const relayoutBig = () => { if (!bigOn) return; bigSize(); const { px, py, k } = poseXY(); bigWrap.getAnimations().forEach(a => a.cancel()); bigWrap.style.transform = bigTf(px, py, k); if (bigSay.classList.contains('on')) placeSay(); };
    new ResizeObserver(relayoutBig).observe(view);

    /* ----- idle life ----- */
    let idle = true;
    setInterval(() => { if (idle && !document.hidden && !owner.scope) owner.wave(2); }, 6200);

    /* ----- beats ----- */
    const reset = () => {
      idle = true;
      dolls.forEach(d => { d.scope = null; d.reset(); d.root.getAnimations().forEach(a => a.cancel()); });
      halwai.legs('none').arm('out').face('open'); halwai.at(76, BACK - 2).setDir(1);
      owner.at(386, BACK).setDir(1);
      rider.legs('none'); rider.root.style.visibility = '';
      rigPlace(-300); rigDir(1);
      walker.at(1000, 306).setDir(1); walker.root.classList.add('ds-hide');
      walkerFree.at(1096, 306).setDir(1); walkerFree.root.classList.add('ds-hide');
      cust.at(1156, 300).setDir(-1); cust.root.classList.add('ds-hide');
      doorOpen.classList.remove('on');
      tablet.classList.remove('ring');
      world.classList.remove('hot');
      Object.keys(B).forEach(n => hush(n));
      B.ticket.i.innerHTML = '';
      flyBox.getAnimations().forEach(a => a.cancel()); flyBox.style.display = 'none';
      parcelState('none'); potFill(0); clearTray();
      ui.querySelectorAll('.ds-conf, .ds-spark, .ds-flyitem, .ds-flyball').forEach(n => n.remove());
      bigOn = false; pose = 'center';
      front.classList.remove('on', 'lit');
      bigWrap.getAnimations().forEach(a => a.cancel());
      bigSay.className = 'ds-say';
      bigBox.classList.remove('gone'); bigBox.getAnimations().forEach(a => a.cancel());
      fx.innerHTML = '';
      camTo(0);
    };
    const claim = S => { idle = false; dolls.forEach(d => (d.scope = S)); };

    const receive = async (S, o) => {
      claim(S);
      camTo(0, T(500));
      tablet.classList.add('ring');
      owner.setDir(1).face('wide', 'o').emote('excl', T(1300));
      const n = o.items.reduce((a, i) => a + (i.qty || 1), 0);
      at('ticket', 486, 206);
      say('ticket', `<div class="ds-tk-h">${icon('bell')}<b>New order</b><span>#${o.id}</span></div>
        <div class="ds-tk-r"><span>${n} item${n > 1 ? 's' : ''}</span><b>${BuyApp.inr(o.bill.total)}</b></div>
        <div class="ds-tk-paid">${icon('check')}Paid online</div>
        <div class="ds-tk-btn">Accept order</div>`);
      await S.wait(T(1500));
      const btn = B.ticket.i.querySelector('.ds-tk-btn');
      btn.classList.add('tap');
      await S.wait(T(380));
      btn.classList.add('ok'); btn.innerHTML = `${icon('checkw')}Accepted`;
      tablet.classList.remove('ring');
      owner.face('happy', 'open');
      at('owner', 386, 166); say('owner', 'Accepted! Making it fresh.');
      await owner.jump(1, 12, T(460));
      await S.wait(T(1100));
      hush('ticket', 'owner');
      owner.face('open', 'smile');
    };

    const shownItems = o => {
      const list = o.items.slice(0, 3).map(i => i.pid);
      return { list, extra: Math.max(0, o.items.length - 3) };
    };
    const prepare = async (S, o) => {
      claim(S);
      world.classList.add('hot');
      halwai.face('happy', 'open');
      at('halwai', 80, 158); say('halwai', 'A fresh batch, coming up!');
      for (let i = 0; i < 3; i++) {
        const b = div('ds-flyball', ui);
        b.animate([{ transform: 'translate(118px, 230px)' }, { transform: `translate(160px, 176px)`, offset: .5 }, { transform: `translate(${186 + i * 8}px, 258px)` }], { duration: T(560), easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
        await S.wait(T(560));
        b.remove(); potFill(i + 1);
        await S.wait(T(160));
      }
      hush('halwai'); halwai.face('open', 'smile');
      const { list, extra } = shownItems(o);
      owner.setDir(-1).face('happy', 'open');
      at('owner', 386, 166); say('owner', 'Weighing &amp; arranging…');
      for (let i = 0; i < list.length; i++) {
        owner.arm('out');
        const x = 238 + i * 36;
        const it = put(trayLayer, sweet(list[i]), x, 210, 36, 24, 'ds-item');
        it.dataset.x = x;
        trayEls.push(it);
        sparkle(x + 18, 206);
        await S.wait(T(560));
        owner.arm('rest');
        await S.wait(T(160));
      }
      if (extra) { const m = div('ds-more', trayLayer, '+' + extra); m.style.left = '330px'; m.style.top = '204px'; trayEls.push(m); }
      hush('owner');
      owner.emote('spark', T(1100));
      await S.wait(T(900));
      world.classList.remove('hot');
    };

    const pack = async S => {
      claim(S);
      owner.face('open', 'smile');
      await owner.walk(518, T(1000));
      owner.setDir(-1);
      parcelState('open');
      await S.wait(T(450));
      for (const it of [...trayEls]) {
        const x = +it.dataset.x || 330;
        const clone = it.cloneNode(true);
        clone.classList.add('ds-flyitem'); clone.style.left = '0'; clone.style.top = '0';
        ui.append(clone); it.style.visibility = 'hidden';
        clone.animate([{ transform: `translate(${x}px, 210px)` }, { transform: `translate(${(x + 450) / 2}px, 150px)`, offset: .5 }, { transform: 'translate(450px, 196px) scale(.6)', opacity: .2 }], { duration: T(520), easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
        owner.arm(trayEls.indexOf(it) % 2 ? 'rest' : 'out');
        await S.wait(T(520));
        clone.remove();
      }
      clearTray(); owner.arm('rest');
      await S.wait(T(200));
      parcelState('closed'); sparkle(468, 190);
      await S.wait(T(450));
      parcelState('taped');
      await S.wait(T(700));
      parcelState('tagged');
      at('stamp', 468, 186); say('stamp', `${icon('check')}Packed`, 1800);
      owner.face('happy', 'open');
      at('owner', 518, 166); say('owner', 'Sealed &amp; tagged!');
      await owner.jump(1, 12, T(460));
      await S.wait(T(800));
      hush('owner', 'stamp');
    };

    const pickup = async S => {
      claim(S);
      camTo(150, T(900));
      rigDir(-1); rigPlace(920);
      rig.offsetWidth;
      await rigTo(S, 652, T(1700), 'cubic-bezier(.2,.7,.3,1)');
      rider.face('happy', 'open');
      at('rider', 640, 214); say('rider', 'Hi! Pickup for Madhuram?');
      owner.setDir(1).face('happy', 'open');
      owner.wave(2);
      await S.wait(T(900));
      hush('rider');
      parcelState('none');
      await fly(S, flyBox, [448, 200], [676, 278], T(820), 70);
      flyBox.style.display = 'none';
      say('rider', 'Got it. On my way!');
      rider.wave(2);
      await S.wait(T(1000));
      hush('rider');
    };

    const ride = async S => {
      claim(S);
      rigDir(1);
      const ms = T(2900);
      camTo(640, ms);
      owner.walk(386, T(1100)).then(() => owner.setDir(1)).catch(() => {});
      await rigTo(S, 958, ms, 'cubic-bezier(.35,.1,.3,1)');
    };

    const door = async S => {
      claim(S);
      rider.root.style.visibility = 'hidden';
      walker.at(1000, 306).setDir(1); walker.root.classList.remove('ds-hide');
      await walker.walk(1096, T(1000));
      walker.emote('note', T(1100));
      at('walker', 1096, 212); say('walker', 'Ding-dong!');
      await S.wait(T(1100));
      hush('walker');
    };

    const forward = async S => {
      claim(S);
      bigSize(); pose = 'center';
      const sx = (walker.x - camX) * ws, sy = (view.clientHeight - H * ws) + walker.y * ws;
      const k0 = (4 * ws) / bigS;
      walker.root.classList.add('ds-hide');
      big.reset(); big.face('open', 'smile'); big.arm('rest', 'both');
      bigBox.classList.remove('gone');
      front.classList.add('on');
      bigOn = true;
      const end = poseXY();
      const ms = T(1500);
      bigWrap.style.transform = bigTf(end.px, end.py, end.k);
      bigWrap.animate([{ transform: bigTf(sx, sy, k0) }, { transform: bigTf(end.px, end.py, end.k) }], { duration: ms, easing: 'cubic-bezier(.4,.05,.25,1)' });
      let f = 0;
      const legT = S.every(150, () => { big.legs(f++ % 2 ? 'a' : 'b'); big.bob.style.translate = f % 2 ? `0 -${bigS}px` : '0 0'; });
      try { await S.wait(ms); } finally { clearInterval(legT); big.legs('stand'); big.bob.style.translate = ''; }
      front.classList.add('lit');
      big.face('happy', 'open');
      await S.wait(T(250));
      sayBig(`Hi! I’m <b>Suresh</b> from Madhuram Sweets. May I have your <b>delivery OTP</b>, please?`);
      big.face('open', 'smile');
    };
    const setPose = (p, ms = 500) => {
      pose = p;
      if (!bigOn) return;
      const { px, py, k } = poseXY();
      const from = getComputedStyle(bigWrap).transform;
      bigWrap.style.transform = bigTf(px, py, k);
      bigWrap.animate([{ transform: from }, { transform: bigTf(px, py, k) }], { duration: T(ms), easing: 'cubic-bezier(.3,.1,.3,1)' });
      if (bigSay.classList.contains('on')) { bigSay.style.opacity = 0; setTimeout(() => { placeSay(); bigSay.style.opacity = ''; }, T(ms)); }
    };
    const puzzled = () => { big.face('sad', 'wobble').emote('q', 1300); sayBig('Hmm, that doesn’t match. Could you check the OTP in your BUY app?', 'warn'); setTimeout(() => big.face('open', 'smile'), 1500); };
    const verified = () => { big.face('happy', 'open').emote('check', 1400); sayBig('<span class="good">OTP verified!</span> Here are your sweets.'); };

    const handover = async S => {
      claim(S);
      pose = 'center';
      const vw = view.clientWidth, vh = view.clientHeight;
      if (bigOn) { const { px, py, k } = poseXY(); const from = getComputedStyle(bigWrap).transform; bigWrap.style.transform = bigTf(px, py, k); bigWrap.animate([{ transform: from }, { transform: bigTf(px, py, k) }], { duration: T(450), easing: 'ease-out' }); }
      bigSay.classList.remove('on');
      await S.wait(T(450));
      big.face('happy', 'open'); big.arm('out', 'both');
      // the parcel comes out of the screen towards you
      const r = bigBox.getBoundingClientRect(), vr = view.getBoundingClientRect();
      const ghost = put(fx, PROPS.box(true), r.left - vr.left, r.top - vr.top, r.width, r.height, 'ds-ghost');
      bigBox.classList.add('gone');
      ghost.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${vw / 2 - (r.left - vr.left) - r.width / 2}px, ${vh * .55 - (r.top - vr.top)}px) scale(2.6)`, opacity: 1, offset: .75 }, { transform: `translate(${vw / 2 - (r.left - vr.left) - r.width / 2}px, ${vh * .7 - (r.top - vr.top)}px) scale(3.4)`, opacity: 0 }], { duration: T(1100), easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' });
      await S.wait(T(800));
      confetti(fx, vw / 2, vh * .55, 44, Math.max(160, vw * .45));
      sayBig('Thank you! Enjoy your sweets.');
      big.arm('rest', 'both');
      await big.wave(3, 'R', T(190));
      await S.wait(T(700));
      ghost.remove();
    };

    const outro = async S => {
      claim(S);
      bigSay.classList.remove('on');
      const sx = (1096 - camX) * ws, sy = (view.clientHeight - H * ws) + 306 * ws;
      const { px, py, k } = poseXY();
      const ms = T(900);
      bigWrap.animate([{ transform: bigTf(px, py, k), opacity: 1 }, { transform: bigTf(sx, sy, (4 * ws) / bigS), opacity: .2 }], { duration: ms, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
      front.classList.remove('lit');
      await S.wait(ms);
      front.classList.remove('on'); bigOn = false;
      bigWrap.getAnimations().forEach(a => a.cancel());
      walkerFree.at(1096, 306).setDir(-1); walkerFree.root.classList.remove('ds-hide');
      doorOpen.classList.add('on');
      cust.at(1156, 300).setDir(-1); cust.root.classList.remove('ds-hide');
      cust.face('happy', 'open').emote('heart', T(1800));
      at('cust', 1156, 196); say('cust', 'Yay, my sweets!', 2200);
      confetti(ui, 1150, 220, 34, 200);
      await Promise.all([cust.jump(2, 16, T(520)), walkerFree.wave(2, 'R', T(190))]);
      await walkerFree.walk(990, T(900));
      walkerFree.root.classList.add('ds-hide');
      rider.root.style.visibility = '';
      rider.face('happy');
      await rigTo(S, 1420, T(1700), 'cubic-bezier(.5,0,.6,1)');
      idle = true;
    };

    const setSpeed = v => { sp = v || 1; };
    reset();
    layout();
    return { el: view, reset, receive, prepare, pack, pickup, ride, door, forward, handover, outro, setPose, sayBig, puzzled, verified, layout, setSpeed, hasFront: () => bigOn };
  }

  window.DeliveryScene = { create, icon, ICONS };
})();
