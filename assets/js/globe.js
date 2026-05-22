/* ===================================================================
   globe.js — Lightweight whereabouts globe.
   Uses native globe.gl point markers only. No HTML marker layer and no
   per-frame custom marker positioning.
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
  let lastPointer = { x: 0, y: 0 };
  let hoverCheckTimer = null;
  const HOVER_CHECK_MS = 90;

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
    const x = lastPointer.x - rect.left + 14;
    const y = lastPointer.y - rect.top + 14;
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

  function pointerInGlobeCircle(e) {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const radius = Math.min(rect.width, rect.height) * 0.44;
    return dx * dx + dy * dy <= radius * radius;
  }

  function markerIsFacingCamera(marker) {
    if (!globe) return false;

    const camera = globe.camera();
    const cp = camera.position;
    const cLen = Math.sqrt(cp.x * cp.x + cp.y * cp.y + cp.z * cp.z);
    if (cLen < 0.001) return false;

    const altitude = marker.type === 'conference' ? 0.025 : 0.014;
    const point = typeof globe.getCoords === 'function'
      ? globe.getCoords(marker.lat, marker.lng, altitude)
      : null;

    if (point) {
      const pLen = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
      if (pLen < 0.001) return false;
      return ((point.x * cp.x) + (point.y * cp.y) + (point.z * cp.z)) / (pLen * cLen) > 0.12;
    }

    const lat = marker.lat * Math.PI / 180;
    const lng = marker.lng * Math.PI / 180;
    const nx = Math.cos(lat) * Math.cos(lng);
    const ny = Math.sin(lat);
    const nz = Math.cos(lat) * Math.sin(lng);

    return (nx * cp.x + ny * cp.y + nz * cp.z) / cLen > 0.12;
  }

  function hoveredMarkerAt(e) {
    if (!globe || !markers.length || !pointerInGlobeCircle(e)) return null;

    const rect = container.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;
    let nearest = null;
    let nearestDistance = Infinity;

    markers.forEach(marker => {
      if (!markerIsFacingCamera(marker)) return;

      const pos = globe.getScreenCoords(
        marker.lat,
        marker.lng,
        marker.type === 'conference' ? 0.025 : 0.014,
      );
      const dx = pointerX - pos.x;
      const dy = pointerY - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = marker.type === 'conference' ? 28 : 24;

      if (distance <= hitRadius && distance < nearestDistance) {
        nearest = marker;
        nearestDistance = distance;
      }
    });

    return nearest;
  }

  function runHoverCheck() {
    hoverCheckTimer = null;

    const overGlobe = pointerInGlobeCircle(lastPointer);
    if (globeHovered !== overGlobe) {
      globeHovered = overGlobe;
      syncGlobeActivity();
    }

    const nearbyMarker = hoveredMarkerAt(lastPointer);
    if (nearbyMarker) showTooltip(nearbyMarker);
    else if (!overGlobe || activeMarker) hideTooltip();
    positionTooltip();
  }

  function scheduleHoverCheck() {
    if (hoverCheckTimer) return;
    hoverCheckTimer = window.setTimeout(runHoverCheck, HOVER_CHECK_MS);
  }

  function syncGlobeActivity() {
    const active = shouldRunGlobe();
    const renderActive = active && !globeHovered;
    if (controls) controls.autoRotate = renderActive;
    if (!globe) return;

    if (renderActive && typeof globe.resumeAnimation === 'function') globe.resumeAnimation();
    if (!renderActive && typeof globe.pauseAnimation === 'function') globe.pauseAnimation();
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
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .atmosphereColor('#7dd3fc')
      .atmosphereAltitude(0.13)
      .pointsData(markers)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(d => PIN_COLORS[d.type] || PIN_COLORS.visited)
      .pointRadius(d => PIN_SIZES[d.type] || PIN_SIZES.visited)
      .pointAltitude(d => d.type === 'conference' ? 0.025 : 0.014)
      .pointResolution(8)
      .pointsMerge(false);

    globe.pointOfView({ lat: 20, lng: -30, altitude: 1.85 });

    const renderer = typeof globe.renderer === 'function' ? globe.renderer() : null;
    if (renderer && typeof renderer.setPixelRatio === 'function') {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));
    }

    controls = globe.controls();
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.34;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    container.addEventListener('mousemove', (e) => {
      lastPointer = { x: e.clientX, y: e.clientY };
      positionTooltip();
      scheduleHoverCheck();
    }, { passive: true });
    container.addEventListener('mouseleave', () => {
      if (hoverCheckTimer) {
        window.clearTimeout(hoverCheckTimer);
        hoverCheckTimer = null;
      }
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
