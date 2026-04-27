/* ===========================================================
   ELF · Evolution Law Firm — main.js
   Lenis smooth scroll · GSAP reveal · Custom cursor · Canvas BG · i18n
   =========================================================== */

(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const isCoarse = matchMedia('(pointer: coarse)').matches || matchMedia('(max-width: 1024px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============== I18N ============== */
  const SUPPORTED = ['uk', 'ru', 'en'];
  const LABEL = { uk: 'UA', ru: 'RU', en: 'EN' };

  function detectLang() {
    const stored = localStorage.getItem('elf_lang');
    if (stored && SUPPORTED.includes(stored)) return stored;
    const nav = (navigator.language || 'uk').slice(0, 2).toLowerCase();
    if (nav === 'uk') return 'uk';
    if (nav === 'ru') return 'ru';
    return 'en';
  }

  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'uk';
    const dict = window.I18N[lang] || {};
    document.documentElement.setAttribute('lang', lang);

    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = dict[key];
      if (val == null) return;
      if (el.tagName === 'META') el.setAttribute('content', val);
      else if (el.tagName === 'TITLE') el.textContent = val;
      else el.textContent = val;
    });

    const cur = $('[data-lang-current]');
    if (cur) cur.textContent = LABEL[lang];

    localStorage.setItem('elf_lang', lang);
  }

  function bindLangSwitcher() {
    const root = $('#lang');
    if (!root) return;
    const trigger = $('.lang__current', root);
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      root.classList.toggle('lang--open');
      trigger.setAttribute('aria-expanded', root.classList.contains('lang--open'));
    });
    document.addEventListener('click', () => {
      root.classList.remove('lang--open');
      trigger.setAttribute('aria-expanded', 'false');
    });
    $$('button[data-lang]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        applyLang(btn.dataset.lang);
        root.classList.remove('lang--open');
      });
    });
  }

  /* ============== PRELOADER ============== */
  function runPreloader() {
    const pre = $('#preloader');
    const bar = $('.preloader__bar span');
    if (!pre) return;
    if (bar) requestAnimationFrame(() => { bar.style.width = '100%'; });

    let hidden = false;
    const hide = () => {
      if (hidden) return;
      hidden = true;
      pre.classList.add('preloader--hidden');
      document.body.classList.add('is-ready');
      setTimeout(() => {
        try { startHeroAnimation(); } catch (e) { console.error('hero anim', e); }
      }, 80);
    };

    // Primary trigger — window 'load' (everything ready)
    if (document.readyState === 'complete') {
      setTimeout(hide, 450);
    } else {
      window.addEventListener('load', () => setTimeout(hide, 450), { once: true });
    }

    // Hard failsafe — never let the preloader linger past 3.5s
    setTimeout(hide, 3500);
  }

  /* ============== LENIS SMOOTH SCROLL ============== */
  let lenis = null;
  function initLenis() {
    if (reduced || isCoarse || typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  /* Anchor links — handled via Lenis or native */
  function bindAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -60, duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        document.body.classList.remove('nav-open');
        $('#nav')?.classList.remove('nav--open');
      });
    });
  }

  /* ============== CUSTOM CURSOR ============== */
  function initCursor() {
    if (isCoarse) return;
    const cur = $('#cursor');
    if (!cur) return;
    const dot = $('.cursor__dot', cur);
    const cir = $('.cursor__circle', cur);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx, dy = my;
    let cx = mx, cy = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function tick() {
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      cir.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    tick();

    const hoverables = 'a, button, .service, .case, .review, .member, .why__item, .faq__item summary, .contact__channel';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) cur.classList.add('cursor--hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) cur.classList.remove('cursor--hover');
    });
  }

  /* ============== MAGNETIC BUTTONS ============== */
  function initMagnetic() {
    if (isCoarse || reduced) return;
    $$('.magnetic').forEach((el) => {
      const strength = 18;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x / r.width * strength}px, ${y / r.height * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ============== STICKY NAV ============== */
  function initStickyNav() {
    const nav = $('#nav');
    if (!nav) return;
    const update = () => {
      const y = window.scrollY;
      nav.classList.toggle('nav--scrolled', y > 40);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });

    const burger = $('#burger');
    burger?.addEventListener('click', () => {
      const open = nav.classList.toggle('nav--open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ============== HERO CANVAS — NETWORK ============== */
  function initHeroCanvas() {
    const canvas = $('#heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0;
    let particles = [];
    const COUNT = isCoarse ? 50 : 110;
    const LINK = isCoarse ? 110 : 150;
    let mouse = { x: -9999, y: -9999, on: false };

    function resize() {
      w = canvas.clientWidth = canvas.offsetWidth;
      h = canvas.clientHeight = canvas.offsetHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticles() {
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.4 + 0.4,
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.on) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12000) {
            const f = (12000 - d2) / 12000 * 0.05;
            p.x += dx * f;
            p.y += dy * f;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 226, 166, 0.55)';
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.28;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(212, 164, 55, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(step);
    }

    resize();
    makeParticles();
    step();

    window.addEventListener('resize', () => { resize(); makeParticles(); });
    if (!isCoarse) {
      window.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        mouse.on = mouse.y < r.height && mouse.y > 0;
      });
    }
  }

  /* ============== HERO REVEAL ============== */
  function startHeroAnimation() {
    if (!window.gsap) return;
    const gsap = window.gsap;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.8 })
      .from('.hero__title .reveal > *', { yPercent: 100, opacity: 0, stagger: 0.12, duration: 1.1 }, '-=0.4')
      .from('.hero__slogan', { y: 24, opacity: 0, duration: 0.9 }, '-=0.6')
      .from('.hero__lead', { y: 24, opacity: 0, duration: 0.9 }, '-=0.6')
      .from('.hero__actions .btn', { y: 24, opacity: 0, stagger: 0.1, duration: 0.7 }, '-=0.5')
      .from('.hero__meta-item', { y: 24, opacity: 0, stagger: 0.12, duration: 0.7, onComplete: runCounters }, '-=0.4')
      .from('.hero__scroll', { opacity: 0, duration: 0.8 }, '-=0.3');
  }

  /* ============== COUNTERS ============== */
  function runCounters() {
    $$('[data-counter]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-counter'));
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(target * eased);
        el.textContent = val.toLocaleString('uk-UA') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ============== SCROLL REVEAL (GSAP ScrollTrigger) ============== */
  function initScrollReveal() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const fadeUp = (els, opts = {}) => {
      gsap.from(els, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: opts.trigger || els[0]?.parentElement, start: 'top 82%' },
        ...opts,
      });
    };

    /* Section heads */
    $$('.section__head').forEach((head) => {
      const els = $$('.section__kicker, .section__title > *', head);
      if (!els.length) return;
      gsap.from(els, {
        opacity: 0,
        y: 36,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: head, start: 'top 82%' },
      });
    });

    /* About */
    gsap.from('.about__text, .about__bullets li', {
      opacity: 0,
      y: 30,
      duration: 0.9,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about__content', start: 'top 75%' },
    });
    gsap.from('.about__media', {
      opacity: 0,
      scale: 0.9,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about', start: 'top 75%' },
    });

    /* Services — staggered grid reveal */
    fadeUp($$('.service'), {
      trigger: '.services__grid',
      stagger: { each: 0.06, from: 'start' },
      duration: 0.9,
    });

    /* Why */
    fadeUp($$('.why__item'), { trigger: '.why__grid', stagger: 0.1 });

    /* Process */
    fadeUp($$('.process__step'), { trigger: '.process__list', stagger: 0.12 });

    /* Team */
    fadeUp($$('.member'), { trigger: '.team__grid', stagger: 0.1 });

    /* Cases */
    fadeUp($$('.case'), { trigger: '.cases__grid', stagger: 0.12 });

    /* Reviews */
    fadeUp($$('.review'), { trigger: '.reviews__grid', stagger: 0.12 });

    /* FAQ */
    fadeUp($$('.faq__item'), { trigger: '.faq__list', stagger: 0.06, duration: 0.7, y: 20 });

    /* Contacts */
    fadeUp($$('.contact__channel'), { trigger: '.contact__grid', stagger: 0.08 });
    gsap.from('.contact__form', {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.contact__form', start: 'top 80%' },
    });

    /* Footer */
    gsap.from('.footer__brand, .footer__col', {
      opacity: 0,
      y: 24,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.footer', start: 'top 90%' },
    });

    /* Section title — sequential reveal of italic line */
    $$('.section__title').forEach((t) => {
      const em = $('em', t);
      if (!em) return;
      gsap.from(em, {
        opacity: 0,
        y: 30,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: t, start: 'top 82%' },
        delay: 0.15,
      });
    });
  }

  /* ============== FORM ============== */
  function initForm() {
    const form = $('#contactForm');
    const toast = $('#toast');
    if (!form || !toast) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const lang = localStorage.getItem('elf_lang') || 'uk';
      const msg = (window.I18N[lang] && window.I18N[lang]['contact.form.success']) || 'Thank you!';
      toast.textContent = msg;
      toast.classList.add('toast--visible');
      setTimeout(() => toast.classList.remove('toast--visible'), 3500);
      form.reset();
    });
  }

  /* ============== INIT ============== */
  function safe(name, fn) {
    try { fn(); } catch (e) { console.error('[ELF]', name, e); }
  }

  function start() {
    // Run preloader FIRST so the failsafe is armed even if init errors out.
    safe('preloader',     runPreloader);
    safe('i18n',          () => applyLang(detectLang()));
    safe('langSwitcher',  bindLangSwitcher);
    safe('anchors',       bindAnchors);
    safe('stickyNav',     initStickyNav);
    safe('lenis',         initLenis);
    safe('cursor',        initCursor);
    safe('magnetic',      initMagnetic);
    safe('heroCanvas',    initHeroCanvas);
    safe('scrollReveal',  initScrollReveal);
    safe('form',          initForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
