# @butteryui/cli

The `buttery` command: it starts an app from one of buttery's four templates, adds a page from its patterns or a component of the app's own, runs the layout checks on the running app, and sets buttery up in a React app that doesn't have it yet.

## Install

```bash
npm install --save-dev @butteryui/cli
```

Or start a new app, which installs it:

```bash
npm create buttery my-shop -- --template dashboard
```

## Use

```bash
npx buttery create my-shop --template dashboard   # blank, dashboard, editor or marketing
npx buttery add page table --name Customers        # a page from a pattern, routed and in the sidebar
npx buttery create component OrderCard --purpose "One order, as a card."
npx buttery check /customers --json                # the layout checks on the running app
npx buttery init                                   # buttery in an app you have: packages, styles, provider, lint, agents
npx buttery doctor                                 # the versions, the files and what's missing
```

`check` opens the app in Chromium and WebKit at a phone's width and a desktop's, in light and dark, and reports each overlap, overflow, crowded line or small target once, with its fix; `--json` writes them for a script or a coding agent to read. Every app a template makes passes it unchanged.

[Command line](https://aliboily.github.io/buttery/tools/command-line) on the docs site has every command, its options and what it writes.

## License

MIT
