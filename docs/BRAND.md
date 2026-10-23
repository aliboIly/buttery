# 🧈 buttery — Brand

## Name
- Always lowercase: **buttery** — in headings, at the start of sentences, beside the logo.
- npm scope: `@butteryui/*`. CLI: `buttery`. CSS prefix: `--bt-` / `.bt-`.
- Tagline: **Make anything buttery.**

## The logo: 🧈
- buttery's logo is the 🧈 character, `U+1F9C8 BUTTER` (Unicode 12.0), set in **text**: the docs site's header, landing page and demo pill, the favicons (an SVG holding the character), the README's title, CLI output (`🧈 buttery check passed`) and release notes.
- On Apple devices (macOS, iOS, and the Tauri app on a Mac) it renders with Apple's design. On Windows, Android and Linux it renders with that platform's design. That's what setting it as text gives: each platform draws its own butter, and buttery ships nobody's artwork.

**What you can't do:** ship Apple's emoji artwork as an image (a PNG logo, a raster favicon, an app icon, a README picture), or bundle the Apple Color Emoji font. It's Apple's copyrighted artwork and isn't licensed for that. Drawing a near-copy of it has the same problem.

## App icons
A desktop app needs raster icons, which can't hold a character, so the starter ships placeholder icons and an app makes its own from a 1024px PNG with `pnpm tauri icon`.

## Colors
`--bt-brand-cream #fff4d6`, `--bt-brand-butter #f5d06f` and `--bt-brand-butter-deep #e8b64a` are decorative only: the docs site and marketing, never interface colors.

## Voice
Short, warm, direct. Say what happens, not how clever it is.
- ✅ "Dropped in. Looking buttery." ✅ "Two buttons overlap at 390px — here's the fix."
- ❌ `Leveraging our revolutionary design paradigm…`
CLI and dev warnings are part of the brand: friendly, specific, always with a fix.
