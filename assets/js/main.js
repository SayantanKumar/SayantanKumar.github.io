/* ===================================================================
   main.js — Site initialization: tabs, nav highlight, smooth scroll,
   fade-up animations, news scroll fade indicator.
   =================================================================== */

(function () {
  'use strict';

  // ── Tab switching (Publications section) ─────────────────────────
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ── Active sidebar nav link on scroll ────────────────────────────
  function initNavHighlight() {
    const sections = document.querySelectorAll('.content-section[id]');
    const links    = document.querySelectorAll('.sidebar-link');
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }

  // ── Smooth scroll for anchor links ───────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ── Scroll-triggered fade-up animations ──────────────────────────
  function initFadeUps() {
    const els = document.querySelectorAll('.fade-up, .stagger-children');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  // ── News panel scroll fade indicator ─────────────────────────────
  function initNewsFade() {
    const scroll = document.getElementById('news-scroll');
    const wrap   = scroll ? scroll.parentElement : null;
    const fade   = wrap ? wrap.querySelector('.news-fade') : null;
    const downBtn = wrap ? wrap.querySelector('.news-scroll-down') : null;
    if (!scroll || !fade) return;

    function update() {
      const atBottom = scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 10;
      fade.style.opacity = atBottom ? '0' : '1';
      if (downBtn) downBtn.classList.toggle('hidden', atBottom);
    }

    if (downBtn) {
      downBtn.addEventListener('click', () => {
        scroll.scrollBy({
          top: Math.round(scroll.clientHeight * 0.78),
          behavior: 'smooth',
        });
      });
    }

    scroll.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ── Keep the desktop sidebar fitted to the viewport height ───────
  function initSidebarFit() {
    const sidebar = document.getElementById('sidebar');
    const inner = sidebar ? sidebar.querySelector('.sidebar-inner') : null;
    if (!sidebar || !inner) return;

    const MIN_SCALE = 0.68;
    const MAX_SCALE = 1.14;
    let frame = null;

    function setLayout(scale, gap) {
      const px = value => `${(value * scale).toFixed(2)}px`;
      const rem = value => `${(value * scale).toFixed(3)}rem`;

      sidebar.style.setProperty('--sidebar-fit-scale', scale.toFixed(3));
      sidebar.style.setProperty('--sidebar-fill-gap', `${gap.toFixed(2)}px`);
      sidebar.style.setProperty('--sidebar-block-padding', px(20));
      sidebar.style.setProperty('--sidebar-section-padding', px(14));
      sidebar.style.setProperty('--sidebar-portrait-size', px(124));
      sidebar.style.setProperty('--sidebar-portrait-gap', px(12));
      sidebar.style.setProperty('--sidebar-name-size', rem(1.08));
      sidebar.style.setProperty('--sidebar-title-size', rem(0.76));
      sidebar.style.setProperty('--sidebar-email-size', rem(0.68));
      sidebar.style.setProperty('--sidebar-email-gap', px(5));
      sidebar.style.setProperty('--sidebar-label-size', rem(0.6));
      sidebar.style.setProperty('--sidebar-label-gap', px(6));
      sidebar.style.setProperty('--sidebar-nav-link-y', px(4));
      sidebar.style.setProperty('--sidebar-nav-size', rem(0.78));
      sidebar.style.setProperty('--sidebar-chips-label-gap', px(7));
      sidebar.style.setProperty('--sidebar-chip-gap', px(5));
      sidebar.style.setProperty('--sidebar-chip-size', rem(0.66));
      sidebar.style.setProperty('--sidebar-chip-y', px(2));
      sidebar.style.setProperty('--sidebar-chip-x', px(7));
      sidebar.style.setProperty('--sidebar-social-gap', px(6));
      sidebar.style.setProperty('--sidebar-social-size', px(34));
      sidebar.style.setProperty('--sidebar-social-font', rem(1));
    }

    function measureStackHeight() {
      const style = window.getComputedStyle(inner);
      const padding =
        parseFloat(style.paddingTop || 0) +
        parseFloat(style.paddingBottom || 0);

      return Array.from(inner.children).reduce((height, child) => {
        return height + child.getBoundingClientRect().height;
      }, padding);
    }

    function fit() {
      frame = null;

      if (window.innerWidth <= 900 || sidebar.offsetParent === null) {
        sidebar.style.removeProperty('--sidebar-fit-scale');
        sidebar.style.removeProperty('--sidebar-fill-gap');
        return;
      }

      const available = sidebar.clientHeight;
      const gapCount = Math.max(0, inner.children.length - 1);
      if (!available || !gapCount) return;

      setLayout(1, 0);
      const baseHeight = measureStackHeight();
      if (!baseHeight) return;

      let scale = Math.min(MAX_SCALE, available / baseHeight);
      scale = Math.max(MIN_SCALE, scale);

      setLayout(scale, 0);
      let fittedHeight = measureStackHeight();

      if (fittedHeight > available && scale > MIN_SCALE) {
        scale = Math.max(MIN_SCALE, scale * (available / fittedHeight));
        setLayout(scale, 0);
        fittedHeight = measureStackHeight();
      }

      const fillGap = Math.max(0, (available - fittedHeight) / gapCount);
      setLayout(scale, fillGap);
    }

    function requestFit() {
      if (frame) return;
      frame = window.requestAnimationFrame(fit);
    }

    window.addEventListener('resize', requestFit, { passive: true });
    if ('ResizeObserver' in window) {
      new ResizeObserver(requestFit).observe(sidebar);
    }
    requestFit();
    window.addEventListener('load', requestFit, { once: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(requestFit);
    }
  }

  // ── Remove preload class ─────────────────────────────────────────
  function removePreload() {
    window.addEventListener('load', () => {
      document.body.classList.remove('is-preload');
    });
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    initTabs();
    initNavHighlight();
    initSmoothScroll();
    initFadeUps();
    initNewsFade();
    initSidebarFit();
    removePreload();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
