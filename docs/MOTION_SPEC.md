# buttery — Motion Spec

Three sets of local captures (not in the repo), all measured frame by frame:

- **App motion**: how controls, panels, dialogs and toasts move in a desktop editing app.
- **Choreography**: how a marketing site morphs its menu, expands cards into modals, staggers entrances and dims context. We take the *principles*, not the look.
- **App chrome**: how a product dashboard's menus, submenus, dialogs and sidebar move (§3, "App chrome").

"Buttery" motion = **instant where the user is in control, short and settled where the system responds, choreographed where something new arrives.** Nothing bounces for no reason. Nothing makes the user wait.

---

## 1. The ten rules

1. **Direct manipulation is instant.** Dragging a slider, picking a swatch, choosing a color, dragging the tilt control: the result updates in the *same frame*. Never tween a value the user is driving: set it directly (a style, a CSS variable, `MotionValue.jump`), since even `spring.instant` lands a frame later. (Measured: background swap = 1 frame, no crossfade.)
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
| `spring.instant` | `{ type: "tween", duration: 0.001 }` | Reduced motion, and snaps the user isn't driving. Lands on the next frame; 1ms rather than 0 (§5). Direct manipulation doesn't animate at all (rule 1) |
| `spring.snappy` | `{ visualDuration: 0.18, bounce: 0 }` | Selection indicators (segmented thumb, page dots, anchor dot), the nav menu's panel switching sections |
| `spring.smooth` | `{ visualDuration: 0.25, bounce: 0 }` | **Default.** Position/aspect/reset, layout morphs, height changes, dialogs |
| `spring.morph` | `{ visualDuration: 0.38, bounce: 0 }` | Big surfaces changing shape: card → modal |
| `spring.gentle` | `{ visualDuration: 0.45, bounce: 0.08 }` | Choreographed entrances only |

