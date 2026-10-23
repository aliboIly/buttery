import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";

export const page: DocsPage = {
  section: "components/actions",
  title: "Stray",
  description: "A component the docs site's table of exports doesn't list.",
  order: 990,
  status: "new",
  since: "0.9.0",
};

export const live: LiveDemo = {
  controls: {},
  render: () => <span>Stray</span>,
};

export const demos: readonly DemoSection[] = [];
