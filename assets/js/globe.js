/* ===================================================================
   globe.js — Lightweight whereabouts globe.
   Uses globe.gl's native onPointHover for tooltip detection.
   =================================================================== */

(function () {
  'use strict';

  const container = document.getElementById('globe-container');
  if (!container || typeof Globe === 'undefined') return;

  const PIN_COLORS = {
    visited:    '#fff200',
    visitor:    '#a78bfa',
    conference: '#ff1744',
  };

  const PIN_SIZES = {
    visited:    0.72,
    visitor:    0.58,
    conference: 0.84,
  };

  let globe = null;
  let controls = null;
  let globeInView = false;
  let globeHovered = false;
  let markers = [];
  let activeMarker = null;
  let tooltip = null;
  let lastPointer = { clientX: 0, clientY: 0 };

  function pageFocused() {
    return !document.hidden && document.hasFocus();
  }

  function shouldRunGlobe() {
    return globeInView && pageFocused();
  }

  function markerKey(lat, lng) {
    return `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
  }

  function addMarker(map, item) {
    const key = markerKey(item.lat, item.lng);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        lat: item.lat,
        lng: item.lng,
        label: item.label || item.city || 'Location',
        sublabels: [],
        type: item.type || 'visited',
      });
      return map.get(key);
    }
    return existing;
  }

  function buildMarkers() {
    const locationPins = typeof LOCATION_PINS !== 'undefined'
      ? LOCATION_PINS
      : (typeof GLOBE_PINS !== 'undefined' ? GLOBE_PINS : []);
    const conferencePins = typeof CONFERENCE_PINS !== 'undefined' ? CONFERENCE_PINS : [];
    const byLocation = new Map();

    locationPins.forEach(pin => {
      const marker = addMarker(byLocation, pin);
      if (pin.sublabel) marker.sublabels.push(pin.sublabel);
    });

    conferencePins.forEach(pin => {
      const marker = addMarker(byLocation, {
        lat: pin.lat,
        lng: pin.lng,
        label: pin.city,
        type: 'conference',
      });
      marker.type = 'conference';
      (pin.conferences || []).forEach(conf => marker.sublabels.push(conf));
    });

    return Array.from(byLocation.values()).map(marker => ({
      ...marker,
      sublabels: Array.from(new Set(marker.sublabels)),
    }));
  }

  function makeTooltip() {
    const el = document.createElement('div');
    el.className = 'globe-tooltip';
    el.setAttribute('aria-hidden', 'true');
    container.appendChild(el);
    return el;
  }

  function tooltipHTML(d) {
    const detail = d.sublabels.length
      ? `<div class="globe-tooltip-detail">${d.sublabels.join(' · ')}</div>`
      : '';
    const color = PIN_COLORS[d.type] || PIN_COLORS.visited;
    return `<div class="globe-tooltip-title" style="color:${color};">${d.label}</div>${detail}`;
  }

  function positionTooltip() {
    if (!tooltip || !activeMarker) return;
    const rect = container.getBoundingClientRect();
    const x = lastPointer.clientX - rect.left + 14;
    const y = lastPointer.clientY - rect.top + 14;
    tooltip.style.transform = `translate(${x}px, ${y}px)`;
  }

  function showTooltip(marker) {
    activeMarker = marker;
    if (!tooltip) tooltip = makeTooltip();
    tooltip.innerHTML = tooltipHTML(marker);
    tooltip.classList.add('visible');
    positionTooltip();
  }

  function hideTooltip() {
    activeMarker = null;
    if (tooltip) tooltip.classList.remove('visible');
  }

  function syncGlobeActivity() {
    const active = shouldRunGlobe();
    // Stop auto-rotation when hovered so the user can inspect pins,
    // but keep the render loop alive (hover events need it).
    if (controls) controls.autoRotate = active && !globeHovered;
    if (!globe) return;

    // Only pause/resume based on visibility and focus, never on hover.
    if (active) {
      if (typeof globe.resumeAnimation === 'function') globe.resumeAnimation();
    } else {
      if (typeof globe.pauseAnimation === 'function') globe.pauseAnimation();
    }
  }

  function resizeGlobe() {
    if (!globe) return;
    const w = container.clientWidth || 360;
    const h = container.clientHeight || 320;
    globe.width(w).height(h);
  }

  function init() {
    markers = buildMarkers();

    globe = Globe({ animateIn: false })(container)
      .width(container.clientWidth || 360)
      .height(container.clientHeight || 320)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .atmosphereColor('#7dd3fc')
      .atmosphereAltitude(0.13)
      .pointsData(markers)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(d => PIN_COLORS[d.type] || PIN_COLORS.visited)
      .pointRadius(d => PIN_SIZES[d.type] || PIN_SIZES.visited)
      .pointAltitude(d => d.type === 'conference' ? 0.025 : 0.014)
      .pointResolution(8)
      .pointsMerge(false)
      .onPointHover(point => {
        if (point) showTooltip(point);
        else hideTooltip();
      });

    globe.pointOfView({ lat: 20, lng: -30, altitude: 1.85 });

    const renderer = typeof globe.renderer === 'function' ? globe.renderer() : null;
    if (renderer && typeof renderer.setPixelRatio === 'function') {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.0));
    }

    controls = globe.controls();
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.34;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    container.addEventListener('mousemove', (e) => {
      lastPointer = { clientX: e.clientX, clientY: e.clientY };
      positionTooltip();
    }, { passive: true });

    container.addEventListener('mouseenter', () => {
      globeHovered = true;
      syncGlobeActivity();
    });

    container.addEventListener('mouseleave', () => {
      globeHovered = false;
      hideTooltip();
      syncGlobeActivity();
    });

    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (canvas) canvas.style.filter = 'brightness(1.18) contrast(1.04) saturate(1.12)';
    }, 300);

    const section = document.getElementById('news-globe');
    if (section) {
      const activeObserver = new IntersectionObserver((entries) => {
        globeInView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.12);
        syncGlobeActivity();
      }, { threshold: [0, 0.12, 0.5] });
      activeObserver.observe(section);
    } else {
      globeInView = true;
    }

    window.addEventListener('focus', syncGlobeActivity);
    window.addEventListener('blur', syncGlobeActivity);
    document.addEventListener('visibilitychange', syncGlobeActivity);

    const ro = new ResizeObserver(resizeGlobe);
    ro.observe(container);
    syncGlobeActivity();
  }

  window.addVisitorPin = function (lat, lng, label) {
    const marker = {
      lat,
      lng,
      label: label || 'Visitor',
      sublabels: [],
      type: 'visitor',
    };
    markers.push(marker);
    if (globe) globe.pointsData([...markers]);
  };

  function tryInit() {
    if (typeof Globe === 'undefined') {
      setTimeout(tryInit, 500);
      return;
    }

    const section = document.getElementById('news-globe');
    if (!section) { init(); return; }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
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
