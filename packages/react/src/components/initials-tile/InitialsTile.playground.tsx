import { Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { InitialsTile } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "InitialsTile",
  description:
    "A square tile with up to two initials, standing in for a workspace or team that has no picture.",
  order: 90,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Sizes",
    description: "20 and 24 at r6, 32 and 40 at r8.",
    render: () => (
      <Inline gap={3} align="center">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <InitialsTile
            key={size}
            name="Harbor Beans"
            size={size}
            label={`Harbor Beans, ${size}`}
          />
        ))}
      </Inline>
    ),
  },
];
