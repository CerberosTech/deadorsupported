// Shared helpers for the brand templates: status chips and the pulse line.
// Status icon shapes match the website: circle+check, circle+clock, triangle+!, octagon+x.
const ICONS = {
  ok: '<circle cx="12" cy="12" r="11" fill="currentColor"/><path class="g" d="M7 12.4l3.3 3.3L17 9"/>',
  soon: '<circle cx="12" cy="12" r="11" fill="currentColor"/><path class="g" d="M12 6.6V12l3.6 2.3"/>',
  exp: '<path d="M12 2.6 22.6 21H1.4z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path class="g" d="M12 9v4.4"/><circle class="g" cx="12" cy="17.2" r=".3"/>',
  dead: '<path d="M7.75 1.75h8.5l6 6v8.5l-6 6h-8.5l-6-6v-8.5z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path class="g" d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8"/>',
};
const LABELS = { ok: 'Supported', soon: 'Ending soon', exp: 'Guarantee expired', dead: 'Dead' };
function chip(kind, label = LABELS[kind]) {
  return `<span class="chip ${kind}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[kind]}</svg>${label}</span>`;
}
// A heartbeat that goes flat. `lead` is the flat run before the spike, in px; the rest of `width` is the flatline.
// One stroke with a hard-stop gradient, so the colour change has no seam. `bleed` runs the line off both edges.
function pulse(width, { lead = 100, stroke = 4, scale = 1, bleed = false } = {}) {
  const s = scale, y = 22 * s, split = (lead + 87 * s) / width, from = bleed ? -2 * stroke : stroke, to = bleed ? width + 2 * stroke : width - stroke;
  const d = `M${from} ${y}H${lead}l${8 * s} ${-16 * s} ${12 * s} ${32 * s} ${10 * s} ${-26 * s} ${7 * s} ${10 * s}H${to}`;
  return `<svg class="pulse" width="${width}" height="${44 * s}" viewBox="0 0 ${width} ${44 * s}" aria-hidden="true">`
    + `<defs><linearGradient id="beat" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="0">`
    + `<stop offset="${split}" style="stop-color:var(--pulse)"/><stop offset="${split}" style="stop-color:var(--flat)"/></linearGradient></defs>`
    + `<path d="${d}" stroke="url(#beat)" style="stroke-width:${stroke}px"/></svg>`;
}
const params = new URLSearchParams(location.search);
