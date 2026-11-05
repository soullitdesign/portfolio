/* Interactive motion: particles, scroll reveals, tilt and mobile navigation. */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("open");
      });
    });
  }

  // Reveal elements as they enter the viewport.
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Mouse tilt on the hero portrait.
  const heroPerson = document.querySelector("[data-tilt]");

  if (heroPerson && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelector(".hero").addEventListener("pointermove", (event) => {
      const bounds = heroPerson.getBoundingClientRect();
      const x = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
      const y = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height;
      heroPerson.style.transform = `translateX(-50%) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
    });

    document.querySelector(".hero").addEventListener("pointerleave", () => {
      heroPerson.style.transform = "translateX(-50%) rotateY(0deg) rotateX(0deg)";
    });
  }

  // Gentle floating movement for the two 3D graphic-design objects.
  document.querySelectorAll("[data-float]").forEach((object, index) => {
    if (!reduceMotion) {
      object.style.animationDelay = `${index * -1.8}s`;
    }
  });

  // Cursor-following ambient glow.
  const glow = document.querySelector(".cursor-glow");

  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
      document.body.classList.add("pointer-active");
    }, { passive: true });

    document.addEventListener("pointerleave", () => {
      document.body.classList.remove("pointer-active");
    });
  }

  // Lightweight canvas particles, no external library required.
  const canvas = document.querySelector("#particles");
  const context = canvas && canvas.getContext("2d");

  if (!canvas || !context || reduceMotion) return;

  let width = 0;
  let height = 0;
  let particles = [];
  const particleCount = window.innerWidth < 700 ? 32 : 68;

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.35,
      speed: Math.random() * 0.28 + 0.08,
      drift: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.45 + 0.12
    }));
  }

  function drawParticles() {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.y -= particle.speed;
      particle.x += particle.drift;

      if (particle.y < -5) {
        particle.y = height + 5;
        particle.x = Math.random() * width;
      }

      if (particle.x < -5) particle.x = width + 5;
      if (particle.x > width + 5) particle.x = -5;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(190, 174, 255, ${particle.alpha})`;
      context.fill();
    });

    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  drawParticles();
  window.addEventListener("resize", resizeCanvas);
})();
