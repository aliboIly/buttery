import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Chip, TiltPad } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

const LEVEL: TiltValue = { x: 0, y: 0 };

function Tilt(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0.4, y: -0.2 });
  const level = tilt.x === 0 && tilt.y === 0;
  return (
    <Inline gap={3} align="center">
      <Text variant="label">Tilt</Text>
      <Chip
        disabled={level}
        onClick={() => {
          setTilt(LEVEL);
        }}
      >
        Reset
      </Chip>
      <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Tilt with a reset",
    description:
      "Drag the knob or use the arrow keys; the accent arc shows the direction. Reset glides back on spring.smooth.",
    render: () => <Tilt />,
  },
  {
    title: "Level and disabled",
    render: () => (
      <Inline gap={4} align="center">
        <TiltPad label="Tilt" />
        <TiltPad label="Tilt" defaultValue={{ x: -0.6, y: 0.6 }} disabled />
      </Inline>
    ),
  },
];
