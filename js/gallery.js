(() => {
  const grid = document.querySelector('#collection-grid');
  const items = Array.isArray(window.collectionItems) ? window.collectionItems : [];
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const closeButton = lightbox?.querySelector('button');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('open', !isOpen);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open');
    }));
  }
  if (!grid) return;
  items.forEach((item, index) => {
    const card = document.createElement('article'); card.className = 'collection-card reveal';
    const image = document.createElement('img'); image.className = 'collection-card-image';
    image.src = item.image; image.alt = item.title || 'Portfolio artwork';
    image.loading = index < 4 ? 'eager' : 'lazy'; image.decoding = 'async';
    image.addEventListener('error', () => { card.classList.add('image-error'); image.alt = `Image unavailable: ${item.title || 'Artwork'}`; });
    const meta = document.createElement('div'); meta.className = 'collection-meta';
    const type = document.createElement('small'); type.textContent = `${String(index + 1).padStart(2, '0')} / ${item.type || 'PROJECT'}`;
    const title = document.createElement('h2'); title.textContent = item.title || 'Untitled';
    meta.append(type, title); card.append(image, meta); grid.append(card);
    image.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return; lightboxImage.src = item.image; lightboxImage.alt = item.title || 'Artwork preview';
      lightbox.classList.add('open'); document.body.style.overflow = 'hidden';
    });
  });
  const close = () => { lightbox?.classList.remove('open'); if (lightboxImage) lightboxImage.src = ''; document.body.style.overflow = ''; };
  closeButton?.addEventListener('click', close);
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, instance) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); instance.unobserve(entry.target); }
    }), { threshold: 0.08 });
    grid.querySelectorAll('.reveal').forEach(card => observer.observe(card));
  } else grid.querySelectorAll('.reveal').forEach(card => card.classList.add('is-visible'));
})();
