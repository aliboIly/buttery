# Decisions log

Every judgment call that deviates from or fills a gap in the specs goes here: date, decision, why, alternatives considered.

| Date | Decision | Why |
|---|---|---|
| 2026-10-19 | The look comes from one set of local app captures; layout and motion behavior come from a second set of page captures. No branding from either. | buttery has its own identity. |
| 2026-10-19 | Caption text uses `#6b6b6b`, not the reference `#8a8a8a`. | Reference fails WCAG AA; `#6b6b6b` passes on white, section and app backgrounds. |
| 2026-10-19 | Toast height snapped from measured 38px to `--bt-h-button` (36); menu item padding-x snapped from ~14 to 12; empty-state title→body gap 6 → 8. | Keep values on the token scale. |
| 2026-10-19 | Panel → Section breaks the concentric-radius rule on purpose (section r15 = inner card 12 + well 3). | Matches the reference; sections are sized inside-out. |
| 2026-10-19 | Hit areas ≥ 24×24 (WCAG 2.5.8), standalone buttons ≥ 28 tall; small visuals extend hit areas with `[data-bt-hit]`. | A flat 28px rule would fail the spec's own thumb, chip and color dot. |
| 2026-10-19 | Layout checks run in Chromium **and** WebKit. | Tauri on macOS renders with WKWebView. |
| 2026-10-19 | Dark theme, dialog-open motion and drop-zone drag-over are derived, not measured. | Not in the references; need a visual pass. |
| 2026-10-19 | `AGENTS.md` is the single source of agent instructions; `CLAUDE.md` imports it with `@AGENTS.md` and `.gemini/settings.json` loads it. | One set of rules for every agent; `docs/DX_AND_AI.md` explains why each file exists. |
| 2026-10-19 | No attribution from tools and no narrating comments or filler prose anywhere; attribution is off in `.claude/settings.json` (`attribution.commit`/`pr` empty, `sessionUrl` false); enforced by `check-ai-tells` in `pnpm check` and a `commit-msg` hook. | Maintainer's call: the project should read as written by its maintainer. |
| 2026-10-19 | Strict TypeScript + React 19 bar (ref as prop, pure render, no `any`/`!`/enums, typescript-eslint strict-type-checked, zero warnings). | Code quality is part of the product. |
| 2026-10-19 | Brand: 🧈 character in text only; the logo is an original butter mark in buttery's own colors. The reference app's icon gradient was removed from the tokens. | Apple's emoji artwork can't be used as a logo or image; the reference gradient was another product's brand. |
