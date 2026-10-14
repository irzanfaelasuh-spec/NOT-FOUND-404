(() => {
  'use strict';

  /* Where BACK HOME leads. "/" = site root.
     Subdirectory deploy (e.g. GitHub Pages project site): "/your-repo/" */
  const HOME_URL = '/';
  const RETRY_LOCK_MS = 5200;
  const EMPHASIS_MS = 1300;

  const hero = document.getElementById('hero');
  const homeLink = document.getElementById('home-link');
  const retryBtn = document.getElementById('retry-btn');
  const plug = document.getElementById('plug-move');
  const attemptEl = document.getElementById('attempt-count');
  const stateEl = document.getElementById('connection-state');
  const noteEl = document.getElementById('retry-note');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let attempts = 0;
  let busy = false;
  const timers = new Set();

  const later = (fn, ms) => {
    const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };
  const clearTimers = () => { timers.forEach(window.clearTimeout); timers.clear(); };
  const renderAttempts = () => { attemptEl.textContent = String(attempts % 1000).padStart(3, '0'); };

  /* Navigation: the anchor works without JS; this only applies HOME_URL. */
  homeLink.setAttribute('href', HOME_URL);
  homeLink.addEventListener('click', () => homeLink.classList.add('is-leaving'));

  /* Count two attempts per completed loop. */
  plug.addEventListener('animationiteration', (e) => {
    if (e.animationName === 'plug-approach') { attempts += 2; renderAttempts(); }
  });

  function restartAnimation() {
    hero.classList.remove('is-running');
    void hero.offsetWidth; /* force reflow so the loop restarts from frame 0 */
    hero.classList.add('is-running');
  }

  function finishRetry() {
    busy = false;
    clearTimers();
    hero.classList.remove('is-retrying', 'is-emphasized');
    retryBtn.removeAttribute('aria-disabled');
    noteEl.textContent = '';
    stateEl.textContent = 'FAILED';
  }

  function retry() {
    if (busy) return; /* ignore rapid clicks: one timer set at a time */
    busy = true;
    retryBtn.setAttribute('aria-disabled', 'true');
    hero.classList.add('is-retrying', 'is-emphasized');
    noteEl.textContent = 'RETRYING CONNECTION...';
    stateEl.textContent = 'RETRYING';
    attempts += 1;
    renderAttempts();
    restartAnimation();
    later(() => hero.classList.remove('is-emphasized'), EMPHASIS_MS);
    later(finishRetry, RETRY_LOCK_MS);
  }

  retryBtn.addEventListener('click', retry);

  /* Clean up timers when leaving; restore UI if restored from bfcache. */
  window.addEventListener('pagehide', clearTimers);
  window.addEventListener('pageshow', (e) => { if (e.persisted) finishRetry(); });

  /* Dust: created once, animated purely with CSS. */
  const dust = document.getElementById('dust');
  if (dust && !reduced.matches) {
    const count = window.innerWidth < 600 ? 12 : 22;
    const frag = document.createDocumentFragment();
    const r = Math.random;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i');
      s.style.cssText =
        `--x:${(r() * 100).toFixed(1)}%;--y:${(40 + r() * 60).toFixed(1)}%;` +
        `--t:${(14 + r() * 16).toFixed(1)}s;--d:${(-r() * 20).toFixed(1)}s;` +
        `--o:${(0.2 + r() * 0.4).toFixed(2)};--dx:${(r() * 60 - 30).toFixed(0)}px`;
      frag.appendChild(s);
    }
    dust.appendChild(frag);
  }
})();
