# Gonarra brand assets

Generated from `scripts/build-brand-assets.cjs`. Run `node scripts/build-brand-assets.cjs` after changing master geometry.

## Figma handoff

- Drag an SVG directly into Figma; each production file has a stable viewBox and named groups.
- The wordmark has no live font or CSS letter-spacing. Tagline characters are outlined vector paths.
- Keep the 26-unit rounded stroke system intact. Flatten/Outline stroke only when preparing a locked vendor handoff.
- Use one visual `o` height as clear space. Minimum sizes: wordmark 60 px, wordmark + tagline 200 px, g mark 16 px.
- Optical gaps in the refined master: o/n 15, n/a 14, a/r 14, r/r 14, r/a 14 units.
- The orange Sun dot remains orange in full-color and reverse-color artwork.
- `gonarra-logo-master.svg` is the presentation sheet; production files are the smaller named SVGs in this folder.

## Color tokens

- Deep Ocean `#0B3045`
- Teal `#0B8EA8`
- Sun `#F6A623`
- Sky `#F0F9FF`

The wordmark and standalone g mark use the same source geometry. Do not redraw the mark in product code.
