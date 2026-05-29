let inited = false;
let onReady = null;

function init(readyCb) {
  if (inited) return;
  inited = true;
  onReady = typeof readyCb === "function" ? readyCb : null;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  runLoader(reduce);
  if (reduce) return;

  setupAnchors();
  setupProgress();
  setupParallax();
  if (!coarse) { setupCursor(); setupMagnetic(); }
}

function runLoader(reduce) {
  const loader = document.getElementById("lsc-loader");
  const bar = loader ? loader.querySelector(".loader-bar > span") : null;
  const count = loader ? loader.querySelector(".loader-count") : null;
  const finish = () => {
    document.body.classList.add("is-ready");
    if (loader) loader.classList.add("out");
    if (onReady) { try { onReady(); } catch (e) {} }
    setTimeout(() => { if (loader) loader.style.display = "none"; }, 1100);
    if (window.ScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 60);
  };
  if (!loader) { finish(); return; }
  requestAnimationFrame(() => loader.classList.add("show"));
  if (reduce) { if (bar) bar.style.width = "100%"; setTimeout(finish, 120); return; }

  const dur = 1150, t0 = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 2);
    if (bar) bar.style.width = (eased * 100).toFixed(1) + "%";
    if (count) count.textContent = String(Math.round(eased * 100)).padStart(2, "0");
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(finish, 220);
  };
  requestAnimationFrame(tick);
}

let SMOOTH = false;

function setupSmoothScroll() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  let target = window.scrollY || 0;
  let current = target;
  let active = false;
  const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const loop = () => {
    current += (target - current) * 0.13;
    if (Math.abs(target - current) < 0.4) { current = target; window.scrollTo(0, current); active = false; return; }
    window.scrollTo(0, current);
    requestAnimationFrame(loop);
  };
  const onWheel = (e) => {
    if (e.ctrlKey) return;
    const dom = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    e.preventDefault();
    target = Math.max(0, Math.min(maxY(), target + e.deltaY * dom));
    if (!active) { active = true; requestAnimationFrame(loop); }
  };
  window.addEventListener("scroll", () => { if (!active) { target = window.scrollY; current = window.scrollY; } }, { passive: true });
  window.addEventListener("wheel", onWheel, { passive: false });
  SMOOTH = true;
  window.__lscScrollTo = (y) => { target = Math.max(0, Math.min(maxY(), y)); if (!active) { active = true; requestAnimationFrame(loop); } };
}

function setupAnchors() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 10;
    if (window.__lscScrollTo) window.__lscScrollTo(y);
    else window.scrollTo({ top: y, behavior: "smooth" });
  });
}

function setupProgress() {
  const bar = document.querySelector("#lsc-progress > span");
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (window.scrollY || h.scrollTop) / max : 0;
    bar.style.width = (Math.max(0, Math.min(1, p)) * 100).toFixed(2) + "%";
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function setupParallax() {
  const tag = (sel, speed) => document.querySelectorAll(sel).forEach((el) => {
    if (!el.hasAttribute("data-parallax")) { el.setAttribute("data-parallax", ""); el.dataset.pspeed = speed; }
  });
  tag(".hero-canvas", "0.18");
  tag(".estilo-img", "0.06");
  tag(".loc .map-dark", "0.05");

  const els = [...document.querySelectorAll("[data-parallax]")];
  if (!els.length) return;
  const vh = () => window.innerHeight || 800;
  const apply = () => {
    const h = vh();
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) continue;
      const speed = parseFloat(el.dataset.pspeed || "0.08");
      const offset = (r.top + r.height / 2 - h / 2) * speed;
      el.style.transform = "translate3d(0," + (-offset).toFixed(1) + "px,0)";
    }
  };
  window.addEventListener("scroll", apply, { passive: true });
  window.addEventListener("resize", apply);
  apply();
}

function setupCursor() {
  const wrap = document.getElementById("lsc-cursor");
  if (!wrap) return;
  const dot = wrap.querySelector(".cursor-dot");
  const ring = wrap.querySelector(".cursor-ring");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, moved = false;
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (!moved) { moved = true; document.body.classList.add("has-cursor"); }
  });
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
    if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  const hot = 'a, button, .btn, .filter-tab, .chip, .style-pick, .masonry-item, .round-arrow, .lang-toggle, input, textarea, select, .wa-float, image-slot';
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest && e.target.closest(hot)) document.body.classList.add("cursor-active");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest && e.target.closest(hot)) document.body.classList.remove("cursor-active");
  });
}

function setupMagnetic() {
  const targets = document.querySelectorAll(".btn-blood, .btn-bone, .round-arrow, .wa-float");
  targets.forEach((el) => {
    const strength = el.classList.contains("round-arrow") || el.classList.contains("wa-float") ? 0.4 : 0.25;
    el.style.transition = (el.style.transition ? el.style.transition + ", " : "") + "transform 0.25s cubic-bezier(0.16,1,0.3,1)";
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    });
    el.addEventListener("mouseleave", () => { el.style.transform = "translate(0,0)"; });
  });
}

export const LSCMotion = { init };
