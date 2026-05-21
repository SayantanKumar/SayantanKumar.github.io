/* ===================================================================
   modals.js — Unified modal system.
   Used for publications, timeline entries, and project cards.
   =================================================================== */

(function () {
  'use strict';

  const overlay  = document.getElementById('modal-overlay');
  const box      = document.getElementById('modal-box');
  const content  = document.getElementById('modal-content');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!overlay) return;

  // ── Open / Close ──────────────────────────────────────────────────
  function openModal(html) {
    content.innerHTML = html;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Trap focus on close button
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    content.innerHTML = '';
  }

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  // ── Helper: build area tags HTML ──────────────────────────────────
  function areaTagsHTML(areas) {
    if (!areas || areas.length === 0) return '';
    return areas.map(a => {
      const key = areaToKey(a);
      return `<span class="area-tag tag-${key}">${a}</span>`;
    }).join('');
  }

  function areaToKey(area) {
    const map = {
      'Sequence Models':        'seq',
      'Healthcare':             'health',
      'Causal':                 'causal',
      'Neuro/Biomedical AI':    'neuro',
      'Representation Learning':'repr',
    };
    return map[area] || 'repr';
  }

  function venueBadgeHTML(badge, venue) {
    return `<span class="venue-badge badge-${badge.toLowerCase()}">${venue}</span>`;
  }

  function linksHTML(links) {
    if (!links || links.length === 0) return '';
    return links.map(l =>
      `<a href="${l.url}" target="_blank" rel="noopener" class="link-btn">${l.label}</a>`
    ).join('');
  }

  // ── Publication modal ─────────────────────────────────────────────
  window.openPubModal = function (pub) {
    const html = `
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
    openModal(html);
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
    openModal(html);
  };

  // ── Project modal ────────────────────────────────────────────────
  window.openProjectModal = function (proj) {
    const html = `
      <img class="modal-image" src="${proj.image}" alt="${proj.title}" loading="lazy" />
      <div class="modal-title">${proj.title}</div>
      <div class="modal-links" style="margin-bottom:14px;">${linksHTML(proj.links)}</div>
      <div class="modal-abstract-label">Description</div>
      <div class="modal-abstract">${proj.description}</div>
    `;
    openModal(html);
  };

  // ── Expand Overlay (View All) ─────────────────────────────────────
  const expandOverlay = document.getElementById('expand-overlay');
  const expandGrid    = document.getElementById('expand-grid');
  const expandTitle   = document.getElementById('expand-title');
  const expandClose   = document.getElementById('expand-close-btn');

  function closeExpand() {
    expandOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (expandClose) expandClose.addEventListener('click', closeExpand);
  if (expandOverlay) {
    expandOverlay.addEventListener('click', (e) => {
      if (e.target === expandOverlay) closeExpand();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && expandOverlay && expandOverlay.classList.contains('open')) closeExpand();
  });

  window.openExpandOverlay = function (items, title, type) {
    expandTitle.textContent = title;
    expandGrid.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'expand-card';

      let tagsHTML = '';
      if (type === 'pub' && item.areas) {
        tagsHTML = item.areas.map(a => {
          const key = areaToKey(a);
          return `<span class="area-tag tag-${key}" style="font-size:0.62rem;">${a}</span>`;
        }).join('');
      }

      const venueText = item.venue || '';
      card.innerHTML = `
        <div class="expand-card-top">
          <img class="expand-card-thumb" src="${item.image}" alt="${item.title}" loading="lazy" />
          <div class="expand-card-info">
            <div class="expand-card-title">${item.title}</div>
            <div class="expand-card-tags">${tagsHTML}</div>
            ${venueText ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-top:3px;">${venueText}</div>` : ''}
          </div>
        </div>
        <div class="expand-abstract">
          ${type === 'pub' ? item.abstract : item.description}
        </div>
      `;

      // Toggle inline abstract on click
      card.addEventListener('click', () => {
        card.classList.toggle('open');
      });

      expandGrid.appendChild(card);
    });

    expandOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

})();
