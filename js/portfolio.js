/* Soullit mobile navigation */
(() => {
  const button = document.querySelector(".sp-menu");
  const nav = document.querySelector("#sp-nav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    button.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }));
})();