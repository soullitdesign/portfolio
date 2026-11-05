(() => {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-particles';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  let width = 0, height = 0, particles = [], raf = 0, dpr = 1;
  const count = () => Math.min(window.innerWidth < 700 ? 24 : 48, Math.floor(width * height / 26000));
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = count();
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * 1.5 + .45,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .2 - .035,
      alpha: Math.random() * .28 + .12,
      phase: Math.random() * Math.PI * 2
    }));
  }
  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -5) p.x = width + 5; if (p.x > width + 5) p.x = -5;
      if (p.y < -5) p.y = height + 5; if (p.y > height + 5) p.y = -5;
      const pulse = .72 + Math.sin(t * .0007 + p.phase) * .28;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(226, 218, 231, ' + (p.alpha * pulse) + ')';
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  function visibility() {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(draw);
  }
  resize();
  raf = requestAnimationFrame(draw);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', visibility);
})();