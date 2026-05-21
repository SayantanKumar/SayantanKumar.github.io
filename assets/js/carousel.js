/* ===================================================================
   carousel.js — Custom coverflow carousels for publications & projects.
   Data-pos attribute states drive CSS transforms (no Swiper).
   Auto-advance 7000ms, hover-pause, keyboard navigation.
   Abstract opens in dedicated panel below carousel, not inside card.
   =================================================================== */

(function () {
  'use strict';

  // ── Helpers ───────────────────────────────────────────────────────
  function areaToKey(area) {
    const map = {
      'Deep Sequence Modeling':              'seq',
      'Healthcare AI':                       'health',
      'Causal Inference / Survival Analysis':'causal',
      'Neuro / Biomedical AI':               'neuro',
      'Representation Learning':             'repr',
      'Multimodal Machine Learning':         'multi',
      'Agentic':                             'agentic',
      'Robotics':                            'robotics',
      'NLP':                                 'nlp',
      'Machine Learning':                    'ml',
      'Neuroengineering':                    'neuro',
      'Computational Imaging':               'imaging',
      'Computational Biology':               'bio',
      'Drug Discovery':                      'drug',
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

  function isCodeData(label) {
    const l = label.toLowerCase();
    return l.includes('code') || l.includes('data') || l.includes('patent');
  }

  function buildLinks(links) {
    const paperLinks = (links || []).filter(l => !isCodeData(l.label));
    const codeLinks  = (links || []).filter(l => isCodeData(l.label));
    return [...paperLinks, ...codeLinks].map(l =>
      `<a href="${l.url}" target="_blank" rel="noopener" class="btn btn-sm" onclick="event.stopPropagation();">${l.label}</a>`
    ).join('');
  }

  function hexToRgba(hex, alpha) {
    if (!hex || hex.length < 7) return `rgba(59,130,246,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── Abstract panel (shared for pub carousel) ──────────────────────
  const abstractPanel = document.getElementById('pub-abstract-panel');
  const papTitle      = document.getElementById('pap-title');
  const papText       = document.getElementById('pap-text');
  const papClose      = document.getElementById('pap-close');

  function openAbstractPanel(item) {
    if (!abstractPanel) return;
    if (papTitle) papTitle.textContent = item.title;
    if (papText)  papText.innerHTML = item.abstract.replace(/\n/g, '<br>');
    abstractPanel.classList.add('open');
  }

  function closeAbstractPanel() {
    if (!abstractPanel) return;
    abstractPanel.classList.remove('open');
  }

  if (papClose) papClose.addEventListener('click', closeAbstractPanel);

  // ── Coverflow factory ─────────────────────────────────────────────
  function createCoverflow(opts) {
    const list    = document.getElementById(opts.listId);
    const prevBtn = document.getElementById(opts.prevId);
    const nextBtn = document.getElementById(opts.nextId);
    const dotsWrap= document.getElementById(opts.dotsId);
    if (!list) return null;

    let items     = opts.items.slice();
    let activeIdx = 0;
    let autoTimer = null;
    let isHovered = false;

    function getPos(i) {
      const total = items.length;
      const diff  = ((i - activeIdx) % total + total) % total;
      if (diff === 0)          return 'active';
      if (diff === 1)          return 'next';
      if (diff === total - 1)  return 'prev';
      if (diff === 2)          return 'next-2';
      if (diff === total - 2)  return 'prev-2';
      return 'hidden';
    }

    function updatePositions() {
      list.querySelectorAll('.cf-item').forEach((li, i) => {
        li.setAttribute('data-pos', getPos(i));
      });

      if (dotsWrap) {
        dotsWrap.querySelectorAll('.cf-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === activeIdx);
        });
      }

      if (opts.type === 'pub' && typeof VENUE_BADGES !== 'undefined') {
        const pub   = items[activeIdx];
        const color = (VENUE_BADGES[pub.venue_badge] || {}).color || '#3b82f6';
        document.documentElement.style.setProperty('--cf-glow', hexToRgba(color, 0.14));
      }
    }

    function navigate(dir) {
      activeIdx = ((activeIdx + dir) % items.length + items.length) % items.length;
      closeAbstractPanel();
      updatePositions();
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => {
        if (!isHovered) navigate(1);
      }, 7000);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    // ── Build card HTML ───────────────────────────────────────────
    function buildPubCard(item) {
      return `
        <div class="cf-card" data-id="${item.id}">
          <div class="cf-card-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
          </div>
          <div class="cf-card-body">
            <div class="cf-card-badges">
              <div class="cf-badges-venue">
                <span class="venue-badge ${badgeClass(item.venue_badge)}">${item.venue_badge}</span>
              </div>
              <div class="cf-badges-areas">
                ${buildAreaTags(item.areas)}
              </div>
            </div>
            <div class="cf-card-title">${item.title}</div>
            <div class="cf-card-authors">${item.authors}</div>
            <div class="cf-card-links">
              <button class="btn btn-sm abs-btn" type="button" onclick="event.stopPropagation();">Abstract</button>
              ${buildLinks(item.links)}
            </div>
          </div>
        </div>
      `;
    }

    function buildProjCard(item) {
      return `
        <div class="cf-card" data-id="${item.id}">
          <div class="cf-card-image project-card-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
          </div>
          <div class="cf-card-body">
            <div class="cf-card-badges">
              <div class="cf-badges-areas">
                ${buildAreaTags(item.areas)}
              </div>
            </div>
            <div class="cf-card-title">${item.title}</div>
            <div class="cf-card-links">${buildLinks(item.links)}</div>
          </div>
        </div>
      `;
    }

    // ── (Re)build DOM from items array ────────────────────────────
    function build(newItems) {
      items     = newItems.slice();
      activeIdx = Math.max(0, Math.min(activeIdx, items.length - 1));

      list.innerHTML      = '';
      if (dotsWrap) dotsWrap.innerHTML = '';

      items.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'cf-item';
        li.innerHTML = opts.type === 'pub' ? buildPubCard(item) : buildProjCard(item);

        li.addEventListener('click', (e) => {
          const pos = li.getAttribute('data-pos');
          if (pos === 'prev' || pos === 'prev-2') {
            navigate(-1); stopAuto(); startAuto(); return;
          }
          if (pos === 'next' || pos === 'next-2') {
            navigate(1);  stopAuto(); startAuto(); return;
          }
          if (pos === 'active') {
            if (e.target.closest('.btn')) return;
            if (opts.type === 'pub'  && typeof openPubModal     === 'function') openPubModal(item);
            if (opts.type === 'proj' && typeof openProjectModal === 'function') openProjectModal(item);
          }
        });

        // Abstract button (pub only) — opens panel below carousel
        if (opts.type === 'pub') {
          const absBtn = li.querySelector('.abs-btn');
          if (absBtn) {
            absBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const isOpen = abstractPanel && abstractPanel.classList.contains('open');
              const sameItem = papTitle && papTitle.textContent === item.title;
              if (isOpen && sameItem) {
                closeAbstractPanel();
                absBtn.textContent = 'Abstract';
              } else {
                openAbstractPanel(item);
                absBtn.textContent = 'Close';
                // Reset other abs buttons
                list.querySelectorAll('.abs-btn').forEach(b => {
                  if (b !== absBtn) b.textContent = 'Abstract';
                });
              }
            });
          }
        }

        list.appendChild(li);

        if (dotsWrap) {
          const dot = document.createElement('span');
          dot.className = 'cf-dot';
          dot.addEventListener('click', () => {
            activeIdx = i;
            closeAbstractPanel();
            updatePositions();
            stopAuto(); startAuto();
          });
          dotsWrap.appendChild(dot);
        }
      });

      updatePositions();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { navigate(-1); stopAuto(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { navigate(1);  stopAuto(); startAuto(); });

    const wrap = list.closest('.carousel-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => { isHovered = true; });
      wrap.addEventListener('mouseleave', () => { isHovered = false; });
    }

    return { build, navigate, startAuto, stopAuto };
  }

  // ── Bookshelf (Research Explorer) ────────────────────────────────
  let pubCf  = null;
  let projCf = null;
  let currentFilter = 'all';

  function filteredPubs(filter) {
    if (filter === 'all') return PUBLICATIONS;
    return PUBLICATIONS.filter(p => p.areas && p.areas.includes(filter));
  }

  function initBookshelf() {
    const books = document.querySelectorAll('#research-bookshelf .book');
    books.forEach(book => {
      book.addEventListener('click', () => {
        books.forEach(b => b.classList.remove('active'));
        book.classList.add('active');
        currentFilter = book.dataset.filter;
        closeAbstractPanel();
        if (pubCf) pubCf.build(filteredPubs(currentFilter));
      });
    });
  }

  // ── Count badges ──────────────────────────────────────────────────
  function updateCounts() {
    const counts = {
      all: PUBLICATIONS.length,
      'Deep Sequence Modeling': 0,
      'Healthcare AI': 0,
      'Causal Inference / Survival Analysis': 0,
      'Neuro / Biomedical AI': 0,
      'Representation Learning': 0,
      'Multimodal Machine Learning': 0,
    };
    PUBLICATIONS.forEach(p => {
      (p.areas || []).forEach(a => { if (a in counts) counts[a]++; });
    });
    const map = {
      all:                       'count-all',
      'Deep Sequence Modeling':              'count-seq',
      'Healthcare AI':                       'count-health',
      'Causal Inference / Survival Analysis':'count-causal',
      'Neuro / Biomedical AI':               'count-neuro',
      'Representation Learning':             'count-repr',
      'Multimodal Machine Learning':         'count-multi',
    };
    Object.entries(map).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = counts[key] || 0;
    });
  }

  // ── View All ─────────────────────────────────────────────────────
  function initViewAll() {
    const pubBtn = document.getElementById('pub-view-all');
    if (pubBtn) {
      pubBtn.addEventListener('click', () => {
        const filtered = filteredPubs(currentFilter);
        const label    = currentFilter === 'all'
          ? 'Recent Research & Publications'
          : `${currentFilter} — Publications`;
        if (typeof openExpandOverlay === 'function') openExpandOverlay(filtered, label, 'pub');
      });
    }

    const projBtn = document.getElementById('proj-view-all');
    if (projBtn) {
      projBtn.addEventListener('click', () => {
        if (typeof openExpandOverlay === 'function') openExpandOverlay(PROJECTS, 'Past Research & Project Experiences', 'proj');
      });
    }
  }

  // ── Keyboard navigation ───────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { if (pubCf)  pubCf.navigate(-1);  }
    if (e.key === 'ArrowRight') { if (pubCf)  pubCf.navigate(1);   }
  });

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    if (typeof PUBLICATIONS === 'undefined' || typeof PROJECTS === 'undefined') {
      console.warn('carousel.js: data.js not loaded');
      return;
    }

    updateCounts();

    pubCf = createCoverflow({
      listId: 'pub-cf',
      prevId: 'pub-prev',
      nextId: 'pub-next',
      dotsId: 'pub-dots',
      items:  PUBLICATIONS,
      type:   'pub',
    });
    if (pubCf) { pubCf.build(PUBLICATIONS); pubCf.startAuto(); }

    projCf = createCoverflow({
      listId: 'proj-cf',
      prevId: 'proj-prev',
      nextId: 'proj-next',
      dotsId: 'proj-dots',
      items:  PROJECTS,
      type:   'proj',
    });
    if (projCf) { projCf.build(PROJECTS); projCf.startAuto(); }

    initBookshelf();
    initViewAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
