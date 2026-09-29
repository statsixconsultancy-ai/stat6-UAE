/* =========================================================
   STAT6 · The Review · behaviour
   Scroll tells the story; every interactive extra is optional.
   1. Setup: dateline, email, masthead intro
   2. Top bar + reading progress
   3. Reveals, service animations, handwriting
   4. Scroll loop: photo parallax, editor's pen, AI answer, stacking case files
   5. Before / after slider
   6. Engagement picker + form prefill
   7. Counters
   8. FAQ schema, form, consent + GA4
   ========================================================= */
(() => {
  'use strict';

  const CONFIG = {
    email: 'hello@stat6.ae',
    ga4Id: 'G-XXXXXXXXXX'   // your GA4 measurement ID; nothing loads until a real ID is set AND the visitor consents
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  /* ---------- 1. SETUP ---------- */
  $('#year').textContent = new Date().getFullYear();
  $$('[data-email]').forEach(a => { a.href = 'mailto:' + CONFIG.email; a.textContent = CONFIG.email; });
  const dateOpts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  let today;
  try { today = new Date().toLocaleDateString('en-GB', { ...dateOpts, timeZone: 'Asia/Dubai' }); }
  catch { today = new Date().toLocaleDateString('en-GB', dateOpts); }   // browsers without time zone data
  $('#dateline').textContent = 'Dubai · ' + today;

  const mast = $('#mast-word');
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    if (!reduce) mast.classList.add('intro');
    setTimeout(() => document.body.classList.add('ready'), reduce ? 0 : 900);   // speech bubbles pop in on the photo
  });

  /* ---------- 2. TOP BAR ---------- */
  const bar = $('#bar'), barProgress = $('#bar-progress');
  new IntersectionObserver(([e]) => bar.classList.toggle('show', !e.isIntersecting), { rootMargin: '-40px 0px 0px 0px' })
    .observe($('.mast-row'));

  /* ---------- 3. REVEALS ---------- */
  // staggered fade up inside each group
  const rvs = $$('.rv');
  const groups = new Map();
  rvs.forEach(el => {
    const g = el.parentElement; const i = groups.get(g) || 0; groups.set(g, i + 1);
    el.style.setProperty('--d', Math.min(i, 6) * 90 + 'ms');
  });
  const once = (els, cls, opts) => {
    const o = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add(cls); o.unobserve(e.target); }
    }), opts);
    els.forEach(el => o.observe(el));
  };
  once(rvs, 'in', { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

  // service cards: live illustrations. Each loops through real scenarios while on screen,
  // a tap or click jumps to the next one, and on desktop the drawing follows the pointer.
  const SCENES = [
    [{ c: 'var(--tomato)', t: 'Book on WhatsApp' }, { c: 'var(--cobalt)', t: 'Get my quote' }, { c: 'var(--emerald)', t: 'Shop the collection' }],
    [{ c: 'var(--tomato)', m: 'S6', bg: 'var(--sun)', t: 'Aa Bb 123' }, { c: 'var(--cobalt)', m: 'DW', bg: 'var(--blush)', t: 'Villas · Palm' }, { c: 'var(--emerald)', m: 'MO', bg: 'var(--lilac)', t: 'Oud · Doha' }],
    [{ q: 'Is the villa still available?', a: 'Yes. Viewing on Saturday at 11?', ok: 'Booked ✓' },
     { q: 'Any appointment today?', a: 'Yes, 4:30 pm with Dr Sara. Shall I book it?', ok: 'Booked ✓' },
     { q: 'Quote Kuwait to Riyadh?', a: 'KWD 184, door to door, 48 hours.', ok: 'Quote sent ✓' }],
    [{ q: 'best clinic in riyadh', me: 'Sadeem Clinics' }, { q: 'off plan villas dubai', me: 'Dunewell' }, { q: 'oud gift set doha', me: 'Mirath Oud' }],
    [{ k: 'AED 4.2M traced' }, { k: '+212% qualified leads' }, { k: '−41% cost per booking' }],
    [{ d: 'Deal won' }, { d: 'Viewing booked' }, { d: 'Contract signed' }]
  ];
  const APPLY = [
    (a, v) => { $('.ab-hero', a).style.background = v.c; $('.ab-cta', a).textContent = v.t; },
    (a, v) => { $('.s2', a).style.background = v.c; const m = $('.mark', a); m.textContent = v.m; m.style.background = v.bg; $('.type', a).textContent = v.t; },
    (a, v) => { $('.ch.in', a).textContent = v.q; $('.ch.out', a).textContent = v.a; $('.ok', a).textContent = v.ok; },
    (a, v) => { const q = $('.sf-q', a); q.textContent = v.q; q.style.setProperty('--qw', v.q.length + 1 + 'ch'); $('.me b', a).textContent = v.me; },
    (a, v) => { $$('.bars i', a).forEach((b, i, all) => b.style.setProperty('--h', Math.round(20 + (i / (all.length - 1)) * 60 + Math.random() * 16) + '%')); $('.kpi', a).textContent = v.k; },
    (a, v) => { $('.deal', a).textContent = v.d; const t = $('.tally', a), b = $('b', t); b.textContent = +b.textContent + 1 + Math.floor(Math.random() * 3); t.classList.remove('tick'); void t.offsetWidth; t.classList.add('tick'); }
  ];
  const secs = $$('.sec');
  secs.forEach((card, idx) => {
    const art = $('.sec-art', card); if (!art) return;
    let step = 0, timer = null;
    const replay = () => { card.classList.remove('play'); void card.offsetWidth; card.classList.add('play'); };
    const next = (bump) => {
      step = (step + 1) % SCENES[idx].length;
      APPLY[idx](art, SCENES[idx][step]);
      replay();
      if (bump) { art.classList.remove('bump'); void art.offsetWidth; art.classList.add('bump'); }
    };
    const start = () => { if (reduce || timer) return; timer = setInterval(() => next(false), 5600); };
    const stop = () => { clearInterval(timer); timer = null; };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!card.classList.contains('play')) replay(); start(); } else stop();
    }, { threshold: 0.45 }).observe(card);
    art.addEventListener('click', () => { next(true); stop(); start(); });
    if (hover && !reduce) {
      art.addEventListener('pointermove', e => {
        const r = art.getBoundingClientRect();
        art.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
        art.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
      });
      art.addEventListener('pointerleave', () => { art.style.setProperty('--mx', 0); art.style.setProperty('--my', 0); });
    }
  });

  // case files: the notebook handwriting writes itself in
  once($$('.case-card'), 'in', { threshold: 0.3 });

  // market cards: a small dotted map of the Gulf with each card's cities pinned
  (function marketMaps() {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 520, H = 300, L0 = 36, L1 = 60, A0 = 16, A1 = 31;
    const px = lon => (lon - L0) / (L1 - L0) * W, py = lat => (A1 - lat) / (A1 - A0) * H;
    // loose outline of the Arabian Peninsula (decorative, not to scale)
    const land = [[34.9,29.5],[36.1,32],[39,32],[42,31.5],[46.5,29.1],[48,29.9],[48.5,28],[50.2,26.6],[50.8,25],[51.2,26.1],[51.6,25.2],[52.5,24.2],[54.5,24.3],[56,25.8],[56.4,26.4],[56.3,24.8],[57.8,23.7],[59.8,22.5],[58.5,20.4],[57.8,19],[55,17],[52.2,16],[48,14],[45,12.8],[43.4,12.7],[42.8,15],[42.6,16.5],[41,19],[39.1,21.5],[38,24],[36.5,26],[35.2,28]].map(([a, b]) => [px(a), py(b)]);
    const inside = (x, y) => { let c = false; for (let i = 0, k = land.length - 1; i < land.length; k = i++) { const [xi, yi] = land[i], [xk, yk] = land[k]; if ((yi > y) !== (yk > y) && x < (xk - xi) * (y - yi) / (yk - yi) + xi) c = !c; } return c; };
    const CITY = { 'Dubai': [55.27, 25.2], 'Abu Dhabi': [54.37, 24.45], 'Riyadh': [46.72, 24.69], 'Jeddah': [39.19, 21.49], 'Doha': [51.53, 25.29], 'Kuwait City': [47.98, 29.37], 'Manama': [50.59, 26.23], 'Muscat': [58.41, 23.59] };
    const dots = [];
    for (let y = 6; y < H; y += 12) for (let x = 6; x < W; x += 12) if (inside(x, y)) dots.push([x, y]);
    const hq = [px(CITY.Dubai[0]), py(CITY.Dubai[1])];
    const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
    $$('.mk-map').forEach(box => {
      const names = box.dataset.cities.split(',');
      const pts = names.map(n => [px(CITY[n][0]), py(CITY[n][1]), n]);
      const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });
      const g = el('g', { class: 'land' }, svg);
      g.style.transformOrigin = `${pts[0][0]}px ${pts[0][1]}px`;
      dots.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.6, class: pts.some(p => Math.hypot(p[0] - x, p[1] - y) < 34) ? 'dot hot' : 'dot' }, g));
      pts.forEach(([x, y, n]) => {
        if (n === 'Dubai') return;
        const mx = (hq[0] + x) / 2, my = (hq[1] + y) / 2 - Math.hypot(x - hq[0], y - hq[1]) * .3;
        const d = `M${hq[0]} ${hq[1]} Q${mx} ${my} ${x} ${y}`;
        el('path', { d, class: 'route' }, g);
        el('path', { d, class: 'route-draw', pathLength: 1 }, g);
      });
      if (!names.includes('Dubai')) { el('circle', { cx: hq[0], cy: hq[1], r: 5, class: 'hq' }, g); el('text', { x: hq[0] + 9, y: hq[1] + 18, class: 'small' }, g).textContent = 'Stat6 · Dubai'; }
      pts.forEach(([x, y, n], i) => {
        el('circle', { cx: x, cy: y, r: 9, class: 'pulse' }, g);
        el('circle', { cx: x, cy: y, r: 6.5, class: 'pin' }, g);
        const right = x < W * .6;
        const t = el('text', { x: right ? x + 12 : x - 12, y: y + (i ? 20 : -10), 'text-anchor': right ? 'start' : 'end' }, g);
        t.textContent = n;
      });
      box.prepend(svg);
    });
    once($$('.mk-grid li'), 'in', { threshold: 0.5 });
  })();

  /* ---------- 4. SCROLL LOOP ---------- */
  const leadImg = $('#lead-img'), leadFrame = $('.ph-frame');
  const opBody = $('#op-body'), chat = $('#chat'), chatItems = $$('#chat-a li');
  const cards = $$('.case-card');
  const stacked = () => matchMedia('(min-width: 1081px) and (min-height: 800px)').matches;
  let vh = innerHeight;
  addEventListener('resize', () => { vh = innerHeight; onScroll(); }, { passive: true });

  const progressIn = (el, start, span) => clamp((vh * start - el.getBoundingClientRect().top) / (vh * span));

  let ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    barProgress.style.setProperty('--read', (scrollY / Math.max(1, root.scrollHeight - vh)).toFixed(4));

    // lead photo drifts slower than the page
    if (!reduce) {
      const r = leadFrame.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) leadImg.style.setProperty('--py', (-6 + (r.top / vh) * 6).toFixed(2) + '%');
    }

    // opinion: the editor strikes "ten blue links" and writes in "one AI answer"
    const p = progressIn(opBody, 0.8, 0.45);
    opBody.style.setProperty('--p', p.toFixed(3));
    opBody.style.setProperty('--p2', clamp((p - 0.55) / 0.4).toFixed(3));

    // exhibit A: the AI names three companies, then the pen circles yours
    const c = progressIn(chat, 0.85, 0.5);
    chatItems.forEach((li, i) => li.classList.toggle('on', reduce || c > 0.15 + i * 0.18));
    chat.style.setProperty('--p', clamp((c - 0.7) / 0.3).toFixed(3));

    // case files: as the next card slides over, the one underneath settles back
    if (stacked() && !reduce) {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        const t = next ? clamp((vh * 0.9 - next.getBoundingClientRect().top) / (vh * 0.7)) : 0;
        card.style.transform = t ? `scale(${(1 - t * 0.05).toFixed(4)})` : '';
        card.style.filter = t ? `brightness(${(1 - t * 0.06).toFixed(3)})` : '';
      });
    } else cards.forEach(card => { card.style.transform = ''; card.style.filter = ''; });
  }
  addEventListener('scroll', onScroll, { passive: true });
  update();

  /* ---------- 5. BEFORE / AFTER ---------- */
  const cmp = $('.cmp'), range = $('.cmp-range');
  const setPos = v => cmp.style.setProperty('--pos', v + '%');
  range.addEventListener('input', () => { hinted = true; setPos(range.value); });
  let hinted = reduce;
  // the first time it appears, the handle nudges once to show it can be dragged
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting || hinted) return;
    o.disconnect(); hinted = true;
    const keys = [[0, 50], [500, 28], [1100, 72], [1700, 50]], t0 = performance.now();
    (function step(now) {
      const t = now - t0;
      let i = 0; while (i < keys.length - 1 && t > keys[i + 1][0]) i++;
      if (i >= keys.length - 1) { setPos(50); range.value = 50; return; }
      const [ta, va] = keys[i], [tb, vb] = keys[i + 1], k = (t - ta) / (tb - ta), e2 = k * k * (3 - 2 * k);
      const v = va + (vb - va) * e2; setPos(v.toFixed(1)); range.value = v;
      requestAnimationFrame(step);
    })(t0);
  }, { threshold: 0.6 }).observe(cmp);

  /* ---------- 6. ENGAGEMENT PICKER + FORM PREFILL ---------- */
  const goals = $$('.fit-goals button'), ads = $('.ads'), adCards = $$('.ad'), fitOut = $('#fit-out');
  const names = card => $('.ad-tag', card).textContent.split('·')[1].trim();
  goals.forEach(btn => btn.addEventListener('click', () => {
    btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    const picked = goals.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.goal);
    if (!picked.length) {
      ads.classList.remove('filtering'); adCards.forEach(a => a.classList.remove('match'));
      fitOut.textContent = 'Pick a goal and we will point you to the right engagement.'; return;
    }
    const scored = adCards.map(a => ({ a, n: picked.filter(g => a.dataset.fit.split(' ').includes(g)).length }));
    const best = Math.max(...scored.map(s => s.n));
    ads.classList.add('filtering');
    scored.forEach(s => s.a.classList.toggle('match', s.n > 0 && s.n >= Math.max(1, best - 1)));
    const matches = scored.filter(s => s.a.classList.contains('match')).sort((x, y) => y.n - x.n).map(s => names(s.a));
    fitOut.textContent = matches.length === 1 ? `We would start with ${matches[0]}.` : `We would suggest ${matches.slice(0, -1).join(', ')} and ${matches.slice(-1)}.`;
  }));
  const engageSelect = $('#f-budget');
  $$('[data-engage]').forEach(a => a.addEventListener('click', () => {
    engageSelect.value = a.dataset.engage;
    const f = engageSelect.closest('.field');
    f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash');
  }));

  /* ---------- 7. COUNTERS ---------- */
  const fmt = n => n.toLocaleString('en-US');
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    if (reduce) return;
    const el = e.target, to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1400;
    (function step(now) {
      const t = clamp((now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - t, 3)));
      el.textContent = pre + fmt(v) + suf;
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- 8a. FAQ schema from the static HTML ---------- */
  const faqLd = document.createElement('script');
  faqLd.type = 'application/ld+json';
  faqLd.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: $$('#faq details').map(d => ({
      '@type': 'Question', name: $('summary span', d).textContent.trim(),
      acceptedAnswer: { '@type': 'Answer', text: $('.a p', d).textContent.trim() }
    }))
  });
  document.head.appendChild(faqLd);

  /* ---------- 8b. FORM ---------- */
  const form = $('#apply-form');
  const statusEl = $('.form-status', form);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRe = /^\+?[0-9\s()]{7,20}$/;
  const fields = $$('input:not([type=checkbox]), select, textarea', form);
  function setErr(f, msg) {
    const wrap = f.closest('.field');
    wrap.classList.toggle('invalid', !!msg);
    $('.err', wrap).textContent = msg || '';
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function check(f) {
    const v = f.value.trim();
    if (f.required && !v) return setErr(f, 'This field is required.'), false;
    if (f.type === 'email' && v && !emailRe.test(v)) return setErr(f, 'Enter an email like name@company.ae'), false;
    if (f.type === 'tel' && v && !phoneRe.test(v)) return setErr(f, 'Use digits with a country code, for example +971 50 123 4567.'), false;
    setErr(f, ''); return true;
  }
  fields.forEach(f => {
    f.addEventListener('blur', () => check(f));
    f.addEventListener('input', () => { if (f.closest('.field').classList.contains('invalid')) check(f); });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true, first = null;
    fields.forEach(f => { if (!check(f)) { ok = false; first = first || f; } });
    const picked = $$('input[name=services]:checked', form).map(c => c.value);
    const fs = $('fieldset', form);
    $('.err', fs).textContent = picked.length ? '' : 'Choose at least one service.';
    if (!picked.length) { ok = false; first = first || $('input', fs); }
    if (!ok) { first.focus(); statusEl.textContent = 'Please check the highlighted fields.'; return; }
    const d = Object.fromEntries(new FormData(form));
    const text = [`Name: ${d.name}`, `Company: ${d.company}`, `Email: ${d.email}`, `WhatsApp: ${d.phone || 'not given'}`,
      `Services: ${picked.join(', ')}`, `Main market: ${d.market}`, `Engagement: ${d.budget}`, '', d.message].join('\n');
    // No backend yet: open the visitor's mail app with the reply filled in.
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Stat6 reply · ' + d.company)}&body=${encodeURIComponent(text)}`;
    statusEl.textContent = 'Your email app is opening with the reply ready to send.';
    if (window.gtag) gtag('event', 'generate_lead', { form: 'reply', services: picked.join('|'), market: d.market, engagement: d.budget });
  });

  /* ---------- 8c. CONSENT + GA4 ---------- */
  const consent = $('#consent');
  const store = {
    get() { try { return localStorage.getItem('stat6-consent'); } catch { return null; } },
    set(v) { try { localStorage.setItem('stat6-consent', v); } catch { /* private mode */ } }
  };
  function loadGA() {
    if (!/^G-[A-Z0-9]{6,}$/.test(CONFIG.ga4Id) || CONFIG.ga4Id === 'G-XXXXXXXXXX' || loadGA.done) return;
    loadGA.done = true;
    const s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4Id;
    document.head.appendChild(s);
    gtag('js', new Date()); gtag('config', CONFIG.ga4Id, { anonymize_ip: true });
  }
  function applyConsent(v) {
    gtag('consent', 'update', { analytics_storage: v === 'grant' ? 'granted' : 'denied' });
    if (v === 'grant') loadGA();
  }
  const saved = store.get();
  if (saved) applyConsent(saved); else setTimeout(() => { consent.hidden = false; }, 6000);
  consent.addEventListener('click', e => {
    const v = e.target.closest('[data-consent]')?.dataset.consent;
    if (!v) return;
    store.set(v); applyConsent(v); consent.hidden = true;
  });
  $('#cookie-open').addEventListener('click', () => { consent.hidden = false; });
})();
