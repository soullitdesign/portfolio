# SOULLIT DESIGN — Ajay Portfolio

Responsive cinematic editorial portfolio for graphic design, photography/DOP and UI/UX work.

## Structure
- `index.html` — homepage, Spider-Man hero cutout, 3D design objects, profile, selected work, journey and contact.
- `design.html` — graphic design gallery with real project images and click-to-enlarge preview.
- `photography.html` — photography collection.
- `ui-ux.html` — UI/UX collection.
- `Images/Hero/` — transparent WebP hero visual.
- `Images/Graphic design/` — optimised project artwork.
- `Images/Photography/` — photography images.
- `Images/UI ux designer/` — UI/UX preview image.
- `Images/Ajay.webp` — profile photograph.

## Deploy to GitHub Pages
1. Extract this ZIP.
2. Copy the contents (not the outer folder) into the root of `soullitdesign/portfolio`.
3. Commit and push to the branch configured in GitHub Pages (currently `main`).
4. Wait for the Pages workflow/build to finish.
5. Open `https://soullitdesign.github.io/portfolio/`.

All site assets use relative paths and the galleries load actual image files from the `Images` folders. No build step or npm install is required.

## 3D & brand system (2026 refresh)
- `js/hero-3d.js` — hand-written WebGL hero sculpture (trefoil ribbon, orbital rings, drifting particles). Reacts to pointer and scroll, pauses off-screen, renders a single static frame for reduced-motion users and removes itself when WebGL is unavailable.
- `js/depth-3d.js` — pointer-driven 3D tilt for the category cards, gallery cards, portrait, logo and the brand showcase, plus the logo light sweep. Disabled for touch-only devices and reduced-motion users.
- `css/style.css` → the `SOULLIT 3D SYSTEM` block: extruded logo lockup, 3D `PORTFOLIO` headline, card depth and spotlight, real rotating 3D cube, brand-page showcase.
- `Images/Brand/logo-mark.svg` — re-drawn vector SD monogram with a 3D extrusion (favicon), with `logo-mark-512.png` and `apple-touch-icon.png` raster copies. `Logo-SD.png` is kept for legacy use.
- The logo lives once per page as an inline SVG sprite (`#sdShape`, `#sdDepth`, `#sdFace`, `#sdSheen`) and is reused through `<use>` in the header and footer, so the mark stays crisp and the type lockup uses the live site fonts.
- Depth reveals: section headings swing up out of perspective, profile entries stagger in, and the logo flips into place in 3D on load.
- Brand watermarks: a faint, drifting 3D monogram sits behind the contact headline and in the collection headers on the gallery pages.
