/* ===================================================================
   globe.js — Interactive globe using globe.gl.
   Antique atlas aesthetic: dark navy + sepia tones.
   Auto-rotates, user can drag. Pins for key locations.
   Structured for future visitor geolocation pins.
   =================================================================== */

(function () {
  'use strict';

  const container = document.getElementById('globe-container');
  if (!container || typeof Globe === 'undefined') return;

  // ── Pin type config ───────────────────────────────────────────────
  const PIN_COLORS = {
    academic: '#60a5fa',  // blue
    industry: '#34d399',  // green
    personal: '#f59e0b',  // amber
    visitor:  '#a78bfa',  // violet
  };

  const PIN_SIZES = {
    academic: 0.5,
    industry: 0.5,
    personal: 0.4,
    visitor:  0.35,
  };

  // ── Build globe ───────────────────────────────────────────────────
  let globe;

  function init() {
    const w = container.clientWidth  || 400;
    const h = container.clientHeight || 320;

    globe = Globe({ animateIn: false })(container)
      .width(w)
      .height(h)
      .backgroundColor('rgba(0,0,0,0)')
      // Globe texture — NASA blue marble night lights for dark aesthetic
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      // Atmosphere: subtle blue glow
      .atmosphereColor('#1e40af')
      .atmosphereAltitude(0.12)
      // Points (pins)
      .pointsData(GLOBE_PINS)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(d => PIN_COLORS[d.type] || '#60a5fa')
      .pointRadius(d => PIN_SIZES[d.type] || 0.4)
      .pointAltitude(0.01)
      .pointsMerge(false)
      .pointLabel(d => `
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
        ">${d.label}</div>
      `);

    // Initial view — center roughly on Atlantic
    globe.pointOfView({ lat: 20, lng: -20, altitude: 1.8 });

    // Auto-rotate
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Resize observer
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw > 0 && nh > 0) globe.width(nw).height(nh);
    });
    ro.observe(container);
  }

  // ── Public: add a visitor pin ─────────────────────────────────────
  window.addVisitorPin = function (lat, lng, label) {
    GLOBE_PINS.push({ lat, lng, label: label || 'Visitor', type: 'visitor' });
    if (globe) {
      globe.pointsData([...GLOBE_PINS]);
    }
  };

  // ── Init (defer until section is near viewport) ───────────────────
  function tryInit() {
    if (typeof Globe === 'undefined') {
      // globe.gl script may not be ready; retry once
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
