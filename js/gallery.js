/* Soullit gallery: crisp image rendering, fullscreen viewing and accessible controls */
(() => {
  const grid = document.querySelector('#collection-grid');
  const items = Array.isArray(window.collectionItems) ? window.collectionItems : [];
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
  const closeButton = lightbox?.querySelector('button');
  const menuToggle = document.querySelector(".sp-menu");
  const nav = document.querySelector('#sp-nav');
  let activeIndex = -1;
  let lastFocused = null;

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }));
  }
  if (!grid || !items.length) return;

  const grouped = new Map();
  items.forEach(item => {
    const groupName = item.group || 'Selected Work';
    if (!grouped.has(groupName)) grouped.set(groupName, []);
    grouped.get(groupName).push(item);
  });

  const jumpNav = document.createElement('nav');
  jumpNav.className = 'collection-jump';
  jumpNav.setAttribute('aria-label', 'Graphic design collections');

  let projectIndex = 0;
  let groupIndex = 0;
  const openPreview = (item, index, trigger) => {
    if (!lightbox || !lightboxImage) return;
    activeIndex = index;
    lastFocused = trigger || document.activeElement;
    lightboxImage.src = item.image;
    lightboxImage.alt = item.title || 'Portfolio artwork';
    lightboxImage.loading = 'eager';
    lightboxImage.decoding = 'async';
    lightboxImage.style.display = 'block';
    if (lightboxCaption) lightboxCaption.textContent = [item.title, item.type].filter(Boolean).join('  /  ');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
  };
  const closePreview = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImage) {
      lightboxImage.src = '';
      lightboxImage.style.display = 'block';
    }
    if (lightboxCaption) lightboxCaption.textContent = '';
    document.body.style.overflow = '';
    lastFocused?.focus?.();
    activeIndex = -1;
  };

  const previewNext = direction => {
    if (activeIndex < 0) return;
    const next = (activeIndex + direction + items.length) % items.length;
    openPreview(items[next], next, closeButton);
  };

  grouped.forEach((groupItems, groupName) => {
    const slug = groupName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const jump = document.createElement('a');
    jump.href = '#' + slug;
    jump.textContent = groupName;
    jumpNav.append(jump);

    const section = document.createElement('section');
    section.className = 'collection-category';
    section.id = slug;

    const heading = document.createElement('div');
    heading.className = 'collection-category-heading';
    const intro = document.createElement('div');
    intro.className = 'collection-category-intro';
    const indexLabel = document.createElement('small');
    indexLabel.textContent = 'COLLECTION / ' + String(groupIndex + 1).padStart(2, '0');
    const title = document.createElement('h2');
    title.textContent = groupName;
    const count = document.createElement('span');
    count.className = 'collection-category-count';
    count.textContent = String(groupItems.length).padStart(2, '0') + (groupItems.length === 1 ? ' PROJECT' : ' PROJECTS');
    intro.append(indexLabel, title);
    heading.append(intro, count);

    const groupGrid = document.createElement('div');
    groupGrid.className = 'collection-group-grid';

    groupItems.forEach(item => {
      const currentIndex = projectIndex++;
      const card = document.createElement('article');
      card.className = 'collection-card reveal';

      const image = document.createElement('img');
      image.className = 'collection-card-image';
      if (item.fit === 'poster') image.classList.add('poster-artwork');
      if (item.fit === 'contain') image.classList.add('logo-artwork');
      image.src = item.image;
      image.alt = item.title || 'Portfolio artwork';
      image.loading = currentIndex < 3 ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.fetchPriority = currentIndex < 3 ? 'high' : 'auto';
      image.addEventListener('error', () => {
        card.classList.add('image-error');
        image.alt = 'Image unavailable: ' + (item.title || 'Artwork');
      });

      const meta = document.createElement('div');
      meta.className = 'collection-meta';
      const type = document.createElement('small');
      type.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + (item.type || 'PROJECT');
      const name = document.createElement('h3');
      name.textContent = item.title || 'Untitled';
      meta.append(type, name);
      card.append(image, meta);
      groupGrid.append(card);

      image.addEventListener('click', () => openPreview(item, currentIndex, image));
      image.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPreview(item, currentIndex, image);
        }
      });
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', 'View ' + (item.title || 'artwork') + ' full screen');
    });

    section.append(heading, groupGrid);
    grid.append(section);
    groupIndex += 1;
  });

  grid.parentNode.insertBefore(jumpNav, grid);
  closeButton?.addEventListener('click', closePreview);
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) closePreview();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox?.classList.contains('open')) return;
    if (event.key === 'Escape') closePreview();
    if (event.key === 'ArrowRight') previewNext(1);
    if (event.key === 'ArrowLeft') previewNext(-1);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    grid.querySelectorAll('.reveal').forEach(card => observer.observe(card));
  } else {
    grid.querySelectorAll('.reveal').forEach(card => card.classList.add('is-visible'));
  }
})();