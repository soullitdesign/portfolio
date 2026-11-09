/* Soullit — pointer-driven 3D depth.
   Tilts cards/pictures in real 3D space, drives hero parallax variables and
   fires the logo light-sweep. Skipped entirely for reduced-motion users and
   touch-only devices, so nothing depends on it to look correct. */
(() => {
  "use strict";

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const root = document.documentElement;

  /* ---------- shared pointer → CSS variables (hero parallax) ---------- */
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function flushPointer() {
    pointerFrame = 0;
    root.style.setProperty("--px", pointerX.toFixed(4));
    root.style.setProperty("--py", pointerY.toFixed(4));
  }

  window.addEventListener("pointermove", event => {
    if (motionQuery.matches) return;
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(flushPointer);
  }, { passive: true });

  /* ---------- logo light sweep ---------- */
  const logos = Array.from(document.querySelectorAll(".sp-logo"));
  const sweepTimers = new WeakMap();

  function sweep(logo, delay) {
    if (motionQuery.matches || !logo) return;
    window.setTimeout(() => {
      logo.classList.remove("is-shining");
      // force reflow so the animation can restart
      void logo.offsetWidth;
      logo.classList.add("is-shining");
      const previous = sweepTimers.get(logo);
      if (previous) window.clearTimeout(previous);
      sweepTimers.set(logo, window.setTimeout(() => logo.classList.remove("is-shining"), 1200));
    }, delay || 0);
  }

  logos.forEach(logo => {
    logo.addEventListener("pointerenter", () => sweep(logo, 0));
    logo.addEventListener("focus", () => sweep(logo, 0));
  });

  const headerLogo = document.querySelector(".sp-header .sp-logo");
  if (headerLogo) sweep(headerLogo, 1100);

  const markStage = document.querySelector(".brand-mark-stage");
  if (markStage) {
    markStage.addEventListener("pointerenter", () => sweep(markStage, 0));
    sweep(markStage, 1800);
  }

  /* ---------- 3D tilt ---------- */
  const TILT_TARGETS = [
    { selector: ".sp-category-card", max: 7, lift: -6 },
    { selector: ".sp-portrait-wrap", max: 9, lift: 0 },
    { selector: ".sp-contents-grid", max: 2.6, lift: 0 },
    { selector: ".sp-logo", max: 14, lift: 0 },
    { selector: ".collection-card", max: 5.5, lift: -4 },
    { selector: ".brand-mark-stage", max: 12, lift: 0 }
  ];

  function bindTilt(element, options) {
    const max = options.max || 6;
    const lift = options.lift || 0;
    let frame = 0;
    let pending = null;
    let rect = null;

    function apply() {
      frame = 0;
      if (!pending) return;
      const { nx, ny } = pending;
      element.style.transform =
        "rotateX(" + (-ny * max).toFixed(2) + "deg) rotateY(" + (nx * max).toFixed(2) + "deg)" +
        (lift ? " translate3d(0," + lift + "px,0)" : "");
      element.style.setProperty("--mx", nx.toFixed(3));
      element.style.setProperty("--my", ny.toFixed(3));
    }

    function onEnter() {
      rect = element.getBoundingClientRect();
      element.classList.add("is-tilting");
    }

    function onMove(event) {
      if (!rect) rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pending = {
        nx: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1)),
        ny: Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1))
      };
      if (!frame) frame = window.requestAnimationFrame(apply);
    }

    function onLeave() {
      pending = null;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      rect = null;
      element.classList.remove("is-tilting");
      element.style.transform = "";
      element.style.setProperty("--mx", "0");
      element.style.setProperty("--my", "0");
    }

    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("pointercancel", onLeave);
    element.classList.add("sp-tilt");
  }

  function init() {
    if (motionQuery.matches || !pointerQuery.matches) return;
    TILT_TARGETS.forEach(target => {
      document.querySelectorAll(target.selector).forEach(element => {
        if (element.dataset.tiltBound === "1") return;
        element.dataset.tiltBound = "1";
        bindTilt(element, target);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  // Gallery pages build their cards after this script runs.
  document.addEventListener("soullit:gallery-ready", init);
  window.setTimeout(init, 1600);

  const onChange = () => {
    if (motionQuery.matches) return;
    document.querySelectorAll(".is-tilting").forEach(element => {
      element.classList.remove("is-tilting");
      element.style.transform = "";
    });
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onChange);
  else if (motionQuery.addListener) motionQuery.addListener(onChange);
})();
