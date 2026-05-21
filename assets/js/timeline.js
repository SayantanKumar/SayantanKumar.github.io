/* ===================================================================
   timeline.js — Horizontal alternating work-experience timeline.
   Scroll-triggered entrance: axis draws L→R, nodes pop, cards stagger.
   Running stick figure at far right.
   =================================================================== */

(function () {
  'use strict';

  const inner = document.getElementById('timeline-inner');
  if (!inner || typeof TIMELINE === 'undefined') return;

  // ── Layout config ─────────────────────────────────────────────────
  const ENTRY_W    = 190;  // card width — larger for visual prominence
  const GAP        = 90;   // horizontal gap between entries
  const AXIS_Y     = 50;   // % from top of inner container
  const CARD_H     = 120;  // approximate card height
  const CONNECTOR  = 35;   // connector line length

  // ── Compute total width needed ────────────────────────────────────
  function totalWidth() {
    return 80 + TIMELINE.length * (ENTRY_W + GAP) + 80;
  }

  // ── Build timeline DOM ────────────────────────────────────────────
  function buildTimeline() {
    inner.style.minWidth = totalWidth() + 'px';
    inner.style.height   = (CARD_H * 2 + CONNECTOR * 2 + 60) + 'px';

    // Axis
    const axis = document.getElementById('timeline-axis');
    const axisGlow = document.getElementById('timeline-axis-glow');
    const axisRight = 80;
    if (axis) {
      axis.style.left  = '40px';
      axis.style.right = axisRight + 'px';
      axis.style.top   = '50%';
    }
    if (axisGlow) {
      axisGlow.style.left  = '40px';
      axisGlow.style.right = axisRight + 'px';
      axisGlow.style.top   = '50%';
    }

    // Entries
    TIMELINE.forEach((entry, i) => {
      const above = i % 2 === 0; // even → above axis
      const x = 40 + i * (ENTRY_W + GAP) + ENTRY_W / 2;

      const div = document.createElement('div');
      div.className = `timeline-entry ${above ? 'above' : 'below'}`;
      div.style.left   = (x - ENTRY_W / 2) + 'px';
      div.style.width  = ENTRY_W + 'px';

      if (above) {
        div.style.top = '0';
        // card sits at top, connector + node below it
        div.innerHTML = `
          <div class="timeline-card" data-timeline-id="${entry.id}">
            <img class="timeline-logo" src="${entry.logo}" alt="${entry.full_name}"
                 onerror="this.style.display='none'" loading="lazy" />
            <div class="timeline-card-label">${entry.label}</div>
            <div class="timeline-card-period">${entry.period}</div>
          </div>
          <div class="timeline-connector"></div>
          <div class="timeline-node" data-timeline-id="${entry.id}" title="${entry.full_name}"></div>
        `;
      } else {
        div.style.bottom = '0';
        div.innerHTML = `
          <div class="timeline-node" data-timeline-id="${entry.id}" title="${entry.full_name}"></div>
          <div class="timeline-connector"></div>
          <div class="timeline-card" data-timeline-id="${entry.id}">
            <img class="timeline-logo" src="${entry.logo}" alt="${entry.full_name}"
                 onerror="this.style.display='none'" loading="lazy" />
            <div class="timeline-card-label">${entry.label}</div>
            <div class="timeline-card-period">${entry.period}</div>
          </div>
        `;
      }

      // Click anywhere in entry → modal
      div.querySelectorAll('[data-timeline-id]').forEach(el => {
        el.addEventListener('click', () => {
          if (typeof openTimelineModal === 'function') openTimelineModal(entry);
        });
      });

      inner.appendChild(div);
    });

    // Running stick figure
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
        <!-- Head -->
        <circle cx="12" cy="5" r="3" fill="rgba(148,163,184,0.5)" stroke="none"/>
        <!-- Torso -->
        <line x1="12" y1="8" x2="12" y2="22"/>
        <!-- Left arm -->
        <line class="arm-l" x1="12" y1="13" x2="6" y2="18"/>
        <!-- Right arm -->
        <line class="arm-r" x1="12" y1="13" x2="18" y2="18"/>
        <!-- Left leg -->
        <line class="leg-l" x1="12" y1="22" x2="6" y2="32"/>
        <!-- Right leg -->
        <line class="leg-r" x1="12" y1="22" x2="18" y2="32"/>
      </g>
    `;
    inner.appendChild(svg);
  }

  // ── Scroll-triggered entrance animation ──────────────────────────
  function initAnimation() {
    const section = document.getElementById('work-experience');
    if (!section) return;

    const axis    = document.getElementById('timeline-axis');
    const axisGlow= document.getElementById('timeline-axis-glow');
    const entries = inner.querySelectorAll('.timeline-entry');

    // Start hidden
    if (axis) {
      axis.style.transform     = 'translateY(-50%) scaleX(0)';
      axis.style.transformOrigin = 'left center';
    }
    if (axisGlow) {
      axisGlow.style.transform     = 'translateY(-50%) scaleX(0)';
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
      // Step 1: axis draws in
      if (axis) {
        axis.style.transition = 'transform 0.9s cubic-bezier(0.4,0,0.2,1)';
        axis.style.transform  = 'translateY(-50%) scaleX(1)';
      }
      if (axisGlow) {
        axisGlow.style.transition = 'transform 0.9s cubic-bezier(0.4,0,0.2,1)';
        axisGlow.style.transform  = 'translateY(-50%) scaleX(1)';
      }

      // Step 2 & 3: entries stagger in
      entries.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, 900 + i * 120);
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    buildTimeline();
    initAnimation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
