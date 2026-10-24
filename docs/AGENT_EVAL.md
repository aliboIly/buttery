# Agent evaluation

How buttery checks that coding agents build well with it, run by run. Anything that trips an agent becomes a better API, example, warning or doc (DX_AND_AI §6).

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
