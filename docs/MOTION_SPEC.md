# buttery — Motion Spec

Two sets of local captures (not in the repo), both measured frame by frame:

- **App motion**: how controls, panels, dialogs and toasts move in a desktop editing app.
- **Choreography**: how a marketing site morphs its menu, expands cards into modals, staggers entrances and dims context. We take the *principles*, not the look.

"Buttery" motion = **instant where the user is in control, short and settled where the system responds, choreographed where something new arrives.** Nothing bounces for no reason. Nothing makes the user wait.

---

## 1. The ten rules

1. **Direct manipulation is instant.** Dragging a slider, picking a swatch, choosing a color, dragging the tilt control: the result updates in the *same frame*. Never tween a value the user is driving. (Measured: background swap = 1 frame, no crossfade.)
2. **Discrete state changes settle in ~250ms with no overshoot.** Position snap, aspect-ratio change, reset, frame change: critically damped spring (`spring.smooth`). Small selection indicators (segmented pill, page dots, anchor dot) are quicker (`spring.snappy`). (Measured: 230–300ms, monotonic decay, no bounce.)
3. **One surface morphs; it doesn't close and reopen.** A menu that switches sections resizes and re-positions itself; a card that opens becomes the modal; a stage that changes aspect ratio reshapes. (Morphing menu, card-to-modal.)
4. **Containers animate their size when content changes.** If content swaps inside a panel, the panel's height animates and the content crossfades. No jumps. (Measured: a panel collapsing after a fill-type switch, ~250ms.)
5. **New context dims, it doesn't black out.** Menus over content: blur the page behind (8–12px) with a light wash. Modals: `rgba(0,0,0,.32)` scrim, no blur. (A menu over a page vs. a modal dialog.)
6. **Arrivals are choreographed.** First paint of a hero visual, a list, a bento grid: children enter with a short rise + fade, staggered 40–60ms, total ≤ 900ms. Only once per element. (A hero visual assembling, section reveals.)
7. **Exits are faster than entrances** (~60%). Users already decided; get out of the way. (Measured: toast out ~130ms vs in ~200ms; dialog close ~120ms.)
8. **Hover says "this is alive" in ≤150ms.** Arrow extends on links/buttons, cards lift 2px, icons fill. Never hover-only information.
9. **Celebrate rarely.** Confetti only for genuine completion (finishing onboarding, first export). Never on routine actions.
10. **Reduced motion is a first-class mode.** Springs become instant; reveals become plain opacity (≤100ms); loops stop; confetti off. Layout still updates.

Never animate: text values (no number tweening of user-set values), layout during a drag, anything longer than 400ms except choreographed entrances (≤900ms total) and ambient loops.

---

## 2. Motion tokens

Use these names everywhere (`@buttery/core` exports them as `spring` for Motion; CSS vars for transitions).

### Springs (Motion `type: "spring"` with `visualDuration` + `bounce`)

| Token | Config | Use |
|---|---|---|
| `spring.instant` | `{ type: "tween", duration: 0.001 }` | Direct manipulation, reduced motion. Lands on the next frame; 1ms rather than 0 (§5) |
| `spring.snappy` | `{ visualDuration: 0.18, bounce: 0 }` | Selection indicators (segmented thumb, page dots, anchor dot) |
| `spring.smooth` | `{ visualDuration: 0.25, bounce: 0 }` | **Default.** Position/aspect/reset, layout morphs, height changes, dialogs |
| `spring.morph` | `{ visualDuration: 0.38, bounce: 0 }` | Big surfaces changing shape: menu morph, card → modal |
| `spring.gentle` | `{ visualDuration: 0.45, bounce: 0.08 }` | Choreographed entrances only |

