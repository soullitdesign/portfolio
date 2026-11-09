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

  /* Reading progress — thin line pinned under the fixed header */
  const progress = document.createElement("div");
  progress.className = "sp-progress";
  progress.id = "sp-progress";
  progress.setAttribute("aria-hidden", "true");
  const progressFill = document.createElement("i");
  progress.append(progressFill);
  const siteHeader = document.querySelector(".sp-header");
  if (siteHeader && siteHeader.parentNode) siteHeader.parentNode.insertBefore(progress, siteHeader.nextSibling);
  else document.body.prepend(progress);

  let progressTick = false;
  const setProgress = () => {
    progressTick = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progressFill.style.width = (ratio * 100).toFixed(2) + "%";
  };
  const queueProgress = () => {
    if (progressTick) return;
    progressTick = true;
    window.requestAnimationFrame(setProgress);
  };
  window.addEventListener("scroll", queueProgress, { passive: true });
  window.addEventListener("resize", queueProgress, { passive: true });
  setProgress();

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