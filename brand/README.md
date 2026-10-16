# DeadOrSupported brand kit

The mark is a heartbeat line that goes flat. The green part means "still gets updates". The red part means "support has ended".

## Palette

| Name | Hex | Use |
|---|---|---|
| Ink | `#142036` | Background of every graphic, the logo tile, text on light backgrounds |
| Pulse green | `#3FCA7D` | The live part of the mark; prices and highlights on Ink |
| Flatline red | `#FF6B5E` | The flat part of the mark only |

- Use white `#FFFFFF` for main text on Ink, and `#C5CFDF` for secondary text on Ink.
- On light backgrounds, the website draws the mark in darker tones (`#13804D` green, `#C7291F` red) to keep the contrast high enough.
- The status badges (Supported, Ending soon, Guarantee expired, Dead) have their own colours. Copy them from `src/brand.css` or the website CSS. Do not use them as brand colours.

## Font

One font: **DIN**, bold. It is a system font, so no web font is loaded.

- Apple devices: DIN Alternate Bold. The PNGs in this folder were rendered with it.
- Windows: Bahnschrift.
- Other systems fall back to Roboto Condensed or Arial Narrow.
- CSS stack: `Bahnschrift, "DIN Alternate", "DIN Next", "Roboto Condensed", sans-serif-condensed, "Arial Narrow", system-ui, sans-serif`

The website uses DIN for headings only. Body text on the website uses the system UI font.

## Files

| File | Size (px) | Where it is used |
|---|---|---|
| `logo.svg` | square, 512 viewBox | Master mark: the pulse on a rounded Ink tile. Use it for anything that needs a vector logo. |
| `logo-wordmark.svg` | 588 x 112 viewBox | Mark and name side by side, for light backgrounds. The name is live text in the DIN stack. |
| `logo-512.png` | 512 x 512 | PNG of `logo.svg`, transparent outside the tile. Also copied to the website root. |
| `favicon.svg` | 32 viewBox | Browser tab icon on the website. A bolder version of the mark for small sizes. |
| `favicon.ico` | 32 x 32 | Browser tab icon for older browsers. A real ICO file with one 32 x 32 image. |
| `apple-touch-icon.png` | 180 x 180 | Home-screen icon on iPhone and iPad. Square, no transparency; iOS rounds the corners. |
| `x-avatar.png` | 400 x 400 | X (Twitter) profile picture. The mark is centred, with about 15% space on the left and right, so a circle crop keeps it whole. |
| `x-banner.png` | 1500 x 500 | X header. All text is in the central band (y 70 to 430). The bottom-left, where the profile picture sits, has no text. |
| `og.png` | 1200 x 630, 84 KB | Default social card for every page (`og:image`, `twitter:image`). Also copied to the website root. |
| `gumroad-cover.png` | 1280 x 720 | Cover of the Safe to Buy Used? checklist on Gumroad. Shows real pages 1, 5 and 12 of the PDF. |
| `gumroad-thumb.png` | 600 x 600 | Square thumbnail of the checklist on Gumroad. |
| `beehiiv-logo.png` | 512 x 512 | Publication logo on beehiiv. Same artwork as the X profile picture. |
| `beehiiv-cover.png` | 1200 x 630 | Social card for the newsletter on beehiiv. |
| `og-template.html` | 1200 x 630 | Template for more social cards, for example one per article. Usage is in the comment at the top of the file. |
| `render.mjs` | | Renders all PNGs and `favicon.ico` from the sources. |
| `src/` | | Sources: `avatar.svg` (full-bleed square mark), `x-banner.html`, `gumroad-cover.html`, `icon.html` (renders an SVG at an exact size), and the shared `brand.css` and `brand.js`. |

The website build (`build.mjs`) copies `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `logo-512.png` and `og.png` to the root of the site.

## Render the PNGs again

1. Install Google Chrome and ImageMagick 7 (`magick`).
2. Make sure `_products/sample-preview-1.png`, `-2.png` and `-3.png` exist. The Gumroad images use them. They are not in git.
3. Run `node brand/render.mjs` from the repository root. To render only some files, add their names, for example `node brand/render.mjs og.png x-banner.png`.
4. Check the sizes that the script prints, and look at each image before you upload it.

To see the safe zones of the X banner, open `src/x-banner.html?guides=1` in Chrome.

## Rules

- Keep the colour order of the mark: green first, then red.
- Do not stretch, rotate or recolour the mark. Do not add shadows or outlines to it.
- Put the mark on Ink or on white. On white, use `logo.svg` (with its tile) or `logo-wordmark.svg`.
- Label the checklist as "Our own product" wherever it appears next to editorial content.
- Do not call the site or its data "official" or "always up to date". Each status links to its source; say that instead.
