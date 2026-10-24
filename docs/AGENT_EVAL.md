# Agent evaluation

How buttery checks that coding agents build well with it, run by run. Anything that trips an agent becomes a better API, example, warning or doc (DX_AND_AI §6).

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
