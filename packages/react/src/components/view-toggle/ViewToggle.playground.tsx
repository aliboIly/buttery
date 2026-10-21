import type { DemoSection } from "@buttery/core";
import { ViewToggle } from "@buttery/react";

export const demos: readonly DemoSection[] = [
  {
    title: "Grid or list",
    description:
      "Two icon segments; hover or focus one for its name. The choice slides on spring.snappy.",
    render: () => <ViewToggle />,
  },
];
