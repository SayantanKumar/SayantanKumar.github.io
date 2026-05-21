/* ===================================================================
   modals.js — Unified modal system.
   Used for publications, timeline entries, and project cards.
   Supports nested behavior: modal opened from expand overlay keeps
   expand overlay open when modal is closed.
   =================================================================== */

(function () {
  'use strict';

  const overlay   = document.getElementById('modal-overlay');
  const box       = document.getElementById('modal-box');
  const content   = document.getElementById('modal-content');
  const closeBtn  = document.getElementById('modal-close-btn');
  const navPrev   = document.getElementById('modal-nav-prev');
  const navNext   = document.getElementById('modal-nav-next');

  if (!overlay) return;

  // Track context when modal is opened from expand overlay
  let expandContext = null; // { items, currentIdx, type }

  // ── Build modal HTML helpers ──────────────────────────────────────
  function areaTagsHTML(areas) {
    if (!areas || areas.length === 0) return '';
    return areas.map(a => {
      const key = areaToKey(a);
      return `<span class="area-tag tag-${key}">${a}</span>`;
    }).join('');
  }

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

  function venueBadgeHTML(badge, venue) {
    if (Array.isArray(badge)) {
      return badge.map((b, i) =>
        `<span class="venue-badge badge-${b.toLowerCase().replace(/[^a-z0-9]/g, '')}">${i === 0 ? venue : b}</span>`
      ).join('');
    }
    return `<span class="venue-badge badge-${badge.toLowerCase().replace(/[^a-z0-9]/g, '')}">${venue}</span>`;
  }

  function linksHTML(links) {
    if (!links || links.length === 0) return '';
    return links.map(l =>
      `<a href="${l.url}" target="_blank" rel="noopener" class="link-btn">${l.label}</a>`
    ).join('');
  }

  function buildPubModalHTML(pub) {
    return `
      <img class="modal-image" src="${pub.image}" alt="${pub.title}" loading="lazy" />
      <div class="modal-meta">
        ${venueBadgeHTML(pub.venue_badge, pub.venue)}
        ${areaTagsHTML(pub.areas)}
      </div>
      <div class="modal-title">${pub.title}</div>
      <div class="modal-authors">${pub.authors}</div>
      <div class="modal-links">${linksHTML(pub.links)}</div>
      <div class="modal-abstract-label">Abstract</div>
      <div class="modal-abstract">${pub.abstract.replace(/\n/g, '<br>')}</div>
    `;
  }

  function buildProjModalHTML(proj) {
    return `
      <img class="modal-image" src="${proj.image}" alt="${proj.title}" loading="lazy" />
      <div class="modal-meta">${areaTagsHTML(proj.areas)}</div>
      <div class="modal-title">${proj.title}</div>
      <div class="modal-links" style="margin-bottom:14px;">${linksHTML(proj.links)}</div>
      <div class="modal-abstract-label">Description</div>
      <div class="modal-abstract">${proj.description}</div>
    `;
  }

  // ── Open / Close ──────────────────────────────────────────────────
  function openModal(html, navCtx) {
    content.innerHTML = html;
    expandContext = navCtx || null;

    // Show/hide nav arrows
    if (navPrev) navPrev.style.display = expandContext ? 'flex' : 'none';
    if (navNext) navNext.style.display = expandContext ? 'flex' : 'none';

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeModal() {
    overlay.classList.remove('open');
    if (navPrev) navPrev.style.display = 'none';
    if (navNext) navNext.style.display = 'none';

    // If opened from expand overlay, keep expand overlay open
    const expandOverlay = document.getElementById('expand-overlay');
    if (expandContext && expandOverlay && expandOverlay.classList.contains('open')) {
      document.body.style.overflow = 'hidden'; // keep scroll locked for expand overlay
    } else {
      document.body.style.overflow = '';
    }

    expandContext = null;
    content.innerHTML = '';
  }

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    if (e.key === 'ArrowLeft'  && overlay.classList.contains('open') && expandContext) navigateModal(-1);
    if (e.key === 'ArrowRight' && overlay.classList.contains('open') && expandContext) navigateModal(1);
  });

  // ── Navigate modal within expand context ─────────────────────────
  function navigateModal(dir) {
    if (!expandContext) return;
    const total = expandContext.items.length;
    expandContext.currentIdx = ((expandContext.currentIdx + dir) % total + total) % total;
    const item = expandContext.items[expandContext.currentIdx];
    const html = expandContext.type === 'pub' ? buildPubModalHTML(item) : buildProjModalHTML(item);
    content.innerHTML = html;
  }

  if (navPrev) navPrev.addEventListener('click', () => navigateModal(-1));
  if (navNext) navNext.addEventListener('click', () => navigateModal(1));

  // ── Publication modal ─────────────────────────────────────────────
  window.openPubModal = function (pub, navCtx) {
    openModal(buildPubModalHTML(pub), navCtx || null);
  };

  // ── Timeline / Work Experience modal ─────────────────────────────
  window.openTimelineModal = function (entry) {
    const logoEl = `<img class="modal-logo" src="${entry.logo}" alt="${entry.full_name}" loading="lazy" />`;
    const html = `
      ${logoEl}
      <div class="modal-title">${entry.full_name}</div>
      <div class="modal-role">${entry.role}</div>
      <div class="modal-period-loc">${entry.period} &nbsp;·&nbsp; ${entry.location}</div>
      <div class="modal-details">${entry.details.replace(/\n/g, '<br>').replace(/•/g, '&#8226;')}</div>
    `;
    openModal(html, null);
  };

  // ── Project modal ────────────────────────────────────────────────
  window.openProjectModal = function (proj, navCtx) {
    openModal(buildProjModalHTML(proj), navCtx || null);
  };

  // ── Expand Overlay (View All) ─────────────────────────────────────
  const expandOverlay = document.getElementById('expand-overlay');
  const expandGrid    = document.getElementById('expand-grid');
  const expandTitle   = document.getElementById('expand-title');
  const expandClose   = document.getElementById('expand-close-btn');

  function closeExpand() {
    if (expandOverlay) expandOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (expandClose) expandClose.addEventListener('click', closeExpand);
  if (expandOverlay) {
    expandOverlay.addEventListener('click', (e) => {
      if (e.target === expandOverlay) closeExpand();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && expandOverlay && expandOverlay.classList.contains('open')
        && !overlay.classList.contains('open')) {
      closeExpand();
    }
  });

  window.openExpandOverlay = function (items, title, type) {
    if (expandTitle) expandTitle.textContent = title;
    if (!expandGrid) return;
    expandGrid.innerHTML = '';

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'expand-card';

      // Tags HTML
      let tagsHTML = '';
      if (item.areas) {
        tagsHTML = item.areas.map(a => {
          const key = areaToKey(a);
          return `<span class="area-tag tag-${key}" style="font-size:0.62rem;">${a}</span>`;
        }).join('');
      }

      const venueText = item.venue || '';

      card.innerHTML = `
        <img class="expand-card-thumb" src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="expand-card-body">
          <div class="expand-card-title">${item.title}</div>
          ${venueText ? `<div class="expand-card-venue">${venueText}</div>` : ''}
          <div class="expand-card-tags">${tagsHTML}</div>
        </div>
      `;

      // Click → open full modal with navigation context
      card.addEventListener('click', () => {
        const navCtx = { items, currentIdx: idx, type };
        if (type === 'pub' && typeof openPubModal === 'function') {
          openPubModal(item, navCtx);
        } else if (type === 'proj' && typeof openProjectModal === 'function') {
          openProjectModal(item, navCtx);
        }
      });

      expandGrid.appendChild(card);
    });

    if (expandOverlay) {
      expandOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

})();
