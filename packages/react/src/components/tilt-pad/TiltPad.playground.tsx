import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Chip, TiltPad } from "@butteryui/react";
import type { TiltValue } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "TiltPad",
  description:
    "A small pad for tilting something in 3D: drag the knob or use the arrow keys.",
  order: 120,
  status: "stable",
  since: "0.6.0",
};

const LEVEL: TiltValue = { x: 0, y: 0 };

function Tilt(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0.4, y: -0.2 });
  const level = tilt.x === 0 && tilt.y === 0;
  return (
    <Inline gap={3} align="center">
      <Text variant="label">Tilt</Text>
      <Chip
        aria-disabled={level}
        onClick={() => {
          setTilt(LEVEL);
        }}
      >
        Flat
      </Chip>
      <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
    </Inline>
  );
}

type Direction = "level" | "left" | "right" | "up" | "down";

const DIRECTION_NAMES: readonly [Direction, ...Direction[]] = [
  "level",
  "left",
  "right",
  "up",
  "down",
];

const DIRECTIONS: Readonly<Record<Direction, TiltValue>> = {
  level: { x: 0, y: 0 },
  left: { x: -0.6, y: 0 },
  right: { x: 0.6, y: 0 },
  up: { x: 0, y: -0.6 },
  down: { x: 0, y: 0.6 },
};

export const live: LiveDemo = {
  controls: {
    defaultValue: {
      kind: "choice",
      options: DIRECTION_NAMES,
      initial: "right",
    },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ defaultValue, disabled }) => {
    const direction = demoChoice(defaultValue, DIRECTION_NAMES);
    return (
      <TiltPad
        key={direction}
        label="Tilt"
        defaultValue={DIRECTIONS[direction]}
        disabled={disabled === true}
      />
    );
  },
  code: ({ defaultValue, disabled }) => {
    const { x, y } = DIRECTIONS[demoChoice(defaultValue, DIRECTION_NAMES)];
    return `<TiltPad label="Tilt" defaultValue={{ x: ${String(x)}, y: ${String(y)} }}${disabled === true ? " disabled" : ""} />`;
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "Tilt with a chip that lays it flat",
    description:
      "Drag the knob or use the arrow keys; the accent arc shows the direction. Flat glides back on spring.smooth.",
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
