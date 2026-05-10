(() => {
  'use strict';

  const state = {
    slides: [],
    index: 0,
    notesOpen: false,
    overviewOpen: false,
  };

  const els = {
    slide: document.getElementById('slide'),
    image: document.getElementById('slide-image'),
    title: document.getElementById('slide-title'),
    bullets: document.getElementById('slide-bullets'),
    counter: document.getElementById('counter'),
    progress: document.getElementById('progress'),
    progressBar: document.getElementById('progress-bar'),
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    fs: document.getElementById('fullscreen'),
    main: document.getElementById('main'),
    hint: document.getElementById('hint'),
    notes: document.getElementById('notes'),
    notesBody: document.getElementById('notes-body'),
    overview: document.getElementById('overview'),
    overviewGrid: document.getElementById('overview-grid'),
    help: document.getElementById('help'),
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  async function loadSlides() {
    const res = await fetch('/data/slides.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`failed to load slides: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error('slides.json must contain non-empty "slides" array');
    }
    state.slides = data.slides;
  }

  function setBullets(items) {
    els.bullets.replaceChildren();
    for (const item of items) {
      const li = document.createElement('li');
      li.textContent = String(item);
      els.bullets.appendChild(li);
    }
  }

  // #00454 — slide transition: brief fade between slides; suppressed when prefers-reduced-motion is set.
  function paintSlide() {
    const total = state.slides.length;
    if (total === 0) return;
    const i = clamp(state.index, 0, total - 1);
    state.index = i;
    const s = state.slides[i];

    els.title.textContent = s.title || '';
    setBullets(Array.isArray(s.bullets) ? s.bullets : []);

    if (s.image) {
      const safe = encodeURI(s.image);
      els.image.style.backgroundImage = `url("${safe}")`;
    } else {
      els.image.style.backgroundImage = '';
    }

    els.counter.textContent = `${i + 1} / ${total}`;
    els.prev.disabled = i === 0;
    els.next.disabled = i === total - 1;

    const pct = total === 1 ? 100 : Math.round((i / (total - 1)) * 100);
    els.progressBar.style.width = `${pct}%`;
    els.progress.setAttribute('aria-valuenow', String(pct));

    const url = new URL(window.location.href);
    url.hash = `slide-${i + 1}`;
    history.replaceState(null, '', url);

    paintNotes();
    if (state.overviewOpen) markOverviewActive();
  }

  function render() {
    if (reduceMotion.matches) {
      paintSlide();
      return;
    }
    els.slide.classList.add('is-fading');
    requestAnimationFrame(() => {
      paintSlide();
      requestAnimationFrame(() => {
        els.slide.classList.remove('is-fading');
      });
    });
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function go(delta) {
    state.index = clamp(state.index + delta, 0, state.slides.length - 1);
    render();
  }

  function jump(target) {
    if (target === 'first') state.index = 0;
    else if (target === 'last') state.index = state.slides.length - 1;
    else if (Number.isInteger(target)) state.index = clamp(target, 0, state.slides.length - 1);
    render();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  // #00456 — speaker notes: slides[i].notes (string) renders into the bottom panel; press S toggles.
  function paintNotes() {
    const s = state.slides[state.index] || {};
    els.notesBody.replaceChildren();
    const text = typeof s.notes === 'string' ? s.notes.trim() : '';
    if (!text) {
      const p = document.createElement('p');
      p.className = 'notes-empty';
      p.textContent = 'No notes for this slide.';
      els.notesBody.appendChild(p);
      return;
    }
    for (const para of text.split(/\n{2,}/)) {
      const p = document.createElement('p');
      p.textContent = para;
      els.notesBody.appendChild(p);
    }
  }

  function setNotesOpen(open) {
    state.notesOpen = Boolean(open);
    els.notes.hidden = !state.notesOpen;
    els.notes.setAttribute('aria-hidden', state.notesOpen ? 'false' : 'true');
    document.body.classList.toggle('has-notes', state.notesOpen);
    try {
      window.localStorage.setItem('presentation.notesOpen', state.notesOpen ? '1' : '0');
    } catch {}
    if (state.notesOpen) paintNotes();
  }

  function toggleNotes() {
    setNotesOpen(!state.notesOpen);
  }

  // #00457 — overview grid: thumbnails of every slide, click to jump.
  function buildOverview() {
    els.overviewGrid.replaceChildren();
    state.slides.forEach((s, i) => {
      const li = document.createElement('li');
      li.className = 'overview-cell';
      li.setAttribute('role', 'listitem');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'overview-tile';
      btn.dataset.action = 'overview-jump';
      btn.dataset.target = String(i);
      btn.setAttribute('aria-label', `Slide ${i + 1}: ${s.title || ''}`);

      const idx = document.createElement('span');
      idx.className = 'overview-tile__idx';
      idx.textContent = String(i + 1);

      const ttl = document.createElement('span');
      ttl.className = 'overview-tile__title';
      ttl.textContent = s.title || `Slide ${i + 1}`;

      btn.append(idx, ttl);
      li.append(btn);
      els.overviewGrid.append(li);
    });
  }

  function markOverviewActive() {
    const tiles = els.overviewGrid.querySelectorAll('.overview-tile');
    tiles.forEach((tile, i) => {
      tile.classList.toggle('is-active', i === state.index);
      if (i === state.index) tile.setAttribute('aria-current', 'true');
      else tile.removeAttribute('aria-current');
    });
  }

  function setOverviewOpen(open) {
    state.overviewOpen = Boolean(open);
    if (state.overviewOpen) buildOverview();
    els.overview.hidden = !state.overviewOpen;
    els.overview.setAttribute('aria-hidden', state.overviewOpen ? 'false' : 'true');
    document.body.classList.toggle('has-overview', state.overviewOpen);
    if (state.overviewOpen) markOverviewActive();
  }

  function toggleOverview() {
    setOverviewOpen(!state.overviewOpen);
  }

  // #00455 — keyboard help dialog. Opens on `?`; closed via Esc / Close button.
  function setHelpOpen(open) {
    if (typeof els.help.showModal !== 'function') return;
    if (open && !els.help.open) els.help.showModal();
    if (!open && els.help.open) els.help.close();
  }

  function toggleHelp() {
    setHelpOpen(!els.help.open);
  }

  function bindControls() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'prev') go(-1);
      else if (action === 'next') go(1);
      else if (action === 'fullscreen') toggleFullscreen();
      else if (action === 'toggle-notes') toggleNotes();
      else if (action === 'toggle-overview') toggleOverview();
      else if (action === 'toggle-help') toggleHelp();
      else if (action === 'overview-jump') {
        const target = parseInt(btn.dataset.target, 10);
        if (Number.isInteger(target)) {
          jump(target);
          setOverviewOpen(false);
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.defaultPrevented) return;
      // Ignore typed shortcuts inside dialogs / form fields.
      const tag = (e.target instanceof Element ? e.target.tagName : '') || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      switch (e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          go(-1); e.preventDefault(); break;
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          go(1); e.preventDefault(); break;
        case 'Home':
          jump('first'); e.preventDefault(); break;
        case 'End':
          jump('last'); e.preventDefault(); break;
        case 'f':
        case 'F':
          toggleFullscreen(); e.preventDefault(); break;
        case 's':
        case 'S':
          toggleNotes(); e.preventDefault(); break;
        case 'o':
        case 'O':
          toggleOverview(); e.preventDefault(); break;
        case '?':
          toggleHelp(); e.preventDefault(); break;
        case 'Escape':
          if (els.help.open) { setHelpOpen(false); e.preventDefault(); break; }
          if (state.overviewOpen) { setOverviewOpen(false); e.preventDefault(); break; }
          if (document.fullscreenElement) document.exitFullscreen?.();
          break;
      }
    });

    document.addEventListener('fullscreenchange', () => {
      document.body.classList.toggle('is-fullscreen', !!document.fullscreenElement);
    });

    let touchStartX = null;
    let touchStartY = null;
    els.main.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }, { passive: true });
    els.main.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? 1 : -1);
      }
      touchStartX = null;
      touchStartY = null;
    }, { passive: true });
  }

  function applyHash() {
    const m = /^#slide-(\d+)$/.exec(window.location.hash);
    if (m) {
      const n = parseInt(m[1], 10) - 1;
      if (Number.isInteger(n)) state.index = clamp(n, 0, state.slides.length - 1);
    }
  }

  function restoreNotesPreference() {
    try {
      if (window.localStorage.getItem('presentation.notesOpen') === '1') {
        setNotesOpen(true);
      }
    } catch {}
  }

  async function main() {
    try {
      await loadSlides();
      applyHash();
      bindControls();
      paintSlide();
      restoreNotesPreference();
      els.main.focus({ preventScroll: true });
    } catch (err) {
      els.title.textContent = 'Error loading slides';
      setBullets([err.message]);
      els.counter.textContent = '–';
    }
  }

  document.addEventListener('DOMContentLoaded', main);
})();
