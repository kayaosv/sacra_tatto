function mount(canvas) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let raf = 0, t = 0, running = true;

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const blobs = [
    { x: 0.28, y: 0.34, r: 0.55, col: [58, 52, 44],  amp: 0.05, sp: 0.10, ph: 0.0,  a: 0.55 },
    { x: 0.74, y: 0.62, r: 0.50, col: [44, 42, 46],  amp: 0.06, sp: 0.08, ph: 1.7,  a: 0.50 },
    { x: 0.52, y: 0.18, r: 0.42, col: [40, 36, 30],  amp: 0.04, sp: 0.13, ph: 3.1,  a: 0.45 },
    { x: 0.60, y: 0.80, r: 0.46, col: [86, 18, 16],  amp: 0.05, sp: 0.07, ph: 4.4,  a: 0.30 },
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, rect.width); h = Math.max(1, rect.height);
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function emberAccent() {
    const off = document.documentElement.getAttribute("data-accent") === "off";
    blobs[3].a = off ? 0.10 : 0.30;
  }

  function draw() {
    if (!running) return;
    t += reduce ? 0 : 0.0035;
    emberAccent();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(10,9,8,1)";
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";
    for (const b of blobs) {
      const cx = (b.x + Math.cos(t * b.sp * 6.28 + b.ph) * b.amp) * w;
      const cy = (b.y + Math.sin(t * b.sp * 6.28 + b.ph * 1.3) * b.amp) * h;
      const rad = b.r * Math.max(w, h) * (1 + Math.sin(t * b.sp * 3.14 + b.ph) * 0.06);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const [r, gg, bb] = b.col;
      g.addColorStop(0, `rgba(${r},${gg},${bb},${b.a})`);
      g.addColorStop(0.55, `rgba(${r},${gg},${bb},${b.a * 0.28})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    const fade = ctx.createLinearGradient(0, 0, 0, h);
    fade.addColorStop(0, "rgba(8,7,6,0.55)");
    fade.addColorStop(0.4, "rgba(8,7,6,0)");
    fade.addColorStop(0.78, "rgba(8,7,6,0)");
    fade.addColorStop(1, "rgba(8,7,6,0.95)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, w, h);

    raf = requestAnimationFrame(draw);
  }

  resize();
  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  raf = requestAnimationFrame(draw);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    },
  };
}

export const LSCAtmosphere = { mount };
