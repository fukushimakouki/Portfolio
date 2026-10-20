/* 横スクロール、閲覧位置の保存、ナビゲーションの現在地表示 */
const track = document.querySelector('.work-track');
if (track) {
  const cards = [...track.querySelectorAll('.work-card')];
  const prev = document.querySelector('[data-direction="prev"]');
  const next = document.querySelector('[data-direction="next"]');
  const number = document.querySelector('[data-current]');
  const progress = document.querySelector('.progress-bar');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  function update() {
    const trackRect = track.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(track).paddingLeft);
    current = cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left - trackRect.left - pad) < Math.abs(cards[best].getBoundingClientRect().left - trackRect.left - pad) ? index : best, 0);
    number.textContent = String(current + 1).padStart(2,'0');
    prev.disabled = current === 0;
    next.disabled = current === cards.length - 1;
    progress.style.transform = `translateX(${current * 100}%)`;
    try { sessionStorage.setItem('portfolio-work-position', String(track.scrollLeft)); } catch {}
  }
  function move(direction) {
    const index = Math.max(0, Math.min(cards.length - 1, current + direction));
    const distance = cards[index].getBoundingClientRect().left - cards[current].getBoundingClientRect().left;
    track.scrollBy({left:distance, behavior:reducedMotion ? 'instant' : 'smooth'});
  }
  prev.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  track.addEventListener('keydown',event=>{
    if(event.target !== track) return;
    if(event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if(event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  });
  track.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  try { if (location.hash === '#work') track.scrollLeft = Number(sessionStorage.getItem('portfolio-work-position')) || 0; } catch {}
  update();
  window.addEventListener('pageshow',update);
}
const sections = [...document.querySelectorAll('main > section[id]')];
if (sections.length) {
  const links = [...document.querySelectorAll('.nav a')];
  function activeSection() {
    let active = sections[0];
    for(const section of sections) if(section.getBoundingClientRect().top <= 160) active = section;
    links.forEach(link=>{
      if(link.hash === '#' + active.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll',activeSection,{passive:true});
  activeSection();
}

// 作品・プロフィールは、スクロールに合わせてゆっくり表示します。
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealTargets = document.querySelectorAll('.section-head, .about-intro, .about-group, .detail-section');
  document.documentElement.classList.add('reveal-enabled');
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });
  revealTargets.forEach(element => {
    element.classList.add('editorial-reveal');
    revealObserver.observe(element);
  });
}

// 本文の1/4速を保ち、同じ絵柄を繰り返さない一続きの背景を作る。
const slowBackground = document.querySelector('.ambient-scene');
if (slowBackground) {
  const backgroundScrollRatio = 0.25;
  const backgroundMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let scrollRange = 0;
  let slowBackgroundFrame = 0;
  let layoutKey = '';
  // 同じ画面サイズでは再訪・逆スクロールでも配置が変わらない乱数。
  function seededBackgroundRandom() {
    let seed = 0x46a71f03;
    return () => {
      seed += 0x6D2B79F5;
      let value = seed;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  function makeBackgroundLayout(width, height, sceneHeight) {
    const mobile = width <= 560;
    // 最初の画面の物量・配置は、直前の版を維持する。
    const first = mobile
      ? [[-.18,.17,.58,.14],[.69,-.02,.48,.31],[.46,.40,.22,.10],[.62,.64,.56,.21],[-.18,.77,.50,.30],[.35,.95,.28,.13],[-.05,.48,.24,.12]]
      : [[-.12,.16,.34,.17],[.79,-.02,.29,.32],[.43,.39,.14,.10],[.74,.62,.38,.22],[-.10,.72,.29,.32],[.24,.95,.23,.15],[.08,.45,.12,.13]];
    const shades = ['#10100f','#0b0b0a','#141413','#0b0b0a','#10100f','#111110','#0c0c0b'];
    const blocks = first.map((box,index) => ({ x:box[0]*width,y:box[1]*height,w:box[2]*width,h:box[3]*height,color:shades[index] }));
    const random = seededBackgroundRandom();
    let y = height * 1.08;
    while (y < sceneHeight) {
      let candidate;
      for(let attempt=0;attempt<8;attempt++) {
        const w = width * ((mobile ? .24 : .15) + random() * (mobile ? .31 : .25));
        const h = height * (.11 + random() * .19);
        const x = width * (-.16 + random() * 1.12);
        candidate = {x,y,w,h,color:shades[Math.floor(random()*shades.length)]};
        const overlaps = blocks.slice(-5).some(other => {
          const overlapWidth = Math.max(0,Math.min(x+w,other.x+other.w)-Math.max(x,other.x));
          const overlapHeight = Math.max(0,Math.min(y+h,other.y+other.h)-Math.max(y,other.y));
          return overlapWidth*overlapHeight > Math.min(w*h,other.w*other.h)*.18;
        });
        if(!overlaps) break;
      }
      blocks.push(candidate);
      y += height * (.12 + random() * .07);
    }
    return blocks;
  }
  function paintSlowBackground() {
    slowBackgroundFrame = 0;
    if (document.hidden) return;
    const distance = Math.max(0, Math.min(scrollRange, scrollY)) * backgroundScrollRatio;
    slowBackground.style.transform = backgroundMotion.matches ? '' : `translate3d(0,${-distance}px,0)`;
  }
  function sizeSlowBackground() {
    const height = Math.max(1,innerHeight);
    const width = Math.max(1,document.documentElement.clientWidth || innerWidth);
    scrollRange = Math.max(0,Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)-height);
    const sceneHeight = height + scrollRange * backgroundScrollRatio + height * .35;
    const nextKey = `${width}:${height}:${sceneHeight}`;
    if (nextKey !== layoutKey) {
      layoutKey = nextKey;
      const fragment = document.createDocumentFragment();
      makeBackgroundLayout(width,height,sceneHeight).forEach(box => {
        const block = document.createElement('span');
        block.className = 'ambient-block';
        Object.assign(block.style,{left:`${box.x}px`,right:'auto',top:`${box.y}px`,width:`${box.w}px`,height:`${box.h}px`,background:box.color});
        fragment.append(block);
      });
      slowBackground.style.height = `${sceneHeight}px`;
      slowBackground.replaceChildren(fragment);
    }
    paintSlowBackground();
  }
  function queueSlowBackground() {
    if(!slowBackgroundFrame && !backgroundMotion.matches && !document.hidden) slowBackgroundFrame = requestAnimationFrame(paintSlowBackground);
  }
  window.addEventListener('scroll',queueSlowBackground,{passive:true});
  window.addEventListener('resize',sizeSlowBackground);
  window.addEventListener('pageshow',sizeSlowBackground);
  backgroundMotion.addEventListener('change',sizeSlowBackground);
  document.addEventListener('visibilitychange',() => {
    if(document.hidden) { cancelAnimationFrame(slowBackgroundFrame);slowBackgroundFrame=0; }
    else sizeSlowBackground();
  });
  if('ResizeObserver' in window) new ResizeObserver(sizeSlowBackground).observe(document.body);
  sizeSlowBackground();
}
