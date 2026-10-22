import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ViewToggle } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "ViewToggle",
  description:
    "Two icon segments that switch a collection between a grid and a list, each named by its tooltip.",
  order: 120,
  status: "new",
  since: "0.8.0",
};

export const live: LiveDemo = {
  controls: {
    defaultValue: {
      kind: "choice",
      options: ["grid", "list"],
      initial: "grid",
    },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ defaultValue, disabled }) => {
    const view = demoChoice(defaultValue, ["grid", "list"]);
    return (
      <ViewToggle key={view} defaultValue={view} disabled={disabled === true} />
    );
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "Grid or list",
    description:
      "Two icon segments; hover or focus one for its name. The choice slides on spring.snappy.",
    render: () => <ViewToggle />,
  },
];