"Settle time" in this doc = time until 95% of the travel is done (that's what the recordings measure). Motion's `visualDuration` is close to that for `bounce: 0`, but verify by sampling — don't assume.

`apps/playground/e2e/motion.spec.ts` reads every demo on the playground's Motion page each frame, in Chromium and WebKit, and fits the token's own curve to what it read. Every spring has fitted within 1% of its `visualDuration` and every tween within about 3ms of its duration; the test allows 3% and 4ms, since WebKit's clock counts whole milliseconds. A spring on its own reaches 95% of its travel in 163ms (`snappy`), 227ms (`smooth`), 344ms (`morph`) and 357ms (`gentle`, whose bounce gets there before its `visualDuration`). Counted from the press, with React's commit and Motion's first frame, that is ~165–180ms, ~230–245ms, ~350–355ms and ~360–370ms. `morph` was 0.35 at first, which reached 95% in ~325ms, short of §4.2's measured 350–400ms.

### Durations & easing (CSS transitions — color, opacity, shadows)

| Token | Value |
|---|---|
| `--bt-dur-instant` | 0ms |
| `--bt-dur-press` | 80ms (pointer-down scale) |
| `--bt-dur-reduced` | 100ms (the longest fade with reduced motion) |
| `--bt-dur-fast` | 120ms (hover color and arrows, exits, text crossfade, the nav panel folding and its blur, dialogs and their scrim both ways) |
| `--bt-dur-base` | 200ms (enters: menu, toast, a sheet's scrim) |
| `--bt-dur-slow` | 300ms (longer fades; nothing in Phase 5 uses it, and the crop-mode background fades over `dur-base`, as §3 measures) |
| `--bt-ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` (enters) |
| `--bt-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` (exits) |
| `--bt-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` (everything else) |
| `--bt-stagger` | 50ms (40–60 range) |
| `--bt-entrance-max` | 900ms (the longest choreographed entrance, stagger included) |
| `--bt-loop-cycle` | 4000ms (one `Loop` step) |
| `--bt-celebration` | 900ms (a confetti burst's life) |
| `--bt-toast-life` / `--bt-toast-life-action` | 3000ms / 5000ms (how long a toast stays, longer with an action, while nothing pauses it) |
| `--bt-delay-hover-open` / `--bt-delay-hover-close` | 150ms / 100ms (hover intent: a menu opens once the pointer has rested on its trigger for 150ms, at once when it moves between the triggers of an open menu, and closes 100ms after the pointer leaves) |
| `--bt-delay-tooltip` | 500ms (tooltips open) |
| `--bt-delay-submenu` | 40ms (a submenu opens once the pointer has rested on its item this long; Phase 6B) |
| `--bt-delay-loading` | 300ms (a loading pill shows only if loading lasts this long, so quick loads never flash it; Phase 6B) |
| `--bt-dur-shimmer` | 1600ms (one pass of a skeleton's shimmer; Phase 6B) |

Never use `transition: all`. Transition only `opacity`, transforms (`transform`, `translate`, `scale`), `background-color`, `color`, `box-shadow`, `filter` and `backdrop-filter`. Layout changes go through Motion's `layout` (FLIP), never animating `width/height/top/left` in CSS. Two size animations are sanctioned: `Morph`'s height (§5) and the `MorphMenu` viewport's size and position (§4.1). One offset follows a motion value: under an auto-hiding nav bar, a sticky follower's `top` takes off the bar's slide while it slides (§4.1), because a transform can't tell a stuck follower from one still in the page's flow.

---

## 3. Measured app motion

| Interaction | What happens | Timing |
|---|---|---|
| Slider drag | Thumb + badge + canvas update every frame | instant |
| Swatch pick | Background swaps; selection ring jumps to new swatch | instant (1 frame) |
| Color picker drag (_derived_) | The area or hue thumb follows the pointer and the color updates in the same frame; a typed code or a preset glides the thumbs there | instant while dragging; `spring.smooth` otherwise |
| Segmented switch | White active pill slides to the new item | `spring.snappy` |
| Fill type switch (gradient ↔ solid) | Swatch grid crossfades; the two gradient rows collapse into one color row; panel height animates | crossfade 120ms, height `spring.smooth` (~270ms measured) |
| Anchor change (anchor grid) | Content glides to the new anchor | `spring.smooth` (~230ms measured) |
| Rotate / Tilt drag | Live 3D transform (perspective 1200px) | instant while dragging |
| Reset (section or chip) | Values spring back to defaults | `spring.smooth` (~300ms measured) |
| Frame style change | Frame style crossfades, content re-fits | `spring.smooth` (~250ms) |
| Aspect ratio change | Stage reshapes, content stays centered | `spring.smooth` (~230ms measured) |
| Enter crop mode | Stage bg fades out (200ms); image scales to fit; handles + floating toolbar fade/slide in after ~80ms | 200–250ms |
| Item deleted | Stage swaps to the empty state instantly; a toast with undo slides up 8px + fades in | slide `spring.snappy` + fade `dur-base` in, fade `dur-fast` out (measured ~200 / ~130ms); auto-dismiss 3s, paused on hover (5s with an action in buttery, see DECISIONS) |
| Toast joins a stack | The new toast rises a whole step (its height and the gap) at the bottom while the stack moves up one step, as one column; a fourth lets the oldest fade out at the top | rise and stack both `spring.snappy`, so the 8px gaps hold every frame; fade `dur-base` in, `dur-fast` out |
| Toast leaves the middle | It fades where it is, then the toasts above it close the gap | fade `dur-fast`, then `spring.snappy`; with reduced motion, a 100ms fade and the stack jumps |
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
| Dialog open and close | As every dialog does: scrim and panel fade together, the panel growing from 0.97 ("App chrome" below, measured on a dashboard's dialogs) | `dur-fast` each way |

### App chrome (Phase 6B)

Measured from local 30fps strips of a product dashboard (`reference/inspiration-dashboard/motion-*`, not in the repo). Chrome is the menus, popovers and panels that belong to the shell and its data views: the account menu, row actions, a saved view's menu, column settings, filter editors and nudges. Dense tools move less than editors: chrome appears at once and stays out of the way.

| Interaction | What happens | Timing |
|---|---|---|
| Chrome menu or popover opens | Appears complete in the next frame: no grow, slide or fade (`entrance="instant"` on `Menu` and `Popover`; `AppShell layout="sidebar"` makes it the default inside it) | one frame (measured: absent in one 30fps frame, complete in the next) |
| Chrome menu or popover closes | Gone in the next frame | one frame |
| Submenu opens | Opens once the pointer has rested on its item for `--bt-delay-submenu` (40ms), fading in over `dur-fast` with `ease-out`; moving toward it on a diagonal keeps it open (pointer grace) | 40ms + `dur-fast` (measured complete within one 30fps frame of the hover) |
| Dialog opens | Scrim and panel fade in together; the panel grows from 0.97 | `dur-fast` (120ms), `ease-out` (measured ~100ms: about 35% at the first frame, 90% at the second, done by the third) |
| Dialog closes | Panel and scrim fade out, without shrinking, as every presence leaves | `dur-fast`, `ease-in`. The recording fades out over ~200ms; buttery keeps rule 7, so the close is never slower than the open |
| Sidebar group expands | Its height opens through `Morph`; the items show as it opens; the chevron turns 180° | `spring.snappy` (95% at ~165ms; measured ~100–135ms, after ~100ms of the app's own input delay that buttery doesn't add) |
| Sidebar group collapses | Height closes, chevron turns back | `dur-fast`, `ease-standard` |
| Sidebar becomes a rail or a sheet | At 1100px the sidebar takes the rail's width at once as the window resizes (a resize is direct manipulation); under 640 it opens as a sheet that rises on the `rise` preset over a `dim` scrim | instant; sheet `spring.smooth` + `dur-base` scrim |
| Tabs, saved views, stat tabs | The chosen item's indicator slides inside its own track | `spring.snappy` |
| Row hover | The row's tint shows | instant |
| Skeleton | Blocks shaped like the content shimmer: a light band crosses each block | `--bt-dur-shimmer` (1600ms) per pass, linear, looping; off with reduced motion |
| Skeleton → content | Crossfade in place: the content fades in over the skeleton, which fades out; nothing moves | `dur-fast` |
| Loading pill | Shows only if loading lasts `--bt-delay-loading` (300ms), fading in; leaves with a fade as the content crossfades in | `dur-fast` each way |
| Chart hover | Crosshair, points and tooltip follow the pointer in the same frame (set from the pointer handler, no React state per move); the tooltip's text changes when the nearest point does, and it flips sides at the chart's edge without animating | instant |
| Setup guide expands or folds | `Morph` height; the progress bar's fill grows by `scaleX` | `spring.smooth`; fill `spring.smooth` |
| Banner or card dismissed | Fades where it is, then what's below closes the gap | `dur-fast` fade, then `spring.smooth` layout |
| A toast or the setup guide arrives | Rises into its lane as toasts do (§3) | `spring.snappy` + `dur-base` fade |

With reduced motion: chrome is unchanged (it doesn't move), dialogs fade over 100ms without scaling, group height and indicators land at once, skeletons don't shimmer, and the crossfades take 100ms.

---

## 4. Choreography patterns

### 4.1 Nav bar and morphing menu (`NavBar`, `MorphMenu`)
Measured from a local 30fps recording of a marketing site's top bar (`reference/inspiration-nav/`, not in the repo). Moving between top-level items never closes the panel: one floating surface **resizes and repositions** to fit each section. Build it on Radix `NavigationMenu`: its shared `Viewport` exposes the active content's size as CSS variables, and it handles hover intent and keyboard navigation.
- **Open:** the pointer rests on a trigger for `--bt-delay-hover-open` (150ms). Then the panel unfolds downward from the bar, the viewport growing from the bar's height to the content's in `dur-fast` with `ease-out` (measured ~100ms), while its columns fade in over `dur-fast`. The page behind blurs and washes in over `dur-fast` (measured ~100–150ms).
- **Switch:** moving to another trigger while the panel is open starts at once, with no hover delay (measured within ~70ms), and settles with `spring.snappy` (measured ~170–200ms). Old columns fade out over `dur-fast`; new ones fade in over `dur-fast`, sliding `travel.rise` (8px; measured 8–12) **from the direction of travel**; the panel's width, height and x morph. It never closes in between. The viewport's width, height and x are the second sanctioned size animation: Radix exposes the active content's size as CSS variables, and Motion animates that one element.
- **Close:** moving onto a plain link (one without a menu) or out of the bar waits `--bt-delay-hover-close` (100ms). Then the panel folds up in `dur-fast` with `ease-in` (measured ~70–120ms) and the blur clears in `dur-fast` (measured ~150ms). Folding is no quicker than unfolding, because the recording's close is no quicker than its open: the one exception to rule 7, logged in DECISIONS. Radix's own close timer is fixed at 150ms, so `NavBar` controls the open `value` and closes on its own `--bt-delay-hover-close` timer.
- **Trigger:** the open trigger's chevron turns 180° with `spring.snappy` and its label goes to `text-strong`.
- **One surface:** the open panel's floating surface reaches up behind the bar row, so the nav items sit inside its top edge without the panel ever painting over them. At rest over a colorful hero the bar has no background. The bar stacks at `--bt-z-sticky` whatever its `behavior` (a static bar is positioned so its z-index applies), and the panel lives in the bar's stacking context, so both stay above the blur scrim (`--bt-z-scrim-nav`).
- **Scrolling:** `behavior="static"` (the default, as recorded) scrolls away with the page; `sticky` stays pinned; `auto-hide` slides out as the page scrolls down and back as it scrolls up, with `spring.smooth`, and once past the hero it takes the `panel` surface with `shadow-card` (no background at the top of the page). While it's slid away it keeps reserving its height in `--bt-sticky-top` and publishes how far it has slid as `--bt-sticky-shift`, which every `Sticky` under it takes off its offset, so a follower that has stuck moves up with it instead of leaving a gap, and one still in the page's flow stays put. For the length of a slide the followers' offset changes each frame (DECISIONS has why it isn't a transform).
- **Keyboard and touch:** arrow keys move between triggers; Enter, Space or ArrowDown opens; Esc closes and returns focus to the trigger. Tab from an open trigger goes into its panel, and Tab past the panel's last link goes on to the next trigger, or after the last menu to the next tab stop after the menus (the bar's actions, or whatever follows the bar). A tap toggles a panel.
- **Reopening:** back on a trigger within 300ms of a close, a menu opens at once, without the hover delay (Radix's skip delay), as in a desktop menu bar.
- **Reduced motion:** the panel appears and leaves with a 100ms fade, a switch swaps the columns without sliding while the viewport takes its new size and position at once, the chevron turns at once, and the blur fades in and out in 100ms. `auto-hide` shows and hides the bar at once.
- buttery look: the `floating` surface, r16, buttery tokens.

### 4.2 Card → modal (`ExpandableCard`)
Clicking a bento card turns *that card* into the modal (shared layout). Grid behind fades to 0 opacity and the scrim washes in; card content crossfades to detail content mid-flight.
- Open: `spring.morph` (~350–400ms measured). Close: reverse into the same card, 250ms (`spring.smooth`).
- The card's title is a shared element — it travels, it doesn't re-render somewhere else.
- The other cards step back to opacity 0 over `dur-base` with `ease-standard` and come back the same way as it closes; the scrim washes in with the `fade` preset.
- The detail and the close button keep their shape as the dialog grows around them (Motion's scale correction) and fade in over `dur-fast` after `--bt-delay-follow`. Closing, they go at once and the empty surface folds back into the card, crossfading to it in the second half: Motion corrects only the parts of the surface that's arriving, and leaves a leaving surface's parts where they were, so they can't travel back. The card passes over its neighbours on the way back.
- Reduced motion: the dialog fades in and out in place in 100ms, and nothing grows.

### 4.3 Staggered entrance (`Reveal`, `Stagger`)
- On first entering the viewport (IntersectionObserver, 15% visible, `once`): opacity 0→1, y 16→0, `spring.gentle`, children staggered `--bt-stagger`.
- Hero assembly: elements start low and slightly scaled (0.96, `assembleScale`), rise into an arranged layout with stagger, total ≤ 900ms: `Stagger arrival="assemble"`, which `SplitHero` and `CenteredHero` put around their visual.
- Never reveal content the user is already looking at (above the fold on load = immediate or a single 200ms fade).

### 4.4 Living demos (`Loop`)
Product visuals inside cards and heroes quietly cycle states — numbers tick to a new value, a row appears, a line chart extends, a connector pulses.
- 3–5s per cycle, ease-in-out, crossfades for text values, `layout` for added rows.
- Pause when offscreen (IntersectionObserver) and under reduced motion. Never loop anything the user is editing.

### 4.5 Forward and back arrows (`Button` and `ArrowLink` with `arrow`)
Measured from the same local recording at 10fps. At rest the label is followed by a small chevron. On hover or keyboard focus a stem draws in behind the chevron's point and the head nudges forward, so › becomes →; leaving reverses it. `dur-fast` each way (measured ~100ms), `ease-out`, no delay. The control never changes width.
- One SVG with a head path and a stem path. The stem scales on X from the head's side, 0 to 1; the head moves `--bt-arrow-nudge` (3px, a component variable). Only transforms change, so hovering shifts nothing: the head nudges into the button's padding, and a link, which has none, gives its arrow box that room.
- `arrow="back"` mirrors it: ‹ becomes ← and nudges left.
- Colors are buttery's hover colors (primary goes to `primary-hover`), and the press scale stays.
- Touch, with no hover: the chevron only. Reduced motion: the chevron becomes the arrow at once, without the nudge. `loading`: the arrow hides and the width stays.
- Use it on every forward or back navigation action: onboarding Next and Back, `StepDialog`, `ExpandableCard` and hero calls to action, "See all" links in the nav menu, pagination. Not on Done, Save, Submit or destructive actions.

### 4.6 Card hover lift
`translateY(-2px)`, shadow steps from `card` to `raised`, corner affordance icon fills with `--bt-primary`. `dur-fast`. Disabled on touch devices and in reduced motion.

### 4.7 Count-up stats (`Stat`)
Marketing numbers (not user values) count up once when revealed, 800ms (`--bt-count-up`) ease-out, tabular-nums, width reserved for the final value. Screen readers get the final value immediately (`aria-label`); with reduced motion the final value renders directly.

### 4.8 Context blur (`Scrim`)
Two variants: `scrim="dim"` (modal, `--bt-overlay`) and `scrim="blur"` (menus over content, blur 10px + `--bt-wash`). The blur scrim fades in and out over `--bt-dur-fast` (measured ~100–150ms each way behind the nav menu); the dim scrim fades with its layer: in and out over `--bt-dur-fast` under a dialog (§3), in over `--bt-dur-base` and out over `--bt-dur-fast` under a sheet. The blur scrim sits below the nav bar (`--bt-z-scrim-nav`, under the bar's `--bt-z-sticky`), so the bar and its open menu stay crisp.

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
