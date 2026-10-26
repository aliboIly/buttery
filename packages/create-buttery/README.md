# create-buttery

Starts an app on buttery from a template:

```bash
npm create buttery my-shop -- --template dashboard
```

`pnpm create buttery my-shop` and `yarn create buttery my-shop` work the same and install with the package manager that ran them. The templates are `blank` (the default), `dashboard`, `editor` and `marketing`. The new app has buttery's packages, styles and provider wired up, its lint configs, Playwright with the layout checks, specs of its own, an `AGENTS.md` and the MCP server's config for coding agents.

It runs `buttery create` from [`@butteryui/cli`](https://www.npmjs.com/package/@butteryui/cli), which also adds pages and components to the app and checks its layout. [Command line](https://aliboily.github.io/buttery/tools/command-line) on the docs site has the details.

## License

MIT
