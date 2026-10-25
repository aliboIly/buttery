# @butteryui/core

The base of buttery: design tokens as CSS variables and typed TypeScript, the layout primitives (`Stack`, `Inline`, `Grid`, `Surface`, `Text` and the rest), the layers floating UI sits in, and the motion presets. [`@butteryui/react`](https://www.npmjs.com/package/@butteryui/react) builds its components on it.

## Install

```bash
npm install @butteryui/core react react-dom
```

## Use

```tsx
import "@butteryui/core/styles.css";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@butteryui/core";

export function Notice(): ReactElement {
  return (
    <Surface level="card" pad={5}>
      <Stack gap={2}>
        <Text variant="title-sm">Roasting on Monday</Text>
        <Text variant="body-sm" tone="secondary">
          Orders placed by noon ship the same afternoon.
        </Text>
      </Stack>
    </Surface>
  );
}
```

What else it exports:

- `@butteryui/core/palettes`: the gradients and solid colors for content, such as a backdrop or a chart.
- `@butteryui/core/layout`: the layout checks behind `LayoutGuard` and `@butteryui/test`.
- `@butteryui/core/tokens.json` and `@butteryui/core/tailwind.css`: the tokens for other tools.

The tokens, the layout rules and every primitive are on [the docs site](https://aliboily.github.io/buttery/). The package carries the same docs for its version, for coding agents and anyone offline: `dist/llms.txt` lists every page, each a Markdown file under `dist/docs/`, and `dist/llms-full.txt` holds them all in one file.

## License

MIT
