# SOULLIT DESIGN — Ajay's Portfolio

A responsive, animated dark editorial portfolio for graphic design, photography/DOP and UI/UX work.

## Included
- `index.html` — homepage with cinematic portrait hero, two floating 3D design objects, animated particles, about, services, work, experience, education and contact.
- `design.html` — graphic design gallery with click-to-enlarge previews.
- `photography.html` — photography gallery.
- `ui-ux.html` — UI/UX gallery.
- `css/style.css` — all styling, responsive layouts and CSS 3D objects.
- `js/main.js` — scroll reveals, portrait tilt, particles, cursor glow and mobile navigation.
- `js/gallery.js` — gallery rendering and lightbox.
- `Images/` — optimized WebP portfolio images and sample hero portrait.

## Replace the sample hero portrait
The homepage currently uses `Images/hero-sample-portrait.png` as a temporary sample portrait.
When you are ready, add your own cutout/transparent portrait to `Images/` and change this line in `index.html`:

```html
<img src="Images/hero-sample-portrait.png"
     alt="Temporary sample portrait — replace with your own photograph"
     class="hero-portrait">
```

Replace the `src` with your own image path and update the alt text.

The About section currently uses `Images/Ajay.webp`. You can replace that image too if you want a different profile photograph.

## Update work images
The project files are stored in:
- `Images/Graphic design/`
- `Images/Photography/`
- `Images/UI ux designer/`

To add a project, copy its WebP/JPG/PNG file into the relevant folder and edit the `window.collectionItems` array near the bottom of its gallery page. The homepage preview images are set directly in `index.html`.

## Publish on GitHub Pages
1. Back up your current repository.
2. Extract this ZIP.
3. Upload **the contents of this folder** to the root of `soullitdesign/portfolio` (not the ZIP itself and not an extra nested folder).
4. Commit the files to the branch configured in Settings → Pages.
5. Wait for Actions → Pages build and deployment to complete.
6. Open: https://soullitdesign.github.io/portfolio/

All links and asset paths are relative, so the site works from the `/portfolio/` project path.

## Notes
- The site uses plain HTML, CSS and JavaScript. No npm install or build step is needed.
- Google Fonts are loaded from Google Fonts; if unavailable, the site falls back to system sans-serif.
- Motion respects `prefers-reduced-motion`.
- Replace the sample hero portrait with your own image before treating the portfolio as final.
