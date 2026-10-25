# Agent evaluation

How buttery checks that coding agents build well with it, run by run. Anything that trips an agent becomes a better API, example, warning or doc (DX_AND_AI §6).

## 1.0.0: every task, two agents, third run (2026-10-25)

The full run DX_AND_AI §6 asks for, as far as this machine allows: all seven tasks, with Claude Code and Codex. Gemini CLI isn't installed here, so its run is still to come.

### Setup
- Agents, each in a fresh app of its own per task, so no agent saw another's work:
  - Claude Code 2.1.310, headless (`claude -p`), with `claude-sonnet-5-5`, up to 80 turns and $3. It could edit files, run `pnpm typecheck`, `pnpm lint`, `pnpm build`, `ls`, `cat` and any `npx buttery` command, and call the MCP server from the app's `.mcp.json` and nothing else.
  - Codex CLI 0.164.0 (`codex exec`), with the account's model, `gpt-6-astra`, at medium reasoning effort, in its workspace-write sandbox with network access on so `buttery check` could start the dev server. It read the app's `AGENTS.md` and `.codex/config.toml` as any project of its own.
- Apps: made with `buttery create --template blank` from packed tarballs of this release, outside the repository, with everything a new app gets. The messy-form task's app started from a quote request form built without buttery: a table for its fields, floats, hand-written CSS with hex colors and pixel sizes.
- Seven tasks, each the same words for both agents, each asking for buttery and nothing hand-styled, 390px and 1280px in light and dark, and typecheck and lint passing (the prompts are kept with the runs):
  1. a settings screen for a coffee roastery's shop: profile, notifications, a danger zone with a confirmation, and a save button disabled until something changed;
  2. make the messy quote form buttery, same fields and behavior;
  3. a three-step onboarding a new visitor sees once, skippable, remembered in localStorage;
  4. a pricing page: three plans, monthly and yearly, one recommended, four questions;
  5. a toolbar with ten actions that all stay reachable at 390px without wrapping or overflowing;
  6. the filtered table of bike repair orders from the earlier runs;
  7. the star rating component from the second run, used in a review form.
- Scored with typecheck, lint, a production build, `buttery check --json` on the first screen and on any component preview, in Chromium and WebKit, at 390 and 1280 in light and dark, screenshots of each, and a count of raw hex colors and pixel values in the files each agent changed.

### Results

| Task | Agent | Turns | Time | Cost | Typecheck, lint, build | Layout problems | Checked its own layout | Built with |
|---|---|---|---|---|---|---|---|---|
| Settings | Claude Code | 12 | 53s | $0.27 | pass | 0 | yes, `npx buttery check` | `SettingsPage`, `SettingsSection`, `SettingRow`, `Switch`, `TextField`, `Dialog`, `toast` |
| Settings | Codex | 23 | 108s | | pass | 0 | yes, `buttery_check_layout` | `SettingsPage`, `SettingsSection`, `Checkbox`, `TextField`, `Dialog`, `Callout` |
| Messy form | Claude Code | 18 | 55s | $0.26 | pass | 0 | yes | `Container`, `Surface`, `Grid`, `TextField`, `NumberField`, `Select`, `TextArea`, `Checkbox`, `Callout`, `ArrowLink` |
| Messy form | Codex | 35 | 141s | | pass | 0 | yes, four times | `SettingsPage`, `Grid`, `Field`, `TextField`, `Select`, `TextArea`, `Checkbox`, `Divider`, `Callout`, `ArrowLink` |
| Onboarding | Claude Code | 29 | 86s | $0.35 | pass | 0, once the check could run (below) | yes, `buttery_check_layout` | `Onboarding` with `Onboarding.Shared` scenes, `RadioCardGroup` |
| Onboarding | Codex | 28 | 123s | | pass | 0 | yes, three times | `Dialog`, `PageDots`, `Morph`, `RadioCardGroup` |
| Pricing | Claude Code | 10 | 26s | $0.16 | pass | 0 | yes | `AppPage`, `PlanComparison`, `Accordion` |
| Pricing | Codex | 20 | 103s | | pass | 0 | yes | `Page`, `Section`, `PlanComparison`, `Faq` |
| Toolbar | Claude Code | 13 | 45s | $0.16 | pass | 0 | yes | `OverflowCluster`, `Button` |
| Toolbar | Codex | 20 | 59s | | pass | 0 | yes | `OverflowCluster`, `Button` |
| Filtered table | Claude Code | 10 | 47s | $0.21 | pass | 0 | yes | `AppPage`, `DataTable`, `FilterBar` and `FilterPill`, `SearchField`, `StatusBadge` |
| Filtered table | Codex | 24 | 125s | | pass | 0 | yes | the same, in a page of its own with a spec |
| Star rating | Claude Code | 21 | 123s | $0.35 | pass | 0, form and preview | yes | `buttery create component`; `Pressable`, `useControllableState`, `variants()`, `Field`, `TextArea`, `Callout` |
| Star rating | Codex | 23 | 117s | | pass | 0, form and preview | yes, twice | `buttery create component`; `Control`, `Pressable`, `useControllableState`, `variants()`, `Surface`, `Field`, `TextArea` |

