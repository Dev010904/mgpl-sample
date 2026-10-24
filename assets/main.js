(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* smooth scrolling, with in-page links landing below the sticky header */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  var nav = $('.nav');
  function goTo(hash) {
    var el = hash === '#top' ? document.body : $(hash);
    if (!el) return;
    var offset = hash === '#top' ? 0 : -(nav.offsetHeight + 8);
    if (lenis) lenis.scrollTo(el, { offset: offset });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    e.preventDefault();
    closeMenu();
    goTo(a.getAttribute('href'));
  });

  /* header */
  function onScroll() { nav.classList.toggle('is-stuck', window.scrollY > 40); parallax(); reveal(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  var menuBtn = $('#menuBtn'), links = $('#navLinks');
  function closeMenu() { links.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
  menuBtn.addEventListener('click', function () {
    var open = !links.classList.contains('is-open');
    links.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  /* reveal on scroll: positions are checked directly, so nothing can stay hidden */
  var pending = $$('.reveal');
  function reveal() {
    if (!pending.length) return;
    var limit = window.innerHeight * 0.94;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) { el.classList.add('in'); return false; }
      return true;
    });
  }
  if (reduce) { pending.forEach(function (el) { el.classList.add('in'); }); pending = []; }
  else { pending.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; }); }
  window.addEventListener('load', reveal);
  window.addEventListener('resize', reveal);

  /* parallax on the image band */
  var band = $('.band'), bandImg = band && $('img', band);
  function parallax() {
    if (!bandImg || reduce) return;
    var r = band.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
    bandImg.style.transform = 'translate3d(0,' + (p * -14).toFixed(2) + '%,0)';
  }
  onScroll();

  /* gas explorer: standard physical values */
  var GAS = {
    o2: { name: 'Oxygen', sym: 'O<sub>2</sub>', text: 'The workhorse of metal cutting, welding and steel making, and the gas behind hotter, cleaner combustion in furnaces and kilns.', uses: ['Oxy-fuel cutting', 'Gas welding', 'Steel and foundries', 'Glass furnaces', 'Effluent treatment'], spec: [['Molar mass', '32.00 g/mol'], ['Boils at', '−183 °C'], ['Share of air', '20.9%']], supply: 'Supplied in high-pressure cylinders and liquid cylinders.' },
    n2: { name: 'Nitrogen', sym: 'N<sub>2</sub>', text: 'An inert gas that keeps oxygen and moisture away, so products stay safe, dry and fresh.', uses: ['Inerting and blanketing', 'Pipeline purging', 'Food packing', 'Pharma processing', 'Laser cutting'], spec: [['Molar mass', '28.01 g/mol'], ['Boils at', '−196 °C'], ['Share of air', '78.1%']], supply: 'Supplied in high-pressure cylinders.' },
    ar: { name: 'Argon', sym: 'Ar', text: 'The shielding gas for clean, spatter-free welds on stainless steel and aluminium.', uses: ['TIG welding', 'MIG welding', 'Stainless and aluminium', 'Laser and plasma', 'Metallurgy'], spec: [['Molar mass', '39.95 g/mol'], ['Boils at', '−186 °C'], ['Share of air', '0.93%']], supply: 'Supplied in high-pressure cylinders.' },
    co2: { name: 'Carbon dioxide', sym: 'CO<sub>2</sub>', text: 'Shields welds, puts the fizz in drinks, chills food and puts out fires.', uses: ['MIG and MAG welding', 'Beverage carbonation', 'Food chilling', 'Fire extinguishers', 'Water treatment'], spec: [['Molar mass', '44.01 g/mol'], ['Turns to gas at', '−78.5 °C'], ['Share of air', '0.04%']], supply: 'Supplied in high-pressure cylinders.' },
    da: { name: 'Dissolved acetylene', sym: 'DA', text: 'The fuel gas for gas welding, cutting, brazing and flame heating. It is supplied dissolved in acetone inside a cylinder packed with a porous mass, which keeps it stable and safe to store.', note: 'A dependable substitute for LPG in cutting and heating. With oxygen it burns at about 3,100 °C, the hottest flame of any common fuel gas, so metal heats faster, cuts come out cleaner and steel can even be welded.', uses: ['Gas welding', 'Oxy-acetylene cutting', 'Brazing', 'Flame heating and hardening', 'Lab analysis'], spec: [['Molar mass', '26.04 g/mol'], ['Flame with oxygen', '≈ 3,100 °C'], ['Stored', 'In acetone']], supply: 'Supplied in dissolved acetylene (DA) cylinders.' },
    n2o: { name: 'Nitrous oxide', sym: 'N<sub>2</sub>O', text: 'A slightly sweet gas used with oxygen for anaesthesia and pain relief in hospitals and dental clinics, and in industry as an oxidiser and a food-grade propellant.', uses: ['Anaesthesia', 'Dental clinics', 'Labour pain relief', 'Food aerosols', 'Lab analysis'], spec: [['Molar mass', '44.01 g/mol'], ['Boils at', '−88.5 °C'], ['Supplied as', 'Liquefied gas']], supply: 'Supplied in high-pressure cylinders as a liquefied gas.' },
    mo2: { name: 'Medical oxygen', sym: 'MO<sub>2</sub>', text: 'Oxygen for patients, supplied to hospitals, clinics and ambulances with the care that medical gases demand, round the clock, 24×7.', uses: ['Wards and ICUs', 'Operation theatres', 'Clinics', 'Ambulances', 'Home oxygen therapy'], spec: [['Molar mass', '32.00 g/mol'], ['Boils at', '−183 °C'], ['Grade', 'Medical']], supply: 'Supplied in medical oxygen cylinders for hospitals and clinics, 24×7.' }
  };
  var panel = $('#gasPanel');
  function showGas(key) {
    var g = GAS[key];
    if (!g) return;
    $$('.tile').forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.gas === key)); t.tabIndex = t.dataset.gas === key ? 0 : -1; });
    $('#gasBig').innerHTML = g.sym;
    $('#gasName').textContent = g.name;
    $('#gasText').textContent = g.text;
    var note = $('#gasNote');
    note.textContent = g.note || '';
    note.hidden = !g.note;
    $('#gasUses').innerHTML = g.uses.map(function (u) { return '<li>' + u + '</li>'; }).join('');
    $('#gasSpec').innerHTML = g.spec.map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>'; }).join('');
    $('#gasSupply').textContent = g.supply;
    $('#gasCta').firstChild.nodeValue = 'Ask for ' + g.name.toLowerCase() + ' ';
    $('#gasCta').dataset.gas = g.name;
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  }
  $$('.tile').forEach(function (t, i, all) {
    t.addEventListener('click', function () { showGas(t.dataset.gas); });
    t.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      var n = all[(i + d + all.length) % all.length];
      n.focus(); showGas(n.dataset.gas);
    });
  });
  showGas('o2');
  panel.classList.remove('swap');
  function tick(name, value) {
    $$('#enq input[name="' + name + '"]').forEach(function (c) { if (c.value === value) c.checked = true; });
    countGases();
  }
  $('#gasCta').addEventListener('click', function () { tick('gas', this.dataset.gas); });
  $$('[data-need]').forEach(function (a) { a.addEventListener('click', function () { tick('need', a.dataset.need); }); });

  /* valve photos: oxygen and CO2 */
  $$('#valveSwap button').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.valve;
      $$('#valveSwap button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('#valveSwap img').forEach(function (img) { img.classList.toggle('is-on', img.dataset.valve === v); });
    });
  });

  /* the cylinder cycle holds still for people who prefer less motion */
  var cycle = $('#cycleSvg');
  if (cycle && reduce && cycle.pauseAnimations) cycle.pauseAnimations();

  /* enquiry form (sample: "Send enquiry" shows a preview; WhatsApp opens a ready message) */
  var WA = '919727785477';
  var form = $('#enq'), msg = $('#enqMsg'), gasCount = $('#gasCount');
  function picked(name) { return $$('#enq input[name="' + name + '"]:checked').map(function (c) { return c.value; }); }
  function countGases() {
    var n = picked('gas').length;
    gasCount.textContent = n ? n + (n === 1 ? ' gas chosen' : ' gases chosen') : 'Choose one or more';
    gasCount.classList.toggle('is-on', n > 0);
    if (n || picked('need').length) $('#gasChips').classList.remove('is-bad');
  }
  form.addEventListener('change', countGases);
  function listOf(items) { return items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function val(id) { return $('#' + id).value.trim(); }
  function check() {
    var bad = [];
    ['fName', 'fPhone'].forEach(function (id) {
      var el = $('#' + id), v = el.value.trim();
      var ok = id === 'fPhone' ? v.replace(/\D/g, '').length >= 10 : v.length > 1;
      el.classList.toggle('is-bad', !ok);
      if (!ok) bad.push(el);
    });
    var none = !picked('gas').length && !picked('need').length;
    $('#gasChips').classList.toggle('is-bad', none);
    if (bad.length || none) {
      msg.hidden = false;
      msg.textContent = bad.length ? 'Please add your name and a 10-digit phone number.' : 'Please choose at least one gas or product.';
      (bad[0] || $('#gasChips input')).focus();
      return false;
    }
    return true;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!check()) return;
    var items = picked('gas').concat(picked('need')).map(function (x) { return x.toLowerCase(); });
    msg.hidden = false;
    msg.textContent = 'Thank you, ' + val('fName').split(' ')[0] + '. Your enquiry for ' + listOf(items) + ' is ready. On the live website it goes straight to the Maruti Gases sales team.';
    form.reset();
    countGases();
  });
  $('#enqWa').addEventListener('click', function () {
    if (!check()) return;
    var lines = ['Hello Maruti Gases, I would like a quote.', '', 'Name: ' + val('fName')];
    if (val('fCompany')) lines.push('Company: ' + val('fCompany'));
    lines.push('Phone: ' + val('fPhone'));
    if (val('fCity')) lines.push('City: ' + val('fCity'));
    lines.push('Supply for: ' + picked('use').join(''));
    if (picked('gas').length) lines.push('Gases: ' + picked('gas').join(', '));
    if (picked('need').length) lines.push('Also need: ' + picked('need').join(', '));
    if (val('fQty')) lines.push('Quantity: ' + val('fQty'));
    if (val('fMsg')) lines.push('Note: ' + val('fMsg'));
    msg.hidden = true;
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  /* sample notes */
  var notesBtn = $('#notesBtn'), notes = $('#notesPanel');
  function setNotes(on) { document.body.classList.toggle('show-notes', on); notes.hidden = !on; notesBtn.setAttribute('aria-pressed', String(on)); }
  notesBtn.addEventListener('click', function () { setNotes(notes.hidden); });
  $('#notesClose').addEventListener('click', function () { setNotes(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setNotes(false); closeMenu(); } });

  /* cold vapour drifting across the hero */
  var cv = $('#vapor');
  if (cv && cv.getContext && !reduce) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), puffs = [], running = true;
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function puff(fresh) {
      return {
        x: W * (0.35 + Math.random() * 0.65), y: fresh ? H * (0.55 + Math.random() * 0.5) : H * (0.85 + Math.random() * 0.3),
        r: 60 + Math.random() * 160, vx: 0.08 + Math.random() * 0.25, vy: -(0.12 + Math.random() * 0.3),
        a: 0, max: 0.035 + Math.random() * 0.06, life: 0, span: 900 + Math.random() * 900
      };
    }
    size();
    for (var i = 0; i < 26; i++) { var p = puff(true); p.life = Math.random() * p.span; puffs.push(p); }
    window.addEventListener('resize', size);
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var j = 0; j < puffs.length; j++) {
        var q = puffs[j];
        q.life += 1; q.x += q.vx; q.y += q.vy; q.r += 0.05;
        var t = q.life / q.span;
        q.a = q.max * Math.sin(Math.PI * Math.min(1, t));
        if (t >= 1 || q.y + q.r < 0) { puffs[j] = puff(false); continue; }
        var g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r);
        g.addColorStop(0, 'rgba(235,244,252,' + q.a.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(235,244,252,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    var hero = $('.hero');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(frame); }
        if (!vis) running = false;
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; else if (!running) { running = true; requestAnimationFrame(frame); } });
    requestAnimationFrame(frame);
  }
})();
