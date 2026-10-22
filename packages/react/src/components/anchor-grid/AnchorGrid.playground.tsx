import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { AnchorGrid } from "@buttery/react";
import type { Anchor } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "AnchorGrid",
  description:
    "A 3\u00d73 grid of dots for picking where something sits: a corner, an edge or the center.",
  order: 10,
  status: "stable",
  since: "0.5.0",
};

function Placement(): ReactElement {
  const [anchor, setAnchor] = useState<Anchor>("center");
  return (
    <Inline gap={3} align="center">
      <Text variant="label">Position</Text>
      <AnchorGrid label="Anchor" value={anchor} onValueChange={setAnchor} />
      <Text variant="caption">{anchor}</Text>
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Placement",
    description:
      "Press anywhere in the box or use the arrow keys; the knob slides to the new dot on spring.snappy.",
    render: () => <Placement />,
  },
  {
    title: "Disabled",
    render: () => (
      <AnchorGrid label="Anchor" defaultValue="top-right" disabled />
    ),
  },
];
