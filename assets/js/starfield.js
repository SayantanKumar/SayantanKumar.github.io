/* ===================================================================
   starfield.js — Animated starry sky background for the right panel.
   Sparse stars with subtle twinkle + rare comet / shooting star.
   Mouse parallax gives subtle depth.
   =================================================================== */

(function () {
  'use strict';

  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Config
  const STAR_COUNT     = 360;
  const STAR_MIN_R     = 0.4;
  const STAR_MAX_R     = 1.65;
  const TWINKLE_SPEED  = 0.003;
  const TWINKLE_AMP    = 0.24;
  const PARALLAX_DEPTH = 0.005;  // subtle — reduced from 0.012
  const COMET_MIN_MS   = 6500;
  const COMET_MAX_MS   = 7500;
  const DRIFT_MAX      = 0.025;  // max pixels/frame drift per star

  let W = 0, H = 0;
  let stars = [];
  let mouse = { x: 0, y: 0 };
  let cometActive = false;
  let comet = null;
  let nextCometTimer = null;
  let animId = null;

  function shouldAnimate() {
    return !document.hidden && document.hasFocus();
  }

  function startDraw() {
    if (!animId && shouldAnimate()) animId = requestAnimationFrame(draw);
  }

  function stopDraw() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  // ── Sizing ────────────────────────────────────────────────────────
  function resize() {
    const sidebar = document.getElementById('sidebar');
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 52;
    const sideW = sidebar ? sidebar.getBoundingClientRect().width : 300;
    W = window.innerWidth - sideW;
    H = window.innerHeight - navH;
    canvas.width  = W;
    canvas.height = H;
    if (stars.length === 0) initStars();
  }

  // ── Stars ─────────────────────────────────────────────────────────
  function randomStar() {
    const r = STAR_MIN_R + Math.random() * (STAR_MAX_R - STAR_MIN_R);
    const angle = Math.random() * Math.PI * 2;
    const drift = (r > 1.2 ? 0.4 : 1.0) * DRIFT_MAX; // large stars drift slower
    return {
      x:         Math.random() * W,
      y:         Math.random() * H,
      r,
      depth:     0.3 + Math.random() * 0.7,
      phase:     Math.random() * Math.PI * 2,
      speed:     (0.5 + Math.random()) * TWINKLE_SPEED,
      baseAlpha: 0.30 + Math.random() * 0.38,
      vx:        Math.cos(angle) * drift * Math.random(),
      vy:        Math.sin(angle) * drift * Math.random(),
    };
  }

  function initStars() {
    stars = Array.from({ length: STAR_COUNT }, randomStar);
  }

  // ── Comet ─────────────────────────────────────────────────────────
  function scheduleComet() {
    if (nextCometTimer) clearTimeout(nextCometTimer);
    const delay = COMET_MIN_MS + Math.random() * (COMET_MAX_MS - COMET_MIN_MS);
    nextCometTimer = setTimeout(spawnComet, delay);
  }

  function spawnComet() {
    if (!shouldAnimate()) { scheduleComet(); return; }
    if (cometActive) { scheduleComet(); return; }
    cometActive = true;

    // Start from top edge, slight random angle
    const angle = (Math.PI / 8) + Math.random() * (Math.PI / 6); // 22.5–52.5°
    const startX = Math.random() * W * 0.6;
    const speed  = 3.5 + Math.random() * 2.5;

    comet = {
      x:    startX,
      y:    -10,
      vx:   Math.cos(angle) * speed,
      vy:   Math.sin(angle) * speed,
      len:  80 + Math.random() * 60,
      alpha: 0,
      fade: 'in',  // 'in' | 'hold' | 'out'
      life: 0,
      maxLife: 60 + Math.random() * 40,
    };
    scheduleComet();
  }

  function updateComet() {
    if (!comet) return;
    comet.x += comet.vx;
    comet.y += comet.vy;
    comet.life++;

    if (comet.fade === 'in') {
      comet.alpha = Math.min(comet.alpha + 0.06, 0.9);
      if (comet.alpha >= 0.9) comet.fade = 'hold';
    } else if (comet.fade === 'hold') {
      if (comet.life > comet.maxLife) comet.fade = 'out';
    } else {
      comet.alpha = Math.max(comet.alpha - 0.05, 0);
      if (comet.alpha <= 0) {
        comet = null;
        cometActive = false;
        return;
      }
    }

    if (comet && (comet.x > W + 100 || comet.y > H + 100)) {
      comet = null;
      cometActive = false;
    }
  }

  function drawComet() {
    if (!comet) return;
    const { x, y, vx, vy, len, alpha } = comet;
    const mag = Math.sqrt(vx * vx + vy * vy);
    const tailX = x - (vx / mag) * len;
    const tailY = y - (vy / mag) * len;

    const grad = ctx.createLinearGradient(tailX, tailY, x, y);
    grad.addColorStop(0, `rgba(180, 210, 255, 0)`);
    grad.addColorStop(0.6, `rgba(180, 210, 255, ${alpha * 0.4})`);
    grad.addColorStop(1, `rgba(220, 235, 255, ${alpha})`);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Head glow
    const headGlow = ctx.createRadialGradient(x, y, 0, x, y, 5);
    headGlow.addColorStop(0, `rgba(220, 240, 255, ${alpha * 0.9})`);
    headGlow.addColorStop(1, `rgba(220, 240, 255, 0)`);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = headGlow;
    ctx.fill();
  }

  // ── Nebula clouds & galaxy dust ───────────────────────────────────
  function drawNebula() {
    // Cloud 1: cool violet-blue, upper-right
    const g1 = ctx.createRadialGradient(W * 0.78, H * 0.18, 0, W * 0.78, H * 0.18, W * 0.32);
    g1.addColorStop(0, 'rgba(139,170,255,0.076)');
    g1.addColorStop(0.5, 'rgba(89,118,246,0.034)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    // Cloud 2: blue, center-left
    const g2 = ctx.createRadialGradient(W * 0.18, H * 0.45, 0, W * 0.18, H * 0.45, W * 0.35);
    g2.addColorStop(0, 'rgba(59,145,255,0.082)');
    g2.addColorStop(0.6, 'rgba(37,111,245,0.036)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // Cloud 3: cyan, lower-right
    const g3 = ctx.createRadialGradient(W * 0.68, H * 0.78, 0, W * 0.68, H * 0.78, W * 0.28);
    g3.addColorStop(0, 'rgba(70,190,255,0.064)');
    g3.addColorStop(0.5, 'rgba(22,150,230,0.030)');
    g3.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);

    // Cloud 4: soft blue-gray, lower-center
    const g4 = ctx.createRadialGradient(W * 0.45, H * 0.88, 0, W * 0.45, H * 0.88, W * 0.24);
    g4.addColorStop(0, 'rgba(126,164,230,0.026)');
    g4.addColorStop(0.6, 'rgba(80,120,210,0.012)');
    g4.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g4;
    ctx.fillRect(0, 0, W, H);

    // Galaxy dust band: layered, gently curved pockets instead of a hard stripe
    ctx.save();
    ctx.translate(W * 0.5, H * 0.5);
    ctx.rotate(-Math.PI / 7.5);
    const bandLen = Math.sqrt(W * W + H * H);
    const dustGrad = ctx.createLinearGradient(0, -260, 0, 260);
    dustGrad.addColorStop(0, 'rgba(0,0,0,0)');
    dustGrad.addColorStop(0.26, 'rgba(95,135,205,0.003)');
    dustGrad.addColorStop(0.46, 'rgba(125,162,225,0.006)');
    dustGrad.addColorStop(0.60, 'rgba(150,180,238,0.005)');
    dustGrad.addColorStop(0.80, 'rgba(86,126,196,0.003)');
    dustGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = dustGrad;
    ctx.beginPath();
    ctx.moveTo(-bandLen / 2, -230);
    ctx.bezierCurveTo(-bandLen * 0.28, -108, -bandLen * 0.12, 132, bandLen * 0.08, 42);
    ctx.bezierCurveTo(bandLen * 0.27, -92, bandLen * 0.34, 146, bandLen / 2, 102);
    ctx.lineTo(bandLen / 2, 286);
    ctx.bezierCurveTo(bandLen * 0.30, 205, bandLen * 0.12, 252, -bandLen * 0.08, 152);
    ctx.bezierCurveTo(-bandLen * 0.27, 56, -bandLen * 0.36, 214, -bandLen / 2, 84);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const pockets = [
      { x: 0.18, y: 0.34, r: 0.46, c: '96,135,220', a: 0.021 },
      { x: 0.36, y: 0.52, r: 0.40, c: '130,112,230', a: 0.014 },
      { x: 0.58, y: 0.46, r: 0.44, c: '75,155,235', a: 0.020 },
      { x: 0.78, y: 0.62, r: 0.36, c: '120,170,240', a: 0.013 },
      { x: 0.48, y: 0.72, r: 0.38, c: '70,115,215', a: 0.010 },
    ];

    pockets.forEach(p => {
      const g = ctx.createRadialGradient(W * p.x, H * p.y, 0, W * p.x, H * p.y, W * p.r);
      g.addColorStop(0, `rgba(${p.c},${p.a})`);
      g.addColorStop(0.32, `rgba(${p.c},${p.a * 0.46})`);
      g.addColorStop(0.68, `rgba(${p.c},${p.a * 0.12})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.save();
    ctx.translate(W * 0.5, H * 0.5);
    ctx.rotate(-Math.PI / 7.5);
    const shadowGrad = ctx.createLinearGradient(0, -80, 0, 80);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    shadowGrad.addColorStop(0.50, 'rgba(3,8,22,0.012)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.moveTo(-bandLen * 0.42, -40);
    ctx.bezierCurveTo(-bandLen * 0.18, 28, bandLen * 0.10, -24, bandLen * 0.42, 34);
    ctx.lineTo(bandLen * 0.42, 82);
    ctx.bezierCurveTo(bandLen * 0.10, 28, -bandLen * 0.18, 76, -bandLen * 0.42, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Draw frame ────────────────────────────────────────────────────
  let t = 0;
  function draw() {
    if (!shouldAnimate()) {
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, W, H);
    drawNebula();
    t += 1;

    const mx = (mouse.x / W - 0.5) * 2;  // -1 to 1
    const my = (mouse.y / H - 0.5) * 2;

    stars.forEach(s => {
      // Apply slow drift and wrap
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;

      const px = s.x + mx * s.depth * W * PARALLAX_DEPTH;
      const py = s.y + my * s.depth * H * PARALLAX_DEPTH;

      const twinkle = Math.sin(t * s.speed + s.phase);
      const alpha = Math.max(0.08, Math.min(1, s.baseAlpha + twinkle * TWINKLE_AMP));

      const blue = Math.floor(200 + s.depth * 55);

      // Glow halo for larger stars
      if (s.r > 1.2) {
        const glowR = s.r * 3.5;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        glow.addColorStop(0, `rgba(${blue}, ${blue}, 255, ${alpha * 0.28})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${blue}, ${blue}, 255, ${alpha})`;
      ctx.fill();
    });

    updateComet();
    drawComet();

    animId = requestAnimationFrame(draw);
  }

  // ── Mouse ─────────────────────────────────────────────────────────
  function onMouseMove(e) {
    const sidebar = document.getElementById('sidebar');
    const sideW = sidebar ? sidebar.getBoundingClientRect().width : 300;
    mouse.x = e.clientX - sideW;
    mouse.y = e.clientY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 52);
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    resize();
    startDraw();
    scheduleComet();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('focus', startDraw);
    window.addEventListener('blur', stopDraw);
    document.addEventListener('visibilitychange', () => {
      if (shouldAnimate()) startDraw();
      else stopDraw();
    });
    // Remove preload class after first paint
    requestAnimationFrame(() => {
      document.body.classList.remove('is-preload');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
