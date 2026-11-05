(() => {
  const grid = document.querySelector('#collection-grid');
  const items = Array.isArray(window.collectionItems) ? window.collectionItems : [];
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const closeButton = lightbox?.querySelector('button');
  const menuToggle = document.querySelector(".sp-menu");
  const nav = document.querySelector('#sp-nav');

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
    const name = item.group || 'Selected Work';
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name).push(item);
  });

  const jumpNav = document.createElement('nav');
  jumpNav.className = 'collection-jump';
  jumpNav.setAttribute('aria-label', 'Graphic design collections');

  let globalIndex = 0;
  let groupIndex = 0;
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

    const index = document.createElement('small');
    index.textContent = 'COLLECTION / ' + String(groupIndex + 1).padStart(2, '0');

    const title = document.createElement('h2');
    title.textContent = groupName;

    const count = document.createElement('span');
    count.className = 'collection-category-count';
    count.textContent = String(groupItems.length).padStart(2, '0') + (groupItems.length === 1 ? ' PROJECT' : ' PROJECTS');

    intro.append(index, title);
    heading.append(intro, count);

    const groupGrid = document.createElement('div');
    groupGrid.className = 'collection-group-grid';

    groupItems.forEach(item => {
      globalIndex += 1;
      const card = document.createElement('article');
      card.className = 'collection-card reveal';

      const image = document.createElement('img');
      image.className = 'collection-card-image';
      if (item.fit === 'poster') image.classList.add('poster-artwork');
      if (item.fit === 'contain') image.classList.add('logo-artwork');
      image.src = item.image;
      image.alt = item.title || 'Portfolio artwork';
      image.loading = globalIndex <= 3 ? 'eager' : 'lazy';
      image.decoding = 'async';

      image.addEventListener('error', () => {
        card.classList.add('image-error');
        image.alt = 'Image unavailable: ' + (item.title || 'Artwork');
      });

      const meta = document.createElement('div');
      meta.className = 'collection-meta';
      const type = document.createElement('small');
      type.textContent = String(globalIndex).padStart(2, '0') + ' / ' + (item.type || 'PROJECT');
      const name = document.createElement('h3');
      name.textContent = item.title || 'Untitled';
      meta.append(type, name);
      card.append(image, meta);
      groupGrid.append(card);

      image.addEventListener('click', () => {
        if (!lightbox || !lightboxImage) return;
        lightboxImage.src = item.image;
        lightboxImage.alt = item.title || 'Artwork preview';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    section.append(heading, groupGrid);
    grid.append(section);
    groupIndex += 1;
  });

  grid.parentNode.insertBefore(jumpNav, grid);

  const close = () => {
    lightbox?.classList.remove('open');
    if (lightboxImage) lightboxImage.src = '';
    document.body.style.overflow = '';
  };
  closeButton?.addEventListener('click', close);
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
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