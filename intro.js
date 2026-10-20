/* 最初の訪問だけ、画像とフォントの準備に合わせてオープニングを表示。 */
(() => {
  const root = document.documentElement;
  const intro = document.querySelector('.site-intro');
  if (!intro || !root.classList.contains('intro-active')) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const startedAt = performance.now();
  const content = [...document.querySelectorAll('.site-header, main, .footer, .skip')];
  const originalInert = content.map((element) => element.inert);
  let done = false;
  let revealing = false;
  let exitTimer;
  let deadline;

  content.forEach((element) => { element.inert = true; });
  try { sessionStorage.setItem('portfolio-intro-seen', '1'); } catch {}

  function finish() {
    if (done) return;
    done = true;
    clearTimeout(deadline);
    clearTimeout(exitTimer);
    clearTimeout(window.portfolioIntroSafety);
    root.classList.remove('intro-active', 'intro-preparing');
    content.forEach((element, index) => { element.inert = originalInert[index]; });
    if (intro.contains(document.activeElement)) {
      document.querySelector('.brand')?.focus({ preventScroll: true });
    }
    intro.remove();
    document.removeEventListener('keydown', onKeydown);
    reducedMotion.removeEventListener('change', onMotionChange);
  }

  function reveal() {
    if (done || revealing) return;
    revealing = true;
    root.classList.remove('intro-preparing');
    intro.classList.add('is-leaving');
    exitTimer = setTimeout(finish, 850);
  }

  function onKeydown(event) {
    if (event.key === 'Escape') finish();
  }

  function onMotionChange(event) {
    if (event.matches) finish();
  }

  intro.querySelector('.intro-skip').addEventListener('click', finish);
  document.addEventListener('keydown', onKeydown);
  reducedMotion.addEventListener('change', onMotionChange);
  window.addEventListener('pagehide', finish, { once: true });
  intro.addEventListener('transitionend', (event) => {
    if (event.target === intro && event.propertyName === 'transform') finish();
  });
  // 通信が遅い場合も、3秒以内を目安に本文を開放する。
  deadline = setTimeout(finish, 3100);

  const images = [...document.querySelectorAll('.hero-image img')].map((image) => {
    if (typeof image.decode === 'function') return image.decode().catch(() => {});
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  });
  const assetsReady = Promise.allSettled([document.fonts?.ready, ...images]);
  const maxWait = new Promise((resolve) => setTimeout(resolve, 2100));
  Promise.race([assetsReady, maxWait]).then(() => {
    const remaining = Math.max(0, 1000 - (performance.now() - startedAt));
    exitTimer = setTimeout(reveal, remaining);
  });
})();
