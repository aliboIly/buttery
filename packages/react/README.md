# @butteryui/react

buttery's React components and patterns: buttons, fields, menus, dialogs, sheets, tables, app shells and page patterns, built on the tokens, layout primitives and motion in [`@butteryui/core`](https://www.npmjs.com/package/@butteryui/core).

## Install

```bash
npm install @butteryui/react @butteryui/core react react-dom
```

## Use

Import the two stylesheets once, wrap the app in `ButteryProvider`, and lay it out with the primitives:

```tsx
import "@butteryui/core/styles.css";
import "@butteryui/react/styles.css";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import { Button, ButteryProvider } from "@butteryui/react";

export function App(): ReactElement {
  return (
    <ButteryProvider>
      <Stack gap={3} pad={6}>
        <Text variant="title">Payouts are paused</Text>
        <Button variant="primary">Add a bank account</Button>
      </Stack>
    </ButteryProvider>
  );
}
```

Every component has a page with live examples on [the docs site](https://aliboily.github.io/buttery/components/overview), and each page is Markdown at its address plus `.md`, for coding agents.

## License

MIT
