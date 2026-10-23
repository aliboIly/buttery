import { Inline } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { InitialsTile } from "@butteryui/react";

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
    shape: {
      kind: "choice",
      options: ["rounded", "circle"],
      initial: "rounded",
    },
  },
  render: ({ name, size, shape }) => (
    <InitialsTile
      name={String(name)}
      size={demoChoice(size, ["sm", "xs", "md", "lg"])}
      shape={demoChoice(shape, ["rounded", "circle"])}
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
  {
    title: "Rounded and circle",
    description:
      "Rounded squares by default; circles to sit beside round avatars, such as a team in a list of people.",
    render: () => (
      <Inline gap={3} align="center">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <InitialsTile
            key={size}
            name="Harbor Beans"
            size={size}
            shape="circle"
            label={`Harbor Beans, ${size}, circle`}
          />
        ))}
      </Inline>
    ),
  },
];
