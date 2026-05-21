/* ===================================================================
   carousel.js — Publication and Project carousels.
   Research Explorer filter + Swiper.js coverflow carousels.
   =================================================================== */

(function () {
  'use strict';

  // ── Helpers ───────────────────────────────────────────────────────
  function areaToKey(area) {
    const map = {
      'Sequence Models':         'seq',
      'Healthcare':              'health',
      'Causal':                  'causal',
      'Neuro/Biomedical AI':     'neuro',
      'Representation Learning': 'repr',
    };
    return map[area] || 'repr';
  }

  function badgeClass(badge) {
    return 'badge-' + badge.toLowerCase().replace(/[^a-z]/g, '');
  }

  function buildAreaTags(areas) {
    return (areas || []).map(a =>
      `<span class="area-tag tag-${areaToKey(a)}">${a}</span>`
    ).join('');
  }

  function buildLinks(links) {
    return (links || []).map(l =>
      `<a href="${l.url}" target="_blank" rel="noopener" class="link-btn" onclick="event.stopPropagation();">${l.label}</a>`
    ).join('');
  }

  // ── Build a publication card element ─────────────────────────────
  function buildPubCard(pub) {
    const el = document.createElement('div');
    el.className = 'swiper-slide';

    el.innerHTML = `
      <div class="pub-card" data-pub-id="${pub.id}">
        <div class="pub-card-image">
          <img src="${pub.image}" alt="${pub.title}" loading="lazy" />
        </div>
        <div class="pub-card-body">
          <div class="pub-card-badges">
            <span class="venue-badge ${badgeClass(pub.venue_badge)}">${pub.venue_badge}</span>
            ${buildAreaTags(pub.areas)}
          </div>
          <div class="pub-card-title">${pub.title}</div>
          <div class="pub-card-authors">${pub.authors}</div>
          <div class="pub-card-links">${buildLinks(pub.links)}</div>
        </div>
      </div>
    `;

    el.querySelector('.pub-card').addEventListener('click', () => {
      if (typeof openPubModal === 'function') openPubModal(pub);
    });

    return el;
  }

  // ── Build a project card element ──────────────────────────────────
  function buildProjectCard(proj) {
    const el = document.createElement('div');
    el.className = 'swiper-slide';

    el.innerHTML = `
      <div class="pub-card" data-proj-id="${proj.id}">
        <div class="pub-card-image project-card-image">
          <img src="${proj.image}" alt="${proj.title}" loading="lazy" />
        </div>
        <div class="pub-card-body">
          <div class="pub-card-title">${proj.title}</div>
          <div class="pub-card-links">${buildLinks(proj.links)}</div>
        </div>
      </div>
    `;

    el.querySelector('.pub-card').addEventListener('click', () => {
      if (typeof openProjectModal === 'function') openProjectModal(proj);
    });

    return el;
  }

  // ── Populate wrapper from array ───────────────────────────────────
  function populateWrapper(wrapper, items, type) {
    wrapper.innerHTML = '';
    items.forEach(item => {
      wrapper.appendChild(type === 'pub' ? buildPubCard(item) : buildProjectCard(item));
    });
  }

  // ── Init Publication Swiper ───────────────────────────────────────
  let pubSwiper = null;
  let currentFilter = 'all';

  function filteredPubs(filter) {
    if (filter === 'all') return PUBLICATIONS;
    return PUBLICATIONS.filter(p => p.areas && p.areas.includes(filter));
  }

  function initPubSwiper(items) {
    const wrapper = document.getElementById('pub-swiper-wrapper');
    if (!wrapper) return;

    populateWrapper(wrapper, items, 'pub');

    if (pubSwiper) { pubSwiper.destroy(true, true); pubSwiper = null; }

    pubSwiper = new Swiper('#pub-swiper', {
      slidesPerView:  'auto',
      centeredSlides: true,
      spaceBetween:   20,
      grabCursor:     true,
      loop:           items.length > 3,
      navigation: {
        nextEl: '#pub-next',
        prevEl: '#pub-prev',
      },
      pagination: {
        el: '#pub-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      on: {
        init(swiper) {
          syncNavBtns(swiper, '#pub-prev', '#pub-next');
        },
        slideChange(swiper) {
          syncNavBtns(swiper, '#pub-prev', '#pub-next');
        },
      },
    });
  }

  function syncNavBtns(swiper, prevSel, nextSel) {
    const prev = document.querySelector(prevSel);
    const next = document.querySelector(nextSel);
    if (!prev || !next) return;
    prev.classList.toggle('swiper-button-disabled', swiper.isBeginning && !swiper.params.loop);
    next.classList.toggle('swiper-button-disabled', swiper.isEnd && !swiper.params.loop);
  }

  // ── Research Explorer ─────────────────────────────────────────────
  function initExplorer() {
    const items = document.querySelectorAll('#research-explorer .explorer-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentFilter = item.dataset.filter;
        const filtered = filteredPubs(currentFilter);
        initPubSwiper(filtered);
      });
    });
  }

  // ── Init Project Swiper ───────────────────────────────────────────
  let projSwiper = null;

  function initProjSwiper() {
    const wrapper = document.getElementById('proj-swiper-wrapper');
    if (!wrapper) return;

    populateWrapper(wrapper, PROJECTS, 'proj');

    if (projSwiper) { projSwiper.destroy(true, true); projSwiper = null; }

    projSwiper = new Swiper('#proj-swiper', {
      slidesPerView:  'auto',
      centeredSlides: true,
      spaceBetween:   20,
      grabCursor:     true,
      loop:           PROJECTS.length > 3,
      navigation: {
        nextEl: '#proj-next',
        prevEl: '#proj-prev',
      },
      pagination: {
        el: '#proj-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      on: {
        init(swiper) { syncNavBtns(swiper, '#proj-prev', '#proj-next'); },
        slideChange(swiper) { syncNavBtns(swiper, '#proj-prev', '#proj-next'); },
      },
    });
  }

  // ── View All buttons ──────────────────────────────────────────────
  function initViewAll() {
    const pubBtn = document.getElementById('pub-view-all');
    if (pubBtn) {
      pubBtn.addEventListener('click', () => {
        const filtered = filteredPubs(currentFilter);
        const label = currentFilter === 'all'
          ? 'All Publications'
          : `${currentFilter} — Publications`;
        if (typeof openExpandOverlay === 'function')
          openExpandOverlay(filtered, label, 'pub');
      });
    }

    const projBtn = document.getElementById('proj-view-all');
    if (projBtn) {
      projBtn.addEventListener('click', () => {
        if (typeof openExpandOverlay === 'function')
          openExpandOverlay(PROJECTS, 'All Projects', 'proj');
      });
    }
  }

  // ── Update explorer counts based on actual data ───────────────────
  function updateCounts() {
    const counts = {
      all:                     PUBLICATIONS.length,
      'Sequence Models':       0,
      'Healthcare':            0,
      'Causal':                0,
      'Neuro/Biomedical AI':   0,
      'Representation Learning': 0,
    };
    PUBLICATIONS.forEach(p => {
      (p.areas || []).forEach(a => { if (counts[a] !== undefined) counts[a]++; });
    });
    const map = {
      all:                     'count-all',
      'Sequence Models':       'count-seq',
      'Healthcare':            'count-health',
      'Causal':                'count-causal',
      'Neuro/Biomedical AI':   'count-neuro',
      'Representation Learning':'count-repr',
    };
    Object.entries(map).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = counts[key] || 0;
    });
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    if (typeof PUBLICATIONS === 'undefined' || typeof PROJECTS === 'undefined') {
      console.warn('carousel.js: data.js not loaded yet');
      return;
    }
    updateCounts();
    initPubSwiper(PUBLICATIONS);
    initExplorer();
    initProjSwiper();
    initViewAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
