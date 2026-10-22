# 🧈 buttery — Brand

## Name
- Always lowercase: **buttery** — in headings, at the start of sentences, in the logo lockup.
- npm scope: `@buttery/*`. CLI: `buttery`. CSS prefix: `--bt-` / `.bt-`.
- Tagline: **Make anything buttery.**

## The emoji: 🧈
- Character: 🧈 `U+1F9C8 BUTTER` (Unicode 12.0).
- Use it in **text**: README title, docs headings, CLI output (`🧈 buttery check passed`), release notes, commit prefixes if you like.
- On Apple devices (macOS, iOS — including the Tauri app on a Mac) it renders with Apple's design. On Windows, Android and Linux it renders with that platform's design. There's no way to change that from your side.

**What you can't do:** ship Apple's emoji artwork as a logo, favicon, app icon or image, or bundle the Apple Color Emoji font. It's Apple's copyrighted artwork and isn't licensed for that. Drawing a near-copy of it has the same problem.

## The mark (logo, favicon, app icon)
Because the emoji renders differently per platform and Apple's art isn't usable as an image, the logo is an **original drawing** that carries the same qualities you like about the iOS emoji style:

- Subject: a soft pat of butter — a rounded block, slightly melted at the edges, seen from a gentle 3/4 angle.
- Finish: glossy, dimensional, friendly. A creamy top face, a warmer side, a soft specular highlight, a soft contact shadow.
- Colors: `--bt-brand-cream #fff4d6` (top), `--bt-brand-butter #f5d06f` (body), `--bt-brand-butter-deep #e8b64a` (side/shadow).
- Rules: original geometry. Don't trace, copy or closely imitate any vendor's emoji (Apple, Google, Microsoft, Samsung, Twitter).
- Deliverables: `BrandMark` React component (inline SVG, sizes 16/24/32/64/128/512), a simplified 16px variant that reads at favicon size, `favicon.svg` + `.ico`, Tauri app icons (generate from a 1024px PNG with `pnpm tauri icon`), and a README hero. `pnpm brand:assets` makes all of them from `BrandMark`, so a change to the drawing reaches every one.
- Where it goes: the mark in UI, favicons and app icons (consistent everywhere). The 🧈 character in text.

## Voice
Short, warm, direct. Say what happens, not how clever it is.
- ✅ "Dropped in. Looking buttery." ✅ "Two buttons overlap at 390px — here's the fix."
- ❌ `Leveraging our revolutionary design paradigm…`
CLI and dev warnings are part of the brand: friendly, specific, always with a fix.
