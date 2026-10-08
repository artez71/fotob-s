'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reducedMotion.matches;
const motionButton = document.querySelector('#motion-toggle');
const heroCarWrap = document.querySelector('.hero-car-wrap');
const progress = document.querySelector('.scroll-progress');
const scene = document.querySelector('.cinema-track');
const sceneSticky = document.querySelector('.cinema-sticky');
const heroVisual = document.querySelector('.hero-visual');
const heroBackword = document.querySelector('.hero-backword');
const liveAnimations = new Set();
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionAllowed = () => !motionPaused && !reducedMotion.matches;
function animateElement(element, keyframes, options) {
  if (!motionAllowed() || !element.animate) return;
  const animation = element.animate(keyframes, options);
  liveAnimations.add(animation);
  animation.addEventListener('finish', () => liveAnimations.delete(animation), {once:true});
  animation.addEventListener('cancel', () => liveAnimations.delete(animation), {once:true});
}
function applyMotion() {
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  document.documentElement.classList.toggle('js-motion', !motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.textContent = motionPaused ? 'Hareketi aç' : 'Hareketi durdur';
  if (motionPaused) {
    heroCarWrap.style.transform = '';
    heroCarWrap.style.translate = '';
    heroBackword.style.translate = '';
    liveAnimations.forEach(animation => animation.cancel());
    document.querySelectorAll('.button,.contact-disc').forEach(element => {
      element.style.removeProperty('--magnet-x');
      element.style.removeProperty('--magnet-y');
    });
  }
  requestAnimationFrame(updateScroll);
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; applyMotion(); });
reducedMotion.addEventListener('change', e => { motionPaused = e.matches; applyMotion(); });
applyMotion();
document.querySelectorAll('.section-heading h2,.story h2,.faq h2,.contact h2').forEach(heading => {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let wordOrder = 0;
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(text => {
      if (!text.trim()) { fragment.append(document.createTextNode(text)); return; }
      const word = document.createElement('span');
      word.className = 'motion-word';
      word.style.setProperty('--word-order', wordOrder++);
      word.textContent = text;
      fragment.append(word);
    });
    node.replaceWith(fragment);
  });
});
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  reveals.forEach(element => observer.observe(element));
  const activityObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('motion-outside', !entry.isIntersecting);
  }), {rootMargin:'100px'});
  document.querySelectorAll('.hero,.marquee,.cinema-track,.contact').forEach(element => activityObserver.observe(element));
  const footerObserver = new IntersectionObserver(entries => {
    document.querySelector('.floating-chat').classList.toggle('footer-near', entries[0].isIntersecting);
  });
  footerObserver.observe(document.querySelector('.site-footer'));
} else reveals.forEach(element => element.classList.add('is-visible'));
let ticking = false;
function updateScroll() {
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const sceneRect = scene.getBoundingClientRect();
  const headerHeight = innerWidth <= 680 ? 78 : innerWidth <= 900 ? 85 : 100;
  const sceneTravel = Math.max(1, scene.offsetHeight - sceneSticky.offsetHeight);
  const sceneProgress = Math.max(0, Math.min(1, (headerHeight - sceneRect.top) / sceneTravel));
  const photoCards = [...document.querySelectorAll('.gallery-card')].map(card => ({card,rect:card.getBoundingClientRect()}));
  progress.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
  if (motionAllowed()) {
    const heroProgress = Math.min(Math.max(scrollY / 700,0),1);
    heroCarWrap.style.transform = innerWidth > 680 ? `translate(${heroProgress * 58}px, ${heroProgress * -30}px) rotate(${heroProgress * -2}deg)` : '';
    heroBackword.style.transform = innerWidth > 680 ? `translateY(${heroProgress * 45}px)` : '';
    scene.style.setProperty('--scene-inset', `${6 * (1 - sceneProgress)}%`);
    scene.style.setProperty('--scene-radius', `${28 * (1 - sceneProgress)}px`);
    scene.style.setProperty('--scene-zoom', String(1.17 - sceneProgress * .17));
    scene.style.setProperty('--scene-shift', `${(sceneProgress-.5) * -24}px`);
    photoCards.forEach(({card,rect}) => {
      if (rect.bottom > 0 && rect.top < innerHeight) card.style.setProperty('--photo-shift', `${Math.max(-10,Math.min(10,(innerHeight/2-rect.top-rect.height/2)*.025))}px`);
    });
  } else {
    heroCarWrap.style.transform = '';
    heroBackword.style.transform = '';
  }
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, {passive:true});
addEventListener('resize', updateScroll);
updateScroll();
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Menüyü aç'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç'); mobileNav.hidden = !open; });
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
document.querySelectorAll('.event-row').forEach(button => button.addEventListener('click', () => {
  const wasOpen = button.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.event-row').forEach(row => { row.classList.remove('active'); row.setAttribute('aria-expanded','false'); row.querySelector('.event-detail').hidden = true; });
  if (!wasOpen) { button.classList.add('active'); button.setAttribute('aria-expanded','true'); button.querySelector('.event-detail').hidden = false; }
}));
const lightbox = document.querySelector('#lightbox');
const gallery = [
  { src: '/assets/foto-bus-evening.png', alt:'Foto Bus etkinlik konsepti', caption:'Biraz ışık, biraz sihir. Foto Bus etkinlik konsepti.' },
  { src: '/assets/fotobus-original.png', alt:'Foto Bus karavanının orijinal fotoğrafı', caption:'Kırmızı. Beyaz. Unutulmaz. Foto Bus’ın kendisi.' }
];
let currentImage = 0;
let lastGalleryTrigger;
function renderPhoto() {
  const photo=gallery[currentImage];
  const image = document.querySelector('#lightbox-image');
  image.src=photo.src; image.alt=photo.alt;
  document.querySelector('#lightbox-caption').textContent=photo.caption;
  document.querySelector('#lightbox-count').textContent=`${currentImage+1} / ${gallery.length}`;
  if (image.complete) animateElement(image,[{opacity:.2,transform:'scale(.975)'},{opacity:1,transform:'scale(1)'}],{duration:320,easing:'ease-out'});
  else image.onload = () => animateElement(image,[{opacity:0},{opacity:1}],{duration:260,easing:'ease-out'});
}
document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => { currentImage=Number(button.dataset.gallery); lastGalleryTrigger=button; renderPhoto(); lightbox.showModal(); document.body.style.overflow='hidden'; }));
function closeLightbox(){ lightbox.close(); }
lightbox.addEventListener('close', () => { document.body.style.overflow=''; if(lastGalleryTrigger)lastGalleryTrigger.focus({preventScroll:true}); });
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if(e.target===lightbox){const rect=lightbox.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeLightbox();} });
function changePhoto(direction) { currentImage=(currentImage+direction+gallery.length)%gallery.length;renderPhoto(); }
document.querySelector('.lightbox-prev').addEventListener('click', () => changePhoto(-1));
document.querySelector('.lightbox-next').addEventListener('click', () => changePhoto(1));
lightbox.addEventListener('keydown', e => { if(e.key==='ArrowLeft'){e.preventDefault();changePhoto(-1);}if(e.key==='ArrowRight'){e.preventDefault();changePhoto(1);} });
document.querySelector('#year').textContent = String(new Date().getFullYear());

