import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, ValueBadge } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "ValueBadge",
  description:
    "A small badge that shows a formatted value and keeps room for its longest value, so it never changes width.",
  order: 160,
  status: "stable",
  since: "0.4.0",
};

function StepDemo(): ReactElement {
  const [angle, setAngle] = useState(0);
  return (
    <Inline gap={2} align="center">
      <ValueBadge reserve={["-180°", "180°"]}>{`${String(angle)}°`}</ValueBadge>
      <Button
        size="sm"
        onClick={() => {
          setAngle(angle === 180 ? -180 : angle + 45);
        }}
      >
        Turn 45°
      </Button>
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Steady width",
    description:
      "It keeps room for -180° and 180°, so it doesn't jitter as the value changes.",
    render: () => <StepDemo />,
  },
];
