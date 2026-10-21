import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { ColorDot, IconButton } from "@buttery/react";
import { ArrowLeftRight } from "lucide-react";

function GradientColors(): ReactElement {
  const [from, setFrom] = useState("#a5b4fc");
  const [to, setTo] = useState("#f0abfc");
  return (
    <Inline gap={1.5} align="center">
      <ColorDot label="First hue" value={from} onValueChange={setFrom} />
      <ColorDot label="Second hue" value={to} onValueChange={setTo} />
      <IconButton
        icon={ArrowLeftRight}
        label="Swap colors"
        size="sm"
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
      />
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "A gradient's colors",
    description:
      "Two dots 6px apart with a button that swaps them. Each opens buttery's color picker in a popover.",
    render: () => <GradientColors />,
  },
  {
    title: "Disabled",
    render: () => <ColorDot label="Fill" defaultValue="#d6d3d1" disabled />,
  },
];