// One photograph, one gentle exposure: no looping flash or blocking intro.
const captureButton = document.querySelector('#capture-moment');
const momentResult = document.querySelector('#moment-result');
const momentClose = document.querySelector('.moment-close');
const captureStatus = document.querySelector('#capture-status');
let lastCapture = -Infinity;
captureButton.addEventListener('click', () => {
  const now = performance.now();
  if (now - lastCapture < 1500) return;
  lastCapture = now;
  momentResult.hidden = false;
  scene.classList.add('moment-open');
  document.querySelector('.cinema-content').inert = true;
  captureStatus.textContent = 'Hatıra kartın hazır. Böyle bir anı planlamak için WhatsApp bağlantısını kullanabilirsin.';
  momentClose.focus({preventScroll:true});
});
function closeMoment() {
  momentResult.hidden = true;
  scene.classList.remove('moment-open');
  document.querySelector('.cinema-content').inert = false;
  captureStatus.textContent = '';
  captureButton.focus({preventScroll:true});
}
momentClose.addEventListener('click', closeMoment);
momentResult.addEventListener('keydown', event => { if(event.key === 'Escape') {event.preventDefault(); closeMoment();} });

// Pointer effects use short-lived frames, and never take over scrolling.
const cursor = document.querySelector('.cursor-aura');
let cursorX = 0, cursorY = 0, targetX = 0, targetY = 0, cursorFrame = 0;
function trackCursor() {
  if (!motionAllowed() || !finePointer.matches || document.hidden || innerWidth <= 900) { cursorFrame=0; cursor.style.opacity='0'; return; }
  cursorX += (targetX - cursorX) * .24;
  cursorY += (targetY - cursorY) * .24;
  cursor.style.transform = `translate(${cursorX}px,${cursorY}px) translate(-50%,-50%)`;
  if(Math.abs(targetX-cursorX)+Math.abs(targetY-cursorY)>.3) cursorFrame=requestAnimationFrame(trackCursor);
  else cursorFrame=0;
}
document.addEventListener('pointermove', event => {
  if (!motionAllowed() || !finePointer.matches || innerWidth <= 900) return;
  targetX=event.clientX;targetY=event.clientY;
  cursor.style.opacity = lightbox.open ? '0':'1';
  cursor.classList.toggle('is-gallery',!!event.target.closest('.gallery-card'));
  cursor.classList.toggle('is-action',!!event.target.closest('a,button,summary'));
  if(!cursorFrame)cursorFrame=requestAnimationFrame(trackCursor);
},{passive:true});
document.addEventListener('pointerleave',()=>{cursor.style.opacity='0';});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(cursorFrame);cursorFrame=0;cursor.style.opacity='0';}
});
let heroRect;
heroVisual.addEventListener('pointerenter',()=>{heroRect=heroVisual.getBoundingClientRect();});
heroVisual.addEventListener('pointermove',event=>{
  if(!motionAllowed()||!finePointer.matches||!heroRect)return;
  const x=(event.clientX-heroRect.left)/heroRect.width-.5;
  const y=(event.clientY-heroRect.top)/heroRect.height-.5;
  heroCarWrap.style.translate=`${x*20}px ${y*14}px`;
  heroBackword.style.translate=`${x*-12}px ${y*-8}px`;
  heroVisual.style.setProperty('--light-x',`${50+x*30}%`);
  heroVisual.style.setProperty('--light-y',`${45+y*25}%`);
},{passive:true});
heroVisual.addEventListener('pointerleave',()=>{heroCarWrap.style.translate='';heroBackword.style.translate='';});
document.querySelectorAll('.button,.contact-disc').forEach(element=>{
  let rect;
  element.addEventListener('pointerenter',()=>{rect=element.getBoundingClientRect();});
  element.addEventListener('pointermove',event=>{
    if(!motionAllowed()||!finePointer.matches||!rect)return;
    element.style.setProperty('--magnet-x',`${(event.clientX-rect.left-rect.width/2)*.09}px`);
    element.style.setProperty('--magnet-y',`${(event.clientY-rect.top-rect.height/2)*.14}px`);
  },{passive:true});
  element.addEventListener('pointerleave',()=>{element.style.removeProperty('--magnet-x');element.style.removeProperty('--magnet-y');});
});
