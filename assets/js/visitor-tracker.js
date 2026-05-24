/* ===================================================================
   visitor-tracker.js — Real-time visitor geolocation + counter.

   What this does on every page load
   ──────────────────────────────────
   1. If Firebase is not yet configured (placeholder keys) → renders
      mock-only counters and exits.
   2. If this browser has already been counted in the last 24 h →
      skips recording a new visit but still reads + renders live data.
   3. Otherwise:
      a. Fetches city/country via ipwho.is (free, no API key).
      b. Writes one document to Firestore `visitors/` (permanent log).
      c. Upserts one document in `visitor_cities/` (aggregated pins).
      d. Increments `meta/stats` (total_visits + unique_countries).
   4. Reads back all visitor_cities and meta/stats, then:
      - Adds purple visitor pins to the globe for cities NOT in the
        pre-seeded mock list.
      - Updates the Visitors counter (mock offset + real count).
      - Updates the Countries counter (mock + real countries).

   Firestore collections
   ──────────────────────
   visitors/{auto-id}
     city, country, country_code, lat, lng, timestamp

   visitor_cities/{city__cc}          ← one doc per unique city
     city, country, country_code, lat, lng, visit_count, first_visit

   meta/stats
     total_visits: number
     unique_countries: string[]

   REMOVING THE MOCK OFFSET (future)
   ───────────────────────────────────
   When you have enough real data and want the counter to show only
   real visits:
     1. Set MOCK_VISITOR_OFFSET = 0 in data.js  (or delete the constant).
     2. Clear VISITOR_MOCK_CITIES in data.js (or delete the constant).
     3. In updateUI() below, change `mockOffset` to 0.
   The hidden data-real-visits attribute on #stat-visitors shows the
   raw Firebase count at all times so you can monitor real traffic.
   =================================================================== */

