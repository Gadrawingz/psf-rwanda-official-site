/**
 * psf-banner.js  —  PSF Top Banner phase controller
 *
 * Phase 1  KWIBUKA 32    Apr 07 2025 → Jul 16 2025  (priority)
 * Phase 2  RITF EXPO     Jul 15 2025 → Aug 05 2025
 *
 * Kwibuka countdown : 100 → 0 mapped over the 100-day window
 * Quote rotation    : 5 quotes, one per 20-day block
 *
 * @author @gadrawingz | One-PSF Digital Transformation
 */
(function () {
  'use strict';

  /* ── Date boundaries (Rwanda UTC+2) ─────────────────────────── */
  var KWI_START = new Date('2025-04-07T00:00:00+02:00');
  var KWI_END   = new Date('2025-07-16T00:00:00+02:00');
  var EXP_START = new Date('2025-07-15T00:00:00+02:00');
  var EXP_END   = new Date('2025-08-05T00:00:00+02:00');

  /* ── 20-day rotating quotes (Kinyarwanda) ───────────────────── */
  var QUOTES = [
    'Kwibuka ni ukwibuka ibyo twapfuye tukabikomeza',   /* day  0–19  */
    'Inzira y\'ubumwe ni umuco wacu wa kera',            /* day 20–39  */
    'Tuzabuka imbere yacu twubaka hamwe',                /* day 40–59  */
    'Urumuri rw\'icyizere ntirwima umucanwa',            /* day 60–79  */
    'Umuryango w\'u Rwanda ni inkomoko y\'amajyambere'  /* day 80–99  */
  ];

  /* ── Helpers ─────────────────────────────────────────────────── */
  function pad(n) { return String(Math.max(0, Math.floor(n))).padStart(2, '0'); }
  function el(id) { return document.getElementById(id); }

  /* ── Show one phase, hide the other ─────────────────────────── */
  function show(id) {
    ['psf-kwibuka', 'psf-expo'].forEach(function (p) {
      var node = el(p);
      if (!node) return;
      node.classList[p === id ? 'add' : 'remove']('psf-on');
    });
  }

  /* ── Kwibuka: countdown 100→0 + quote swap ───────────────────── */
  function tickKwibuka(now) {
    var total   = KWI_END - KWI_START;
    var elapsed = now - KWI_START;
    var pct     = Math.min(1, Math.max(0, elapsed / total));
    var days    = Math.round(100 - pct * 100);

    var dEl = el('psf-kwi-days');
    if (dEl) dEl.textContent = pad(days);

    var slot  = Math.min(Math.floor(elapsed / 86400000 / 20), QUOTES.length - 1);
    slot      = Math.max(0, slot);
    var qEl   = el('psf-kwi-quote');
    if (qEl && qEl.dataset.slot !== String(slot)) {
      qEl.textContent       = QUOTES[slot];
      qEl.dataset.slot      = slot;
      qEl.style.animation   = 'none';
      void qEl.offsetWidth;
      qEl.style.animation   = 'kwiQ .8s ease-in';
    }
  }

  /* ── Expo: live D:H:M countdown ─────────────────────────────── */
  function tickExpo(now) {
    var ms = EXP_END - now;
    if (ms <= 0) return;
    el('psf-exp-d').textContent = pad(ms / 86400000);
    el('psf-exp-h').textContent = pad((ms % 86400000) / 3600000);
    el('psf-exp-m').textContent = pad((ms % 3600000)  / 60000);
  }

  /* ── Main tick ───────────────────────────────────────────────── */
  function tick() {
    var now = new Date();

    /* Kwibuka has strict priority — always shown inside its window */
    if (now >= KWI_START && now < KWI_END) {
      show('psf-kwibuka');
      tickKwibuka(now);
      return;
    }

    /* Expo — only after Kwibuka window closes */
    if (now >= EXP_START && now < EXP_END) {
      show('psf-expo');
      tickExpo(now);
      return;
    }

    /* Both events finished — hide banner entirely */
    show(null);
  }

  /* ── Run ─────────────────────────────────────────────────────── */
  tick();
  setInterval(tick, 60000);

}());
