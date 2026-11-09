/* Soullit — hero 3D sculpture.
   A hand-written WebGL scene (no libraries): a glowing trefoil ribbon, three
   orbiting rings and a drifting particle field, reacting to pointer + scroll.
   Everything degrades gracefully: no WebGL → the CSS hero art simply remains. */
(() => {
  "use strict";

  const STRIDE = 7; // x, y, r, g, b, a, size

  const VS = [
    "attribute vec2 aPos;",
    "attribute vec3 aColor;",
    "attribute float aAlpha;",
    "attribute float aSize;",
    "uniform vec2 uResolution;",
    "varying vec3 vColor;",
    "varying float vAlpha;",
    "void main() {",
    "  vec2 clip = (aPos / uResolution) * 2.0 - 1.0;",
    "  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);",
    "  gl_PointSize = aSize;",
    "  vColor = aColor;",
    "  vAlpha = aAlpha;",
    "}"
  ].join("\n");

  const FS = [
    "precision mediump float;",
    "varying vec3 vColor;",
    "varying float vAlpha;",
    "void main() {",
    "  gl_FragColor = vec4(vColor * vAlpha, vAlpha);",
    "}"
  ].join("\n");

  /* ---------- pure scene maths (unit-testable) ---------- */

  const TAU = Math.PI * 2;

  function makeKnot(segments) {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * TAU;
      pts.push([
        (Math.sin(t) + 2 * Math.sin(2 * t)) * 0.33,
        (Math.cos(t) - 2 * Math.cos(2 * t)) * 0.33,
        (-Math.sin(3 * t)) * 0.36
      ]);
    }
    return pts;
  }

  function makeRing(segments, radius) {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * TAU;
      pts.push([Math.cos(t) * radius, Math.sin(t) * radius, 0]);
    }
    return pts;
  }

  function rotX(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
  }

  function rotY(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  }

  function rotZ(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
  }

  function project(p, view) {
    const depth = p[2] + view.camZ; // world units in front of the camera
    if (depth <= 0.35) return null;
    const k = (view.focal / depth) * view.unit; // pixels per world unit
    return [view.cx + p[0] * k, view.cy - p[1] * k, depth];
  }

  function alphaForDepth(depth, camZ) {
    const t = (depth - (camZ - 1.7)) / 3.4; // 0 near, 1 far
    return Math.max(0.05, Math.min(1, 1.05 - t * 0.78));
  }

  /* ---------- mount ---------- */

  const state = {
    gl: null,
    program: null,
    buffer: null,
    loc: {},
    canvas: null,
    hero: null,
    w: 0,
    h: 0,
    dpr: 1,
    unit: 1,
    cx: 0,
    cy: 0,
    camZ: 3.9,
    focal: 2.6,
    data: null,
    knot: null,
    rings: [],
    particles: [],
    nodes: [],
    raf: 0,
    running: false,
    visible: true,
    time: 0,
    pointer: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    scroll: 0
  };

  function compile(gl, type, src) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      if (window.console) console.warn("Soullit hero 3D:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function initGL(gl) {
    const vs = compile(gl, gl.VERTEX_SHADER, VS);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return false;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (window.console) console.warn("Soullit hero 3D:", gl.getProgramInfoLog(program));
      return false;
    }
    gl.useProgram(program);
    state.program = program;
    state.loc = {
      aPos: gl.getAttribLocation(program, "aPos"),
      aColor: gl.getAttribLocation(program, "aColor"),
      aAlpha: gl.getAttribLocation(program, "aAlpha"),
      aSize: gl.getAttribLocation(program, "aSize"),
      uResolution: gl.getUniformLocation(program, "uResolution")
    };
    state.buffer = gl.createBuffer();
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    return true;
  }

  function buildScene() {
    const compact = Math.min(window.innerWidth, window.innerHeight) < 640;
    const knotSegments = compact ? 240 : 420;
    const ringSegments = compact ? 64 : 108;

    state.knot = makeKnot(knotSegments);
    state.rings = [
      { pts: makeRing(ringSegments, 1.32), tiltX: 1.15, tiltY: 0.2, speed: 0.16, color: [0.95, 0.22, 0.28], alpha: 0.5 },
      { pts: makeRing(ringSegments, 1.62), tiltX: -0.62, tiltY: 0.85, speed: -0.11, color: [0.85, 0.16, 0.22], alpha: 0.34 },
      { pts: makeRing(ringSegments, 1.02), tiltX: 2.1, tiltY: -0.4, speed: 0.22, color: [1.0, 0.42, 0.46], alpha: 0.3 }
    ].filter(ring => ring.pts.length);

    const particleCount = compact ? 90 : 170;
    state.particles = [];
    for (let i = 0; i < particleCount; i++) {
      state.particles.push({
        p: [(Math.random() - 0.5) * 4.4, (Math.random() - 0.5) * 3.2, (Math.random() - 0.5) * 3.4],
        drift: 0.04 + Math.random() * 0.09,
        size: 0.7 + Math.random() * 1.9,
        phase: Math.random() * TAU,
        color: Math.random() < 0.35 ? [1, 0.72, 0.76] : [1, 0.42, 0.48]
      });
    }

    state.nodes = [];
    const nodeCount = compact ? 14 : 26;
    for (let i = 0; i < nodeCount; i++) {
      state.nodes.push({ index: Math.round((i / nodeCount) * (state.knot.length - 1)) });
    }

    const maxVerts = (state.knot.length - 1) * 2 +
      state.rings.reduce((sum, ring) => sum + (ring.pts.length - 1) * 2, 0) +
      state.nodes.length + state.particles.length + 8;
    state.data = new Float32Array(maxVerts * STRIDE);
  }

  function resize() {
    const hero = state.hero;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const w = Math.max(320, Math.round(rect.width));
    const h = Math.max(320, Math.round(rect.height));
    state.dpr = Math.min(window.devicePixelRatio || 1, w < 700 ? 1.5 : 1.9);
    state.w = w;
    state.h = h;
    state.canvas.width = Math.round(w * state.dpr);
    state.canvas.height = Math.round(h * state.dpr);
    state.canvas.style.width = w + "px";
    state.canvas.style.height = h + "px";
    state.gl.viewport(0, 0, state.canvas.width, state.canvas.height);
    state.unit = Math.min(w * 0.7, h) * 0.5;
    state.cx = w * 0.5;
    state.cy = h * 0.46;
    render(performance.now());
  }

  function pushVertex(i, x, y, color, alpha, size) {
    const d = state.data;
    const offset = i * STRIDE;
    d[offset] = x;
    d[offset + 1] = y;
    d[offset + 2] = color[0];
    d[offset + 3] = color[1];
    d[offset + 4] = color[2];
    d[offset + 5] = alpha;
    d[offset + 6] = size;
  }

  function render(now) {
    const gl = state.gl;
    if (!gl || !state.program) return;
    const t = now * 0.001;
    state.time = t;

    const ease = 0.055;
    state.pointer.x += (state.target.x - state.pointer.x) * ease;
    state.pointer.y += (state.target.y - state.pointer.y) * ease;

    const yaw = t * 0.16 + state.pointer.x * 0.42;
    const pitch = -0.28 + Math.sin(t * 0.23) * 0.1 + state.pointer.y * 0.28 + state.scroll * 0.22;

    const view = {
      unit: state.unit,
      cx: state.cx,
      cy: state.cy,
      camZ: state.camZ,
      focal: state.focal
    };

    let v = 0;
    const knotColor = [1, 0.34, 0.4];
    const glowColor = [1, 0.16, 0.22];

    // ribbon
    const knot = state.knot;
    for (let i = 0; i < knot.length - 1; i++) {
      const a = rotX(rotY(knot[i], yaw), pitch);
      const b = rotX(rotY(knot[i + 1], yaw), pitch);
      const pa = project(a, view);
      const pb = project(b, view);
      if (!pa || !pb) continue;
      const mix = 0.55 + 0.45 * Math.sin((i / knot.length) * TAU + t * 0.8);
      const c = [knotColor[0], knotColor[1] + 0.28 * mix, knotColor[2] + 0.3 * mix];
      const aa = alphaForDepth((pa[2] + pb[2]) * 0.5, view.camZ) * 0.66;
      pushVertex(v++, pa[0], pa[1], c, aa, 1);
      pushVertex(v++, pb[0], pb[1], glowColor, aa * 0.85, 1);
    }
    const lineVerts = v;

    // rings
    state.rings.forEach((ring, index) => {
      const spin = t * ring.speed + index * 1.7;
      let prev = null;
      for (let i = 0; i < ring.pts.length; i++) {
        let p = rotZ(ring.pts[i], spin);
        p = rotX(p, ring.tiltX);
        p = rotY(p, ring.tiltY + Math.sin(t * 0.2 + index) * 0.12);
        const q = project(p, view);
        if (prev && q) {
          const alpha = alphaForDepth((prev[2] + q[2]) * 0.5, view.camZ) * ring.alpha;
          pushVertex(v++, prev[0], prev[1], ring.color, alpha, 1);
          pushVertex(v++, q[0], q[1], ring.color, alpha, 1);
        }
        prev = q;
      }
    });
    const totalLineVerts = v;

    // ribbon nodes
    state.nodes.forEach((node, index) => {
      const p = rotX(rotY(knot[node.index], yaw), pitch);
      const q = project(p, view);
      if (!q) return;
      const pulse = 0.55 + 0.45 * Math.sin(t * 1.6 + index);
      const alpha = alphaForDepth(q[2], view.camZ) * (0.5 + pulse * 0.5);
      const size = (1.6 + pulse * 2.6) * state.dpr;
      pushVertex(v++, q[0], q[1], [1, 0.86, 0.88], alpha, size);
    });

    // particle field
    const spread = [4.6, 3.4, 3.6];
    state.particles.forEach(particle => {
      particle.p[2] += particle.drift * 0.01;
      if (particle.p[2] > spread[2] * 0.5) particle.p[2] -= spread[2];
      let p = [particle.p[0], particle.p[1], particle.p[2]];
      p = rotY(p, yaw * 0.55);
      p = rotX(p, pitch * 0.6);
      const q = project(p, view);
      if (!q) return;
      const twinkle = 0.5 + 0.5 * Math.sin(t * 0.9 + particle.phase);
      const alpha = alphaForDepth(q[2], view.camZ) * 0.4 * twinkle;
      pushVertex(v++, q[0], q[1], particle.color, alpha, particle.size * state.dpr);
    });

    const total = v;
    // reset additive canvas each frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, state.data.subarray(0, total * STRIDE), gl.DYNAMIC_DRAW);

    const { aPos, aColor, aAlpha, aSize, uResolution } = state.loc;
    const bytes = STRIDE * 4;
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, bytes, 0);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, bytes, 8);
    gl.enableVertexAttribArray(aAlpha);
    gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, bytes, 20);
    gl.enableVertexAttribArray(aSize);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, bytes, 24);
    gl.uniform2f(uResolution, state.w, state.h);

    if (lineVerts > 0) gl.drawArrays(gl.LINES, 0, lineVerts);
    if (totalLineVerts > lineVerts) gl.drawArrays(gl.LINES, lineVerts, totalLineVerts - lineVerts);
    if (total > totalLineVerts) gl.drawArrays(gl.POINTS, totalLineVerts, total - totalLineVerts);
  }

  function loop(now) {
    if (!state.running) return;
    render(now);
    state.raf = window.requestAnimationFrame(loop);
  }

  function start() {
    if (state.running || !state.gl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(1200);
      return;
    }
    state.running = true;
    state.raf = window.requestAnimationFrame(loop);
  }

  function stop() {
    state.running = false;
    if (state.raf) window.cancelAnimationFrame(state.raf);
    state.raf = 0;
  }

  function mount() {
    const hero = document.querySelector(".sp-hero");
    if (!hero) return;
    state.hero = hero;

    const canvas = document.createElement("canvas");
    canvas.className = "sp-hero-fx";
    canvas.setAttribute("aria-hidden", "true");
    hero.prepend(canvas);

    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, depth: false, premultipliedAlpha: true, powerPreference: "low-power" }) ||
      canvas.getContext("experimental-webgl", { alpha: true, antialias: true });
    if (!gl) {
      canvas.remove();
      return;
    }
    state.canvas = canvas;
    state.gl = gl;
    if (!initGL(gl)) {
      canvas.remove();
      return;
    }
    buildScene();
    resize();
    hero.classList.add("has-hero-3d");
    start();

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        buildScene();
        resize();
      }, 180);
    }, { passive: true });

    window.addEventListener("pointermove", event => {
      state.target.x = (event.clientX / window.innerWidth - 0.5) * 2;
      state.target.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      state.target.x = 0;
      state.target.y = 0;
    }, { passive: true });

    window.addEventListener("scroll", () => {
      const rect = hero.getBoundingClientRect();
      state.scroll = Math.max(-1, Math.min(1, -rect.top / Math.max(1, rect.height)));
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          state.visible = entry.isIntersecting;
          if (state.visible) start();
          else stop();
        });
      }, { threshold: 0.02 });
      observer.observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (state.visible) start();
    });

    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      stop();
      canvas.remove();
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
  }

  // exposed for tests / debugging
  const api = { makeKnot, makeRing, rotX, rotY, rotZ, project, alphaForDepth, VS, FS };
  if (typeof module === "object" && module.exports) module.exports = api;
  else if (typeof window !== "undefined") window.SoullitHero3D = api;
})();