Codex runs on the account's plan, so it reports tokens rather than a price; Claude Code's seven tasks cost $1.76 together.

### What it found
- Every one of the fourteen apps passed typecheck, lint and the build, and every page the agents built held at both widths in both themes and both engines. Neither agent left a raw color or pixel value in anything it changed, and the messy form's hand-written stylesheet went.
- Every run checked its own layout before finishing. Claude Code mostly ran `npx buttery check`; Codex called `buttery_check_layout` every time, up to four times on the messy form, and `buttery_lint` on nearly every task. Both agents searched the server once or twice and fetched two or three components per task.
- Both built the toolbar on `OverflowCluster` at the first try, and both star ratings were built from the public parts the second run's fix named, with roving focus, arrow keys, a hover preview and a hidden input.
- Claude Code's onboarding app failed the scorer's WebKit check with "buttery didn't report settled within 5000ms", though its page had no layout problem and Claude's own check had passed. It came back only while other agents loaded the machine: the onboarding dialog was still arriving when the check switched to reduced motion, and in WebKit Motion drops such an animation without reporting its end, so buttery's settled flag never came back. `useAnimationTracking` held a layout animation for such a case, but not a component's own.
- Claude Code built the messy form as a `Container` around a `Surface` and gave its grid `columns={{ base: 1, md: 2 }}`, which stayed one column at 1280px: responsive columns step with the nearest size container, and neither is one. Nothing said why.
- The same form wrote `<Select label="Bag size">` beside `<TextField label="Company">` and got no visible label: a text field shows its label, and a `Select`'s names it for screen readers unless a `Field` is around it. Codex put its select in a `Field`.
- Codex loads a project's `.codex/config.toml`, and so the app's MCP server, only once the folder is trusted, and `--ignore-user-config` leaves the project's servers out too; a first attempt with that flag had no buttery tools. Claude Code loads `buttery_search` and `buttery_get` at once and defers the other three until the model looks them up, which it did when it needed the layout check.

### Fixed
- `useAnimationTracking` lets go of a component's own animation, not only its layout animation, once the longest animation would have ended after a switch to reduced motion. The failing check passes under the same load.
- `Grid` warns in development when its columns are responsive and nothing above it is a size container, naming what to put it in.
- `Select`'s `label` JSDoc, which the manifest and `buttery_get` carry, says the label isn't shown and that a `Field` shows it; the meta and the skill say the same.
- The MCP server's README and DX_AND_AI say how Codex reads a project's config and which tools Claude Code defers.
- Next: the run with Gemini CLI once it's installed and signed in here, and a look at whether the forms the agents build in a `Container` should get a narrower column by default.

## 0.11.0: the command line, second run (2026-10-24)

The first run's next steps: an app with everything a new app gets, an agent that can run the layout check, the custom component task, and the transcripts kept.

### Setup
- Agent: Claude Code 2.1.309, headless (`claude -p`), with `claude-sonnet-5-5`. No web access; it could edit files, run `pnpm typecheck`, `pnpm lint`, `pnpm build`, `ls` and any `npx buttery` command, and call the MCP server. The whole transcript of each run is kept.
- Apps: made with `create-buttery` from the blank template, from packed 0.11.0 tarballs, outside the repository. Each had what every new app gets: `AGENTS.md` with buttery's section, `CLAUDE.md` importing it, the make-it-buttery skill, `@butteryui/mcp` in `.mcp.json`, and the `buttery` command, so `npx buttery check` could start the app's dev server.
- Two tasks:
  - the filtered table page from the first run, word for word;
  - a component of its own: a star rating for reviews, one to five, by pointer or keyboard, with a preview on hover and a value a form can read, built to look and behave like one of buttery's, and used on the first screen in a review form that says thanks.
- Scored with typecheck, lint, a production build, `buttery check --json` on the first screen and on any component preview, in Chromium and WebKit, at 390 and 1280 in light and dark, and screenshots.

### Results

| Task | Turns | Time | Cost | Typecheck, lint, build | Layout problems | Checked its own layout | Built with |
|---|---|---|---|---|---|---|---|
| Filtered table | 12 | 37s | $0.22 | pass | 0 | yes, once, clean | `AppPage`, `PageHeader`, `DataTable`, `FilterBar` and `FilterPill`, `SearchField`, `StatusBadge` |
| Star rating | 33 | 92s | $0.38 | pass | 0, on the form and the component's preview | yes, both pages, clean | `buttery create component`; `AppPage`, `PageHeader`, `Field`, `TextArea`, `Callout`, `Button`, `Icon` |

