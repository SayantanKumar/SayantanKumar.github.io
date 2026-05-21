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
  const STAR_COUNT     = 160;   // sparse by design
  const STAR_MIN_R     = 0.4;
  const STAR_MAX_R     = 1.5;
  const TWINKLE_SPEED  = 0.003; // very slow
  const PARALLAX_DEPTH = 0.012; // very subtle
  const COMET_MIN_MS   = 20000; // 20s
  const COMET_MAX_MS   = 90000; // 90s

  let W = 0, H = 0;
  let stars = [];
  let mouse = { x: 0, y: 0 };
  let cometActive = false;
  let comet = null;
  let nextCometTimer = null;
  let animId = null;

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
    return {
      x:       Math.random() * W,
      y:       Math.random() * H,
      r:       STAR_MIN_R + Math.random() * (STAR_MAX_R - STAR_MIN_R),
      depth:   0.3 + Math.random() * 0.7,      // 0.3–1 (parallax layer)
      phase:   Math.random() * Math.PI * 2,    // twinkle phase offset
      speed:   (0.5 + Math.random()) * TWINKLE_SPEED,
      baseAlpha: 0.35 + Math.random() * 0.50,  // 0.35–0.85
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
    // Cloud 1: violet, upper-right
    const g1 = ctx.createRadialGradient(W * 0.78, H * 0.18, 0, W * 0.78, H * 0.18, W * 0.30);
    g1.addColorStop(0, 'rgba(167,139,250,0.055)');
    g1.addColorStop(0.5, 'rgba(139,92,246,0.024)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    // Cloud 2: blue, center-left
    const g2 = ctx.createRadialGradient(W * 0.18, H * 0.45, 0, W * 0.18, H * 0.45, W * 0.33);
    g2.addColorStop(0, 'rgba(59,130,246,0.048)');
    g2.addColorStop(0.6, 'rgba(37,99,235,0.020)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // Cloud 3: cyan, lower-right
    const g3 = ctx.createRadialGradient(W * 0.68, H * 0.78, 0, W * 0.68, H * 0.78, W * 0.26);
    g3.addColorStop(0, 'rgba(34,211,238,0.042)');
    g3.addColorStop(0.5, 'rgba(6,182,212,0.018)');
    g3.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);

    // Galaxy dust band: faint diagonal stripe
    ctx.save();
    ctx.translate(W * 0.5, H * 0.5);
    ctx.rotate(-Math.PI / 7.5);
    const bandLen = Math.sqrt(W * W + H * H);
    const dustGrad = ctx.createLinearGradient(0, -65, 0, 65);
    dustGrad.addColorStop(0, 'rgba(0,0,0,0)');
    dustGrad.addColorStop(0.28, 'rgba(130,148,185,0.024)');
    dustGrad.addColorStop(0.50, 'rgba(155,172,210,0.033)');
    dustGrad.addColorStop(0.72, 'rgba(130,148,185,0.024)');
    dustGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = dustGrad;
    ctx.fillRect(-bandLen / 2, -65, bandLen, 130);
    ctx.restore();
  }

  // ── Draw frame ────────────────────────────────────────────────────
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawNebula();
    t += 1;

    const mx = (mouse.x / W - 0.5) * 2;  // -1 to 1
    const my = (mouse.y / H - 0.5) * 2;

    stars.forEach(s => {
      const px = s.x + mx * s.depth * W * PARALLAX_DEPTH;
      const py = s.y + my * s.depth * H * PARALLAX_DEPTH;

      const twinkle = Math.sin(t * s.speed + s.phase);
      const alpha = s.baseAlpha + twinkle * 0.18;

      // Color: slightly blue-tinted white
      const blue = Math.floor(200 + s.depth * 55);
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${blue}, ${blue}, 255, ${Math.max(0.08, Math.min(1, alpha))})`;
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
    draw();
    scheduleComet();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
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
