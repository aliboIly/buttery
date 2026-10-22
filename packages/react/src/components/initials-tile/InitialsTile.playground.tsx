import { Inline } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { InitialsTile } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "InitialsTile",
  description:
    "A square tile with up to two initials, standing in for a workspace or team that has no picture.",
  order: 90,
  status: "new",
  since: "0.8.0",
};

export const live: LiveDemo = {
  controls: {
    name: { kind: "text", initial: "Harbor Beans" },
    size: { kind: "choice", options: ["xs", "sm", "md", "lg"], initial: "md" },
  },
  render: ({ name, size }) => (
    <InitialsTile
      name={String(name)}
      size={demoChoice(size, ["sm", "xs", "md", "lg"])}
    />
  ),
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
