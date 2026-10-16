# DeadOrSupported
Tracks when gadgets lose software updates or cloud service. Static site built from `data/devices.json` by `node build.mjs` into `dist/`. It deploys to GitHub Pages through `.github/workflows/pages.yml` on every push to main, plus a daily rebuild.

Run `node check-dist.mjs` after the build. It checks every page in `dist/`: the head tags (title, description, canonical, Open Graph, Twitter card, icons), the GoatCounter tag before `</body>`, internal links, HTML structure, the own-product box and the Google verification file.

The brand kit (logo, icons, social images) is in `brand/`. See `brand/README.md`.
