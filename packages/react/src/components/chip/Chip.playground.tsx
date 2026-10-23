import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Chip } from "@buttery/react";

export const page: DocsPage = {
  section: "components/actions",
  title: "Chip",
  description:
    "A small reset action that sits next to a control, such as Reset beside a slider's label.",
  order: 30,
  status: "stable",
  since: "0.4.0",
};

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

export const live: LiveDemo = {
  controls: {
    "aria-disabled": { kind: "toggle", initial: false },
    children: { kind: "text", initial: "Reset" },
  },
  render: ({ "aria-disabled": unavailable, children }) => (
    <Chip aria-disabled={unavailable === true}>{String(children)}</Chip>
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Reset",
    description:
      "Press Reset and it disables itself until the value changes again.",
    render: () => <ResetDemo />,
  },
];
