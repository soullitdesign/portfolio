/* Soullit gallery: automatically discovers new images added to its matching Images folder. */
(() => {
  const init = async () => {
    const grid = document.querySelector('#collection-grid');
    if (!grid) return;

    const items = Array.isArray(window.collectionItems) ? [...window.collectionItems] : [];
    const folder = grid.dataset.imageFolder || '';
    const known = new Set(items.map(item => String(item.image || '').toLowerCase()));

    // GitHub Pages is static, so discover newly uploaded assets from the public repository tree.
    // Existing curated entries keep their titles, types, groups and display settings.
    if (folder) {
      try {
        const response = await Promise.race([fetch('https://api.github.com/repos/soullitdesign/portfolio/git/trees/main?recursive=1', {
          headers: { Accept: 'application/vnd.github+json' },
          cache: 'force-cache'
        }), new Promise((_, reject) => setTimeout(() => reject(new Error('Image index request timed out')), 700))]);
        if (!response.ok) throw new Error('Image index unavailable');
        const tree = await response.json();
        const prefix = folder.replace(/\/$/, '') + '/';
        const extensions = /\.(avif|gif|jpe?g|png|webp)$/i;
        tree.tree.filter(entry => entry.type === 'blob' && entry.path.startsWith(prefix) && extensions.test(entry.path))
          .forEach(entry => {
            const imagePath = entry.path;
            if (known.has(imagePath.toLowerCase())) return;
            const relative = imagePath.slice(prefix.length);
            const parts = relative.split('/');
            const filename = parts.pop().replace(/\.[^.]+$/, '');
            const title = filename.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
              .replace(/\b\w/g, letter => letter.toUpperCase()) || 'New Project';
            const group = parts.length
              ? parts[0].replace(/[_-]+/g, ' ').replace(/\\b\\w/g, letter => letter.toUpperCase())
              : (folder.toLowerCase().includes('photography') ? 'Photography / DOP' : 'Newly Added Work');
            items.push({
              title,
              type: folder.toLowerCase().includes('photography') ? 'Photography / DOP' : 'New addition',
              image: imagePath,
              group,
              fit: 'poster'
            });
            known.add(imagePath.toLowerCase());
          });
      } catch (error) {
        console.warn('Soullit: automatic image discovery unavailable; showing saved gallery items.', error);
      }
    }

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
    if (!items.length) return;

    const grouped = new Map();
    items.forEach(item => {
      const groupName = item.group || 'Selected Work';
      if (!grouped.has(groupName)) grouped.set(groupName, []);
      grouped.get(groupName).push(item);
    });

    const jumpNav = document.createElement('nav');
    jumpNav.className = 'collection-jump';
    jumpNav.setAttribute('aria-label', 'Gallery collections');

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
      document.body.classList.add('gallery-preview-open');
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton?.focus();
    };
    const previousButton = document.createElement('button');
    previousButton.type = 'button';
    previousButton.className = 'lightbox-nav lightbox-prev';
    previousButton.setAttribute('aria-label', 'Previous image');
    previousButton.innerHTML = '<span aria-hidden="true">‹</span>';
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'lightbox-nav lightbox-next';
    nextButton.setAttribute('aria-label', 'Next image');
    nextButton.innerHTML = '<span aria-hidden="true">›</span>';
    if (lightbox) lightbox.append(previousButton, nextButton);

    const closePreview = () => {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      document.body.classList.remove('gallery-preview-open');
      lightbox.setAttribute('aria-hidden', 'true');
      if (lightboxImage) lightboxImage.src = '';
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
        image.loading = currentIndex < 2 ? 'eager' : 'lazy';
        image.decoding = 'async';
        image.fetchPriority = currentIndex < 2 ? 'high' : 'auto';
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
        image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.setAttribute('aria-label', 'View ' + (item.title || 'artwork') + ' full screen');
        image.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPreview(item, currentIndex, image);
          }
        });
      });
      section.append(heading, groupGrid);
      grid.append(section);
      groupIndex += 1;
    });

    grid.parentNode.insertBefore(jumpNav, grid);
    closeButton?.addEventListener('click', closePreview);
    previousButton.addEventListener('click', () => previewNext(-1));
    nextButton.addEventListener('click', () => previewNext(1));
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
  };

  init();
})();