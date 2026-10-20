# 🧈 buttery — Roadmap

Tick boxes as work lands (agents do this too). Details and acceptance criteria per phase: `docs/BUILD_PLAN.md`.

**Now:** Phase 2 is done. Next: Phase 3, the motion system.

---

## v0.1 — Foundation (Phases 0–1)
- [x] Agent files merged (`AGENTS.md` ← `AGENTS.buttery.md`), `CLAUDE.md` import, `.gemini/settings.json`
- [x] Monorepo, tooling, scripts, VS Code tasks
- [x] Playground + starter running on web; starter running as a desktop app
- [x] All tokens (light, dark, compact) + `tokens.json` + contrast test
- [x] Recipes, `ButteryProvider`, `createTheme`, palettes, Tailwind bridge
- [x] Tokens + Surfaces playground pages

## v0.2 — Guardrails (Phase 2)
- [x] Layout primitives + layer system
- [x] `expectButtery` (all checks, JSON reports, Chromium + WebKit)
- [x] `LayoutGuard` + grid overlay
- [x] `@buttery/lint` enforced repo-wide
- [x] `new-component` generator

## v0.3 — Motion (Phase 3)
- [ ] Motion tokens, presets, `useButteryTransition`
- [ ] `Morph`, `Presence`, `SharedIndicator`, `Reveal`, `Stagger`, `Loop`, `Confetti`
- [ ] `buttery` factory (`buttery.div`, `buttery(Component)`)
- [ ] Settle times verified against the spec

## v0.4 — Controls (Phase 4)
- [ ] Button family, IconButton, SplitButton, with the forward/back arrow shared with ArrowLink
- [ ] SegmentedControl, Slider + ValueBadge, Chip, NumberField
- [ ] Tooltip, Kbd, ArrowLink
- [ ] Compare page vs references

## v0.5 — App patterns (Phase 5)
- [ ] SwatchGrid, ColorDot, TiltPad, AnchorGrid
- [ ] Menu, Select, Toast, FloatingToolbar
- [ ] EmptyState/DropZone, Stage, Inspector, HeaderBar, AppShell
- [ ] Card Studio demo (original), passes the full matrix at every size

## v0.6 — Choreography (Phase 6)
- [ ] Dialog, Onboarding (StepDialog), PageDots
- [ ] NavBar (static, sticky, auto-hide) + MorphMenu, SubNav
- [ ] Bento + ExpandableCard
- [ ] Page patterns: SplitHero, CenteredHero (with the hero assembly), StatStrip, LogoStrip, ArticleLayout, Footer
- [ ] Card Studio marketing page + onboarding; NavBar in the playground's docs shell

## v0.9 — Hardening & brand (Phase 7)
- [ ] Accessibility audit, dark + compact passes, visual regression baselines
- [ ] Docs pages in the playground (props, examples, do/don't)
- [ ] 🧈 Original BrandMark (3 directions → pick one) + favicon + app icons + README hero
- [ ] `new-app` finished; Changesets
- [ ] make-it-buttery skill tested on a messy page

## v1.0 — Developer & agent experience (Phase 8)
- [ ] `manifest.json`, `tokens.json`, `llms.txt`, docs + examples shipped in packages
- [ ] Dev warnings with fixes; VS Code snippets
- [ ] CLI: `create-buttery`, `init`, `add`, `doctor`, `check`, `migrate`
- [ ] `@buttery/mcp` + configs for the common coding agents (`docs/DX_AND_AI.md`)
- [ ] Agent eval run + top issues fixed
- [ ] npm org `buttery` claimed (or own scope chosen); first publish

## Later (ideas, not commitments)
- [ ] Docs site deployed from the playground
- [ ] More patterns: settings, data table, command palette (⌘K), file browser, chat
- [ ] Charts that follow the motion rules
- [ ] Next.js / SSR support
- [ ] Figma library generated from tokens
