/* ===================================================================
   globe.js — Interactive globe using globe.gl.
   Two simultaneous layers:
     1. LOCATION_PINS  → glowing pointsData dots
     2. CONFERENCE_PINS → htmlElementsData dark-red flag markers
   Hover pauses auto-rotation; mouse leave resumes.
   Tooltip format: "City, State/Province, Country"
   =================================================================== */

(function () {
  'use strict';

  const container = document.getElementById('globe-container');
  if (!container || typeof Globe === 'undefined') return;

  // ── Pin type config ───────────────────────────────────────────────
  const PIN_COLORS = {
    academic: '#60a5fa',
    industry: '#34d399',
    personal: '#f59e0b',
    visitor:  '#a78bfa',
  };

  const PIN_SIZES = {
    academic: 0.55,
    industry: 0.55,
    personal: 0.45,
    visitor:  0.38,
  };

  // ── Conference flag HTML element ──────────────────────────────────
  function buildFlagEl(d) {
    const el = document.createElement('div');
    el.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: default;
      user-select: none;
      pointer-events: all;
    `;

    const flag = document.createElement('div');
    flag.style.cssText = `
      width: 12px;
      height: 9px;
      background: #c0392b;
      border-radius: 1px 2px 2px 1px;
      position: relative;
      box-shadow: 0 0 5px rgba(192,57,43,0.55);
    `;

    const pole = document.createElement('div');
    pole.style.cssText = `
      width: 1px;
      height: 14px;
      background: #e06c5e;
      margin: 0 auto;
    `;

    const tooltip = document.createElement('div');
    const confNames = (d.conferences || []).join(' · ');
    tooltip.style.cssText = `
      position: absolute;
      bottom: calc(100% + 20px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(7,11,20,0.92);
      border: 1px solid rgba(192,57,43,0.45);
      border-radius: 6px;
      padding: 5px 10px;
      font-family: Roboto, sans-serif;
      font-size: 11px;
      color: #e2e8f0;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 10;
    `;
    tooltip.innerHTML = `<strong style="color:#f87171;">${d.city}</strong><br>${confNames}`;

    el.style.position = 'relative';
    el.appendChild(tooltip);
    el.appendChild(flag);
    el.appendChild(pole);

    el.addEventListener('mouseenter', () => { tooltip.style.opacity = '1'; });
    el.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    return el;
  }

  // ── Build globe ───────────────────────────────────────────────────
  let globe;
  let controls;

  function init() {
    const w = container.clientWidth  || 400;
    const h = container.clientHeight || 320;

    const locationPins    = typeof LOCATION_PINS    !== 'undefined' ? LOCATION_PINS    : (typeof GLOBE_PINS !== 'undefined' ? GLOBE_PINS : []);
    const conferencePins  = typeof CONFERENCE_PINS  !== 'undefined' ? CONFERENCE_PINS  : [];

    globe = Globe({ animateIn: false })(container)
      .width(w)
      .height(h)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      // Brighter atmosphere
      .atmosphereColor('#2563eb')
      .atmosphereAltitude(0.14)
      // Layer 1: glowing location dots
      .pointsData(locationPins)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(d => PIN_COLORS[d.type] || '#60a5fa')
      .pointRadius(d => PIN_SIZES[d.type] || 0.45)
      .pointAltitude(0.01)
      .pointsMerge(false)
      .pointLabel(d => {
        const sub = d.sublabel ? `<br><span style="opacity:0.7;font-size:11px;">${d.sublabel}</span>` : '';
        return `
          <div style="
            background: rgba(7,11,20,0.90);
            border: 1px solid rgba(59,130,246,0.30);
            border-radius: 6px;
            padding: 5px 10px;
            font-family: Roboto, sans-serif;
            font-size: 12px;
            color: #e2e8f0;
            white-space: nowrap;
            pointer-events: none;
          ">${d.label}${sub}</div>
        `;
      })
      // Layer 2: conference flag HTML elements
      .htmlElementsData(conferencePins)
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.02)
      .htmlElement(d => buildFlagEl(d));

    globe.pointOfView({ lat: 20, lng: -20, altitude: 1.8 });

    controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Pause rotation on hover
    container.addEventListener('mouseenter', () => {
      if (controls) controls.autoRotate = false;
    });
    container.addEventListener('mouseleave', () => {
      if (controls) controls.autoRotate = true;
    });

    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw > 0 && nh > 0) globe.width(nw).height(nh);
    });
    ro.observe(container);
  }

  // ── Public: add a visitor pin ─────────────────────────────────────
  window.addVisitorPin = function (lat, lng, label) {
    const locationPins = typeof LOCATION_PINS !== 'undefined' ? LOCATION_PINS : (typeof GLOBE_PINS !== 'undefined' ? GLOBE_PINS : []);
    locationPins.push({ lat, lng, label: label || 'Visitor', sublabel: '', type: 'visitor' });
    if (globe) globe.pointsData([...locationPins]);
  };

  // ── Init (defer until section is near viewport) ───────────────────
  function tryInit() {
    if (typeof Globe === 'undefined') {
      setTimeout(tryInit, 500);
      return;
    }

    const section = document.getElementById('news-globe');
    if (!section) { init(); return; }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          observer.disconnect();
          init();
        }
      });
    }, { rootMargin: '200px' });

    observer.observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

})();