### What it found
- Both agents ran `npx buttery check` on their own work before they finished, which the first run's agents couldn't do, and both came back clean; scored in both engines afterwards, so did their apps.
- Both loaded the make-it-buttery skill and made one search and one get on the MCP server.
- The component agent started from `buttery create component`, kept its preview page and spec, and rewrote the spec to test pointer, hover and keyboard. It couldn't run the spec here, since the run allowed only the commands above.
- Its rating was a real radio group: roving focus, arrow keys, Home and End, a hover preview, a hidden input for forms, and buttery's focus and press classes. It wasn't built from the public parts buttery's own components use: it wrote its controlled state by hand rather than with `useControllableState`, drew plain buttons rather than `Pressable` in a `Control`, and marked its component with `data-bt`, buttery's own attribute.
- Its first CSS guessed a height token that doesn't exist, `--bt-h-md` with a 32px fallback, and it found the real one, `--bt-h-control`, by searching the installed CSS. buttery's stylelint config would have let the guess through: it checks raw values, not whether a `--bt-*` name in a `var()` is a token.

### Fixed
- `AGENTS.md`'s buttery section and the skill now name the public parts for a component of an app's own (`Control`, `Pressable`, `SharedIndicator`, `variants()` and `useControllableState`) and say that `data-bt` is buttery's.
- Next: stylelint flags a `--bt-*` name that isn't a token, with the nearest one, and the next run tries the agents this machine doesn't have.

## 0.10.0: the MCP server, first run (2026-10-23)

A small run before 0.10.0, to see whether `@butteryui/mcp` changes what an agent builds. The full evaluation, with the command line tool, more tasks and more agents, comes with 1.0.

### Setup
- Agent: Claude Code, headless (`claude -p`), with `claude-sonnet-5-5`. No web access; it could edit files and run only `pnpm typecheck`, `pnpm lint`, `pnpm build` and `ls`.
- Apps: copies of the starter outside the repository, installed from packed tarballs of `@butteryui/core`, `react`, `test` and `lint`, so the agent saw none of the repository's docs or agent files. What it could read was the app and `node_modules`.
- Two conditions: with `@butteryui/mcp` installed and configured (`--strict-mcp-config`), and without it.
- Two tasks:
  - a filtered table page: replace the first screen with 12 made-up repair orders for a bike shop, sortable by date and total, filtered by status, searchable by customer or bike, with something sensible when nothing matches;
  - a sign-in screen: an email address or phone number, then a one-time code, with a demo code shown since there's no server, and a way to sign out.
  Both asked for buttery, for 390px and 1280px in light and dark, and for `pnpm typecheck` and `pnpm lint` to pass.
- Scored with typecheck, lint, a production build, `checkButtery` on the first screen at 390 and 1280 in light and dark, and screenshots.

### Results

| Task | MCP server | Turns | Time | Cost | Typecheck, lint, build | Layout problems | Built with |
|---|---|---|---|---|---|---|---|
| Filtered table | no | 18 | 51s | $0.17 | pass | 0 | `AppPage`, `PageHeader`, `DataTable`, `SearchField`, `Select`, `StatusBadge` |
| Filtered table | yes | 17 | 37s | $0.23 | pass | 0 | `AppPage`, `PageHeader`, `DataTable`, `FilterBar` and `FilterPill`, `SearchField`, `StatusBadge` |
| Sign-in | no | 16 | 34s | $0.18 | pass | 4, then 0 after the fix below | `AuthFlow`, `AppPage`, `PageHeader`, `Center` |
| Sign-in | yes | 10 | 25s | $0.10 | pass | 4, then 0 after the fix below | `AuthFlow`, `AppPage`, `PageHeader`, `Stack` |

### What it found
- Both agents finished both tasks, and typecheck, lint and the build passed every time. Neither table page had a layout problem.
- Both sign-in agents centered `AuthFlow` in a parent, a centered `Stack` or `Center`, and there it collapsed: `AuthFlow` is a size container, which has no width of its own, so it shrank to its padding and its field overflowed by 32px in every condition. Fixed in `AuthFlow` (it takes its container's full width), with a test that centers it in a `Stack`; both apps then had no layout problems.
- With the server, the table agent built its filter from the data table page's own parts, `FilterBar` and `FilterPill`, where the other used a `Select`. The sign-in agent with the server took 10 turns to the other's 16.
- Without the server, the sign-in agent still found `AuthFlow`, in `node_modules`.
- No run checked its own layout: the agents couldn't start a dev server, which `pnpm score` and the server's `buttery_check_layout` need. Each said so in its summary instead of claiming the page held.

### Limits, and the next run
- One run per task and condition, with one agent, so the differences in turns, time and cost are anecdotes, not measurements.
- The runs kept only their final result, so the number of calls to each tool wasn't recorded. The next run keeps the transcript.
- The next run lets the agent start the dev server, so the layout check is part of the work, and adds the custom-component task and the other agents DX_AND_AI names, which aren't installed on the machine this ran on.
