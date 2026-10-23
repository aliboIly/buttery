import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Button, ValueBadge } from "@butteryui/react";

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

function reserveOf(value: string | number | boolean | undefined): string[] {
  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

export const live: LiveDemo = {
  controls: {
    variant: {
      kind: "choice",
      options: ["soft", "solid", "outline"],
      initial: "soft",
    },
    children: { kind: "text", initial: "80%" },
    reserve: { kind: "text", initial: "0%, 100%" },
  },
  render: ({ variant, children, reserve }) => (
    <ValueBadge
      variant={demoChoice(variant, ["soft", "solid", "outline"])}
      reserve={reserveOf(reserve)}
    >
      {String(children)}
    </ValueBadge>
  ),
  code: ({ variant, children, reserve }) =>
    `<ValueBadge variant="${String(variant)}" reserve={[${reserveOf(reserve)
      .map((part) => `"${part}"`)
      .join(", ")}]}>${String(children)}</ValueBadge>`,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Steady width",
    description:
      "It keeps room for -180° and 180°, so it doesn't jitter as the value changes.",
    render: () => <StepDemo />,
  },
  {
    title: "Soft, solid and outline",
    description:
      "Soft, the default, on bg-control; solid filled with text-secondary; outline, a 1px edge with no fill, for a quiet row. Each keeps its reserved width.",
    render: () => (
      <Inline gap={2} align="center" wrap>
        <ValueBadge reserve={["0%", "100%"]}>80%</ValueBadge>
        <ValueBadge variant="solid" reserve={["0%", "100%"]}>
          80%
        </ValueBadge>
        <ValueBadge variant="outline" reserve={["0%", "100%"]}>
          80%
        </ValueBadge>
      </Inline>
    ),
  },
];
