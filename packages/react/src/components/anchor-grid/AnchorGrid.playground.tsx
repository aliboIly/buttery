import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { AnchorGrid } from "@buttery/react";
import type { Anchor } from "@buttery/react";

function Placement(): ReactElement {
  const [anchor, setAnchor] = useState<Anchor>("center");
  return (
    <Inline gap={3} align="center">
      <Text variant="label">Position</Text>
      <AnchorGrid label="Position" value={anchor} onValueChange={setAnchor} />
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
      <AnchorGrid label="Position" defaultValue="top-right" disabled />
    ),
  },
];
