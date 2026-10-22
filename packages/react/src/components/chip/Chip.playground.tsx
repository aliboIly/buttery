import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Chip } from "@buttery/react";

function ResetDemo(): ReactElement {
  const [angle, setAngle] = useState(12);
  return (
    <Inline gap={2} align="center">
      <Text variant="label">Rotation {angle}°</Text>
      <Chip
        aria-disabled={angle === 0 || undefined}
        onClick={() => {
          setAngle(0);
        }}
      >
        Reset
      </Chip>
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Reset",
    description:
      "Press Reset and it disables itself until the value changes again.",
    render: () => <ResetDemo />,
  },
];
