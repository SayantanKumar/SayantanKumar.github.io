/* ===================================================================
   timeline.js — Horizontal alternating work-experience timeline.
   Dynamically fits all entries without horizontal scroll.
   Scroll-triggered entrance: axis draws L→R, nodes pop, cards stagger.
   =================================================================== */

(function () {
  'use strict';

  const inner = document.getElementById('timeline-inner');
  if (!inner || typeof TIMELINE === 'undefined') return;

  // ── Layout constants ──────────────────────────────────────────────
  const PAD_L       = 40;   // left start margin
  const PAD_R       = 80;   // right margin (stick figure space)
  const CONNECTOR   = 32;   // connector line length

  let ENTRY_W = 145;
  let GAP     = 40;
  let CARD_H  = 145;

  // ── Compute dimensions from container width ───────────────────────
  function computeDimensions() {
    const wrap       = inner.parentElement;
    const containerW = wrap ? wrap.clientWidth : 960;
    const n          = TIMELINE.length;
    const available  = Math.max(0, containerW - PAD_L - PAD_R);

    // Allocate ~72% to card widths, rest to gaps
    const rawW = Math.floor(available * 0.72 / n);
    ENTRY_W    = Math.max(110, Math.min(160, rawW));
    const remaining = available - n * ENTRY_W;
    GAP        = n > 1 ? Math.max(10, Math.floor(remaining / (n - 1))) : 20;
    // Account for wrapped company + role + location text on narrow screens.
    CARD_H     = Math.min(245, Math.max(220, ENTRY_W + 90));

    // Expose as CSS custom property for card width
    document.documentElement.style.setProperty('--tl-entry-w', ENTRY_W + 'px');
    document.documentElement.style.setProperty('--tl-card-h', CARD_H + 'px');
  }

  // ── Compute total width needed ────────────────────────────────────
  function totalWidth() {
    return PAD_L + TIMELINE.length * (ENTRY_W + GAP) - GAP + PAD_R;
  }

  // ── Build timeline DOM ────────────────────────────────────────────
  function buildTimeline() {
    computeDimensions();
    const wrap    = inner.parentElement;
    const tlWidth = totalWidth();
    const tlHeight = CARD_H * 2 + CONNECTOR * 2 + 60;
    const scale   = wrap ? Math.min(1, wrap.clientWidth / tlWidth) : 1;

    inner.style.minWidth = tlWidth + 'px';
    inner.style.height   = tlHeight + 'px';
    inner.style.transform = scale < 1 ? `scale(${scale})` : '';
    inner.style.transformOrigin = 'top left';

    if (wrap) {
      const verticalPadding = 160; // timeline-inner top + bottom padding
      wrap.style.height = scale < 1
        ? Math.ceil((tlHeight + verticalPadding) * scale + 16) + 'px'
        : '';
    }

    // Axis
    const axis     = document.getElementById('timeline-axis');
    const axisGlow = document.getElementById('timeline-axis-glow');
    if (axis) {
      axis.style.left  = PAD_L + 'px';
      axis.style.right = PAD_R + 'px';
      axis.style.top   = '50%';
    }
    if (axisGlow) {
      axisGlow.style.left  = PAD_L + 'px';
      axisGlow.style.right = PAD_R + 'px';
      axisGlow.style.top   = '50%';
    }

    // Entries
    TIMELINE.forEach((entry, i) => {
      const above = i % 2 === 0;
      const x     = PAD_L + i * (ENTRY_W + GAP) + ENTRY_W / 2;

      const div = document.createElement('div');
      div.className = `timeline-entry ${above ? 'above' : 'below'}`;
      div.style.left  = (x - ENTRY_W / 2) + 'px';
      div.style.width = ENTRY_W + 'px';

      const cardHTML = `
        <div class="timeline-card" data-timeline-id="${entry.id}">
          <img class="timeline-logo" src="${entry.logo}" alt="${entry.full_name}"
               onerror="this.style.display='none'" loading="lazy" />
          <div class="timeline-card-label">${entry.label}</div>
          <div class="timeline-card-role">${entry.role}</div>
          <div class="timeline-card-location">${entry.location}</div>
          <div class="timeline-card-period">${entry.period}</div>
        </div>
      `;

      if (above) {
        div.style.top = '0';
        div.innerHTML = `
          ${cardHTML}
          <div class="timeline-connector"></div>
          <div class="timeline-node" data-timeline-id="${entry.id}" title="${entry.full_name}"></div>
        `;
      } else {
        div.style.bottom = '0';
        div.innerHTML = `
          <div class="timeline-node" data-timeline-id="${entry.id}" title="${entry.full_name}"></div>
          <div class="timeline-connector"></div>
          ${cardHTML}
        `;
      }

      div.querySelectorAll('[data-timeline-id]').forEach(el => {
        el.addEventListener('click', () => {
          if (typeof openTimelineModal === 'function') openTimelineModal(entry);
        });
      });

      inner.appendChild(div);
    });

    addStickFigure();
  }

  // ── SVG Running Stick Figure ──────────────────────────────────────
  function addStickFigure() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 40');
    svg.setAttribute('class', 'stick-runner');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
      <style>
        @keyframes run {
          0%   { transform: none; }
          25%  { transform: rotate(-8deg); }
          50%  { transform: none; }
          75%  { transform: rotate(8deg); }
          100% { transform: none; }
        }
        .runner-body { animation: run 0.6s linear infinite; transform-origin: 12px 20px; }
        @keyframes leg-l {
          0%,100% { transform: rotate(30deg);  transform-origin: 12px 24px; }
          50%      { transform: rotate(-30deg); transform-origin: 12px 24px; }
        }
        @keyframes leg-r {
          0%,100% { transform: rotate(-30deg); transform-origin: 12px 24px; }
          50%      { transform: rotate(30deg);  transform-origin: 12px 24px; }
        }
        @keyframes arm-l {
          0%,100% { transform: rotate(-30deg); transform-origin: 12px 18px; }
          50%      { transform: rotate(30deg);  transform-origin: 12px 18px; }
        }
        @keyframes arm-r {
          0%,100% { transform: rotate(30deg);  transform-origin: 12px 18px; }
          50%      { transform: rotate(-30deg); transform-origin: 12px 18px; }
        }
        .leg-l { animation: leg-l 0.6s linear infinite; }
        .leg-r { animation: leg-r 0.6s linear infinite; }
        .arm-l { animation: arm-l 0.6s linear infinite; }
        .arm-r { animation: arm-r 0.6s linear infinite; }
      </style>
      <g class="runner-body" stroke="rgba(148,163,184,0.7)" stroke-width="1.5" stroke-linecap="round" fill="none">
        <circle cx="12" cy="5" r="3" fill="rgba(148,163,184,0.5)" stroke="none"/>
        <line x1="12" y1="8" x2="12" y2="22"/>
        <line class="arm-l" x1="12" y1="13" x2="6" y2="18"/>
        <line class="arm-r" x1="12" y1="13" x2="18" y2="18"/>
        <line class="leg-l" x1="12" y1="22" x2="6" y2="32"/>
        <line class="leg-r" x1="12" y1="22" x2="18" y2="32"/>
      </g>
    `;
    inner.appendChild(svg);
  }

  // ── Scroll-triggered entrance animation ──────────────────────────
  function initAnimation() {
    const section = document.getElementById('work-experience');
    if (!section) return;

    const axis     = document.getElementById('timeline-axis');
    const axisGlow = document.getElementById('timeline-axis-glow');
    const entries  = inner.querySelectorAll('.timeline-entry');

    if (axis) {
      axis.style.transform      = 'translateY(-50%) scaleX(0)';
      axis.style.transformOrigin = 'left center';
    }
    if (axisGlow) {
      axisGlow.style.transform      = 'translateY(-50%) scaleX(0)';
      axisGlow.style.transformOrigin = 'left center';
    }

    let animated = false;

    const observer = new IntersectionObserver((entries_obs) => {
      entries_obs.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          runEntrance();
        }
      });
    }, { threshold: 0.15 });

    observer.observe(section);

    function runEntrance() {
      if (axis) {
        axis.style.transition = 'transform 0.9s cubic-bezier(0.4,0,0.2,1)';
        axis.style.transform  = 'translateY(-50%) scaleX(1)';
      }
      if (axisGlow) {
        axisGlow.style.transition = 'transform 0.9s cubic-bezier(0.4,0,0.2,1)';
        axisGlow.style.transform  = 'translateY(-50%) scaleX(1)';
      }
      entries.forEach((el, i) => {
        setTimeout(() => { el.classList.add('visible'); }, 900 + i * 120);
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    buildTimeline();
    initAnimation();

    // Recompute on window resize
    window.addEventListener('resize', () => {
      clearTimeout(window._tlResizeTimer);
      window._tlResizeTimer = setTimeout(() => {
        inner.querySelectorAll('.timeline-entry, .stick-runner').forEach(el => el.remove());
        buildTimeline();
      }, 220);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
