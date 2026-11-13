(() => {
  const D = window.SITE, C = window.CONTENT;
  const stage = document.getElementById('stage');
  const $ = id => document.getElementById(id);
  const STICKERS = ['telefone', 'telefone-g', 'laco', 'laco-p', 'cerejas', 'cerejas-p', 'flor', 'flor-g', 'canto-renda'];
  const INTERIOR = {
    'etiqueta': [30, 54, 107, 162], 'paint': [61, 44, 326, 252],
    'moldura-renda': [0, 0, 316, 226], 'moldura-renda-g': [0, 0, 389, 277],
    'moldura-vermelha': [11, 11, 325, 218], 'moldura-dourada': [11, 11, 380, 218],
    'moldura-xadrez': [25, 29, 153, 293], 'moldura-xadrez-g': [29, 33, 171, 330], 'moldura-xadrez-g2': [29, 34, 178, 340]
  };
  const nameOf = src => src.replace('assets/', '').replace('.webp', '');

  /* ---------- ajustes visuales (modo edición) ---------- */
  const EDIT = location.hash === '#editar';
  let E = JSON.parse(JSON.stringify(window.EDITS || {}));
  // el borrador del navegador solo vale si parte de la versión actual de edits.js
  if (EDIT) { try { const d = JSON.parse(localStorage.getItem('ar-edits')); if (d && d.rev === (window.EDITS || {}).rev) E = d; } catch (e) {} }
  E.ov = E.ov || {}; E.html = E.html || {}; E.add = E.add || []; E.hide = E.hide || {};

  /* ---------- idioma: o próprio navegador decide (português → PT; o resto → espanhol). ?lang=pt|es força ---------- */
  const LANG = (() => {
    if (EDIT) return 'es';
    try {
      const q = new URLSearchParams(location.search).get('lang'); if (q === 'pt' || q === 'es') return q;
    } catch (e) {}
    return /^pt/i.test(navigator.language || '') ? 'pt' : 'es';
  })();
  const PTX = LANG === 'pt' ? window.CONTENT_PT : null;
  const UI = Object.assign({
    hint: 'toca el cuaderno para abrirlo', skip: 'saltar intro', tipDesk: 'clic aquí ♪', tipMob: 'toca aquí ♪', playing: '♪ Reproduciendo',
    home: 'Inicio', homeAria: 'Inicio: cerrar el cuaderno', secs: ['Sobre mí', 'Obras', 'Ensayos', 'Contacto'],
    resumo: 'Resumen', projetos: 'Proyectos', verSite: 'Ver sitio', verCaderno: 'ver en el cuaderno →', video: 'vídeo', imagem: 'imagen',
    fechar: 'Cerrar', abrir: 'Abrir el cuaderno', virar: 'Pasar la página', anterior: 'Página anterior', seguinte: 'Página siguiente', nav: 'Navegación'
  }, PTX ? PTX.ui : {});
  if (PTX) {
    Object.assign(C.cover, PTX.cover);
    const R0 = C.resumen, R1 = PTX.resumen;
    ['saludo', 'intro', 'datos', 'firma'].forEach(k => { if (R1[k] != null) R0[k] = R1[k]; });
    R0.proyectos.forEach((p, i) => {
      const q = R1.proyectos[i]; if (!q) return;
      if (q.sub) p.sub = q.sub; if (q.text) p.text = q.text;
      (q.captions || []).forEach((c, j) => { if (p.media[j]) p.media[j].caption = c; });
    });
    C.spreads.forEach(sp => {
      const q = PTX.spreads[sp.id]; if (!q) return;
      ['label', 'L', 'R'].forEach(k => { if (q[k] != null) sp[k] = q[k]; });
      if (q.captions) Object.keys(q.captions).forEach(side => ((sp.slots || {})[side] || []).forEach((sl, i) => { if (q.captions[side][i] != null) sl.caption = q.captions[side][i]; }));
    });
    Object.assign(E.html, PTX.html);
  }
  document.documentElement.lang = LANG;
  function applyOv(key, tf, w, h) {
    const o = key && E.ov[key];
    if (!o) return tf;
    const c = new DOMMatrix(tf).transformPoint(new DOMPoint(w / 2, h / 2));
    return `translate(${(c.x + (o.dx || 0)).toFixed(2)}px, ${(c.y + (o.dy || 0)).toFixed(2)}px) rotate(${(o.r || 0).toFixed(2)}deg) scale(${(o.s || 1).toFixed(4)}) translate(${(-c.x).toFixed(2)}px, ${(-c.y).toFixed(2)}px) ${tf}`;
  }

  /* ---------- escala ---------- */
  /* celular em pé: a câmera fica parada numa coluna (uma página do caderno + os objetos em volta) */
  let mk = 0;   // página atual no celular (0 … 2×nº de páginas duplas − 1)
  const MOB = () => !EDIT && innerWidth < 820 && innerHeight > innerWidth;
  function fit() {
    const vp = document.getElementById('viewport');
    const vw = vp.clientWidth, vh = vp.clientHeight;
    const mob = MOB();
    document.body.classList.toggle('mobile', mob);
    if (!mob) {
      const s = Math.min(vw / 1440, vh / 1024);
      stage.style.transform = `translate(${-720 * s}px, ${-512 * s}px) scale(${s})`;
      return;
    }
    let st = 'loading'; try { st = state; } catch (e) {}
    const navH = 76;
    if (st === 'loading') {
      const s = vw / 1440;
      stage.style.transform = `translate(${-720 * s}px, ${-512 * s}px) scale(${s})`;
      return;
    }
    const s = Math.min(vw / 468, (vh - navH) / 1000);
    stage.style.transform = `translate(${(-994 * s).toFixed(1)}px, ${(-583 * s - navH / 2).toFixed(1)}px) scale(${s.toFixed(4)})`;
  }
  addEventListener('resize', fit); fit();

  /* ---------- helpers ---------- */
  function img(o, cls = '', key = '') {
    const i = new Image();
    i.src = o.src; i.alt = ''; i.className = 'el ' + cls; i.draggable = false;
    i.style.width = o.w + 'px'; i.style.height = o.h + 'px';
    if (key) { i.dataset.key = key; i._base = o.tf; i._w = o.w; i._h = o.h; }
    i.style.transform = applyOv(key, o.tf, o.w, o.h);
    if (key && E.hide[key]) i.style.display = 'none';
    return i;
  }

  /* ---------- mesa ---------- */
  const desk = {};
  // (a renda e o clipe fazem parte do caderno: esses continuam acompanhando o caderno)
  const BOOKPART = { renda: 1, clip: 1 };
  const order = ['ipod', 'piranha', 'vela', 'tinta', 'gloss', 'cafe', 'renda', 'clip'];
  const zs = { ipod: 1, piranha: 2, vela: 3, tinta: 4, gloss: 5, cafe: 6, renda: 8, clip: 10 };
  order.forEach((n, i) => {
    const o = D.desk[n];
    const el = img({ src: o.src, w: o.w, h: o.h, tf: o.tf.pages }, 'desk');
    el.dataset.desk = n; el._w = o.w; el._h = o.h;
    if (!BOOKPART[n]) el.style.transform = applyOv('desk:' + n + ':pages', o.tf.pages, o.w, o.h);
    el.style.zIndex = zs[n];
    if (n === 'renda' || n === 'clip') el.classList.add('later');
    el.style.transitionDelay = (i * 0.06) + 's';
    $('deskLayer').appendChild(el); desk[n] = el;
  });
  $('deskLayer').style.cssText = 'position:absolute;inset:0;z-index:auto';
  const FALL = {};   // transformação extra (frasco de nanquim caído)
  // posições da mesa no celular: objetos acima e abaixo da página  [x, y, escala, rotação, centroX, centroY nativos]
  const MDESK = { cafe: [840, 192, .41, 0, 187, 357], piranha: [994, 198, .37, -12, 207, 286], vela: [1152, 190, .33, 0, 254, 248],
    ipod: [842, 975, .52, -18, 83.5, 131.5], tinta: [996, 980, .6, 90, 237, 282], gloss: [1150, 975, .42, 15, 220, 292] };
  function deskTf(n, s) {
    s = s || stage.dataset.state;
    const m = MDESK[n];
    if (MOB() && m && ['closed', 'cover', 'pages'].includes(s))
      return `translate(${m[0]}px, ${m[1]}px) rotate(${m[3]}deg) scale(${m[2]}) translate(${-m[4]}px, ${-m[5]}px)`;
    const el = desk[n];
    return fitShift(applyOv(el.dataset.key, el._base, el._w, el._h), el._w, el._h, s);
  }
  /* computador: a mesa se adapta à largura da tela. Objetos que ficariam cortados
     na borda são puxados para dentro (só o necessário), sem mudar o resto. */
  function fitShift(tf, w, h, s) {
    if (EDIT || MOB() || !['closed', 'cover', 'pages'].includes(s || stage.dataset.state)) return tf;
    const vp = document.getElementById('viewport');
    const k = Math.min(vp.clientWidth / 1440, vp.clientHeight / 1024);
    const half = vp.clientWidth / k / 2, xL = 720 - half, xR = 720 + half;
    const M = new DOMMatrix(tf);
    const xs = [[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) => M.transformPoint(new DOMPoint(x, y)).x);
    const l = Math.min(...xs), r = Math.max(...xs), over = (r - l) * .12, pad = 6;
    let dx = 0;
    if (r - l > xR - xL) dx = (xL + xR) / 2 - (l + r) / 2;
    else if (l < xL - over + pad) dx = xL - over + pad - l;
    else if (r > xR + over - pad) dx = xR + over - pad - r;
    return Math.abs(dx) < .5 ? tf : `translate(${dx.toFixed(1)}px, 0px) ${tf}`;
  }
  // a mesa fica parada: caderno fechado, capa e páginas usam as mesmas posições
  const SAME = (s, n) => !BOOKPART[n] && ['closed', 'cover', 'pages'].includes(s) ? 'pages' : (s === 'cover' ? 'pages' : s);
  const deskKey = (n, s) => `desk:${n}:${SAME(s, n)}`;
  // a primeira arrumação (depois do holis) é instantânea: as coisas já aparecem no lugar,
  // sem deslizar (e a chama da vela não se separa da vela)
  let deskFirst = true;
  function deskTo(s) {
    const instant = deskFirst && s !== 'loading';
    for (const n in desk) {
      const el = desk[n]; el.dataset.key = deskKey(n, s); el._base = D.desk[n].tf[BOOKPART[n] ? s : SAME(s, n)];
      if (instant) el.style.transition = 'none';
      el.style.transform = deskTf(n, s) + (FALL[n] ? ' ' + FALL[n] : '');
      el.style.display = E.hide['desk:' + n] || (MOB() && (n === 'renda' || n === 'clip') && s !== 'messy') ? 'none' : '';
    }
    syncFx();
    if (instant) {
      deskFirst = false;
      requestAnimationFrame(() => requestAnimationFrame(() => { for (const n in desk) desk[n].style.transition = ''; }));
    }
  }

  /* ---------- vida na mesa: vela, café e iPod ---------- */
  const FX = [];
  function makeFx(obj, nx, ny, html, z, rot) {
    const d = document.createElement('div');
    d.className = 'fx desk'; d.innerHTML = html; d.style.zIndex = z;
    $('deskLayer').appendChild(d);
    FX.push({ obj, nx, ny, el: d, rot });
    return d;
  }
  function syncFx() {
    FX.forEach(f => {
      const o = desk[f.obj]; if (!o) return;
      const M = new DOMMatrix(o.style.transform || 'none');
      const p = M.transformPoint(new DOMPoint(f.nx, f.ny));
      const s = Math.hypot(M.a, M.b), r = Math.atan2(M.b, M.a) * 180 / Math.PI;
      f.el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)${f.rot ? ` rotate(${r.toFixed(2)}deg)` : ''} scale(${s.toFixed(4)})`;
      f.el.style.display = o.style.display;
      f.p = p; f.s = s;
    });
  }
  const velaFx = makeFx('vela', 249, 243, '<i class="patch"></i><i class="dim"></i><i class="wick"></i><i class="glow"></i><i class="halo"></i><i class="flame"></i><i class="smoke"></i>', 3);
  const cafeFx = makeFx('cafe', 188, 350, '<div class="sw"><i class="steam s1"></i><i class="steam s2"></i><i class="steam s3"></i><i class="steam s4"></i><i class="steam s5"></i></div>', 6);
  // tela do iPod (o buraco da imagem): player do YouTube por trás, ou o visor do mp3
  const IPS = { x: 14, y: 14.5, w: 138, h: 110 };            // tela, em unidades do iPod (167 × 263)
  const WHEEL = { x: 83, y: 193, r: 48, c: 16 };              // rodinha e botão central
  const ytFx = makeFx('ipod', IPS.x, IPS.y, '<div class="ytbox"><div class="ythost"></div><div class="scr-idle"><b>MUSIC</b><span>♪</span><i>▶ play</i></div></div>', 0, true);
  const screenFx = makeFx('ipod', IPS.x, IPS.y, `<div class="screen"><b>${UI.playing}</b><div class="mq"><span></span></div><i class="bar"><i></i></i></div>`, 2, true);
  const notesFx = makeFx('ipod', 150, 10, '', 7);
  const tipFx = makeFx('ipod', 176, 34, `<span class="tip">${UI.tipDesk}</span>`, 12);
  tipFx.classList.add('side');
  const tipFxM = makeFx('ipod', 128, 318, `<span class="tip"><svg class="arr" viewBox="0 0 170 150" aria-hidden="true"><path d="M150 112 C 95 118, 40 95, 22 22" /><path d="M6 44 L 22 20 L 44 38" /></svg>${UI.tipMob}</span>`, 12); // celular: sempre visível, com setinha
  tipFxM.classList.add('below');
  let tipUntil = 0;
  const inkFx = makeFx('tinta', 238, 222, '', 1, true);
  $('deskLayer').insertBefore(inkFx, desk.tinta);

  /* ----- nanquim: cai com o cursor e faz uma poça ----- */
  const TC = [237, 282];
  const tip = (a, dy) => `translate(${TC[0]}px, ${TC[1]}px) rotate(${a}deg) translate(${-TC[0]}px, ${-TC[1]}px) translate(0px, ${dy}px)`;
  let inkState = 'up', inkArmed = true;
  /* poça de tinta realista: forma orgânica que escorre, borda absorvida pelo papel, brilho molhado e respingos */
  let pud = null;
  function makePuddle() {
    const id = 'ink' + Date.now();
    inkFx.innerHTML = `<svg class="puddle" viewBox="-200 -260 400 360" width="400" height="360">
      <defs>
        <filter id="${id}w" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="${Math.floor(Math.random() * 99)}"/>
          <feDisplacementMap in="SourceGraphic" scale="9"/>
          <feGaussianBlur stdDeviation="1.6"/>
        </filter>
        <filter id="${id}e" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="${Math.floor(Math.random() * 99)}"/>
          <feDisplacementMap in="SourceGraphic" scale="3.5"/>
        </filter>
        <filter id="${id}g"><feGaussianBlur stdDeviation="5"/></filter>
        <radialGradient id="${id}f" cx="45%" cy="40%" r="75%">
          <stop offset="0" stop-color="#1c1016"/><stop offset=".55" stop-color="#0b0508"/><stop offset="1" stop-color="#050203"/>
        </radialGradient>
      </defs>
      <path class="stain" fill="rgba(35,18,26,.32)" filter="url(#${id}w)"/>
      <g filter="url(#${id}e)">
        <path class="ink" fill="url(#${id}f)" stroke="rgba(95,60,78,.55)" stroke-width="1.3"/>
        <g class="drops" fill="#080406"></g>
      </g>
      <path class="gloss" fill="rgba(255,255,255,.11)" filter="url(#${id}g)"/>
      <path class="spec" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
    const sv = inkFx.querySelector('svg');
    const H = Array.from({ length: 7 }, (_, k) => ({ k: k + 2, a: (Math.random() * .09) / (1 + k * .35), p: Math.random() * 6.28 }));
    const fingers = Array.from({ length: 3 }, () => ({ th: -Math.PI / 2 + (Math.random() - .5) * 2.2, w: .18 + Math.random() * .2, l: .25 + Math.random() * .35 }));
    pud = { sv, H, fingers, t0: performance.now(), dur: 4200, state: 'spread' };
    // respingos do impacto
    const drops = sv.querySelector('.drops');
    for (let i = 0; i < 9; i++) {
      const th = -Math.PI / 2 + (Math.random() - .5) * 2.6, r = 78 + Math.random() * 55, rr = 1.5 + Math.random() * 5;
      const x = Math.cos(th) * r, y = Math.sin(th) * r - 40;
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      el.setAttribute('cx', x.toFixed(1)); el.setAttribute('cy', y.toFixed(1));
      el.setAttribute('rx', (rr * (1.2 + Math.random() * .8)).toFixed(1)); el.setAttribute('ry', rr.toFixed(1));
      el.setAttribute('transform', `rotate(${(th * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`);
      el.style.opacity = 0; el.style.transition = `opacity .12s ease ${(Math.random() * .15).toFixed(2)}s`;
      drops.appendChild(el);
      requestAnimationFrame(() => el.style.opacity = .95);
    }
    requestAnimationFrame(pudFrame);
  }
  function shapePath(R, cx, cy, detail, scale = 1, ox = 0, oy = 0) {
    const N = 72; let d = '';
    for (let i = 0; i <= N; i++) {
      const th = i / N * Math.PI * 2;
      let f = 1;
      pud.H.forEach(h => f += h.a * Math.min(1, detail * (1 + h.k * .15)) * Math.sin(h.k * th + h.p));
      // escorre mais na direção da queda (para cima no sistema da poça)
      f *= 1 + .38 * Math.max(0, -Math.sin(th)) ** 1.5;
      pud.fingers.forEach(g => { const dd = Math.atan2(Math.sin(th - g.th), Math.cos(th - g.th)); f += g.l * detail * Math.exp(-(dd * dd) / (2 * g.w * g.w)); });
      const r = R * f * scale;
      d += (i ? 'L' : 'M') + (cx + ox + Math.cos(th) * r * 1.12).toFixed(1) + ' ' + (cy + oy + Math.sin(th) * r * .86).toFixed(1);
    }
    return d + 'Z';
  }
  function pudFrame(now) {
    if (!pud) return;
    const t = Math.min(1, (now - pud.t0) / pud.dur);
    const e = 1 - Math.pow(1 - t, 3);
    const R = 12 + 62 * e;                 // raio cresce rápido no início e desacelera
    const cy = -8 - 50 * e;               // o centro se afasta da boca do frasco
    const detail = Math.min(1, .25 + t * 1.2);
    const sv = pud.sv;
    sv.querySelector('.ink').setAttribute('d', shapePath(R, 0, cy, detail));
    sv.querySelector('.stain').setAttribute('d', shapePath(R + 5 + 7 * e, 0, cy, detail));
    sv.querySelector('.gloss').setAttribute('d', shapePath(R * .36, 0, cy, detail * .5, 1, -R * .3, -R * .28));
    const sx = -R * .55, sy = cy - R * .45;
    sv.querySelector('.spec').setAttribute('d', `M${(sx).toFixed(1)} ${(sy + 6).toFixed(1)} Q ${(sx + R * .18).toFixed(1)} ${(sy - 4).toFixed(1)} ${(sx + R * .42).toFixed(1)} ${(sy - 2).toFixed(1)}`);
    if (t < 1 && pud.state === 'spread') requestAnimationFrame(pudFrame);
  }
  /* piranha: abre e fecha ("morde") quando o cursor passa */
  let pirBusy = false, pirArmed = true;
  function chomp(dir) {
    if (pirBusy || !pirArmed) return;
    pirBusy = true; pirArmed = false;
    const el = desk.piranha, base = el.style.transform;
    const X = (sx, sy, r, ty) => `translate(209px, 300px) rotate(${r * dir}deg) translate(0px, ${ty}px) scale(${sx}, ${sy}) translate(-209px, -300px)`;
    el.style.transition = 'none';
    const an = el.animate([
      { transform: `${base} ${X(1, 1, 0, 0)}`, easing: 'cubic-bezier(.3,0,.6,1)' },
      { transform: `${base} ${X(1.03, 1.13, -5, -8)}`, offset: .26, easing: 'cubic-bezier(.7,0,1,.6)' },  // abre
      { transform: `${base} ${X(1.07, .88, 3, 2)}`, offset: .40, easing: 'ease-out' },                   // fecha com estalo
      { transform: `${base} ${X(.97, 1.05, -2.2, -2)}`, offset: .58, easing: 'ease-in-out' },
      { transform: `${base} ${X(1.015, .98, 1, 0)}`, offset: .76, easing: 'ease-in-out' },
      { transform: `${base} ${X(1, 1, 0, 0)}` }
    ], { duration: 820 });
    an.onfinish = () => { el.style.transform = base; requestAnimationFrame(() => { el.style.transition = ''; }); pirBusy = false; };
  }
  function knockInk() {
    if (inkState !== 'up' || !inkArmed) return;
    inkState = 'falling'; inkArmed = false;
    const el = desk.tinta, base = el.style.transform;
    el.style.transition = 'none';
    const anim = el.animate([
      { transform: `${base} ${tip(0, 0)}`, easing: 'ease-out' },
      { transform: `${base} ${tip(7, 2)}`, offset: .14, easing: 'cubic-bezier(.5,0,.95,.35)' },   // balança antes de tombar
      { transform: `${base} ${tip(-94, -30)} scale(1, .95)`, offset: .62, easing: 'ease-out' },     // impacto
      { transform: `${base} ${tip(-78, -25)} scale(1, 1)`, offset: .76, easing: 'ease-in-out' },
      { transform: `${base} ${tip(-86, -28)}`, offset: .88, easing: 'ease-in-out' },
      { transform: `${base} ${tip(-83, -27)}` }
    ], { duration: 900 });
    setTimeout(() => { FALL.tinta = tip(-83, -27); const keep = el.style.transform; el.style.transform = `${base} ${FALL.tinta}`; syncFx(); el.style.transform = keep; makePuddle(); }, 560);
    anim.onfinish = () => {
      FALL.tinta = tip(-83, -27);
      el.style.transform = `${base} ${FALL.tinta}`;
      requestAnimationFrame(() => { el.style.transition = ''; });
      syncFx();
      inkState = 'down';
    };
  }
  function standInk() {
    if (inkState !== 'down') return;
    inkState = 'rising';
    const el = desk.tinta, base = el.style.transform.replace(' ' + FALL.tinta, '');
    const p = inkFx.querySelector('.puddle'); if (p) { if (pud) pud.state = 'dry'; p.classList.add('dry'); }
    el.style.transition = 'none';
    const anim = el.animate([{ transform: `${base} ${tip(-82, -26)}` }, { transform: `${base} ${tip(6, 2)}`, offset: .75 }, { transform: `${base} ${tip(0, 0)}` }],
      { duration: 650, easing: 'cubic-bezier(.3,.7,.4,1)' });
    anim.onfinish = () => {
      delete FALL.tinta; el.style.transform = base;
      requestAnimationFrame(() => { el.style.transition = ''; });
      syncFx(); inkState = 'up';
      setTimeout(() => { if (inkState === 'up') { inkFx.innerHTML = ''; pud = null; } }, 6500);
    };
  }

  /* ----- tocador de música: YouTube Music (playlist) ou mp3 ----- */
  const MUS = C.music || { tracks: [] };
  const YTC = MUS.youtube || {};
  const useYT = !!(YTC.playlist || (YTC.videos && YTC.videos.length));
  const audio = new Audio(); audio.preload = 'none'; audio.volume = MUS.volume != null ? MUS.volume : .5;
  let trk = 0, userPaused = false, started = false;
  const hasMusic = () => !EDIT && (useYT || (MUS.tracks && MUS.tracks.length > 0));
  if (useYT) { screenFx.style.visibility = 'hidden'; stage.classList.add('yt'); } else ytFx.style.visibility = 'hidden';
  // etiqueta da mesa com o nome da música
  let labelTxt = null, curSong = ['', ''];
  function setTitle(t, a) {
    curSong = [t, a];
    if (labelTxt && !labelTxt.isConnected) labelTxt = null;
    const q = screenFx.querySelector('.mq span'); if (q) q.textContent = a ? `${t} — ${a}` : (t || '');
    const bs = document.querySelector('#ipodBig .ib-song'); if (bs) bs.textContent = t ? (a ? `${t} — ${a}` : t) : '';
    if (!labelTxt) {
      const L = MUS.label && $('layerDesk').querySelector(`[data-key="${MUS.label}"]`);
      if (!L) return;
      labelTxt = document.createElement('div'); labelTxt.className = 'el label-song';
      labelTxt.style.width = L.style.width; labelTxt.style.height = L.style.height;
      L.after(labelTxt); labelTxt._for = L;
    }
    labelTxt.style.transform = labelTxt._for.style.transform;
    labelTxt.innerHTML = t ? `<small>♪ sonando</small><b></b><i></i>` : `<small>♪ mi playlist</small><b>pulsa play</b><i>en el iPod</i>`;
    if (t) { labelTxt.querySelector('b').textContent = t; labelTxt.querySelector('i').textContent = a || ''; }
  }
  // --- mp3
  function loadTrack(i) {
    trk = (i + MUS.tracks.length) % MUS.tracks.length;
    const t = MUS.tracks[trk];
    audio.src = t.src;
    const [tt, aa] = (t.title || '').split(' — ');
    setTitle(tt, aa);
  }
  audio.addEventListener('ended', () => { loadTrack(trk + 1); play(); });
  audio.addEventListener('pause', () => stage.classList.remove('playing'));
  audio.addEventListener('play', () => stage.classList.add('playing'));
  // --- YouTube
  let yt = null, ytReady = false, ytWant = false, ytOn = false, ytTimer = 0;
  const ytHost = () => (MOB() ? $('ipodBig').querySelector('.ythost') : ytFx.querySelector('.ythost'));
  function ytLoad() {
    if (yt || !useYT) return;
    yt = 'loading';
    const go = () => {
      const el = document.createElement('div'); ytHost().appendChild(el);
      const pv = { controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, rel: 0, playsinline: 1, modestbranding: 1, origin: location.origin };
      if (YTC.playlist) { pv.listType = 'playlist'; pv.list = YTC.playlist; }
      else if (YTC.videos.length > 1) pv.playlist = YTC.videos.slice(1).join(',');
      const opt = { width: '100%', height: '100%', playerVars: pv };
      if (!YTC.playlist) opt.videoId = YTC.videos[0];
      yt = new YT.Player(el, Object.assign(opt, {
        events: {
          onReady: () => {
            ytReady = true;
            yt.setVolume(Math.round((MUS.volume != null ? MUS.volume : .5) * 100));
            try { yt.setLoop(true); if (YTC.shuffle) yt.setShuffle(true); } catch (e) {}
            if (ytWant) yt.playVideo();
          },
          onStateChange: e => {
            if (e.data === 1) {                                  // tocando
              ytOn = true; stage.classList.add('playing'); stage.classList.add('ytlive');
              clearTimeout(ytTimer); $('ipodBig').classList.remove('tapyt');
              const d = yt.getVideoData ? yt.getVideoData() : {};
              setTitle(d.title || '', (d.author || '').replace(/\s*-\s*Topic$/i, ''));
            } else if (e.data === 2 || e.data === 0) stage.classList.remove('playing');
          },
          onError: () => { setTimeout(() => { try { yt.nextVideo(); } catch (e) {} }, 400); }   // faixa que não deixa tocar fora do YouTube: pula
        }
      }));
    };
    if (window.YT && YT.Player) return go();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev && prev(); go(); };
    const sc = document.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(sc);
  }
  // --- comandos (servem para os dois)
  function play() {
    if (!hasMusic()) return;
    if (useYT) {
      ytWant = true; ytLoad();
      if (ytReady) yt.playVideo();
      // celular (iOS): se o navegador não deixar começar sozinho, libera o toque direto na tela do player
      clearTimeout(ytTimer); ytTimer = setTimeout(() => { if (!ytOn || yt.getPlayerState() !== 1) $('ipodBig').classList.add('tapyt'); }, 1600);
      return;
    }
    if (!audio.src) loadTrack(0);
    audio.play().then(() => stage.classList.add('playing')).catch(() => {});
  }
  function pause() {
    if (useYT) { ytWant = false; if (ytReady) yt.pauseVideo(); stage.classList.remove('playing'); return; }
    audio.pause(); stage.classList.remove('playing');
  }
  const isPlaying = () => useYT ? ytWant : !audio.paused;
  function toggle() { started = true; if (isPlaying()) { userPaused = true; pause(); } else { userPaused = false; play(); } }
  function skip(d) {
    started = true; userPaused = false;
    if (useYT) {
      ytWant = true; ytLoad();
      if (ytReady) {
        try {
          const list = yt.getPlaylist() || [], n = list.length, i = yt.getPlaylistIndex();
          if (n > 0 && i >= 0) yt.playVideoAt((i + d + n) % n);
          else { d > 0 ? yt.nextVideo() : yt.previousVideo(); yt.playVideo(); }
        } catch (e) { d > 0 ? yt.nextVideo() : yt.previousVideo(); }
      }
      return;
    }
    loadTrack(trk + d); play();
  }
  // qual botão do iPod foi tocado (x, y em unidades do iPod 167 × 263)
  function ipodAct(x, y) {
    const dx = x - WHEEL.x, dy = y - WHEEL.y, r = Math.hypot(dx, dy);
    if (r <= WHEEL.c) return 'toggle';
    if (r <= WHEEL.r) {
      const a = Math.atan2(dy, dx) * 180 / Math.PI;     // 0 = direita, 90 = baixo
      if (a > -45 && a < 45) return 'next';
      if (a > 135 || a < -135) return 'prev';
      if (a >= 45 && a <= 135) return 'toggle';         // ▶❚❚ embaixo
      return 'menu';
    }
    return 'toggle';
  }
  function doAct(act) { if (act === 'next') skip(1); else if (act === 'prev') skip(-1); else if (act === 'toggle') toggle(); }
  // computador: o player do YouTube é criado depois do holis (criar ele durante a escrita travava a caneta)
  const ytLater = () => { if (useYT && !MOB()) setTimeout(ytLoad, 900); };
  setTitle('', '');
  // começa no primeiro clique de quem visita (o navegador não deixa antes) — só no computador
  let autoT = 0;
  addEventListener('pointerdown', () => { if (!started && hasMusic() && MUS.autostart !== false && !MOB()) { started = true; autoT = performance.now(); if (!userPaused) play(); } }, { capture: true, once: false });

  /* ----- celular: o iPod abre grande na tela (e cai de volta na mesa ao fechar) ----- */
  const big = document.createElement('div');
  big.id = 'ipodBig'; big.setAttribute('aria-hidden', 'true');
  big.innerHTML = `<div class="ib"><div class="ib-scr"><div class="ythost"></div><div class="scr-idle"><b>MUSIC</b><span>♪</span><i>▶ play</i></div></div>
    <img src="${D.desk.ipod.src}" alt=""><button class="ib-x" aria-label="${UI.fechar}">×</button><div class="ib-song"></div></div>`;
  document.body.appendChild(big);
  const ib = big.querySelector('.ib');
  let bigOpen = false;
  function ipodRect() { const r = desk.ipod.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; }
  function fromDesk() {          // transformação que põe o iPod grande exatamente sobre o da mesa
    const d = ipodRect(), b = ib.getBoundingClientRect();
    const k = (d.h / 1.1) / b.height;     // a caixa da mesa inclui a rotação
    return `translate(${(d.x - (b.left + b.width / 2)).toFixed(1)}px, ${(d.y - (b.top + b.height / 2)).toFixed(1)}px) rotate(-18deg) scale(${k.toFixed(3)})`;
  }
  function openIpod() {
    if (bigOpen) return;
    bigOpen = true; ytLoad();
    big.classList.add('anim', 'open'); big.setAttribute('aria-hidden', 'false');
    ib.style.transition = 'none'; ib.style.transform = fromDesk();
    desk.ipod.style.opacity = ytFx.style.opacity = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ib.style.transition = 'transform .55s cubic-bezier(.2,.9,.25,1.12)'; ib.style.transform = 'none';
    }));
  }
  function closeIpod() {
    if (!bigOpen) return;
    bigOpen = false; userPaused = true; pause();
    big.classList.remove('open', 'tapyt'); big.setAttribute('aria-hidden', 'true');
    ib.style.transition = 'transform .5s cubic-bezier(.55,0,.75,.35)';     // cai na mesa
    ib.style.transform = fromDesk();
    setTimeout(() => {
      desk.ipod.style.opacity = ytFx.style.opacity = '';
      big.classList.remove('anim');
      // pousa: um quiquezinho no iPod da mesa
      desk.ipod.animate([{ translate: '0 -6px' }, { translate: '0 0' }, { translate: '0 -2px' }, { translate: '0 0' }], { duration: 380, easing: 'ease-out' });
    }, 500);
  }
  big.querySelector('.ib-x').addEventListener('click', e => { e.stopPropagation(); closeIpod(); });
  big.addEventListener('click', e => {
    if (e.target === big) return closeIpod();               // tocar fora fecha
    if (!e.target.closest('.ib') || e.target.closest('.ib-x')) return;
    const r = ib.getBoundingClientRect(), k = 167 / r.width;
    doAct(ipodAct((e.clientX - r.left) * k, (e.clientY - r.top) * k));
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeIpod(); });

  // notas musicais saindo do fone enquanto toca
  const NOTES = ['♪', '♫', '♩', '♬'];
  setInterval(() => {
    if (!stage.classList.contains('playing') || document.hidden) return;
    const n = document.createElement('i');
    n.className = 'note';
    n.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
    n.style.setProperty('--dx', (Math.random() * 60 - 10).toFixed(0) + 'px');
    n.style.setProperty('--rot', (Math.random() * 50 - 25).toFixed(0) + 'deg');
    n.style.fontSize = (17 + Math.random() * 13).toFixed(0) + 'px';
    notesFx.appendChild(n);
    setTimeout(() => n.remove(), 3200);
  }, 520);

  /* ----- toque e passagem do cursor ----- */
  const alphaCache = {};
  function alphaAt(name, sx, sy) {
    const el = desk[name]; if (!el || el.style.display === 'none' || !el.complete || !el.naturalWidth) return false;
    let c = alphaCache[name];
    if (!c) {
      const cv = document.createElement('canvas'); cv.width = el.naturalWidth; cv.height = el.naturalHeight;
      const g = cv.getContext('2d'); g.drawImage(el, 0, 0);
      try { c = alphaCache[name] = { d: g.getImageData(0, 0, cv.width, cv.height).data, w: cv.width, h: cv.height, k: cv.width / el._w }; } catch (e) { return false; }
    }
    const p = new DOMMatrix(el.style.transform).inverse().transformPoint(new DOMPoint(sx, sy));
    const x = Math.floor(p.x * c.k), y = Math.floor(p.y * c.k);
    if (x < 0 || y < 0 || x >= c.w || y >= c.h) return false;
    return c.d[(y * c.w + x) * 4 + 3] > 40;
  }
  const BOOK = { closed: [512, 306, 1052, 961], cover: [291, 186, 1267, 950], pages: [308, 233, 1250, 940] };
  const underBook = (x, y) => { const r = BOOK[state]; return r && x > r[0] && x < r[2] && y > r[1] && y < r[3]; };
  const toStage = (cx, cy) => { const r = stage.getBoundingClientRect(), s = r.width / 1440; return [(cx - r.left) / s, (cy - r.top) / s]; };
  const BLOCK = 'a,button,[data-go],#hitClosed,#hitCover,#coverText,#aboutTag,#carta,#nav,#layerCover .blk,#layerCover [data-key],#edBar,#edPanel';
  const live = () => !EDIT && ['closed', 'cover', 'pages'].includes(state);
  let mouse = null, pageCursor = '';
  addEventListener('pointermove', e => { mouse = [e.clientX, e.clientY, e.target, e.pointerType]; });
  // no celular não existe "passar o mouse": ao tocar no iPod, o aviso aparece por um instante
  addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' || !live() || !hasMusic()) return;
    const [x, y] = toStage(e.clientX, e.clientY);
    if (!underBook(x, y) && alphaAt('ipod', x, y)) tipUntil = performance.now() + 1800;
  });
  addEventListener('pointerleave', () => { mouse = null; });
  stage.addEventListener('click', e => {
    if (!live() || e.target.closest(BLOCK)) return;
    const [x, y] = toStage(e.clientX, e.clientY);
    if (!underBook(x, y) && inkState === 'down' && alphaAt('tinta', x, y)) { e.stopPropagation(); standInk(); return; }
    if (underBook(x, y)) return;
    const p = new DOMMatrix(desk.ipod.style.transform).inverse().transformPoint(new DOMPoint(x, y));
    const onScreen = p.x >= IPS.x && p.x <= IPS.x + IPS.w && p.y >= IPS.y && p.y <= IPS.y + IPS.h;
    if (!onScreen && !alphaAt('ipod', x, y)) return;
    e.stopPropagation();
    if (!hasMusic()) return;
    if (MOB()) return openIpod();                          // celular: o iPod abre grande
    const act = ipodAct(p.x, p.y);
    try { desk.ipod.animate([{ scale: '1' }, { scale: '.975' }, { scale: '1' }], { duration: 180, easing: 'ease-out' }); } catch (_) {}
    if (act === 'toggle' && performance.now() - autoT < 700) return;   // esse mesmo clique já deu o play
    doAct(act);
  }, true);

  // um só laço de animação: chama, apagar/acender, vento na fumaça
  {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ph = Array.from({ length: 6 }, () => Math.random() * 6.28);
    const glow = velaFx.querySelector('.glow'), halo = velaFx.querySelector('.halo'), flame = velaFx.querySelector('.flame'), smoke = velaFx.querySelector('.smoke');
    const patch = velaFx.querySelector('.patch'), wick = velaFx.querySelector('.wick'), dim = velaFx.querySelector('.dim');
    const sw = cafeFx.querySelector('.sw');
    let ga = 0, gv = 0, swinging = false, wasGloss = false, lastMX = null;
    let gust = 0, gustT = 0, lit = 1, litT = 1, offT = 0, wx = 0, wy = 0, twx = 0, twy = 0;
    const tick = t => {
      const s = t / 1000;
      // cursor
      let overVela = false, overCafe = false, ptr = false, overGloss = false;
      if (mouse && live() && !(mouse[2] && mouse[2].closest && mouse[2].closest(BLOCK))) {
        const [x, y] = toStage(mouse[0], mouse[1]);
        if (!underBook(x, y)) {
          overVela = alphaAt('vela', x, y);
          const cf = FX.find(f => f.el === cafeFx);
          overCafe = alphaAt('cafe', x, y) || (cf && cf.p && Math.hypot(x - cf.p.x, y - cf.p.y) < 230 * cf.s);
          if (overCafe && cf.p) { twx = Math.max(-170, Math.min(170, x - cf.p.x)); twy = Math.max(-170, Math.min(170, y - cf.p.y)); }
          ptr = hasMusic() && alphaAt('ipod', x, y);
          overGloss = alphaAt('gloss', x, y);
          const overPir = alphaAt('piranha', x, y);
          if (overPir) chomp(lastMX != null && mouse[0] < lastMX ? -1 : 1); else if (!pirBusy) pirArmed = true;
          const overInk = alphaAt('tinta', x, y);
          if (overInk && inkState === 'up') knockInk();
          if (!overInk && inkState === 'up') inkArmed = true;
          if (overInk && inkState === 'down') ptr = true;
        }
      }
      stage.style.cursor = ptr ? 'pointer' : (pageCursor || '');
      {
        let overIpod = false;
        if (mouse && mouse[3] === 'mouse' && live() && hasMusic() && !(mouse[2] && mouse[2].closest && mouse[2].closest(BLOCK))) {
          const [x, y] = toStage(mouse[0], mouse[1]);
          overIpod = !underBook(x, y) && alphaAt('ipod', x, y);
        }
        const show = overIpod || t < tipUntil;
        tipFx.classList.toggle('on', show && !MOB());
        tipFxM.classList.toggle('on', MOB() && hasMusic() && !EDIT);   // no celular fica sempre escrito
      }
      // gloss balança com o cursor (pêndulo amortecido preso na argola)
      {
        const gx = mouse ? mouse[0] : 0, mv = lastMX == null ? 0 : gx - lastMX; lastMX = mouse ? gx : null;
        if (overGloss && !wasGloss) gv += (mv >= 0 ? 1 : -1) * 110;
        if (overGloss) gv += mv * 1.4;
        wasGloss = overGloss;
        const dt = 1 / 60;
        gv += (-30 * ga - 2.4 * gv) * dt; ga += gv * dt;
        ga = Math.max(-24, Math.min(24, ga));
        const el = desk.gloss;
        if (Math.abs(ga) > .05 || Math.abs(gv) > .3) {
          if (!swinging) { swinging = true; el.style.transition = 'none'; }
          el.style.transform = deskTf('gloss') + ` translate(160px, 165px) rotate(${ga.toFixed(2)}deg) translate(-160px, -165px)`;
        } else if (swinging) {
          swinging = false; ga = 0; gv = 0;
          el.style.transform = deskTf('gloss');
          requestAnimationFrame(() => el.style.transition = '');
        }
      }
      if (!overCafe) { twx = 0; twy = 0; }
      // vela: apaga com o cursor, volta a acender depois
      if (overVela) { if (litT === 1) { smoke.classList.remove('puff'); void smoke.offsetWidth; smoke.classList.add('puff'); } litT = 0; offT = s; }
      else if (litT === 0 && s - offT > 1.6) litT = 1;
      lit += (litT - lit) * (litT ? 0.05 : 0.22);
      // tremulação
      if (s > gustT) { gust = Math.random() < .25 ? 1 : 0; gustT = s + 0.4 + Math.random() * 2.2; }
      const n = reduce ? 0 : Math.sin(s * 7.3 + ph[0]) * .45 + Math.sin(s * 13.1 + ph[1]) * .3 + Math.sin(s * 23.7 + ph[2]) * .25;
      const m = reduce ? 0 : Math.sin(s * 3.1 + ph[3]) * .5 + Math.sin(s * 9.7 + ph[4]) * .5;
      const g = reduce ? 0 : gust * Math.sin(s * 31 + ph[5]);
      const relight = litT === 1 && lit < .95 ? Math.sin(s * 40) * .15 * (1 - lit) : 0;
      flame.style.transform = `translate(${(m * 1.6 + g * 2.2).toFixed(2)}px, ${(n * 1.2).toFixed(2)}px) scale(${((1 + n * .12 + g * .08) * lit).toFixed(3)}, ${((1 + m * .1) * lit).toFixed(3)}) rotate(${(m * 8 + g * 14).toFixed(1)}deg)`;
      flame.style.opacity = Math.min(1, lit * 1.3 + relight).toFixed(3);
      halo.style.opacity = ((.75 + n * .2 - Math.abs(g) * .15) * lit).toFixed(3);
      glow.style.opacity = ((.62 + n * .16 + m * .08 - Math.abs(g) * .12) * lit).toFixed(3);
      glow.style.transform = `translate(-50%,-50%) scale(${(1 + n * .045).toFixed(3)})`;
      const off = (1 - lit).toFixed(3);
      patch.style.opacity = off; wick.style.opacity = off; dim.style.opacity = (1 - lit) * .9;
      // fumaça do café acompanha o cursor
      wx += (twx - wx) * 0.06; wy += (twy - wy) * 0.06;
      sw.style.transform = `translate(${(wx * .55).toFixed(1)}px, ${(wy * .45).toFixed(1)}px) skewX(${(-wx * .12).toFixed(2)}deg)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- caderno fechado / capa ---------- */
  const cb = img(D.closedBook, '', 'closed'); cb.id = 'closedBook';
  cb.style.transform = '';
  function closedTf() {
    return MOB() ? 'translate(762px, 301px) scale(.861)' : applyOv('closed', D.closedBook.tf, D.closedBook.w, D.closedBook.h);
  }
  cb.style.setProperty('--closed-tf', closedTf());
    $('closedWrap').appendChild(cb);
  $('closedWrap').style.perspective = '2400px';
  $('closedWrap').style.perspectiveOrigin = '512px 630px';
  D.coverGroup.forEach((o, i) => { const e = img(o, '', 'cover:' + i); e.style.zIndex = [7, 13, 13, 11, 12][i]; $('cover').appendChild(e); });
  $('cover').style.zIndex = 7;
  // portada: etiqueta de encaje queda en z 8, texto por encima
  $('coverText').querySelector('.q').textContent = C.cover.q;
  $('coverText').querySelector('.l').textContent = C.cover.line;
  $('btnResumen').textContent = C.cover.btnResumen;
  $('btnProyectos').textContent = C.cover.btnProyectos;
  $('aboutTag').querySelector('.t').textContent = C.cover.tag;
  $('aboutTag').setAttribute('aria-label', C.cover.tag);
  $('bookGrp').appendChild(img(D.book, '', 'book'));
  $('bookGrp').appendChild(img(D.strap, '', 'strap'));
  function applyUi() {
    ['coverText', 'aboutTag'].forEach(id => {
      const o = E.ov['ui:' + id] || {}, el = $(id);
      el.style.translate = `${o.dx || 0}px ${o.dy || 0}px`;
      el.style.scale = String(o.s || 1);
      if (id === 'aboutTag') el.style.rotate = `${o.r || 0}deg`;
      el.style.display = E.hide['ui:' + id] ? 'none' : '';
    });
  }
  applyUi();
  $('pages').style.perspective = '2600px';
  $('pages').style.perspectiveOrigin = '780px 580px';

  /* ---------- páginas ---------- */
  function slotEl(frame, s) {
    const nm = nameOf(frame.src);
    let r = s.rect || INTERIOR[nm] || [0, 0, frame.w, frame.h];
    const k = s.inset || 0;
    r = [r[0] + k, r[1] + k, r[2] - 2 * k, r[3] - 2 * k];
    // posición real en la página (sin rotaciones de 90°)
    const M = new DOMMatrix(frame.tf);
    const P = (x, y) => M.transformPoint(new DOMPoint(x, y));
    const c = P(r[0] + r[2] / 2, r[1] + r[3] / 2);
    let ang = Math.atan2(M.b, M.a) * 180 / Math.PI;
    let w = r[2], h = r[3];
    const sx = Math.hypot(M.a, M.b);
    w *= sx; h *= sx;
    while (ang > 45) { ang -= 90; [w, h] = [h, w]; }
    while (ang < -45) { ang += 90; [w, h] = [h, w]; }
    const d = document.createElement('div');
    d.className = 'slot';
    d.style.width = w + 'px'; d.style.height = h + 'px';
    d.style.transform = `translate(${c.x}px, ${c.y}px) rotate(${ang}deg) translate(${-w / 2}px, ${-h / 2}px)`;
    d.innerHTML = s.video ? `<video src="${s.video}" poster="${s.poster || s.video.replace(/\.mp4$/, '.webp')}" muted loop playsinline autoplay preload="auto" aria-label="${s.caption || ''}"></video>`
      : s.img ? `<img src="${s.img}" alt="${s.caption || ''}">` : `<span>${s.caption || ''}</span>`;
    d._base = d.style.transform; d._w = w; d._h = h;
    return d;
  }
  function buildSide(sp, side) {
    const pc = document.createElement('div'); pc.className = 'pc';
    const items = (D.pages[sp.tpl] || {})[side] || [];
    const keyOf = o => `pg:${sp.id}:${side}:${items.indexOf(o)}`;
    const frames = items.filter(o => !STICKERS.includes(nameOf(o.src)));
    const frameEls = frames.map(o => { const e = img(o, '', keyOf(o)); pc.appendChild(e); return e; });
    ((sp.slots || {})[side] || []).forEach((s, si) => {
      const f = frames[s.frame]; if (!f || E.hide[keyOf(f)]) return;
      const sl = slotEl({ ...f, tf: frameEls[s.frame].style.transform }, s);
      const sk = `slot:${sp.id}:${side}:${si}`;
      sl.dataset.key = sk; sl.dataset.follow = keyOf(f);
      sl.style.transform = applyOv(sk, sl._base, sl._w, sl._h);
      if (E.hide[sk]) sl.style.display = 'none';
      pc.appendChild(sl);
    });
    items.filter(o => STICKERS.includes(nameOf(o.src))).forEach(o => pc.appendChild(img(o, '', keyOf(o))));
    E.add.filter(it => it.where === `pg:${sp.id}:${side}`).forEach(it => pc.appendChild(addEl(it)));
    const hk = `${sp.id}:${side}`;
    const t = document.createElement('div'); t.className = 'pc txt'; t.dataset.hkey = hk;
    t.innerHTML = E.html[hk] != null ? E.html[hk] : (sp[side] || '');
    [...t.children].forEach(c => c.classList.add('tb'));
    pc.appendChild(t);
    pc.querySelectorAll('[data-go]').forEach(li => li.addEventListener('click', e => { e.stopPropagation(); goTo(C.spreads.findIndex(s => s.id === li.dataset.go)); }));
    return pc;
  }
  const pageL = $('pageL'), pageR = $('pageR');

  /* ---------- elementos agregados (modo edición) ---------- */
  function addEl(it) {
    const e = img({ src: it.src, w: it.w, h: it.h, tf: `translate(${it.x}px, ${it.y}px)` }, 'added', 'add:' + it.id);
    return e;
  }
  function renderLayers() {
    [['layerDesk', 'desk'], ['layerCover', 'cover']].forEach(([id, w]) => {
      const L = $(id); L.innerHTML = '';
      if (w === 'desk') $('deskLayer').querySelectorAll('img.added').forEach(e => e.remove());
      E.add.filter(it => it.where === w).forEach(it => {
        const el = addEl(it);
        if (w === 'desk' && it.layer === 'under') { el.style.zIndex = 0; $('deskLayer').appendChild(el); }   // por baixo do iPod
        else L.appendChild(el);
      });
      const t = document.createElement('div'); t.className = 'pc txt'; t.dataset.hkey = 'layer:' + w;
      t.innerHTML = E.html['layer:' + w] || '';
      [...t.children].forEach(c => c.classList.add('tb'));
      L.appendChild(t);
    });
  }
  renderLayers();
  function fitAdds() {
    document.querySelectorAll('#layerDesk img.added, #deskLayer img.added').forEach(el => {
      const it = E.add.find(a => 'add:' + a.id === el.dataset.key); if (!it) return;
      el.style.transform = fitShift(applyOv(el.dataset.key, `translate(${it.x}px, ${it.y}px)`, it.w, it.h), it.w, it.h);
    });
    if (typeof setTitle === 'function' && !EDIT) setTitle(curSong[0], curSong[1]);
  }
  addEventListener('resize', () => { if (!EDIT && typeof state !== 'undefined' && D.desk.cafe.tf[state]) { deskTo(state); fitAdds(); } });
  function show(i, side) { const p = side === 'L' ? pageL : pageR; p.innerHTML = ''; p.appendChild(buildSide(C.spreads[i], side)); }

  /* ---------- estado y navegación ---------- */
  let state = 'loading', idx = -1, busy = false;
  function setState(s) {
    state = s; stage.dataset.state = s;
    cb.style.setProperty('--closed-tf', closedTf());
    if (D.desk.cafe.tf[s]) { deskTo(s); fitAdds(); } updateNav(); fit();
    if (s === 'pages' && MOB() && !EDIT && typeof mHintSchedule === 'function') { mhN = 0; mHintSchedule(1800); }
    if (s === 'cover' && !MOB() && !EDIT) { hintN = 0; scheduleHint(1500); } else if (typeof stopHint === 'function' && s !== 'cover') clearTimeout(hintT);
  }
  /* ---------- menu de seções (embaixo do caderno) ---------- */
  const SECS = [[UI.secs[0], 'autora'], [UI.secs[1], 'obras'], [UI.secs[2], 'ensayos'], [UI.secs[3], 'notas']];
  function goHome() {                     // fecha o caderno e volta para a mesa
    if (busy || state === 'closed') return;
    busy = true; idx = -1; mk = 0; setState('closed'); setTimeout(() => busy = false, 900);
  }
  const secStart = () => SECS.map(s => C.spreads.findIndex(x => x.id === s[1]));
  function secOf(i) { let r = 0; secStart().forEach((st, k) => { if (st >= 0 && i >= st) r = k; }); return r; }
  function buildSecMenu(el) {
    el.classList.add('secmenu');
    el.innerHTML = `<button type="button" class="home" aria-label="${UI.homeAria}">${UI.home}</button><i>·</i>` +
      SECS.map(s => `<button type="button" data-sec="${s[1]}">${s[0]}</button>`).join('<i>·</i>');
    el.querySelector('.home').onclick = e => { e.stopPropagation(); goHome(); };
    el.querySelectorAll('button[data-sec]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const i = C.spreads.findIndex(x => x.id === b.dataset.sec);
      if (i < 0 || busy) return;
      if (state === 'pages' && MOB()) return mflip(i * 2);
      jump(i);
    });
  }
  function updateNav() {
    const n = C.spreads.length;
    $('prev').disabled = state !== 'pages';
    $('next').disabled = state === 'pages' && idx >= n - 1;
    // menuzinho embaixo do caderno: marca a seção atual
    const cur = state === 'pages' ? secOf(MOB() ? (mk >> 1) : idx) : -1;
    document.querySelectorAll('.secmenu').forEach(m => m.querySelectorAll('button[data-sec]').forEach((b, i) => b.classList.toggle('on', i === cur)));
    // navegação do celular
    const all = C.spreads.length * 2;
    let pn = 0, ord = 0;
    for (let k = 0; k < all; k++) if (!MSKIP(k)) { pn++; if (k <= mk) ord = pn; }
    $('mprev').disabled = state !== 'pages';
    $('mnext').disabled = state === 'pages' && mstep(mk, 1) >= all;
  }

  /* ---------- virada de página realista (folha curva em tiras 3D) ---------- */
  const PW = 428, PH = 629, NS_ = 16, SW = PW / NS_, OV = 1.5;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smoother = t => t * t * t * (t * (6 * t - 15) + 10);
  const raf = () => new Promise(r => requestAnimationFrame(r));
  const decoded = el => Promise.all([...el.querySelectorAll('img')].map(i => (i.decode ? i.decode() : Promise.resolve()).catch(() => {})));
  const INK = '42,11,16';
  function makeShade(side) {
    const d = document.createElement('div');
    d.className = 'cast';
    d.style.cssText = `position:absolute;top:269px;left:${side === 'L' ? 352 : 780}px;width:${PW}px;height:${PH}px;pointer-events:none;z-index:25;opacity:0;will-change:opacity;` +
      `background:linear-gradient(${side === 'L' ? 'to left' : 'to right'}, rgba(${INK},.42), rgba(${INK},.12) 38%, rgba(${INK},0) 75%)`;
    $('pages').appendChild(d); return d;
  }
  // sombra de cada tira = capa lisa + degradê (só opacidade muda → animação leve, sem repintar a página)
  function shadeLayers(face) {
    const mk = bg => { const d = document.createElement('div'); d.style.cssText = `position:absolute;inset:0;pointer-events:none;opacity:0;will-change:opacity;background:${bg}`; face.appendChild(d); return d; };
    return { a: mk(`rgb(${INK})`), up: mk(`linear-gradient(to right, rgba(${INK},0), rgb(${INK}))`), dn: mk(`linear-gradient(to left, rgba(${INK},0), rgb(${INK}))`) };
  }
  function setShade(L, left, right) {
    const lo = Math.min(left, right);
    L.a.style.opacity = lo.toFixed(3);
    L.up.style.opacity = right > left ? (right - left).toFixed(3) : '0';
    L.dn.style.opacity = left > right ? (left - right).toFixed(3) : '0';
  }
  const specEl = k => buildSide(C.spreads[k >> 1], k % 2 ? 'R' : 'L');
  function showSpec(side, k) { const p = side === 'L' ? pageL : pageR; p.innerHTML = ''; p.appendChild(specEl(k)); }
  function flip(to) {
    if (busy || to === idx || to < 0 || to >= C.spreads.length) return;
    const fwd = to > idx;
    return flipCore(fwd, buildSide(C.spreads[idx], fwd ? 'R' : 'L'), buildSide(C.spreads[to], fwd ? 'L' : 'R'),
      () => show(to, fwd ? 'R' : 'L'), () => show(to, fwd ? 'L' : 'R'), () => { idx = to; });
  }
  // celular: todas as páginas passam pela página da direita, uma de cada vez.
  // A página esquerda das Notas (só cartas manuscritas, sem texto) não aparece no celular.
  function MSKIP(k) { const sp = C.spreads[k >> 1]; return !!sp && k % 2 === 0 && sp.id === 'notas'; }
  function mstep(k, d) { k += d; while (k >= 0 && k < C.spreads.length * 2 && MSKIP(k)) k += d; return k; }
  function mflip(k2) {
    const n = C.spreads.length * 2;
    if (MSKIP(k2)) k2 = mstep(k2, k2 > mk ? 1 : -1);
    if (busy || k2 === mk || k2 < 0 || k2 >= n) return;
    const fwd = k2 > mk;
    return mcurl(fwd, specEl(fwd ? mk : k2),
      () => { if (fwd) showSpec('R', k2); }, () => { if (!fwd) showSpec('R', k2); }, () => { mk = k2; idx = k2 >> 1; });
  }

  /* celular: dobra 2D (sem tiras 3D, então não aparecem linhas entre elas).
     A ponta de baixo da folha é levada até o outro lado; a dobra é a mediatriz
     entre a ponta e onde ela está agora. A parte dobrada é o reflexo da folha. */
  async function mcurl(fwd, frontSrc, under, land, commit) {
    busy = true; stage.classList.add('turning');
    const W = PW, H = PH;
    const host = document.createElement('div');
    host.className = 'curl';
    host.style.cssText = `position:absolute;left:780px;top:269px;width:${W}px;height:${H}px;z-index:30;pointer-events:none`;
    const mkLayer = (tex, src) => {
      const d = document.createElement('div');
      d.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0;will-change:transform,clip-path;` +
        (tex ? `background:url(${tex}) 0 0/${W}px ${H}px no-repeat` : `background:linear-gradient(100deg,#e9e5e1,#f1eeeb 45%,#e6e1dc)`);
      if (src) {
        const c = src.cloneNode(true);
        c.querySelectorAll('video').forEach(v => { const im = document.createElement('img'); im.src = v.getAttribute('poster') || ''; im.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top;display:block'; v.replaceWith(im); });
        c.style.cssText = `position:absolute;inset:0;width:${W}px;height:${H}px`;
        d.appendChild(c);
      }
      return d;
    };
    // sombra sobre a página de baixo, junto à dobra
    const ushadeBox = document.createElement('div');
    ushadeBox.style.cssText = `position:absolute;inset:0;overflow:hidden`;
    const ushade = document.createElement('div');
    ushade.style.cssText = `position:absolute;left:0;top:0;width:4000px;height:90px;transform-origin:0 0;will-change:transform,opacity;` +
      `background:linear-gradient(to bottom, rgba(40,10,14,.32), rgba(40,10,14,0))`;
    ushadeBox.appendChild(ushade);
    const front = mkLayer('assets/folha-dir.webp', frontSrc);
    const flap = mkLayer(null, null);   // verso liso: a textura da folha tem a borda do caderno e virava listras
    const fshade = document.createElement('div');
    fshade.style.cssText = `position:absolute;left:0;top:0;width:4000px;height:1px;transform-origin:0 0;will-change:transform`;
    flap.appendChild(fshade);
    flap.style.boxShadow = 'none';
    host.append(ushadeBox, front, flap);
    $('pages').appendChild(host);
    under();
    await decoded(host); await raf(); await raf();

    const C = { x: W, y: H };
    const clipHalf = (pts, f) => {          // Sutherland–Hodgman com um semiplano f(p) >= 0
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], fa = f(a), fb = f(b);
        if (fa >= 0) out.push(a);
        if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
      }
      return out;
    };
    const poly = pts => pts.length < 3 ? 'polygon(0 0,0 0,0 0)' : 'polygon(' + pts.map(p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(',') + ')';
    const RECT = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
    function pose(e) {
      const lift = 0.11 * H * Math.sin(Math.PI * e);
      const P = { x: W - 2 * W * e, y: H - lift };
      const nx = P.x - C.x, ny = P.y - C.y, L = Math.hypot(nx, ny);
      if (L < 0.5) { front.style.clipPath = 'none'; flap.style.clipPath = poly([]); ushade.style.opacity = 0; return; }
      const M = { x: (P.x + C.x) / 2, y: (P.y + C.y) / 2 };
      const f = p => nx * (p.x - M.x) + ny * (p.y - M.y);
      front.style.clipPath = poly(clipHalf(RECT, f));
      const beyond = clipHalf(RECT, p => -f(p));
      // reflexo na dobra (R) composto com o espelho da folha (F: u -> W-u) = rotação + translação
      const ux = nx / L, uy = ny / L;                      // normal unitária
      const r = (x, y) => { const d = (x - M.x) * ux + (y - M.y) * uy; return { x: x - 2 * d * ux, y: y - 2 * d * uy }; };
      const o = r(W, 0), a = r(W - 1, 0), b = r(W, 1);    // imagem de (0,0), (1,0), (0,1) em coordenadas locais
      flap.style.transform = `matrix(${(a.x - o.x).toFixed(5)},${(a.y - o.y).toFixed(5)},${(b.x - o.x).toFixed(5)},${(b.y - o.y).toFixed(5)},${o.x.toFixed(2)},${o.y.toFixed(2)})`;
      flap.style.clipPath = poly(beyond.map(p => ({ x: W - p.x, y: p.y })));
      // sombra na página de baixo (lado da ponta)
      const vx = -ux, vy = -uy;                            // do vinco para a ponta
      const phi = Math.atan2(-vx, vy) * 180 / Math.PI;
      ushade.style.transform = `translate(${M.x}px, ${M.y}px) rotate(${phi}deg) translate(-2000px, 0)`;
      ushade.style.opacity = Math.min(1, Math.sin(Math.PI * e) * 2.2).toFixed(3);
      // brilho/sombra na aba, a partir do vinco (em coordenadas locais da aba)
      const Ml = { x: W - M.x, y: M.y }, wl = { x: -vx, y: vy };
      const phl = Math.atan2(-wl.x, wl.y) * 180 / Math.PI;
      const span = Math.max(40, L / 2);
      fshade.style.height = span + 'px';
      fshade.style.transform = `translate(${Ml.x}px, ${Ml.y}px) rotate(${phl}deg) translate(-2000px, 0)`;
      fshade.style.background = `linear-gradient(to bottom, rgba(255,255,255,.35), rgba(255,255,255,0) 18%, rgba(60,20,24,.08) 55%, rgba(60,20,24,.16))`;
    }
    pose(fwd ? 0.0001 : 0.9999);
    const DUR = REDUCE ? 1 : 1150;
    await new Promise(done => {
      let t0 = null;
      const frame = now => {
        if (t0 == null) t0 = now;
        const p = Math.min(1, (now - t0) / DUR);
        const e = smoother(p);
        pose(fwd ? Math.max(0.0001, e) : Math.max(0.0001, 1 - e));
        if (p < 1) requestAnimationFrame(frame); else done();
      };
      requestAnimationFrame(frame);
    });
    land();
    await decoded(pageR); await raf();
    host.remove();
    commit(); busy = false; stage.classList.remove('turning');
    updateNav();
  }

  /* ---------- computador: arrastar a folha com o mouse ----------
     Dobra 2D que segue o cursor: a ponta da folha vai até o mouse e o vinco é a
     mediatriz entre a ponta original e o mouse. A aba dobrada mostra o verso real
     (a próxima página), com sombras no vinco, na aba e sobre a página de baixo. */
  const SPX = 780, PT = 269;
  const clipHalfG = (pts, f) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
    }
    return out;
  };
  const polyCss = (pts, ox, oy) => pts.length < 3 ? 'polygon(0 0,0 0,0 0)' : 'polygon(' + pts.map(p => `${(p.x - ox).toFixed(2)}px ${(p.y - oy).toFixed(2)}px`).join(',') + ')';
  function makeFold(fwd, frontSrc, backSrc, G) {
    G = Object.assign({ sx: SPX, top: PT, w: PW, h: PH }, G || {});
    const W = G.w, H = G.h;
    const fx0 = fwd ? G.sx : G.sx - W, bx0 = fwd ? G.sx - W : G.sx;
    const wrap = document.createElement('div');
    wrap.className = 'curl';
    wrap.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:30;pointer-events:none';
    const layer = (x0, tex, src) => {
      const d = document.createElement('div');
      d.style.cssText = `position:absolute;left:${x0}px;top:${G.top}px;width:${W}px;height:${H}px;transform-origin:0 0;will-change:transform,clip-path;overflow:hidden;` +
        (tex === 'none' ? 'background:transparent' : tex ? `background:url(${tex}) 0 0/${W}px ${H}px no-repeat` : `background:linear-gradient(${fwd ? 80 : 100}deg,#ebe7e3,#f3f1ee 40%,#eeebe7)`);
      if (src) {
        const c = src.cloneNode(true);
        c.querySelectorAll('video').forEach(v => { const im = document.createElement('img'); im.src = v.getAttribute('poster') || ''; im.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top;display:block'; v.replaceWith(im); });
        c.style.cssText = `position:absolute;inset:0;width:${W}px;height:${H}px`;
        d.appendChild(c);
      }
      return d;
    };
    const strip = bg => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:0;top:0;width:4000px;height:10px;transform-origin:0 0;will-change:transform,opacity;pointer-events:none;background:${bg}`; return d; };
    // sombra sobre a página que aparece por baixo
    const ubox = document.createElement('div');
    ubox.style.cssText = `position:absolute;left:${fx0}px;top:${G.top}px;width:${W}px;height:${H}px;overflow:hidden`;
    const ush = strip('linear-gradient(to bottom, rgba(40,10,14,.38), rgba(40,10,14,.12) 35%, rgba(40,10,14,0))');
    ubox.appendChild(ush);
    const front = layer(fx0, G.frontTex !== undefined ? G.frontTex : (fwd ? 'assets/folha-dir.webp' : 'assets/folha-esq.webp'), frontSrc);
    // a folha vai escurecendo de leve perto do vinco (ela está levantando ali)
    const fsh = strip('linear-gradient(to bottom, rgba(40,10,14,.22), rgba(40,10,14,0))');
    front.appendChild(fsh);
    // sombra projetada pela aba
    const NSV = 'http://www.w3.org/2000/svg', fid = 'fs' + Date.now();
    const svg = document.createElementNS(NSV, 'svg');
    svg.setAttribute('width', 1440); svg.setAttribute('height', 1024);
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
    svg.innerHTML = `<defs><filter id="${fid}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter></defs><polygon fill="rgb(30,8,12)" filter="url(#${fid})"/>`;
    const spoly = svg.querySelector('polygon');
    const flap = layer(bx0, G.backTex || null, backSrc);   // verso: papel liso + conteúdo (a textura tem a borda do caderno, que não vira junto)
    const flsh = strip('');
    flap.appendChild(flsh);
    wrap.append(ubox, front, svg, flap);
    (G.host || $('pages')).appendChild(wrap);
    const RECT = [{ x: fx0, y: G.top }, { x: fx0 + W, y: G.top }, { x: fx0 + W, y: G.top + H }, { x: fx0, y: G.top + H }];
    const rot = (d, ox, oy, el, h, op) => {   // faixa encostada no vinco, crescendo na direção d
      const phi = Math.atan2(-d.x, d.y) * 180 / Math.PI;
      el.style.height = h.toFixed(1) + 'px';
      el.style.transform = `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px) rotate(${phi.toFixed(3)}deg) translate(-2000px, 0)`;
      el.style.opacity = op.toFixed(3);
    };
    function set(P, Cn) {
      const nx = P.x - Cn.x, ny = P.y - Cn.y, L = Math.hypot(nx, ny);
      if (L < 0.5) {
        front.style.clipPath = 'none'; flap.style.clipPath = polyCss([], 0, 0);
        spoly.setAttribute('points', ''); ush.style.opacity = 0; fsh.style.opacity = 0; return;
      }
      const ux = nx / L, uy = ny / L, M = { x: (P.x + Cn.x) / 2, y: (P.y + Cn.y) / 2 };
      const f = p => (p.x - M.x) * ux + (p.y - M.y) * uy;
      front.style.clipPath = polyCss(clipHalfG(RECT, f), fx0, G.top);
      const beyond = clipHalfG(RECT, p => -f(p));
      const r = p => { const d = f(p); return { x: p.x - 2 * d * ux, y: p.y - 2 * d * uy }; };
      const S = p => ({ x: 2 * G.sx - p.x, y: p.y });
      const Gm = (u, v) => r(S({ x: bx0 + u, y: G.top + v }));
      const o = Gm(0, 0), a = Gm(1, 0), b = Gm(0, 1);
      flap.style.transform = `matrix(${(a.x - o.x).toFixed(5)},${(a.y - o.y).toFixed(5)},${(b.x - o.x).toFixed(5)},${(b.y - o.y).toFixed(5)},${(o.x - bx0).toFixed(2)},${(o.y - G.top).toFixed(2)})`;
      flap.style.clipPath = polyCss(beyond.map(S), bx0, G.top);
      // quanto a folha já andou (0 = deitada no lugar, 1 = deitada do outro lado)
      const prog = Math.min(1, Math.abs(Cn.x - P.x) / (2 * W));
      const k = Math.sin(Math.PI * Math.min(1, prog * 1.05));
      const flapPts = beyond.map(r);
      spoly.setAttribute('points', flapPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
      spoly.setAttribute('fill-opacity', (0.32 * k).toFixed(3));
      spoly.setAttribute('transform', `translate(${(-ux * 6 * k).toFixed(1)} ${(4 * k).toFixed(1)})`);
      // sombra na página de baixo, do vinco em direção à ponta
      rot({ x: -ux, y: -uy }, M.x - fx0, M.y - G.top, ush, Math.max(30, Math.min(140, L * 0.35)), Math.min(1, k * 1.6));
      // escurecido na frente da folha, junto ao vinco (fica por baixo da aba, aparece nas bordas)
      rot({ x: ux, y: uy }, M.x - fx0, M.y - G.top, fsh, Math.max(20, Math.min(90, L * 0.25)), k * .9);
      // brilho e sombra na aba (coordenadas locais da aba)
      const Ml = S(M);
      const span = Math.max(40, L * 0.55);
      flsh.style.background = `linear-gradient(to bottom, rgba(40,10,14,${(0.28 * k + .04).toFixed(3)}), rgba(40,10,14,0) 22%, rgba(255,255,255,${(0.22 * k).toFixed(3)}) 48%, rgba(255,255,255,0) 72%, rgba(40,10,14,${(0.08 * k).toFixed(3)}))`;
      rot({ x: ux, y: -uy }, Ml.x - bx0, Ml.y - G.top, flsh, span, 1);
    }
    return { set, remove: () => wrap.remove(), wrap };
  }
  // limita a ponta para a folha não "rasgar" na lombada
  function constrainP(P, Cn, G) {
    G = G || { sx: SPX, top: PT, w: PW, h: PH };
    const A = { x: G.sx, y: Cn.y }, B = { x: G.sx, y: Cn.y === G.top ? G.top + G.h : G.top };
    let q = { x: P.x, y: P.y };
    let d = Math.hypot(q.x - A.x, q.y - A.y);
    if (d > G.w) q = { x: A.x + (q.x - A.x) * G.w / d, y: A.y + (q.y - A.y) * G.w / d };
    const diag = Math.hypot(G.w, G.h);
    d = Math.hypot(q.x - B.x, q.y - B.y);
    if (d > diag) q = { x: B.x + (q.x - B.x) * diag / d, y: B.y + (q.y - B.y) * diag / d };
    return q;
  }
  {
    let D = null;          // folha em movimento: { fold, fwd, to, C, P, T, mode, vx, lastT }
    let pend = null;
    const canDrag = () => !MOB() && !EDIT && state === 'pages';
    const sideAt = (x, y) => {
      if (y < PT - 6 || y > PT + PH + 6) return null;
      if (x >= SPX && x <= SPX + PW + 10) return true;
      if (x >= SPX - PW - 10 && x < SPX) return false;
      return null;
    };
    const cornerFor = (fwd, y) => ({ x: fwd ? SPX + PW : SPX - PW, y: y < PT + PH / 2 ? PT : PT + PH });
    function begin(fwd, y, mode) {
      const to = idx + (fwd ? 1 : -1);
      if (to < 0 || to >= C.spreads.length) return null;
      busy = true; stage.classList.add('turning');
      const fold = makeFold(fwd, buildSide(C.spreads[idx], fwd ? 'R' : 'L'), buildSide(C.spreads[to], fwd ? 'L' : 'R'));
      show(to, fwd ? 'R' : 'L');            // a página que aparece por baixo
      const Cn = cornerFor(fwd, y);
      D = { fold, fwd, to, C: Cn, P: { ...Cn }, T: { ...Cn }, mode, vx: 0, lastX: null, lastT: 0, anim: null };
      fold.set(D.P, D.C);
      requestAnimationFrame(loop);
      return D;
    }
    function finish(done) {
      const d = D; D = null;
      if (done) { show(d.to, d.fwd ? 'L' : 'R'); idx = d.to; }
      else show(idx, d.fwd ? 'R' : 'L');
      requestAnimationFrame(() => { d.fold.remove(); busy = false; stage.classList.remove('turning'); updateNav(); });
    }
    function settle(done) {
      const d = D; if (!d) return;
      const end = done ? { x: 2 * SPX - d.C.x, y: d.C.y } : { ...d.C };
      const from = { ...d.P }, dist = Math.hypot(end.x - from.x, end.y - from.y);
      const dur = Math.max(260, Math.min(720, dist * 0.9));
      const lift = done ? Math.min(70, dist * 0.08) * (d.C.y === PT ? 1 : -1) : 0;
      d.mode = 'anim'; d.anim = { from, end, t0: performance.now(), dur, lift, done };
    }
    function loop(now) {
      const d = D; if (!d) return;
      if (d.mode === 'anim') {
        const a = d.anim, t = Math.min(1, (now - a.t0) / a.dur);
        const e = 1 - Math.pow(1 - t, 3);                       // desacelera no fim, como papel pousando
        const P = { x: a.from.x + (a.end.x - a.from.x) * e, y: a.from.y + (a.end.y - a.from.y) * e + a.lift * Math.sin(Math.PI * e) };
        d.P = constrainP(P, d.C);
        d.fold.set(d.P, d.C);
        if (t >= 1) { finish(a.done); return; }
      } else {
        const dt = d.lastT ? Math.min(50, now - d.lastT) : 16.7; d.lastT = now;
        const k = 1 - Math.pow(1 - (d.mode === 'peek' ? .16 : .3), dt / 16.7);   // segue o mouse com um leve atraso (peso do papel)
        d.P = { x: d.P.x + (d.T.x - d.P.x) * k, y: d.P.y + (d.T.y - d.P.y) * k };
        d.fold.set(d.P, d.C);
        if (d.mode === 'leaving' && Math.hypot(d.P.x - d.C.x, d.P.y - d.C.y) < 0.8) { finish(false); return; }
      }
      requestAnimationFrame(loop);
    }
    // a ponta levanta um pouquinho quando o mouse chega perto do canto
    function peekTarget(fwd, x, y, Cn) {
      const ix = fwd ? -1 : 1, iy = Cn.y === PT ? 1 : -1;
      const dx = Math.abs(x - Cn.x), dy = Math.abs(y - Cn.y);
      return constrainP({ x: Cn.x + ix * (34 + Math.max(0, 50 - dx) * .5), y: Cn.y + iy * (26 + Math.max(0, 50 - dy) * .4) }, Cn);
    }
    const nearCorner = (fwd, x, y) => {
      const cx = fwd ? SPX + PW : SPX - PW;
      return Math.abs(x - cx) < 70 && (Math.abs(y - PT) < 80 || Math.abs(y - (PT + PH)) < 80);
    };
    stage.addEventListener('pointerdown', e => {
      if (!canDrag() || e.button !== 0 || e.pointerType !== 'mouse') return;
      if (e.target.closest && e.target.closest('a,button,[data-go],#nav,#carta,#edBar,#edPanel')) return;
      const [x, y] = toStage(e.clientX, e.clientY);
      if (D && D.mode === 'peek') {
        D.mode = 'drag'; D.T = constrainP({ x, y }, D.C); D.lastX = x; D.lastT2 = performance.now();
        stage.setPointerCapture(e.pointerId); e.preventDefault(); pageCursor = 'grabbing'; return;
      }
      if (busy) return;
      const fwd = sideAt(x, y); if (fwd == null) return;
      pend = { x, y, fwd, id: e.pointerId };
    });
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const [x, y] = toStage(e.clientX, e.clientY);
      if (pend && !D && Math.hypot(x - pend.x, y - pend.y) > 6) {
        if (begin(pend.fwd, pend.y, 'drag')) {
          try { stage.setPointerCapture(pend.id); } catch (_) {}
          getSelection && getSelection().removeAllRanges();
          D.lastX = x; D.lastT2 = performance.now();
        }
        pend = null;
      }
      if (D && D.mode === 'drag') {
        const now = performance.now(), dt = Math.max(1, now - (D.lastT2 || now));
        D.vx = D.vx * .6 + ((x - (D.lastX ?? x)) / dt) * .4; D.lastX = x; D.lastT2 = now;
        D.T = constrainP({ x, y }, D.C);
        pageCursor = 'grabbing';
        return;
      }
      if (!canDrag() || (busy && !(D && (D.mode === 'peek' || D.mode === 'leaving')))) { if (!D) pageCursor = ''; return; }
      const fwd = sideAt(x, y);
      const corner = fwd != null && nearCorner(fwd, x, y) && (idx + (fwd ? 1 : -1)) >= 0 && (idx + (fwd ? 1 : -1)) < C.spreads.length;
      pageCursor = fwd != null && (idx + (fwd ? 1 : -1)) >= 0 && (idx + (fwd ? 1 : -1)) < C.spreads.length ? 'grab' : '';
      if (corner) {
        if (D && (D.mode === 'peek' || D.mode === 'leaving') && D.fwd === fwd && D.C.y === cornerFor(fwd, y).y) { D.mode = 'peek'; D.T = peekTarget(fwd, x, y, D.C); }
        else if (!D && !busy) { begin(fwd, y, 'peek'); D.T = peekTarget(fwd, x, y, D.C); }
      } else if (D && D.mode === 'peek') { D.mode = 'leaving'; D.T = { ...D.C }; }
    });
    const up = e => {
      pend = null;
      if (!D || D.mode !== 'drag') return;
      const d = D;
      const crossed = d.fwd ? d.P.x < SPX + PW * .35 : d.P.x > SPX - PW * .35;
      const flick = d.fwd ? d.vx < -0.45 : d.vx > 0.45;
      const back = d.fwd ? d.vx > 0.45 : d.vx < -0.45;
      settle((crossed || flick) && !back);
      pageCursor = '';
    };
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
  }

  /* ---------- capa (página das estrelinhas): vira como uma folha do caderno ----------
     Mesma dobra das páginas. Por baixo aparece a página da direita de "Sobre mí";
     o verso da folha é a página da esquerda. Ao pousar, o caderno passa para as páginas. */
  const GC = { sx: 763, top: 292, w: 407, h: 622 };
  let CV = null, cvPend = null, cvDragged = false;
  const scaled = (el, tex) => {          // página (428 × 629) encolhida para a folha da capa
    const w = document.createElement('div'); w.style.cssText = `position:absolute;inset:0;overflow:hidden`;
    const i = document.createElement('div');
    i.style.cssText = `position:absolute;left:0;top:0;width:${PW}px;height:${PH}px;transform-origin:0 0;transform:scale(${GC.w / PW},${GC.h / PH});` + (tex ? `background:url(${tex}) 0 0/${PW}px ${PH}px no-repeat` : '');
    i.appendChild(el); w.appendChild(i); return w;
  };
  function coverFront() {               // a página das estrelinhas como está na tela
    const d = document.createElement('div');
    const i = document.createElement('div');
    i.style.cssText = `position:absolute;left:${-GC.sx}px;top:${-GC.top}px;width:1440px;height:1024px`;
    // os clones mantêm o id da raiz (para herdar os estilos); os originais vêm antes no documento
    [$('cover'), $('layerCover')].forEach(src => { const c = src.cloneNode(true); c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); c.style.transition = 'none'; i.appendChild(c); });
    d.appendChild(i); return d;
  }
  // a folha da capa vai "crescendo" até o tamanho exato da página enquanto vira (e a capa junto),
  // assim ao pousar não há ajuste nenhum
  function geoM(t) {
    t = Math.max(0, Math.min(1, t));
    const bx = 1 + (PW / GC.w - 1) * t, by = 1 + (PH / GC.h - 1) * t;
    const ax = (GC.sx + (SPX - GC.sx) * t) - GC.sx * bx, ay = (GC.top + (PT - GC.top) * t) - GC.top * by;
    return `translate(${ax.toFixed(2)}px, ${ay.toFixed(2)}px) scale(${bx.toFixed(5)}, ${by.toFixed(5)})`;
  }
  function cvGeo(t) {
    const m = geoM(t);
    [CV && CV.host, $('cover'), $('layerCover')].forEach(el => { if (el) { el.style.transition = 'none'; el.style.transformOrigin = '0 0'; el.style.transform = m; } });
  }
  function cvClearGeo() { [$('cover'), $('layerCover')].forEach(el => { el.style.transform = ''; el.style.transformOrigin = ''; el.style.transition = ''; }); }
  function cvBegin(y, mode, rev) {
    if (CV || state !== (rev ? 'pages' : 'cover')) return null;
    busy = true;
    if (rev) {                                         // volta: a capa reaparece por baixo, já no tamanho da página
      stage.classList.add('cvnojump');
      idx = -1; setState('cover');
    }
    const host = document.createElement('div'); host.id = 'coverFlip';
    host.style.cssText = 'position:absolute;inset:0;z-index:44;pointer-events:none;transition:opacity .35s ease';
    const under = document.createElement('div');
    under.style.cssText = `position:absolute;left:${GC.sx}px;top:${GC.top}px;width:${GC.w}px;height:${GC.h}px;overflow:hidden;opacity:${rev ? 1 : 0};transition:opacity .15s ease`;
    under.appendChild(scaled(buildSide(C.spreads[0], 'R'), 'assets/folha-dir.webp'));
    host.appendChild(under); stage.appendChild(host);
    const fold = makeFold(true, coverFront(), scaled(buildSide(C.spreads[0], 'L'), null), Object.assign({ host, frontTex: 'none' }, GC));
    const Cn = { x: GC.sx + GC.w, y: y < GC.top + GC.h * .45 ? GC.top : GC.top + GC.h };
    const M0 = { x: 2 * GC.sx - Cn.x, y: Cn.y };
    const P0 = rev ? { ...M0 } : { ...Cn };
    CV = { host, under, fold, C: Cn, M0, rev: !!rev, P: P0, T: { ...P0 }, mode, vx: 0, lastX: null, lastT: 0, ft: 0 };
    fold.set(CV.P, CV.C);
    if (mode !== 'demo') cvGeo(rev ? 1 : 0);
    requestAnimationFrame(() => { under.style.opacity = 1; if (mode !== 'demo') stage.classList.add('cvflip'); });
    getSelection && getSelection().removeAllRanges();
    requestAnimationFrame(cvLoop);
    return CV;
  }
  function cvLoop(now) {
    const d = CV; if (!d) return;
    if (d.mode === 'anim' || d.mode === 'demo') {
      const a = d.anim, t = Math.min(1, (now - a.t0) / a.dur);
      const P = a.path(t);
      d.P = constrainP(P, d.C, GC); d.fold.set(d.P, d.C);
      if (d.mode !== 'demo') cvGeo((d.C.x - d.P.x) / (2 * GC.w));
      if (d.finger) d.finger.style.transform = `translate(${d.P.x}px, ${d.P.y}px) rotate(-28deg)`;
      if (t >= 1) return cvFinish(a.done);
    } else {
      const dt = d.ft ? Math.min(50, now - d.ft) : 16.7; d.ft = now;
      const k = 1 - Math.pow(1 - .3, dt / 16.7);
      d.P = { x: d.P.x + (d.T.x - d.P.x) * k, y: d.P.y + (d.T.y - d.P.y) * k };
      d.fold.set(d.P, d.C);
      cvGeo((d.C.x - d.P.x) / (2 * GC.w));
    }
    requestAnimationFrame(cvLoop);
  }
  function cvSettle(done) {
    const d = CV; if (!d) return;
    const end = (done !== d.rev) ? { ...d.M0 } : { ...d.C };   // ida: pousa à esquerda; volta: pousa à direita
    const from = { ...d.P }, dist = Math.hypot(end.x - from.x, end.y - from.y);
    const lift = Math.min(70, dist * .08) * (d.C.y === GC.top ? 1 : -1) * (done ? 1 : .3);
    d.mode = 'anim';
    d.anim = { t0: performance.now(), dur: Math.max(260, Math.min(760, dist * .9)), done,
      path: t => { const e = 1 - Math.pow(1 - t, 3); return { x: from.x + (end.x - from.x) * e, y: from.y + (end.y - from.y) * e + lift * Math.sin(Math.PI * e) }; } };
  }
  function cvFinish(done) {
    const d = CV; CV = null;
    if (d.finger) d.finger.remove();
    const toPagesNow = d.rev ? !done : done;
    if (d.mode === 'demo' || (!toPagesNow && !d.rev)) {          // dica ou desistiu: fica na capa
      stage.classList.remove('cvflip'); d.host.remove(); cvClearGeo(); busy = false; return;
    }
    if (toPagesNow) {
      // a folha pousou exatamente onde ficam as páginas: troca sem nenhum ajuste
      stage.classList.add('cvnojump');
      idx = 0; mk = 0; show(0, 'L'); show(0, 'R'); setState('pages');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        d.host.remove(); stage.classList.remove('cvflip');
        setTimeout(() => { cvClearGeo(); stage.classList.remove('cvnojump'); busy = false; }, 320);
      }));
    } else {                                                      // voltou para a capa de estrelinhas
      d.host.remove(); cvClearGeo(); stage.classList.remove('cvflip');
      requestAnimationFrame(() => { stage.classList.remove('cvnojump'); busy = false; });
    }
  }
  function cvBackAuto() {                           // voltar da primeira página para a capa
    if (busy || state !== 'pages' || idx !== 0 || MOB()) return false;
    if (cvBegin(GC.top + GC.h, 'anim', true)) { cvSettle(true); return true; }
    return false;
  }
  function cvAuto() {                               // clique: a folha vira sozinha
    if (busy || state !== 'cover') return;
    stopHint();
    if (cvBegin(GC.top + GC.h, 'anim')) cvSettle(true);
  }
  // dedinho vermelho que levanta a pontinha da folha (mostra que dá para virar)
  const FINGER = `<svg viewBox="0 0 60 92" width="46" height="70" aria-hidden="true"><path d="M23 88 C 15 72, 11 60, 13 47 L 18 13 C 19 5, 31 5, 32 13 L 32 40 C 36 35, 44 36, 45 43 C 49 39, 57 41, 57 50 L 55 67 C 53 79, 45 87, 36 90 Z" fill="#fff" fill-opacity=".9" stroke="#b3122a" stroke-width="3.2" stroke-linejoin="round"/><path d="M19 17 C 22 13.5, 28 13.5, 30.5 17" fill="none" stroke="#b3122a" stroke-width="2.2" stroke-linecap="round"/><path d="M33 52 C 36 50, 40 50, 43 52" fill="none" stroke="#b3122a" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>`;
  let hintT = 0, hintN = 0;
  function stopHint() { clearTimeout(hintT); if (CV && CV.mode === 'demo') { const d = CV; CV = null; d.finger && d.finger.remove(); d.host.remove(); stage.classList.remove('cvflip'); busy = false; } }
  function scheduleHint(ms) { clearTimeout(hintT); if (hintN < 3 && !REDUCE) hintT = setTimeout(playHint, ms); }
  function playHint() {
    if (state !== 'cover' || busy || CV || EDIT) return;
    const d = cvBegin(GC.top + GC.h, 'demo'); if (!d) return;
    hintN++;
    const f = document.createElement('div'); f.className = 'cv-finger'; f.innerHTML = FINGER;
    d.host.appendChild(f); d.finger = f;
    const C0 = d.C, lift = { x: C0.x - 62, y: C0.y - 74 };
    d.anim = { t0: performance.now(), dur: 2600, done: false, path: t => {
      const ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      f.style.opacity = t < .12 ? t / .12 : t > .88 ? (1 - t) / .12 : 1;
      if (t < .15) return { ...C0 };
      if (t < .5) { const e = ease((t - .15) / .35); return { x: C0.x + (lift.x - C0.x) * e, y: C0.y + (lift.y - C0.y) * e }; }
      if (t < .65) return { ...lift };
      const e = ease(Math.min(1, (t - .65) / .3)); return { x: lift.x + (C0.x - lift.x) * e, y: lift.y + (C0.y - lift.y) * e };
    } };
    // depois de um tempinho, mostra de novo se ninguém mexeu
    setTimeout(() => scheduleHint(6500), 2700);
  }
  // arrastar a folha da capa (mouse ou dedo)
  stage.addEventListener('pointerdown', e => {
    if (EDIT) return;
    const back = state === 'pages' && idx === 0 && !MOB();
    if (state !== 'cover' && !back) return;
    stopHint();
    if (busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.target.closest && e.target.closest('a,button,[data-go],#coverText,#carta,#nav,#edBar,#edPanel,#layerCover .blk')) return;
    const [x, y] = toStage(e.clientX, e.clientY);
    if (back) { if (x < SPX - PW - 10 || x >= SPX || y < PT - 10 || y > PT + PH + 10) return; }
    else if (x < GC.sx || x > GC.sx + GC.w + 12 || y < GC.top - 10 || y > GC.top + GC.h + 10) return;
    cvPend = { x, y, id: e.pointerId, rev: back }; cvDragged = false;
    e.preventDefault();                               // não seleciona texto ao arrastar
  }, true);
  addEventListener('pointermove', e => {
    if (!cvPend && !(CV && CV.mode === 'drag')) return;
    const [x, y] = toStage(e.clientX, e.clientY);
    if (cvPend && !CV) {
      if (Math.hypot(x - cvPend.x, y - cvPend.y) < 7) return;
      if (cvPend.rev ? x < cvPend.x : x > cvPend.x) { cvPend = null; return; }   // ida: para a esquerda; volta: para a direita
      const yy = cvPend.rev ? GC.top + (cvPend.y - PT) * GC.h / PH : cvPend.y;
      if (cvBegin(yy, 'drag', cvPend.rev)) { cvDragged = true; try { stage.setPointerCapture(cvPend.id); } catch (_) {} CV.start = { x: cvPend.x, y: cvPend.y }; CV.lastX = x; CV.lastT = performance.now(); }
      cvPend = null;
    }
    if (!CV || CV.mode !== 'drag') return;
    const now = performance.now(), dt = Math.max(1, now - CV.lastT);
    CV.vx = CV.vx * .6 + ((x - CV.lastX) / dt) * .4; CV.lastX = x; CV.lastT = now;
    const base = CV.rev ? CV.M0 : CV.C;
    const tx = base.x + (x - CV.start.x) * (e.pointerType === 'mouse' ? 1 : 1.2), ty = base.y + (y - CV.start.y) * .7;
    CV.T = constrainP({ x: tx, y: ty }, CV.C, GC);
    e.preventDefault();
  }, { passive: false });
  const cvUp = () => {
    cvPend = null;
    if (!CV || CV.mode !== 'drag') return;
    if (CV.rev) { const moved = CV.P.x - CV.M0.x; cvSettle((moved > GC.w * .45 || CV.vx > .35) && !(CV.vx < -.35)); return; }
    const moved = CV.C.x - CV.P.x;
    cvSettle((moved > GC.w * .45 || CV.vx < -.35) && !(CV.vx > .35));
  };
  addEventListener('pointerup', cvUp); addEventListener('pointercancel', cvUp);

  /* ---------- celular: o dedinho também aparece na primeira página (Sobre mí) ---------- */
  let mhT = 0, mhN = 0, MH = null;
  function mHintStop() {
    clearTimeout(mhT);
    if (MH) { const h = MH; MH = null; h.fold.remove(); h.finger.remove(); showSpec('R', mk); busy = false; }
  }
  function mHintSchedule(ms) { clearTimeout(mhT); if (mhN < 3 && !REDUCE) mhT = setTimeout(mHintPlay, ms); }
  function mHintPlay() {
    if (!MOB() || EDIT || state !== 'pages' || mk !== 0 || busy || MH) return;
    const k2 = mstep(mk, 1); if (k2 >= C.spreads.length * 2) return;
    busy = true; mhN++;
    const fold = makeFold(true, specEl(mk), null);
    showSpec('R', k2);
    const f = document.createElement('div'); f.className = 'cv-finger'; f.innerHTML = FINGER;
    f.style.zIndex = 60; $('pages').appendChild(f);
    MH = { fold, finger: f };
    const C0 = { x: SPX + PW, y: PT + PH }, lift = { x: C0.x - 70, y: C0.y - 84 };
    const t0 = performance.now(), dur = 2600;
    const ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const fr = now => {
      if (!MH || MH.fold !== fold) return;
      const t = Math.min(1, (now - t0) / dur);
      let P;
      if (t < .15) P = { ...C0 };
      else if (t < .5) { const e = ease((t - .15) / .35); P = { x: C0.x + (lift.x - C0.x) * e, y: C0.y + (lift.y - C0.y) * e }; }
      else if (t < .65) P = { ...lift };
      else { const e = ease(Math.min(1, (t - .65) / .3)); P = { x: lift.x + (C0.x - lift.x) * e, y: lift.y + (C0.y - lift.y) * e }; }
      fold.set(P, C0);
      f.style.opacity = t < .12 ? t / .12 : t > .88 ? (1 - t) / .12 : 1;
      f.style.transform = `translate(${P.x}px, ${P.y}px) rotate(-28deg) scale(1.5)`;
      if (t < 1) requestAnimationFrame(fr);
      else { mHintStop(); mHintSchedule(6500); }
    };
    requestAnimationFrame(fr);
  }
  addEventListener('pointerdown', () => { if (MOB()) { mhN = 9; mHintStop(); } }, true);

  /* ---------- celular: arrastar a folha com o dedo ----------
     Mesmo motor de dobra do computador. Para frente: puxa a página para a esquerda.
     Para trás: puxa da esquerda para a direita e a página anterior vem por cima. */
  {
    let D = null, pend = null;
    const can = () => MOB() && !EDIT && state === 'pages';
    stage.addEventListener('pointerdown', e => {
      if (!can() || busy || D || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (e.target.closest && e.target.closest('a,button,[data-go],#mnav,#carta')) return;
      const [x, y] = toStage(e.clientX, e.clientY);
      if (y < PT - 20 || y > PT + PH + 20 || x < SPX - 20 || x > SPX + PW + 20) return;
      pend = { x, y, id: e.pointerId, t: performance.now() };
    });
    function begin(fwd) {
      const k2 = mstep(mk, fwd ? 1 : -1);
      if (k2 < 0 || k2 >= C.spreads.length * 2) return false;
      busy = true; stage.classList.add('turning');
      const Cn = { x: SPX + PW, y: pend.y < PT + PH * .45 ? PT : PT + PH };
      const M0 = { x: SPX - PW, y: Cn.y };
      const fold = makeFold(true, specEl(fwd ? mk : k2), null);
      if (fwd) showSpec('R', k2);
      const P0 = fwd ? { ...Cn } : { ...M0 };
      D = { fold, fwd, k2, C: Cn, M0, P: P0, T: P0, start: { x: pend.x, y: pend.y }, mode: 'drag', vx: 0, lastX: pend.x, lastT: performance.now(), ft: 0 };
      fold.set(D.P, D.C);
      try { stage.setPointerCapture(pend.id); } catch (_) {}
      requestAnimationFrame(loop);
      return true;
    }
    function loop(now) {
      const d = D; if (!d) return;
      if (d.mode === 'anim') {
        const a = d.anim, t = Math.min(1, (now - a.t0) / a.dur), e = 1 - Math.pow(1 - t, 3);
        d.P = constrainP({ x: a.from.x + (a.end.x - a.from.x) * e, y: a.from.y + (a.end.y - a.from.y) * e + a.lift * Math.sin(Math.PI * e) }, d.C);
        d.fold.set(d.P, d.C);
        if (t >= 1) return finish(a.done);
      } else {
        const dt = d.ft ? Math.min(50, now - d.ft) : 16.7; d.ft = now;
        const k = 1 - Math.pow(1 - .34, dt / 16.7);
        d.P = { x: d.P.x + (d.T.x - d.P.x) * k, y: d.P.y + (d.T.y - d.P.y) * k };
        d.fold.set(d.P, d.C);
      }
      requestAnimationFrame(loop);
    }
    function finish(done) {
      const d = D; D = null;
      if (d.fwd) { if (done) mk = d.k2; else showSpec('R', mk); }
      else if (done) { showSpec('R', d.k2); mk = d.k2; }
      idx = mk >> 1;
      requestAnimationFrame(() => { d.fold.remove(); busy = false; stage.classList.remove('turning'); updateNav(); });
    }
    addEventListener('pointermove', e => {
      if (!pend && !D) return;
      const [x, y] = toStage(e.clientX, e.clientY);
      if (pend && !D) {
        const dx = x - pend.x, dy = y - pend.y;
        if (Math.hypot(dx, dy) < 8) return;
        if (Math.abs(dx) < Math.abs(dy) * .7 || !begin(dx < 0)) { pend = null; return; }
        pend = null;
      }
      if (!D || D.mode !== 'drag') return;
      const now = performance.now(), dt = Math.max(1, now - D.lastT);
      D.vx = D.vx * .6 + ((x - D.lastX) / dt) * .4; D.lastX = x; D.lastT = now;
      // a ponta acompanha o dedo (com um pouco mais de alcance), levantando de leve no meio do caminho
      const base = D.fwd ? D.C : D.M0;
      const tx = base.x + (x - D.start.x) * 1.25;
      const prog = Math.min(1, Math.abs(tx - base.x) / (2 * PW));
      const lift = Math.sin(Math.PI * prog) * 40 * (D.C.y === PT ? 1 : -1);
      D.T = constrainP({ x: tx, y: base.y + (y - D.start.y) * .6 + lift }, D.C);
      e.preventDefault();
    }, { passive: false });
    const up = () => {
      pend = null;
      if (!D || D.mode !== 'drag') return;
      const d = D;
      const moved = d.fwd ? d.C.x - d.P.x : d.P.x - d.M0.x;
      const flickOn = d.fwd ? d.vx < -0.3 : d.vx > 0.3, flickBack = d.fwd ? d.vx > 0.3 : d.vx < -0.3;
      const done = (moved > PW * .5 || flickOn) && !flickBack;
      const end = done === d.fwd ? { ...d.M0 } : { ...d.C };
      const from = { ...d.P }, dist = Math.hypot(end.x - from.x, end.y - from.y);
      d.mode = 'anim';
      d.anim = { from, end, t0: performance.now(), dur: Math.max(240, Math.min(650, dist * .85)), lift: Math.min(50, dist * .07) * (d.C.y === PT ? 1 : -1), done };
    };
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
  }

  async function flipCore(fwd, frontSrc, backSrc, under, land, commit) {
    busy = true; stage.classList.add('turning');
    // no celular: menos tiras e mais sobreposição (as GPUs móveis abrem frestas entre as tiras)
    const NS = MOB() ? 8 : NS_, SWd = PW / NS, OVd = MOB() ? 5 : OV;
    const dir = fwd ? -1 : 1;
    const frontTex = fwd ? 'assets/folha-dir.webp' : 'assets/folha-esq.webp';
    const backTex = fwd ? 'assets/folha-esq.webp' : 'assets/folha-dir.webp';
    const root = document.createElement('div');
    root.className = 'curl';
    root.style.cssText = `position:absolute;left:780px;top:269px;width:0;height:${PH}px;transform-style:preserve-3d;z-index:30`;
    const strips = [], shF = [], shB = [];
    let parent = root;
    for (let i = 0; i < NS; i++) {
      const st = document.createElement('div');
      st.style.cssText = `position:absolute;top:0;left:${fwd ? (i ? SWd : 0) : -SWd}px;width:${SWd}px;height:${PH}px;` +
        `transform-style:preserve-3d;transform-origin:${fwd ? '0' : '100%'} 50%;will-change:transform;outline:1px solid transparent`;
      const fx = fwd ? i * SWd : PW - (i + 1) * SWd;
      const bx = fwd ? PW - (i + 1) * SWd : i * SWd;
      const face = (src, tex, x, isBack) => {
        const f = document.createElement('div');
        f.style.cssText = `position:absolute;top:0;left:${-OVd}px;width:${SWd + 2 * OVd}px;height:${PH}px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;` +
          `background:url(${tex}) ${-(x - OVd)}px 0/${PW}px ${PH}px no-repeat;${isBack ? 'transform:rotateY(180deg);' : ''}`;
        const c = src.cloneNode(true);
        c.querySelectorAll('video').forEach(v => { const im = document.createElement('img'); im.src = v.getAttribute('poster') || ''; im.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top;display:block'; v.replaceWith(im); });
        c.style.cssText = `position:absolute;top:0;left:${-(x - OVd)}px;width:${PW}px;height:${PH}px`;
        f.appendChild(c);
        st.appendChild(f);
        return shadeLayers(f);
      };
      shF.push(face(frontSrc, frontTex, fx, false));
      shB.push(face(backSrc, backTex, bx, true));
      parent.appendChild(st); strips.push(st); parent = st;
    }
    // ¿el eje +x local va de la lombada hacia el borde?
    const fOut = fwd, bOut = !fwd;
    const fS = ang => 0.34 * (1 - Math.cos(ang * Math.PI / 180)) / 2;
    const bS = ang => 0.30 * (1 + Math.cos(ang * Math.PI / 180)) / 2;
    const W = []; let WS = 0;
    function pose(theta, k, expn) {
      W.length = 0; WS = 0;
      for (let i = 0; i < NS; i++) { const v = Math.pow((i + 1) / NS, expn) - Math.pow(i / NS, expn); W.push(v); WS += v; }
      let acc = 0;
      for (let i = 0; i < NS; i++) {
        const d = (i === 0 ? theta : 0) + k * W[i] / WS;
        const a0 = acc; acc += d;
        strips[i].style.transform = `rotateY(${(dir * d).toFixed(3)}deg)`;
        const fi = fS(a0), fo = fS(acc), bi = bS(a0), bo = bS(acc);
        setShade(shF[i], fOut ? fi : fo, fOut ? fo : fi);
        setShade(shB[i], bOut ? bi : bo, bOut ? bo : bi);
      }
      return acc;
    }
    pose(0, 0, 2);
    $('pages').appendChild(root);
    under();
    const shadeUnder = makeShade(fwd ? 'R' : 'L');
    const shadeLand = makeShade(fwd ? 'L' : 'R');
    // dá tempo ao navegador de preparar as camadas antes de começar (evita o tranco inicial)
    await decoded(root); await raf(); await raf();

    const DUR = REDUCE ? 1 : 1400;
    await new Promise(done => {
      let t0 = null;
      const frame = now => {
        if (t0 == null) t0 = now;
        const p = Math.min(1, (now - t0) / DUR);
        const theta = 180 * smoother(p);
        const k = 95 * Math.sin(Math.PI * p) * Math.cos(Math.PI * p * 0.9);
        const outer = pose(theta, k, 1 + 1.3 * (1 - p));
        shadeUnder.style.opacity = (Math.sin(Math.PI * p) * (1 - p * 0.6)).toFixed(3);
        shadeLand.style.opacity = (Math.max(0, Math.sin(outer * Math.PI / 180)) * Math.pow(p, 1.5) * 0.9 * (1 - smoother(Math.max(0, (p - .85) / .15)))).toFixed(3);
        if (p < 1) requestAnimationFrame(frame); else done();
      };
      requestAnimationFrame(frame);
    });
    // troca a página de baixo já pronta, sem piscar
    land();
    await decoded(fwd ? pageL : pageR); await raf();
    root.remove(); shadeUnder.remove(); shadeLand.remove();
    commit(); busy = false; stage.classList.remove('turning');
    updateNav();
  }
  function goTo(i) {
    if (state === 'pages') return flip(i);
  }
  function next() {
    if (busy) return;
    if (state === 'closed') return MOB() ? toPages(0) : openBook();
    if (state === 'cover') return MOB() ? toPages(0) : cvAuto();
    if (state === 'pages') return MOB() ? mflip(mstep(mk, 1)) : flip(idx + 1);
  }
  function prev() {
    if (busy) return;
    if (state === 'pages' && MOB()) {
      if (mstep(mk, -1) < 0) { busy = true; setState('closed'); idx = -1; setTimeout(() => busy = false, 800); return; }
      return mflip(mstep(mk, -1));
    }
    if (state === 'pages' && idx === 0) { if (cvBackAuto()) return; busy = true; setState('cover'); idx = -1; setTimeout(() => busy = false, 800); return; }
    if (state === 'pages') flip(idx - 1);
  }
  function openBook() { busy = true; setState('cover'); setTimeout(() => busy = false, 1100); }
  function toPages(i) {
    busy = true; idx = i; mk = i * 2;
    if (MOB() && MSKIP(mk)) mk++;
    if (MOB()) { pageL.innerHTML = ''; showSpec('R', mk); } else { show(i, 'L'); show(i, 'R'); }
    setState('pages');
    setTimeout(() => busy = false, 900);
  }
  /* ---------- atajos de la portada ---------- */
  const idOf = id => C.spreads.findIndex(s => s.id === id);
  function jump(i) {
    if (busy || i < 0) return;
    if (state === 'pages') return MOB() ? mflip(i * 2) : flip(i);
    if (state === 'closed' && MOB()) return toPages(i);
    if (state === 'closed') { setState('cover'); setTimeout(() => toPages(i), 900); return; }
    toPages(i);
  }
  $('btnProyectos').onclick = e => { e.stopPropagation(); jump(idOf('obras')); };
  $('aboutTag').onclick = e => { e.stopPropagation(); jump(idOf('autora')); };
  $('aboutTag').onkeydown = e => { if (e.key === 'Enter') jump(idOf('autora')); };
  // lo que esté en la capa de la portada (la etiqueta "Sobre mí") lleva a la página Autora
  $('layerCover').addEventListener('click', e => { if (EDIT || state !== 'cover') return; e.stopPropagation(); cvAuto(); });

  /* ---------- carta resumen ---------- */
  const R = C.resumen, carta = $('carta');
  const media = m => `<figure>${m.src ? (m.type === 'video'
      ? `<video src="${m.src}" poster="${m.src.replace(/\.mp4$/, '.webp')}" muted loop playsinline preload="none"></video>`
      : `<img src="${m.src}" alt="${m.caption || ''}" loading="lazy">`)
      : `<figcaption>${m.type === 'video' ? UI.video : UI.imagem} · ${m.caption || ''}</figcaption>`}</figure>`;
  carta.querySelector('.paper').innerHTML = `
    <button class="close" aria-label="${UI.fechar}">×</button>
    <p class="kicker">${UI.resumo}</p>
    <h2>${R.saludo}</h2>
    ${R.intro.map(p => `<p>${p}</p>`).join('')}
    <dl>${R.datos.map(d => `<dt>${d[0]}</dt><dd>${d[1]}</dd>`).join('')}</dl>
    <p class="kicker">${UI.projetos}</p>
    ${R.proyectos.map(p => `
      <div class="proj">
        <h3>${p.title}</h3><p class="sub">${p.sub}</p>
        <p>${p.text}</p>
        <div class="media">${p.media.map(media).join('')}</div>
        <div class="links-proj">${p.url ? `<a class="ver-sitio mini" href="${p.url}" target="_blank" rel="noopener">${UI.verSite}</a>` : ''}<button class="go" data-go="${p.go}">${UI.verCaderno}</button></div>
      </div>`).join('')}
    <div class="end">
      <a href="mailto:anacasadei.design@gmail.com">anacasadei.design@gmail.com</a>
      <div class="links"><a href="https://www.linkedin.com/in/ana-rosa-casadei-41bb11192" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://www.behance.net/rosa_casadei" target="_blank" rel="noopener">Behance</a></div>
      <p class="sign">${R.firma}</p>
    </div>`;
  // abre como uma carta de verdade: envelope fechado → abre → papel sobe → vira a carta para ler
  let cartaT = [];
  // na carta só toca o vídeo que está visível (vários ao mesmo tempo travam)
  const vio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    const v = e.target; if (e.isIntersecting && carta.classList.contains('reading')) v.play().catch(() => {}); else v.pause();
  }), { root: carta, threshold: .35 }) : null;
  carta.querySelectorAll('video').forEach(v => vio ? vio.observe(v) : v.play().catch(() => {}));
  const openCarta = () => {
    cartaT.forEach(clearTimeout); cartaT = [];
    carta.className = ''; carta.scrollTop = 0;
    void carta.offsetWidth;
    carta.classList.add('on');
    const fast = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = (cls, t) => cartaT.push(setTimeout(() => carta.classList.add(cls), fast ? 0 : t));
    step('opened', 750); step('rising', 1050); step('reading', 2050);
    cartaT.push(setTimeout(() => carta.querySelectorAll('video').forEach(v => { if (vio) { vio.unobserve(v); vio.observe(v); } }), fast ? 0 : 2150));
    cartaT.push(setTimeout(() => carta.querySelector('.close').focus({ preventScroll: true }), fast ? 0 : 2600));
  };
  const closeCarta = () => { carta.querySelectorAll('video').forEach(v => v.pause()); cartaT.forEach(clearTimeout); cartaT = []; carta.classList.remove('on'); setTimeout(() => { if (!carta.classList.contains('on')) carta.className = ''; }, 450); };
  $('btnResumen').onclick = e => { e.stopPropagation(); openCarta(); };
  carta.querySelector('.close').onclick = closeCarta;
  carta.onclick = e => { if (e.target === carta) closeCarta(); };
  carta.querySelectorAll('.go').forEach(b => b.onclick = () => { closeCarta(); setTimeout(() => jump(idOf(b.dataset.go)), 350); });

  $('next').onclick = next; $('prev').onclick = prev;
  $('mnext').onclick = next; $('mprev').onclick = prev;
  buildSecMenu($('count')); buildSecMenu($('mcount'));
  $('hitClosed').onclick = () => MOB() ? toPages(0) : openBook(); $('hitCover').onclick = () => { if (cvDragged) { cvDragged = false; return; } cvAuto(); };
  addEventListener('keydown', e => {
    if (EDIT && window.__edKey && window.__edKey(e)) return;
    if (carta.classList.contains('on')) { if (e.key === 'Escape') closeCarta(); return; }
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if ((e.key === 'Enter' || e.key === ' ') && state === 'closed') openBook();
  });
  // deslizar en pantallas táctiles
  let tx = null;
  addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  addEventListener('touchend', e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) (dx < 0 ? next : prev)(); tx = null; });

  /* ---------- intro: "holis" escrito con la pluma ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const g = $('holis');
  D.holis.forEach(a => { const p = document.createElementNS(NS, 'path'); for (const k in a) p.setAttribute(k, a[k]); g.appendChild(p); });
  const word = g.querySelector('path');
  const rect = $('revealRect'), pen = $('loadPen');
  // trayectoria de la punta: centro de la tinta en cada columna
  const track = [];
  const pt = new DOMPoint();
  for (let x = -20; x <= 1260; x += 8) {
    let sum = 0, n = 0;
    for (let y = 150; y <= 950; y += 6) { pt.x = x; pt.y = y; try { if (word.isPointInFill(pt)) { sum += y; n++; } } catch (e) {} }
    track.push([x, n ? sum / n : null]);
  }
  let last = 560; track.forEach(t => { if (t[1] == null) t[1] = last; else last = t[1]; });
  for (let k = 0; k < 3; k++) for (let i = 1; i < track.length - 1; i++) track[i][1] = (track[i - 1][1] + track[i][1] + track[i + 1][1]) / 3;
  const TIP = [95, 436]; // punta de la pluma dentro de la imagen de 493px
  function penAt(x) {
    const i = Math.max(0, Math.min(track.length - 1, Math.round((x + 20) / 8)));
    pen.style.transform = `translate(${x - TIP[0]}px, ${track[i][1] - TIP[1]}px)`;
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = reduce ? 10 : 3000, X0 = -40, X1 = 1300;
  let t0 = null, introDone = false;
  function step(t) {
    if (introDone) return;
    if (t0 == null) t0 = t;
    const k = Math.min(1, (t - t0) / DUR);
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const x = X0 + (X1 - X0) * e;
    rect.setAttribute('width', Math.max(0, x - X0));
    penAt(Math.min(x, 1250));
    if (k < 1) requestAnimationFrame(step); else setTimeout(endIntro, 700);
  }
  function endIntro() {
    if (introDone) return; introDone = true;
    rect.setAttribute('width', 1500);
    $('loader').classList.add('out');
    setState('closed');                       // depois do "holis", a mesa já aparece arrumada
    setTimeout(() => { busy = false; }, reduce ? 10 : 1200);
    ytLater();
  }
  busy = true;
  $('skip').onclick = endIntro;

  // textos fixos da página no idioma escolhido
  $('hint').textContent = UI.hint; $('skip').textContent = UI.skip;
  $('hitClosed').setAttribute('aria-label', UI.abrir); $('hitCover').setAttribute('aria-label', UI.virar);
  ['prev', 'mprev'].forEach(i => $(i).setAttribute('aria-label', UI.anterior));
  ['next', 'mnext'].forEach(i => $(i).setAttribute('aria-label', UI.seguinte));
  $('mnav').setAttribute('aria-label', UI.nav); $('carta').setAttribute('aria-label', UI.resumo);
  // enlace directo a una página (#obras, #notas…)
  const startId = location.hash.slice(1);
  const startIdx = C.spreads.findIndex(s => s.id === startId);
  Promise.all([document.fonts ? document.fonts.ready : 0]).then(() => {
    if (EDIT) {
      introDone = true; $('loader').classList.add('out');
      let v = { state: 'pages', idx: 0 };
      try { v = JSON.parse(localStorage.getItem('ar-edit-view')) || v; } catch (e) {}
      deskTo('pages');
      if (v.state === 'pages') toPages(Math.max(0, Math.min(C.spreads.length - 1, v.idx || 0))); else setState(v.state);
      startEditor(); return;
    }
    let resume = null;
    try { resume = JSON.parse(sessionStorage.getItem('ar-resume')); sessionStorage.removeItem('ar-resume'); } catch (e) {}
    if (resume) {                                   // trocou o idioma: volta para onde estava, sem repetir o holis
      introDone = true; $('loader').classList.add('out'); busy = false;
      if (resume.state === 'pages') {
        deskTo('pages'); toPages(Math.max(0, Math.min(C.spreads.length - 1, resume.idx || 0)));
        if (MOB() && resume.mk) { mk = resume.mk; idx = mk >> 1; showSpec('R', mk); updateNav(); }
      } else setState(resume.state === 'cover' ? 'cover' : 'closed');
      ytLater(); return;
    }
    if (startIdx >= 0) {
      introDone = true; $('loader').classList.add('out');
      deskTo('pages'); toPages(startIdx); ytLater();
    } else {
      penAt(-20);
      const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
      const penImg = $('loadPen');
      Promise.race([Promise.all([loaded, penImg && penImg.decode ? penImg.decode().catch(() => {}) : 0]), new Promise(r => setTimeout(r, 2500))])
        .then(() => requestAnimationFrame(() => requestAnimationFrame(step)));
    }
  });

  /* =====================================================================
     MODO EDICIÓN  (abrir el sitio con #editar al final del enlace)
     ===================================================================== */
  function startEditor() {
    stage.classList.add('editing');
    document.body.classList.add('editing'); fit();
    const bar = document.createElement('div'); bar.id = 'edBar';
    bar.innerHTML = `
      <strong>Modo edición</strong>
      <span class="grp-b">
        <button data-scene="messy">Bagunça</button><button data-scene="closed">Cerrado</button>
        <button data-scene="cover">Portada</button><button data-scene="pages">Páginas</button>
      </span>
      <span class="grp-b">
        <button id="edAdd" class="main">+ Agregar</button>
        <button id="edDel" title="Eliminar el elemento seleccionado (tecla Supr)">Eliminar</button>
        <button id="edUndo" title="Deshacer (Ctrl+Z)">Deshacer</button>
      </span>
      <span id="edInfo">Haz clic en un elemento</span>
      <span class="grp-b">
        <button id="edReset" title="Volver el elemento seleccionado a su lugar original">Restablecer</button>
        <button id="edCopy" class="main">Copiar cambios</button>
        <button id="edClear" title="Borrar todos los cambios">Borrar todo</button>
        <button id="edExit">Salir</button>
      </span>`;
    document.body.appendChild(bar);
    const help = document.createElement('div'); help.id = 'edHelp';
    help.textContent = 'arrastra para mover · ● girar · ◢ tamaño · doble clic en un texto para escribir · Supr elimina · Ctrl+Z deshace · flechas mueven 1px (Shift: 10px)';
    document.body.appendChild(help);
    const sel = document.createElement('div'); sel.id = 'edSel';
    sel.innerHTML = '<i class="rot"></i><i class="sz"></i>';
    stage.appendChild(sel);
    let cur = null;      // elemento seleccionado
    const scale = () => stage.getBoundingClientRect().width / 1440;
    const save = () => { try { localStorage.setItem('ar-edits', JSON.stringify(E)); } catch (e) { $('edInfo').textContent = '⚠ el navegador no pudo guardar (¿imagen muy pesada?)'; } };
    const hist = [];
    const snap = () => { hist.push(JSON.stringify(E)); if (hist.length > 60) hist.shift(); };
    const saveView = () => { try { localStorage.setItem('ar-edit-view', JSON.stringify({ state, idx })); } catch (e) {} };
    function undo() {
      if (!hist.length) { $('edInfo').textContent = 'Nada que deshacer'; return; }
      E = JSON.parse(hist.pop()); save(); saveView(); location.reload();
    }
    // en modo edición los botones y enlaces del sitio no funcionan
    addEventListener('click', e => {
      if (e.target.closest('#edBar, #nav, #edPanel, #edOut')) return;
      if (stage.contains(e.target) || e.target.closest('#carta')) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    addEventListener('keydown', e => {
      if (e.target.closest && e.target.closest('#edPanel')) return;
      if (e.target.isContentEditable) return;
      if (e.key === 'Enter' || e.key === ' ') { if (stage.contains(document.activeElement)) e.preventDefault(); }
    }, true);
    const kind = el => el.dataset.key ? 'img' : (el.id === 'coverText' || el.id === 'aboutTag') ? 'ui' : 'txt';
    const label = el => kind(el) === 'img' ? el.dataset.key.replace(/^pg:/, 'página ').replace(/^desk:/, 'mesa ').replace(/^add:.*/, 'elemento agregado').replace(/^slot:/, 'espacio de imagen ') :
      kind(el) === 'ui' ? (el.id === 'coverText' ? 'etiqueta de la portada' : 'tag SOBRE MÍ') : 'bloque de texto';
    function visible(el) {
      for (let n = el; n && n !== stage; n = n.parentElement) { if (+getComputedStyle(n).opacity < 0.05) return false; }
      return true;
    }
    function box(el) {
      const r = el.getBoundingClientRect(), s0 = stage.getBoundingClientRect(), s = scale();
      return { x: (r.left - s0.left) / s, y: (r.top - s0.top) / s, w: r.width / s, h: r.height / s };
    }
    function drawSel() {
      if (!cur || !document.contains(cur)) { sel.style.display = 'none'; return; }
      const b = box(cur);
      Object.assign(sel.style, { display: 'block', left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
      sel.querySelector('.rot').style.display = kind(cur) === 'txt' ? 'none' : 'block';
      const o = curOv();
      $('edInfo').textContent = label(cur) + (o && kind(cur) !== 'txt' ? `  ·  x ${Math.round(o.dx || 0)}  y ${Math.round(o.dy || 0)}  ${Math.round(o.r || 0)}°  ${Math.round((o.s || 1) * 100)}%` : '');
    }
    addEventListener('resize', () => setTimeout(drawSel, 50));
    const ovKey = el => kind(el) === 'img' ? el.dataset.key : kind(el) === 'ui' ? 'ui:' + el.id : null;
    function curOv(create) {
      const k = cur && ovKey(cur); if (!k) return null;
      if (!E.ov[k] && create) E.ov[k] = { dx: 0, dy: 0, r: 0, s: 1 };
      return E.ov[k];
    }
    function render() {
      if (!cur) return;
      if (kind(cur) === 'img') {
        const tf = applyOv(cur.dataset.key, cur._base, cur._w, cur._h);
        if (cur.id === 'closedBook') cur.style.setProperty('--closed-tf', tf); else cur.style.transform = tf;
        if (cur.dataset.desk) syncFx();
      } else if (kind(cur) === 'ui') applyUi();
      drawSel();
    }
    function saveTxt(el) {
      const t = el.closest('.txt'); if (!t) return;
      const c = t.cloneNode(true);
      c.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
      c.querySelectorAll('.tb').forEach(n => n.classList.remove('tb'));
      E.html[t.dataset.hkey] = c.innerHTML.trim();
      save();
    }
    function refreshSide(el) {
      // reconstruye la página para que los marcos de imagen sigan a su moldura
      const page = el.closest('.page'); if (!page) return;
      const key = el.dataset.key;
      show(idx, page.id === 'pageL' ? 'L' : 'R');
      cur = page.querySelector(`[data-key="${key}"]`); drawSel();
    }
    function pick(e) {
      const list = document.elementsFromPoint(e.clientX, e.clientY);
      return list.find(n => stage.contains(n) && n !== sel && !sel.contains(n) &&
        (n.dataset.key || n.classList.contains('tb') || n.id === 'coverText' || n.id === 'aboutTag') && visible(n)) ||
        list.map(n => n.closest && n.closest('.tb, #coverText, #aboutTag')).find(n => n && visible(n)) || null;
    }
    let drag = null;
    addEventListener('pointerdown', e => {
      if (e.target.closest('#edBar, #nav, #carta, #edHelp, #edPanel, #edOut')) return;
      if (e.target.isContentEditable) return;
      const mode = e.target.classList.contains('rot') ? 'rot' : e.target.classList.contains('sz') ? 'sz' : 'move';
      if (mode === 'move') {
        const el = pick(e);
        if (document.activeElement && document.activeElement.isContentEditable) document.activeElement.blur();
        cur = el; drawSel();
        if (!el) return;
      }
      if (!cur) return;
      e.preventDefault(); e.stopPropagation();
      const b = box(cur), s = scale();
      const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      const s0 = stage.getBoundingClientRect();
      const P = ev => ({ x: (ev.clientX - s0.left) / s, y: (ev.clientY - s0.top) / s });
      const p0 = P(e);
      snap();
      const o = curOv(false);
      drag = { mode, p0, c, P, start: o ? { dx: 0, dy: 0, r: 0, s: 1, ...o } : { dx: 0, dy: 0, r: 0, s: 1 },
        left: cur.offsetLeft, top: cur.offsetTop, width: cur.offsetWidth,
        follow: cur.dataset.key ? [...stage.querySelectorAll(`[data-follow="${cur.dataset.key}"]`)] : [] };
      if (kind(cur) === 'txt') { cur.style.left = drag.left + 'px'; cur.style.top = drag.top + 'px'; }
    }, true);
    addEventListener('pointermove', e => {
      if (!drag || !cur) return;
      const p = drag.P(e), dx = p.x - drag.p0.x, dy = p.y - drag.p0.y, st = drag.start;
      if (kind(cur) === 'txt') {
        if (drag.mode === 'sz') cur.style.width = Math.max(60, drag.width + dx) + 'px';
        else { cur.style.left = (drag.left + dx) + 'px'; cur.style.top = (drag.top + dy) + 'px'; }
        drawSel(); return;
      }
      const o = curOv(true);
      if (drag.mode === 'move') {
        o.dx = st.dx + dx; o.dy = st.dy + dy;
        drag.follow.forEach(f => f.style.translate = `${dx}px ${dy}px`);
      } else if (drag.mode === 'rot') {
        const a0 = Math.atan2(drag.p0.y - drag.c.y, drag.p0.x - drag.c.x), a1 = Math.atan2(p.y - drag.c.y, p.x - drag.c.x);
        let r = st.r + (a1 - a0) * 180 / Math.PI;
        if (e.shiftKey) r = Math.round(r / 15) * 15;
        o.r = r;
      } else {
        const d0 = Math.hypot(drag.p0.x - drag.c.x, drag.p0.y - drag.c.y), d1 = Math.hypot(p.x - drag.c.x, p.y - drag.c.y);
        o.s = Math.max(0.1, st.s * d1 / Math.max(1, d0));
      }
      render();
    });
    addEventListener('pointerup', () => {
      if (!drag) return;
      const k = kind(cur);
      if (k === 'txt') saveTxt(cur);
      else if (curOv(false)) { save(); if (cur.closest('.page')) refreshSide(cur); }
      drag = null;
    });
    addEventListener('dblclick', e => {
      const el = e.target.closest('.tb'); if (!el || !stage.contains(el)) return;
      snap(); el.contentEditable = 'true'; el.focus(); cur = el; drawSel();
      el.addEventListener('blur', function done() { el.removeAttribute('contenteditable'); saveTxt(el); el.removeEventListener('blur', done); }, { once: true });
    });
    document.addEventListener('input', e => { if (e.target.isContentEditable) drawSel(); });
    window.__edKey = e => {
      if (document.activeElement && document.activeElement.isContentEditable) { if (e.key === 'Escape') document.activeElement.blur(); return true; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return true; }
      if (cur && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); del(); return true; }
      if (e.key === 'Escape') { cur = null; drawSel(); return true; }
      if (!cur || !e.key.startsWith('Arrow')) return false;
      e.preventDefault();
      const n = e.shiftKey ? 10 : 1, dx = e.key === 'ArrowLeft' ? -n : e.key === 'ArrowRight' ? n : 0, dy = e.key === 'ArrowUp' ? -n : e.key === 'ArrowDown' ? n : 0;
      if (kind(cur) === 'txt') { cur.style.left = (cur.offsetLeft + dx) + 'px'; cur.style.top = (cur.offsetTop + dy) + 'px'; saveTxt(cur); drawSel(); return true; }
      snap(); const o = curOv(true); o.dx += dx; o.dy += dy; render(); save();
      if (cur.closest('.page')) refreshSide(cur);
      return true;
    };
    // barra
    bar.querySelectorAll('[data-scene]').forEach(b => b.onclick = () => {
      cur = null; drawSel(); const s = b.dataset.scene;
      if (s === 'pages') { toPages(idx < 0 ? 0 : idx); } else { setState(s); }
      setTimeout(drawSel, 50);
    });
    $('edReset').onclick = () => {
      if (!cur) return;
      snap();
      if (kind(cur) === 'txt') { const t = cur.closest('.txt'); delete E.html[t.dataset.hkey]; save(); const page = cur.closest('.page'); show(idx, page.id === 'pageL' ? 'L' : 'R'); cur = null; drawSel(); return; }
      delete E.ov[ovKey(cur)]; save(); render();
      if (cur.closest('.page')) refreshSide(cur);
    };
    $('edClear').onclick = () => {
      $('edClear').textContent === '¿Seguro?' ? (E.ov = {}, E.html = {}, E.add = [], E.hide = {}, save(), saveView(), location.reload()) : ($('edClear').textContent = '¿Seguro?', setTimeout(() => $('edClear').textContent = 'Borrar todo', 2500));
    };
    $('edExit').onclick = () => { location.hash = ''; location.reload(); };
    $('edUndo').onclick = undo;
    $('edDel').onclick = del;
    bar.querySelectorAll('[data-scene]').forEach(b => b.addEventListener('click', () => setTimeout(saveView, 100)));
    $('next').addEventListener('click', () => setTimeout(saveView, 1800));
    $('prev').addEventListener('click', () => setTimeout(saveView, 1800));

    /* ----- eliminar ----- */
    function del() {
      if (!cur) { $('edInfo').textContent = 'Selecciona algo para eliminar'; return; }
      snap();
      const k = kind(cur);
      if (k === 'txt') {
        const t = cur.closest('.txt'); cur.remove(); cur = t.firstElementChild || t; saveTxt(cur); cur = null; drawSel(); return;
      }
      if (k === 'ui') { E.hide['ui:' + cur.id] = true; applyUi(); }
      else {
        const key = cur.dataset.key;
        if (key.startsWith('add:')) E.add = E.add.filter(it => 'add:' + it.id !== key);
        else if (cur.dataset.desk) { E.hide['desk:' + cur.dataset.desk] = true; cur.style.display = 'none'; syncFx(); }
        else E.hide[key] = true;
        cur.style.display = 'none';
        stage.querySelectorAll(`[data-follow="${key}"]`).forEach(f => f.style.display = 'none');
        if (cur.closest('.page')) show(idx, cur.closest('.page').id === 'pageL' ? 'L' : 'R');
      }
      save(); cur = null; drawSel();
      $('edInfo').textContent = 'Eliminado (Ctrl+Z para deshacer)';
    }

    /* ----- agregar ----- */
    const lib = new Map();
    const reg = o => { if (o && o.src && !/papel|folha/.test(o.src) && !lib.has(o.src)) lib.set(o.src, { w: o.w, h: o.h }); };
    Object.values(D.pages).forEach(p => [...(p.L || []), ...(p.R || [])].forEach(reg));
    Object.values(D.desk).forEach(reg); D.coverGroup.forEach(reg); reg(D.closedBook); reg(D.pen);
    const panel = document.createElement('div'); panel.id = 'edPanel';
    panel.innerHTML = `
      <div class="hd"><strong>Agregar</strong><button class="x">×</button></div>
      <label>Dónde <select id="edWhere"></select></label>
      <p class="sec">Texto</p>
      <div class="row"><button data-txt="title">Título</button><button data-txt="text">Párrafo</button><button data-txt="kicker">Etiqueta</button><button data-txt="hand">Frase manuscrita</button></div>
      <p class="sec">Elementos del cuaderno</p>
      <div class="grid">${[...lib.keys()].map(s => `<button data-src="${s}" title="${nameOf(s)}"><img src="${s}" alt=""></button>`).join('')}</div>
      <p class="sec">Imagen de tu computador</p>
      <input type="file" id="edFile" accept="image/*">
      <p class="note">Para fotos de proyectos, mejor guárdalas en la carpeta <b>portifolio</b> y avísame: así el sitio queda liviano.</p>`;
    document.body.appendChild(panel);
    const where = () => $('edWhere').value;
    function fillWhere() {
      const o = [];
      if (state === 'pages') o.push(['pg:' + C.spreads[idx].id + ':L', 'Página izquierda'], ['pg:' + C.spreads[idx].id + ':R', 'Página derecha']);
      if (state === 'cover') o.push(['cover', 'Portada (solo cuaderno abierto en la portada)']);
      o.push(['desk', 'Mesa (aparece siempre)']);
      $('edWhere').innerHTML = o.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
    }
    $('edAdd').onclick = () => { fillWhere(); panel.classList.toggle('on'); };
    panel.querySelector('.x').onclick = () => panel.classList.remove('on');
    function spot(w, h) {
      const wh = where();
      if (wh.startsWith('pg:')) return [214 - w / 2, 300 - h / 2];
      return [720 - w / 2, 512 - h / 2];
    }
    function addImage(src, w, h) {
      snap();
      const k = Math.min(1, 320 / Math.max(w, h));
      w *= k; h *= k;
      const [x, y] = spot(w, h);
      const it = { id: Date.now().toString(36), where: where(), type: 'img', src, w: +w.toFixed(1), h: +h.toFixed(1), x: +x.toFixed(1), y: +y.toFixed(1) };
      E.add.push(it); save();
      if (it.where.startsWith('pg:')) { const side = it.where.slice(-1); show(idx, side); cur = (side === 'L' ? pageL : pageR).querySelector(`[data-key="add:${it.id}"]`); }
      else { renderLayers(); cur = stage.querySelector(`[data-key="add:${it.id}"]`); }
      drawSel(); panel.classList.remove('on');
    }
    panel.querySelectorAll('[data-src]').forEach(b => b.onclick = () => { const m = lib.get(b.dataset.src); addImage(b.dataset.src, m.w, m.h); });
    $('edFile').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 1000 / Math.max(im.width, im.height));
        const cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        let url = cv.toDataURL('image/webp', 0.82);
        if (!url.startsWith('data:image/webp')) url = cv.toDataURL('image/png');
        addImage(url, cv.width / 2, cv.height / 2);
        URL.revokeObjectURL(im.src); e.target.value = '';
      };
      im.src = URL.createObjectURL(f);
    };
    const TXT = {
      title: '<h2>Título nuevo</h2>',
      text: '<p>Escribe aquí tu texto.</p>',
      kicker: '<p class="kicker">Etiqueta</p>',
      hand: '<p class="hand">una frase a mano</p>'
    };
    panel.querySelectorAll('[data-txt]').forEach(b => b.onclick = () => {
      snap();
      const wh = where();
      let t;
      if (wh.startsWith('pg:')) t = (wh.slice(-1) === 'L' ? pageL : pageR).querySelector('.txt');
      else t = $(wh === 'cover' ? 'layerCover' : 'layerDesk').querySelector('.txt');
      const d = document.createElement('div');
      d.className = 'blk tb';
      const [x, y] = wh.startsWith('pg:') ? [60, 260] : [560, 480];
      d.style.cssText = `left:${x}px;top:${y}px;width:300px`;
      d.innerHTML = TXT[b.dataset.txt];
      t.appendChild(d); saveTxt(d);
      cur = d; drawSel(); panel.classList.remove('on');
    });
    $('edCopy').onclick = () => {
      const txt = 'window.EDITS = ' + JSON.stringify(E, null, 1) + ';\n';
      const done = () => { $('edCopy').textContent = '¡Copiado!'; setTimeout(() => $('edCopy').textContent = 'Copiar cambios', 2200); };
      const fallback = () => {
        const m = document.createElement('div'); m.id = 'edOut';
        m.innerHTML = '<p>Copia este texto y pégalo en el chat:</p><textarea readonly></textarea><button>Cerrar</button>';
        m.querySelector('textarea').value = txt; document.body.appendChild(m);
        m.querySelector('textarea').select(); m.querySelector('button').onclick = () => m.remove();
      };
      try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (e) { fallback(); }
    };
    // al pasar página, quitar selección
    stage.addEventListener('transitionend', () => drawSel());
    setInterval(() => { if (cur && !document.contains(cur)) { cur = null; drawSel(); } }, 400);
  }
})();
