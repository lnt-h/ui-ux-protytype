'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'prototype', 'assets', 'brand');
fs.mkdirSync(out, { recursive: true });

const color = {
  ocean: '#0B3045',
  teal: '#0B8EA8',
  sun: '#F6A623',
  sky: '#F0F9FF',
  white: '#FFFFFF',
  black: '#000000',
};

const svgOpen = (width, height, viewBox = `0 0 ${width} ${height}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" role="img">`;
const meta = (title, description) => `<title>${title}</title><desc>${description}</desc>`;

/*
 * Production geometry.
 *
 * The wordmark is drawn with one 26-unit rounded stroke system. Optical gaps
 * between adjacent visible bounds are 14–15 units for o/n, n/a, a/r, r/r and
 * r/a. That becomes roughly one full device pixel at the 60 px minimum width,
 * which prevents the old n/a and r/r joins from collapsing together.
 */
function gMark(base = color.ocean, dot = color.sun, optimized = false) {
  const stroke = optimized ? 28 : 26;
  const radius = optimized ? 40 : 39;
  const dotRadius = optimized ? 13 : 11.5;
  return `<g id="gonarra-g" fill="none" stroke="${base}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="72" cy="73" r="${radius}"/>
    <path d="M110 49V122C110 151 93 171 67 171C48 171 34 165 22 154"/>
  </g><circle id="gonarra-sun" cx="139" cy="17" r="${dotRadius}" fill="${dot}"/>`;
}

function wordmark(mode = 'color') {
  let first = color.ocean;
  let second = 'url(#gonarra-gradient)';
  let dot = color.sun;
  if (mode === 'reverse') first = second = color.white;
  if (mode === 'mono') first = second = dot = color.ocean;
  if (mode === 'mono-white') first = second = dot = color.white;

  return `<defs><linearGradient id="gonarra-gradient" x1="385" y1="0" x2="790" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color.ocean}"/><stop offset="1" stop-color="${color.teal}"/></linearGradient></defs>
  <g id="letter-g" transform="translate(8 0)">${gMark(first, dot)}</g>
  <g id="letters-go-n" fill="none" stroke="${first}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round">
    <circle id="letter-o" cx="212" cy="82" r="38"/>
    <path id="letter-n" d="M291 128V54M291 84C291 61 307 49 329 49C348 49 359 63 359 85V128"/>
  </g>
  <g id="letters-arra" fill="none" stroke="${second}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round">
    <circle id="letter-a-1" cx="437" cy="84" r="38"/><path d="M475 51V128"/>
    <path id="letter-r-1" d="M516 128V54M516 83C516 61 532 49 550 49C558 49 564 51 568 54"/>
    <path id="letter-r-2" d="M609 128V54M609 83C609 61 625 49 643 49C651 49 657 51 661 54"/>
    <circle id="letter-a-2" cx="738" cy="84" r="38"/><path d="M776 51V128"/>
  </g>`;
}

const glyphs = {
  E: 'M0 0H64V16H18V40H58V56H18V84H66V100H0Z',
  X: 'M0 0H21L42 34L63 0H84L53 50L84 100H63L42 66L21 100H0L31 50Z',
  P: 'M0 0H39C62 0 76 13 76 34C76 56 61 69 38 69H19V100H0ZM19 16V53H37C50 53 57 46 57 34C57 22 50 16 37 16Z',
  L: 'M0 0H19V83H65V100H0Z',
  O: 'M42 0C69 0 84 20 84 50C84 80 69 100 42 100C15 100 0 80 0 50C0 20 15 0 42 0ZM42 17C27 17 20 29 20 50C20 71 27 83 42 83C57 83 64 71 64 50C64 29 57 17 42 17Z',
  R: 'M0 0H40C63 0 76 13 76 34C76 49 68 60 56 65L80 100H57L37 69H19V100H0ZM19 16V53H38C50 53 57 46 57 34C57 22 50 16 38 16Z',
  A: 'M31 0H54L88 100H67L60 78H24L17 100H-4ZM29 62H55L42 21Z',
  N: 'M0 0H20L63 69V0H82V100H62L19 31V100H0Z',
  C: 'M83 23L66 32C61 22 53 17 42 17C27 17 19 29 19 50C19 71 27 83 42 83C54 83 62 77 67 66L84 74C76 92 62 100 42 100C15 100 0 80 0 50C0 20 15 0 42 0C61 0 76 8 83 23Z',
  I: 'M0 0H20V100H0Z',
};
const advances = { I: 35, L: 72, E: 73, P: 82, R: 86, O: 90, X: 90, A: 92, N: 90, C: 91 };

function tagline(text = 'EXPLORE · PLAN · EXPERIENCE', width = 465, y = 223, fill = color.ocean) {
  let raw = 0;
  for (const char of text) raw += char === ' ' ? 34 : char === '·' ? 42 : (advances[char] || 82);
  const scale = width / raw;
  let x = (800 - width) / 2;
  const paths = [];
  for (const char of text) {
    if (char === ' ') { x += 34 * scale; continue; }
    if (char === '·') {
      paths.push(`<circle cx="${(x + 14 * scale).toFixed(3)}" cy="${(y - 49 * scale).toFixed(3)}" r="${(5.5 * scale).toFixed(3)}" fill="${fill}"/>`);
      x += 42 * scale;
      continue;
    }
    paths.push(`<path d="${glyphs[char]}" transform="translate(${x.toFixed(3)} ${(y - 100 * scale).toFixed(3)}) scale(${scale.toFixed(5)})" fill="${fill}" fill-rule="evenodd"/>`);
    x += (advances[char] || 82) * scale;
  }
  return `<g id="gonarra-tagline" aria-label="${text}">${paths.join('')}</g>`;
}

function wordmarkSvg(mode = 'color', withTagline = false) {
  const height = withTagline ? 240 : 190;
  const taglineFill = mode === 'reverse' || mode === 'mono-white' ? color.white : color.ocean;
  return `${svgOpen(800, height)}${meta('Gonarra wordmark', 'Hand-authored Gonarra vector wordmark with optically balanced character spacing.')}${wordmark(mode)}${withTagline ? tagline(undefined, 465, 223, taglineFill) : ''}</svg>`;
}

function markSvg(reverse = false) {
  const base = reverse ? color.white : color.ocean;
  return `${svgOpen(512, 512)}${meta('Gonarra g mark', 'The standalone Gonarra g mark uses the exact same geometry as the wordmark.')}<g transform="translate(52 36) scale(2.55)">${gMark(base, color.sun, true)}</g></svg>`;
}

function appIconSvg() {
  return `${svgOpen(1024, 1024)}${meta('Gonarra app icon', 'Opaque square source. Platform tooling applies the final corner mask.')}<rect width="1024" height="1024" fill="${color.ocean}"/><g transform="translate(186 174) scale(3.65)">${gMark(color.white, color.sun)}</g></svg>`;
}

function masterSheetSvg() {
  return `${svgOpen(1600, 900)}${meta('Gonarra logo master sheet', 'Figma-compatible master sheet with production variants and kerning notes.')}
    <rect width="1600" height="900" fill="${color.sky}"/>
    <g id="frame-primary" transform="translate(90 110) scale(1.25)">${wordmark('color')}</g>
    <rect x="80" y="380" width="920" height="300" rx="28" fill="${color.ocean}"/>
    <g id="frame-reverse" transform="translate(120 435) scale(1.05)">${wordmark('reverse')}</g>
    <rect x="1070" y="100" width="390" height="390" rx="36" fill="${color.white}"/>
    <g id="frame-mark" transform="translate(1150 150) scale(1.75)">${gMark(color.ocean, color.sun, true)}</g>
    <rect x="1070" y="530" width="390" height="260" rx="36" fill="${color.white}"/>
    <text x="1115" y="585" fill="${color.ocean}" font-family="Nunito, Arial, sans-serif" font-size="28" font-weight="700">OPTICAL KERNING</text>
    <text x="1115" y="635" fill="#496575" font-family="Nunito, Arial, sans-serif" font-size="21">o/n 15 · n/a 14 · a/r 14</text>
    <text x="1115" y="672" fill="#496575" font-family="Nunito, Arial, sans-serif" font-size="21">r/r 14 · r/a 14 units</text>
    <text x="1115" y="725" fill="#496575" font-family="Nunito, Arial, sans-serif" font-size="18">Min wordmark width 60 px</text>
    <text x="1115" y="755" fill="#496575" font-family="Nunito, Arial, sans-serif" font-size="18">Do not add CSS letter-spacing</text>
  </svg>`;
}

const assets = {
  primary: {
    label: 'Primary wordmark',
    note: 'Default on white or Sky.',
    file: 'gonarra-wordmark-color.svg',
    background: 'light',
    svg: wordmarkSvg('color'),
  },
  tagline: {
    label: 'Primary + tagline',
    note: 'Use from 200 px width.',
    file: 'gonarra-wordmark-tagline-color.svg',
    background: 'light',
    svg: wordmarkSvg('color', true),
  },
  reverse: {
    label: 'Reverse wordmark',
    note: 'For Deep Ocean or dark imagery.',
    file: 'gonarra-wordmark-reverse.svg',
    background: 'dark',
    svg: wordmarkSvg('reverse'),
  },
  mono: {
    label: 'One-color wordmark',
    note: 'Single-ink and utility use.',
    file: 'gonarra-wordmark-mono.svg',
    background: 'light',
    svg: wordmarkSvg('mono'),
  },
  mark: {
    label: 'g mark',
    note: 'Compact identity and favicon.',
    file: 'gonarra-mark-color.svg',
    background: 'light',
    svg: markSvg(false),
  },
  markReverse: {
    label: 'Reverse g mark',
    note: 'Compact use on dark surfaces.',
    file: 'gonarra-mark-reverse.svg',
    background: 'dark',
    svg: markSvg(true),
  },
  appIcon: {
    label: 'App icon master',
    note: 'Square and opaque; do not pre-round.',
    file: 'gonarra-app-icon.svg',
    background: 'checker',
    svg: appIconSvg(),
  },
};

for (const asset of Object.values(assets)) fs.writeFileSync(path.join(out, asset.file), asset.svg + '\n');
fs.writeFileSync(path.join(out, 'gonarra-logo-master.svg'), masterSheetSvg() + '\n');

const browserData = Object.fromEntries(Object.entries(assets).map(([key, asset]) => [key, asset]));
fs.writeFileSync(
  path.join(out, 'brand-assets-data.js'),
  `/* Generated by scripts/build-brand-assets.cjs. */\nwindow.GONARRA_BRAND_ASSETS = ${JSON.stringify(browserData, null, 2)};\n`,
);

fs.writeFileSync(path.join(out, 'brand-tokens.json'), JSON.stringify({
  name: 'Gonarra',
  version: '1.1',
  colors: {
    deepOcean: { value: color.ocean, rgb: [11, 48, 69], role: 'Primary brand and text' },
    teal: { value: color.teal, rgb: [11, 142, 168], role: 'Large type and accent' },
    sun: { value: color.sun, rgb: [246, 166, 35], role: 'Identity dot only in full-color marks' },
    sky: { value: color.sky, rgb: [240, 249, 255], role: 'Light brand surface' },
  },
  geometry: {
    wordmarkViewBox: [0, 0, 800, 190],
    minimumDigitalWidth: 60,
    taglineMinimumDigitalWidth: 200,
    iconMinimumDigitalSize: 16,
    clearSpace: '1x visual o-height',
    strokeWidth: 26,
    opticalGaps: { 'o/n': 15, 'n/a': 14, 'a/r': 14, 'r/r': 14, 'r/a': 14 },
  },
}, null, 2) + '\n');

fs.writeFileSync(path.join(out, 'README.md'), `# Gonarra brand assets\n\nGenerated from \`scripts/build-brand-assets.cjs\`. Run \`node scripts/build-brand-assets.cjs\` after changing master geometry.\n\n## Figma handoff\n\n- Drag an SVG directly into Figma; each production file has a stable viewBox and named groups.\n- The wordmark has no live font or CSS letter-spacing. Tagline characters are outlined vector paths.\n- Keep the 26-unit rounded stroke system intact. Flatten/Outline stroke only when preparing a locked vendor handoff.\n- Use one visual \`o\` height as clear space. Minimum sizes: wordmark 60 px, wordmark + tagline 200 px, g mark 16 px.\n- Optical gaps in the refined master: o/n 15, n/a 14, a/r 14, r/r 14, r/a 14 units.\n- The orange Sun dot remains orange in full-color and reverse-color artwork.\n- \`gonarra-logo-master.svg\` is the presentation sheet; production files are the smaller named SVGs in this folder.\n\n## Color tokens\n\n- Deep Ocean \`#0B3045\`\n- Teal \`#0B8EA8\`\n- Sun \`#F6A623\`\n- Sky \`#F0F9FF\`\n\nThe wordmark and standalone g mark use the same source geometry. Do not redraw the mark in product code.\n`);

console.log(`Built ${Object.keys(assets).length} production brand assets in ${path.relative(root, out)}.`);
