/**
 * Urboa — controle da apresentação.
 * Escala o palco 1920×1080 para a janela, navega por teclado, clique,
 * toque e hash da URL (#3 abre o terceiro slide).
 */
(() => {
  const STAGE_W = 1920;
  const STAGE_H = 1080;
  const IDLE_MS = 2500;

  const root = document.documentElement;
  const stage = document.getElementById('deck');
  const slides = Array.from(stage.querySelectorAll('.slide'));
  const counter = document.querySelector('[data-counter]');
  const hud = document.querySelector('.hud');
  const total = slides.length;
  const pad = (n) => String(n).padStart(2, '0');

  let current = -1;
  let idleTimer;

  function fit() {
    const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    root.style.setProperty('--scale', String(scale));
  }

  function indexFromHash() {
    const n = Number.parseInt(window.location.hash.slice(1), 10);
    return Number.isFinite(n) ? n - 1 : 0;
  }

  function go(target) {
    const next = Math.max(0, Math.min(total - 1, target));
    if (next === current) return;

    slides.forEach((slide, i) => {
      const active = i === next;
      slide.classList.toggle('is-active', active);
      slide.classList.toggle('is-past', i < next);
      slide.inert = !active;
      slide.setAttribute('aria-hidden', String(!active));
    });

    current = next;
    root.style.setProperty('--p', `${((next + 1) / total) * 100}%`);
    counter.textContent = `${pad(next + 1)} / ${pad(total)}`;
    document.title = `${slides[next].dataset.title} · Urboa`;
    history.replaceState(null, '', `#${next + 1}`);
  }

  const nextSlide = () => go(current + 1);
  const prevSlide = () => go(current - 1);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }

  function wakeHud() {
    hud.classList.remove('is-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => hud.classList.add('is-idle'), IDLE_MS);
  }

  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
      case 'Enter':
        event.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Backspace':
        event.preventDefault();
        prevSlide();
        break;
      case 'Home':
        go(0);
        break;
      case 'End':
        go(total - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      default:
        return;
    }
    wakeHud();
  });

  // Clique no palco: terço esquerdo volta, restante avança.
  document.querySelector('.viewport').addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    const { left, width } = stage.getBoundingClientRect();
    if (event.clientX - left < width / 3) prevSlide();
    else nextSlide();
  });

  // Gesto de deslizar em telas de toque.
  let touchX = null;
  document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) (dx < 0 ? nextSlide : prevSlide)();
    touchX = null;
  });

  document.getElementById('hud-prev').addEventListener('click', prevSlide);
  document.getElementById('hud-next').addEventListener('click', nextSlide);
  document.getElementById('hud-full').addEventListener('click', toggleFullscreen);

  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => go(indexFromHash()));
  document.addEventListener('mousemove', wakeHud);

  fit();
  go(indexFromHash());
  wakeHud();
})();
