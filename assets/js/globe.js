/* ===================================================================
   globe.js — Interactive globe using globe.gl.
   Two simultaneous layers:
     1. LOCATION_PINS  → glowing pointsData dots
     2. CONFERENCE_PINS → htmlElementsData flag markers
   Flags: triangular flag + dark-red pole, perpendicular to globe surface
   (orientations updated per animation frame via camera math).
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

  // ── Flag element tracking for orientation updates ─────────────────
  const flagData = []; // { el, d }

  // ── Conference flag HTML element — triangular flag + pole ─────────
  function buildFlagEl(d) {
    const outer = document.createElement('div');
    outer.style.cssText = `
      position: relative;
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      cursor: default;
      user-select: none;
      pointer-events: all;
      transform-origin: bottom left;
    `;

    // Triangular flag (CSS border trick → right-pointing triangle)
    // Sized at ~50% of original rectangular flag (original: 12×9px flag + 14px pole)
    const flag = document.createElement('div');
    flag.style.cssText = `
      width: 0;
      height: 0;
      border-top: 3px solid transparent;
      border-bottom: 3px solid transparent;
      border-left: 6px solid #c0392b;
      margin-left: 1px;
      filter: drop-shadow(0 0 2px rgba(192,57,43,0.70));
      flex-shrink: 0;
    `;

    // Pole — dark red vertical bar
    const pole = document.createElement('div');
    pole.style.cssText = `
      width: 1.5px;
      height: 6px;
      background: #7b0000;
      margin-left: 0;
      flex-shrink: 0;
    `;

    // Tooltip
    const confNames = (d.conferences || []).join(' · ');
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute;
      bottom: calc(100% + 4px);
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

    outer.appendChild(tooltip);
    outer.appendChild(flag);
    outer.appendChild(pole);

    outer.addEventListener('mouseenter', () => { tooltip.style.opacity = '1'; });
    outer.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    flagData.push({ el: outer, d });
    return outer;
  }

  // ── Per-frame flag orientation update ────────────────────────────
  // Camera orbits a fixed globe. Surface normals are constant in world space.
  // We project each flag's surface normal onto the screen plane and compute
  // the CSS rotate() angle needed to align the flag pole with that direction.
  function updateFlagOrientations() {
    if (!globe || flagData.length === 0) return;

    const cam = globe.camera();
    const cp  = cam.position;
    const cLen = Math.sqrt(cp.x * cp.x + cp.y * cp.y + cp.z * cp.z);
    if (cLen < 0.001) return;

    // Camera forward (toward globe center = -camPos normalized)
    const fx = -cp.x / cLen, fy = -cp.y / cLen, fz = -cp.z / cLen;

    // Screen up = world Y (0,1,0) projected onto camera plane
    const dotFU = fy; // (0,1,0)·fwd = fy
    let sux = -dotFU * fx, suy = 1 - dotFU * fy, suz = -dotFU * fz;
    const suLen = Math.sqrt(sux * sux + suy * suy + suz * suz);
    if (suLen < 0.001) return;
    sux /= suLen; suy /= suLen; suz /= suLen;

    // Screen right = fwd × screenUp
    const srx = fy * suz - fz * suy;
    const sry = fz * sux - fx * suz;
    const srz = fx * suy - fy * sux;

    flagData.forEach(({ el, d }) => {
      const latR = d.lat * Math.PI / 180;
      const lngR = d.lng * Math.PI / 180;

      // Surface normal (world-space, globe is fixed)
      const nx = Math.cos(latR) * Math.cos(lngR);
      const ny = Math.sin(latR);
      const nz = Math.cos(latR) * Math.sin(lngR);

      // Visibility: dot with camera forward
      const vis = nx * fx + ny * fy + nz * fz;
      // (globe.gl already hides rear elements; we just compute angle)

      // Project normal onto screen plane
      const dot = nx * fx + ny * fy + nz * fz;
      const pnx = nx - dot * fx, pny = ny - dot * fy, pnz = nz - dot * fz;
      const pnLen = Math.sqrt(pnx * pnx + pny * pny + pnz * pnz);

      if (pnLen < 0.02) {
        // Normal pointing directly at camera — no rotation needed
        el.style.transform = '';
        return;
      }
      const pnNx = pnx / pnLen, pnNy = pny / pnLen, pnNz = pnz / pnLen;

      // Angle between projected normal and screen up
      const cosA = pnNx * sux + pnNy * suy + pnNz * suz;
      const sinA = pnNx * srx + pnNy * sry + pnNz * srz;
      const angle = Math.atan2(sinA, cosA) * 180 / Math.PI;

      el.style.transform = `rotate(${angle.toFixed(1)}deg)`;
    });

    requestAnimationFrame(updateFlagOrientations);
  }

  // ── Build globe ───────────────────────────────────────────────────
  let globe;
  let controls;

  function init() {
    const w = container.clientWidth  || 400;
    const h = container.clientHeight || 320;

    const locationPins   = typeof LOCATION_PINS   !== 'undefined' ? LOCATION_PINS   : (typeof GLOBE_PINS !== 'undefined' ? GLOBE_PINS : []);
    const conferencePins = typeof CONFERENCE_PINS !== 'undefined' ? CONFERENCE_PINS : [];

    globe = Globe({ animateIn: false })(container)
      .width(w)
      .height(h)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .atmosphereColor('#3b82f6')
      .atmosphereAltitude(0.16)
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
      .htmlAltitude(0.018)
      .htmlElement(d => buildFlagEl(d));

    globe.pointOfView({ lat: 20, lng: -20, altitude: 1.8 });

    controls = globe.controls();
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom      = false;
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.1;

    // Pause rotation on hover
    container.addEventListener('mouseenter', () => { if (controls) controls.autoRotate = false; });
    container.addEventListener('mouseleave', () => { if (controls) controls.autoRotate = true; });

    // Brighten the globe canvas
    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (canvas) canvas.style.filter = 'brightness(1.9) saturate(1.15)';
    }, 300);

    // Start per-frame flag orientation
    requestAnimationFrame(updateFlagOrientations);

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
