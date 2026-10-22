import type { DemoSection, DocsPage } from "@buttery/core";
import { ViewToggle } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "ViewToggle",
  description:
    "Two icon segments that switch a collection between a grid and a list, each named by its tooltip.",
  order: 120,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Grid or list",
    description:
      "Two icon segments; hover or focus one for its name. The choice slides on spring.snappy.",
    render: () => <ViewToggle />,
  },
];