(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────
  const GEO_API         = 'https://ipwho.is/';
  const GEO_TIMEOUT_MS  = 5000;
  const LAST_VISIT_KEY  = 'sn_visitor_ts';   // localStorage key
  const VISIT_WINDOW_MS = 24 * 60 * 60 * 1000;

  // ── Helpers ───────────────────────────────────────────────────────

  // Accept either FIREBASE_CONFIG (our name) or firebaseConfig (Firebase's default)
  function resolveConfig() {
    if (typeof FIREBASE_CONFIG !== 'undefined' &&
        FIREBASE_CONFIG.apiKey !== 'REPLACE_WITH_YOUR_API_KEY') return FIREBASE_CONFIG;
    if (typeof firebaseConfig !== 'undefined' &&
        firebaseConfig.apiKey !== 'REPLACE_WITH_YOUR_API_KEY') return firebaseConfig;
    return null;
  }

  function isFirebaseReady() {
    return resolveConfig() !== null;
  }

  // Stable Firestore document key for a city
  function cityDocKey(city, countryCode) {
    return (city + '__' + countryCode)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .slice(0, 100);
  }

  // True when this visitor's city is already covered by mock seed data
  function isMockCity(city, countryCode) {
    if (typeof VISITOR_MOCK_CITIES === 'undefined') return false;
    const c = city.toLowerCase().trim();
    const cc = countryCode.toLowerCase().trim();
    return VISITOR_MOCK_CITIES.some(
      m => m.city.toLowerCase() === c && m.country_code.toLowerCase() === cc
    );
  }

  // Whether this browser has been recorded within the last 24 h
  function isNewVisit() {
    const last = localStorage.getItem(LAST_VISIT_KEY);
    if (!last) return true;
    return Date.now() - parseInt(last, 10) > VISIT_WINDOW_MS;
  }

  function markVisited() {
    try { localStorage.setItem(LAST_VISIT_KEY, Date.now().toString()); } catch (_) {}
  }

  // ── UI ────────────────────────────────────────────────────────────

  function updateUI(totalRealVisits, realCountries) {
    const mockOffset   = typeof MOCK_VISITOR_OFFSET    !== 'undefined' ? MOCK_VISITOR_OFFSET    : 0;
    const mockCountries= typeof MOCK_VISITOR_COUNTRIES !== 'undefined' ? MOCK_VISITOR_COUNTRIES : [];

    const displayedVisitors = mockOffset + (totalRealVisits || 0);
    const allCountries      = new Set([...mockCountries, ...(realCountries || [])]);

    const elV = document.getElementById('stat-visitors');
    const elC = document.getElementById('stat-countries');

    if (elV) {
      elV.textContent = displayedVisitors;
      // Hidden true counter — raw Firebase visits, visible in DevTools.
      // Remove data-real-visits (and the mock offset logic above) once
      // you no longer need the artificial head-start.
      elV.setAttribute('data-real-visits', totalRealVisits || 0);
    }
    if (elC) elC.textContent = allCountries.size;
  }

  function addPinsToGlobe(cities) {
    if (typeof window.addVisitorPin !== 'function') return;
    cities.forEach(c => {
      if (!isMockCity(c.city, c.country_code)) {
        window.addVisitorPin(c.lat, c.lng, c.city);
      }
    });
  }

  // ── Geolocation ───────────────────────────────────────────────────

  async function fetchGeo() {
    const ctrl    = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), GEO_TIMEOUT_MS);
    try {
      const res  = await fetch(GEO_API, { signal: ctrl.signal });
      const data = await res.json();
      clearTimeout(timeout);
      if (!data.success || !data.city) return null;
      return {
        city:         data.city         || 'Unknown',
        country:      data.country      || 'Unknown',
        country_code: data.country_code || 'XX',
        lat:          data.latitude     || 0,
        lng:          data.longitude    || 0,
      };
    } catch (_) {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  // ── Firestore read ────────────────────────────────────────────────

  async function loadAndRender(db) {
    const [citySnap, statsSnap] = await Promise.all([
      db.collection('visitor_cities').get(),
      db.collection('meta').doc('stats').get(),
    ]);

    const cities = citySnap.docs.map(d => d.data());
    const stats  = statsSnap.exists
      ? statsSnap.data()
      : { total_visits: 0, unique_countries: [] };

    addPinsToGlobe(cities);
    updateUI(stats.total_visits, stats.unique_countries);
  }

  // ── Firestore write ───────────────────────────────────────────────

  async function recordVisit(db, geo) {
    const hasLocation = geo && geo.city !== 'Unknown' && geo.lat !== 0;
    const FV          = firebase.firestore.FieldValue;

    // Read city + stats documents in parallel before building the batch
    const cityKey  = hasLocation ? cityDocKey(geo.city, geo.country_code) : null;
    const cityRef  = hasLocation ? db.collection('visitor_cities').doc(cityKey) : null;
    const statsRef = db.collection('meta').doc('stats');

    const [citySnap, statsSnap] = await Promise.all([
      cityRef  ? cityRef.get()  : Promise.resolve(null),
      statsRef.get(),
    ]);

    const batch = db.batch();

    // 1. Permanent raw visit log (always written)
    const visitRef = db.collection('visitors').doc();
    batch.set(visitRef, {
      city:         (geo && geo.city)         || 'Unknown',
      country:      (geo && geo.country)      || 'Unknown',
      country_code: (geo && geo.country_code) || 'XX',
      lat:          (geo && geo.lat)          || 0,
      lng:          (geo && geo.lng)          || 0,
      timestamp:    FV.serverTimestamp(),
    });

    // 2. City aggregate (only when we have a real city)
    if (hasLocation && cityRef) {
      if (citySnap && citySnap.exists) {
        batch.update(cityRef, { visit_count: FV.increment(1) });
      } else {
        batch.set(cityRef, {
          city:         geo.city,
          country:      geo.country,
          country_code: geo.country_code,
          lat:          geo.lat,
          lng:          geo.lng,
          visit_count:  1,
          first_visit:  FV.serverTimestamp(),
        });
      }
    }

    // 3. Aggregated stats
    if (statsSnap.exists) {
      const updates = { total_visits: FV.increment(1) };
      if (hasLocation && geo) {
        const existing = statsSnap.data().unique_countries || [];
        if (!existing.includes(geo.country)) {
          updates.unique_countries = FV.arrayUnion(geo.country);
        }
      }
      batch.update(statsRef, updates);
    } else {
      batch.set(statsRef, {
        total_visits:     1,
        unique_countries: (hasLocation && geo) ? [geo.country] : [],
      });
    }

    await batch.commit();
  }

  // ── Main ──────────────────────────────────────────────────────────

  async function run() {
    // Not yet configured — show mock-seeded counters only
    if (!isFirebaseReady()) {
      updateUI(0, []);
      return;
    }

    // Initialise Firebase (guard against double-init in dev reloads)
    if (!firebase.apps.length) firebase.initializeApp(resolveConfig());
    const db = firebase.firestore();

    const newVisit = isNewVisit();

    if (newVisit) {
      markVisited();  // stamp immediately so a crash doesn't cause double-count
      try {
        const geo = await fetchGeo();
        await recordVisit(db, geo);
      } catch (_) {
        // Write failed — still show existing data below
      }
    }

    // Always read back current state and render (visit or not)
    try {
      await loadAndRender(db);
    } catch (_) {
      updateUI(0, []);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

})();
