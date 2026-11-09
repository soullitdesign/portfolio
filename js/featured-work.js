/* Soullit — homepage featured work.
   Turns each selected piece into an in-page preview with keyboard support.
   Without JS every piece still opens the full artwork (plain link fallback). */
(() => {
  "use strict";

  const grid = document.querySelector(".sp-featured-grid");
  const lightbox = document.querySelector(".lightbox");
  if (!grid || !lightbox) return;

  const pieces = Array.from(grid.querySelectorAll(".sp-piece"));
  if (!pieces.length) return;

  const image = lightbox.querySelector("img");
  const caption = lightbox.querySelector(".lightbox-caption");
  const closeButton = lightbox.querySelector('button[aria-label="Close preview"]');
  if (!image || !closeButton) return;

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "lightbox-nav lightbox-prev";
  previousButton.setAttribute("aria-label", "Previous artwork");
  previousButton.innerHTML = '<span aria-hidden="true">‹</span>';

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "lightbox-nav lightbox-next";
  nextButton.setAttribute("aria-label", "Next artwork");
  nextButton.innerHTML = '<span aria-hidden="true">›</span>';

  lightbox.append(previousButton, nextButton);

  const items = pieces.map(piece => {
    const img = piece.querySelector("img");
    return {
      src: piece.getAttribute("href"),
      title: piece.dataset.title || (img ? img.alt : ""),
      type: piece.dataset.type || "",
      alt: img ? img.alt : ""
    };
  });

  let active = -1;
  let lastFocused = null;

  const pad = value => String(value).padStart(2, "0");

  function show(index) {
    active = (index + items.length) % items.length;
    const item = items[active];
    if (!item) return;
    image.src = item.src;
    image.alt = item.alt || item.title;
    if (caption) {
      caption.textContent = item.title +
        (item.type ? "  —  " + item.type : "") +
        "   ·   " + pad(active + 1) + " / " + pad(items.length);
    }
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-preview-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-preview-open");
    document.body.style.overflow = "";
    image.removeAttribute("src");
    if (caption) caption.textContent = "";
    active = -1;
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function step(direction) {
    if (active >= 0) show(active + direction);
  }

  pieces.forEach((piece, index) => {
    piece.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (event.button && event.button !== 0)) return;
      event.preventDefault();
      lastFocused = piece;
      show(index);
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", close);
  previousButton.addEventListener("click", event => {
    event.stopPropagation();
    step(-1);
  });
  nextButton.addEventListener("click", event => {
    event.stopPropagation();
    step(1);
  });
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  });
})();
