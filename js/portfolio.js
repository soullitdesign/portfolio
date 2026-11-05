/* Soullit: responsive navigation + accessible scroll reveal animations */
(() => {
  const button = document.querySelector(".sp-menu");
  const nav = document.querySelector("#sp-nav");
  if (button && nav) {
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      button.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }));
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;
  const revealTargets = document.querySelectorAll(
    ".sp-section, .sp-gallery-title, .sp-project, .sp-work-heading, .sp-tools, .sp-category-card"
  );
  if (!("IntersectionObserver" in window)) return;
  document.body.classList.add("js-enabled");
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  revealTargets.forEach((element, index) => {
    element.classList.add("sp-reveal");
    if (element.classList.contains("sp-project")) {
      element.style.transitionDelay = (index % 3) * 90 + "ms";
    }
    observer.observe(element);
  });
})();