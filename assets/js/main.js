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
    if (!scroll || !fade) return;

    function update() {
      const atBottom = scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 10;
      fade.style.opacity = atBottom ? '0' : '1';
    }
    scroll.addEventListener('scroll', update, { passive: true });
    update();
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
    removePreload();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