"Settle time" in this doc = time until 95% of the travel is done (that's what the recordings measure). Motion's `visualDuration` is close to that for `bounce: 0`, but verify by sampling — don't assume.

Sampled by `apps/playground/e2e/motion.spec.ts` in Chromium and WebKit: `snappy` settles in ~175ms, `smooth` ~240ms, `morph` ~355ms (0.35 gave ~325ms, short of §4.2's measured 350–400ms) and `gentle` ~370ms, since its bounce reaches 95% before its `visualDuration`.

### Durations & easing (CSS transitions — color, opacity, shadows)

| Token | Value |
|---|---|
| `--bt-dur-instant` | 0ms |
| `--bt-dur-press` | 80ms (pointer-down scale) |
| `--bt-dur-reduced` | 100ms (the longest fade with reduced motion) |
| `--bt-dur-fast` | 120ms (hover color, exits, text crossfade) |
| `--bt-dur-base` | 200ms (enters: menu, toast, dialog opacity) |
| `--bt-dur-slow` | 300ms (backdrop blur in, crop-mode bg fade) |
| `--bt-ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` (enters) |
| `--bt-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` (exits) |
| `--bt-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` (everything else) |
| `--bt-stagger` | 50ms (40–60 range) |
| `--bt-entrance-max` | 900ms (the longest choreographed entrance, stagger included) |
| `--bt-loop-cycle` | 4000ms (one `Loop` step) |
| `--bt-celebration` | 900ms (a confetti burst's life) |
| `--bt-delay-hover-open` / `--bt-delay-hover-close` | 80ms / 150ms (hover-intent for menus and tooltips; tooltips use 500ms open) |

Never use `transition: all`. Transition only `opacity`, `transform`, `background-color`, `color`, `box-shadow`, `filter` and `backdrop-filter`. Layout changes go through Motion's `layout` (FLIP), never animating `width/height/top/left` in CSS. Two size animations are sanctioned: `Morph`'s height (§5) and the `MorphMenu` viewport's size and position (§4.1).

---

## 3. Measured app motion

| Interaction | What happens | Timing |
|---|---|---|
| Slider drag | Thumb + badge + canvas update every frame | instant |
| Swatch pick | Background swaps; selection ring jumps to new swatch | instant (1 frame) |
| Segmented switch | White active pill slides to the new item | `spring.snappy` |
| Fill type switch (gradient ↔ solid) | Swatch grid crossfades; the two gradient rows collapse into one color row; panel height animates | crossfade 120ms, height `spring.smooth` (~270ms measured) |
| Anchor change (anchor grid) | Content glides to the new anchor | `spring.smooth` (~230ms measured) |
| Rotate / Tilt drag | Live 3D transform (perspective 1200px) | instant while dragging |
| Reset (section or chip) | Values spring back to defaults | `spring.smooth` (~300ms measured) |
| Frame style change | Frame style crossfades, content re-fits | `spring.smooth` (~250ms) |
| Aspect ratio change | Stage reshapes, content stays centered | `spring.smooth` (~230ms measured) |
| Enter crop mode | Stage bg fades out (200ms); image scales to fit; handles + floating toolbar fade/slide in after ~80ms | 200–250ms |
| Item deleted | Stage swaps to the empty state instantly; a toast with undo slides up 8px + fades in | slide `spring.snappy` + fade `dur-base` in, fade `dur-fast` out (measured ~200 / ~130ms); auto-dismiss 3s, paused on hover |
| Menu open (select) | Trigger gets active bg; menu fades + scales from trigger origin (0.97 → 1) | scale `spring.snappy` + fade `dur-base` in, fade `dur-fast` out (measured ~150–200ms in) |
| Button press | Scale 0.97 on pointer-down | down `dur-press`, release `dur-fast`, both `ease-out` (a CSS recipe, so no spring); at once with reduced motion |
| Primary hover | `#1a1a1a` → `#2b2b2b` | `dur-fast` |

### Onboarding (step dialog)

| Moment | Behavior | Timing |
|---|---|---|
| Step forward / back | Title, body, caption crossfade **in place** (no slide) | 120ms |
| Media scene | Shared scene elements move, scale or rotate between steps; parts that belong to one step fade or pop in. The background crossfades. | `spring.smooth`, bg crossfade 250ms |
| Page dots | Active pill shrinks while the next one grows (width interpolation) | `spring.snappy` |
| Back button on the first step | Disabled (lighter text), enabled from step 2 | color 120ms |
| Last step | The forward button's label crossfades (e.g. "Continue" → "Finish") inside a fixed-width button (no layout shift) | 120ms |
| Idle step | One scene element drifts and the rest follow, slow loop | ~3s loop, ease-in-out |
| Finish | Confetti bursts from the finish button (24–40 small rounded rects in palette colors, ±60° upward cone, gravity, ~900ms life). Dialog stays open during the burst, then fades out. | close fade 120ms after ~900ms |
| Dialog open (not in recording — _derived_) | Scrim fades; panel opacity 0→1, scale 0.97→1, y 6→0 | `spring.smooth` + 200ms scrim |

---

## 4. Choreography patterns

### 4.1 Morphing menu (`MorphMenu`)
Hovering between top-level nav items never closes the panel: one floating surface **resizes and repositions** to fit each section. Build it on Radix `NavigationMenu` (its shared `Viewport` exposes the active content's size as CSS variables, and it handles hover intent and keyboard navigation).
- Open: `dur-base` (measured ~170ms). Panel fades in + scale 0.98 → 1 from the trigger. Page behind: `backdrop-filter: blur(10px)` + `rgba(255,255,255,.55)` wash over `--bt-dur-slow`.
- Switch: panel width/height/x animate with `spring.morph`; old content fades out (100ms) while new content fades in sliding 8–12px **from the direction of travel**. The viewport's width, height and x are the second sanctioned size animation: Radix exposes the active content's size as CSS variables, and Motion animates that one element.
- Close: panel fades `dur-fast`; blur clears `dur-base`. Hover-intent delays: `--bt-delay-hover-open` / `-close` (prevents flicker when moving diagonally).
- buttery look: white `floating` surface, r16, buttery tokens.

### 4.2 Card → modal (`ExpandableCard`)
Clicking a bento card turns *that card* into the modal (shared layout). Grid behind fades to 0 opacity and the scrim washes in; card content crossfades to detail content mid-flight.
- Open: `spring.morph` (~350–400ms measured). Close: reverse into the same card, 250ms.
- The card's title is a shared element — it travels, it doesn't re-render somewhere else.

### 4.3 Staggered entrance (`Reveal`, `Stagger`)
- On first entering the viewport (IntersectionObserver, 15% visible, `once`): opacity 0→1, y 16→0, `spring.gentle`, children staggered `--bt-stagger`.
- Hero assembly: elements start low and slightly scaled (0.96), rise into an arranged layout with stagger, total ≤ 900ms.
- Never reveal content the user is already looking at (above the fold on load = immediate or a single 200ms fade).

### 4.4 Living demos (`Loop`)
Product visuals inside cards and heroes quietly cycle states — numbers tick to a new value, a row appears, a line chart extends, a connector pulses.
- 3–5s per cycle, ease-in-out, crossfades for text values, `layout` for added rows.
- Pause when offscreen (IntersectionObserver) and under reduced motion. Never loop anything the user is editing.

### 4.5 Hover arrow (`ArrowLink`, `Button` with `arrow`)
Chevron "›" grows a stem and becomes "→", nudging 2px right. `dur-fast`, `--bt-ease-out`. Implemented with two SVG paths (stem scales from 0 → 1 on X).

### 4.6 Card hover lift
`translateY(-2px)`, shadow steps from `card` to `raised`, corner affordance icon fills with `--bt-primary`. `dur-fast`. Disabled on touch devices and in reduced motion.

### 4.7 Count-up stats (`Stat`)
Marketing numbers (not user values) count up once when revealed, 800ms ease-out, tabular-nums, width reserved for the final value. Screen readers get the final value immediately (`aria-label`); with reduced motion the final value renders directly.

### 4.8 Context blur (`Scrim`)
Two variants: `scrim="dim"` (modal, `--bt-overlay`) and `scrim="blur"` (menus over content, blur 10px + `--bt-wash`). Both animate in over `--bt-dur-slow`; out over `--bt-dur-base` (blur) or `--bt-dur-fast` (dim). The blur scrim sits below the sticky nav (`--bt-z-scrim-nav`) so the nav and menu stay crisp.

---

## 5. Implementation notes

- Motion library: `motion` (`import { motion, AnimatePresence, LayoutGroup, MotionConfig } from "motion/react"`).
- `ButteryProvider` resolves its `reducedMotion` prop (`user` follows the OS) and wraps the app in `<MotionConfig reducedMotion={reduced ? "always" : "never"} transition={spring.smooth}>`, with a `MotionPreferenceContext` that buttery's components read. Motion's reduced mode only stops transform and layout animations; opacity still runs at full length. So components never hardcode transitions: they ask `useButteryTransition("smooth" | "snappy" | …)`, which returns the spring, or the reduced set (transforms land at once, opacity ≤ 100ms) when motion is reduced. `Presence` presets (`presencePresets`) have a reduced twin, `reducedPresence`.
- Layout animations spread `useLayoutAnimation(name)` (`layout` plus the transition) instead of setting `layout` directly. With reduced motion it turns `layout` off, so the element simply takes its new place. Motion snaps a reduced layout animation with a zero-length animation, and it renders an element at most once per frame timestamp; WebKit's clock rounds to whole milliseconds, so that last frame can land in the same millisecond as the frame Motion flushed after the layout change, and the element stays at its old position. The same is why `spring.instant` lasts 1ms.
- Motion only restarts a value whose target changes, so turning reduced motion on mid-animation doesn't stop a running spring by itself. Reduced targets start from the current value (`y: [null, 0]`) so they restart and land, and imperative entrances (`Reveal`, `Stagger`, `Morph`'s height) finish in their effect's cleanup.
- Under the React Compiler, JSX is memoized: a `motion` element whose own props don't change doesn't re-render when a parent's state moves it, and Motion only measures layout when it re-renders. Pass `layoutDependency` with the state that moves it.
- Shared indicators (segmented, dots, anchor grid): one element with a stable `layoutId` scoped by `useId()` inside a `LayoutGroup` so two instances never fight. With reduced motion it has no `layoutId` and simply appears on the new item.
- Auto-height (`Morph`): measure content with `ResizeObserver` and let Motion animate the wrapper's `height` (overflow clipped during the animation). This is one of the **two sanctioned size animations** (the other is the `MorphMenu` viewport, §4.1); CSS transitions on width/height/top/left stay banned. Content uses `AnimatePresence mode="popLayout"` crossfade.
- Morph surfaces: animate a single `motion.div` with `layout` and keep it mounted between states.
- Never animate on the main thread during drags: use pointer events + `transform` only; batch with `requestAnimationFrame`.
- Every animated component must render correctly with motion disabled (this is a test).
- The reference strips to compare against are local only, with timestamps burned in; `reference/README.md` indexes them.
