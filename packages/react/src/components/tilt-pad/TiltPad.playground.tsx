import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Chip, TiltPad } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

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
      <Text variant="label">Lean</Text>
      <Chip
        aria-disabled={level}
        onClick={() => {
          setTilt(LEVEL);
        }}
      >
        Flat
      </Chip>
      <TiltPad label="Lean" value={tilt} onValueChange={setTilt} />
    </Inline>
  );
}

type Lean = "level" | "left" | "right" | "up" | "down";

const LEAN_NAMES: readonly [Lean, ...Lean[]] = [
  "level",
  "left",
  "right",
  "up",
  "down",
];

const LEANS: Readonly<Record<Lean, TiltValue>> = {
  level: { x: 0, y: 0 },
  left: { x: -0.6, y: 0 },
  right: { x: 0.6, y: 0 },
  up: { x: 0, y: -0.6 },
  down: { x: 0, y: 0.6 },
};

export const live: LiveDemo = {
  controls: {
    defaultValue: { kind: "choice", options: LEAN_NAMES, initial: "right" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ defaultValue, disabled }) => {
    const lean = demoChoice(defaultValue, LEAN_NAMES);
    return (
      <TiltPad
        key={lean}
        label="Lean"
        defaultValue={LEANS[lean]}
        disabled={disabled === true}
      />
    );
  },
  code: ({ defaultValue, disabled }) => {
    const { x, y } = LEANS[demoChoice(defaultValue, LEAN_NAMES)];
    return `<TiltPad label="Lean" defaultValue={{ x: ${String(x)}, y: ${String(y)} }}${disabled === true ? " disabled" : ""} />`;
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "Lean with a chip that lays it flat",
    description:
      "Drag the knob or use the arrow keys; the accent arc shows the direction. Flat glides back on spring.smooth.",
    render: () => <Tilt />,
  },
  {
    title: "Level and disabled",
    render: () => (
      <Inline gap={4} align="center">
        <TiltPad label="Lean" />
        <TiltPad label="Lean" defaultValue={{ x: -0.6, y: 0.6 }} disabled />
      </Inline>
    ),
  },
];
