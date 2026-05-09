(() => {
  'use strict';

  const state = {
    slides: [],
    index: 0,
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
  };

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

  function render() {
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

  function bindControls() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'prev') go(-1);
      else if (action === 'next') go(1);
      else if (action === 'fullscreen') toggleFullscreen();
    });

    document.addEventListener('keydown', (e) => {
      if (e.defaultPrevented) return;
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
        case 'Escape':
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

  async function main() {
    try {
      await loadSlides();
      applyHash();
      bindControls();
      render();
      els.main.focus({ preventScroll: true });
    } catch (err) {
      els.title.textContent = 'Error loading slides';
      setBullets([err.message]);
      els.counter.textContent = '–';
    }
  }

  document.addEventListener('DOMContentLoaded', main);
})();
