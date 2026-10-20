import { HelpCircle, Redo2, Undo2, X } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { IconButton } from "@buttery/react";
import { Grid3x3 } from "lucide-react";

function ToggleDemo(): ReactElement {
  const [on, setOn] = useState(false);
  return (
    <IconButton
      icon={Grid3x3}
      label="Show the grid"
      aria-pressed={on}
      onClick={() => {
        setOn(!on);
      }}
    />
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Sizes",
    description:
      "36px in headers and toolbars, 28px to close a dialog. Hover or focus one for its tooltip.",
    render: () => (
      <Inline gap={1} align="center">
        <IconButton icon={Undo2} label="Undo" />
        <IconButton icon={Redo2} label="Redo" />
        <IconButton icon={HelpCircle} label="Help" />
        <IconButton icon={X} label="Close" size="sm" />
      </Inline>
    ),
  },
  {
    title: "Toggle and disabled",
    render: () => (
      <Inline gap={1} align="center">
        <ToggleDemo />
        <IconButton icon={Redo2} label="Redo" disabled />
      </Inline>
    ),
  },
];
