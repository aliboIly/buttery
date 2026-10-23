import {
  Bell,
  HelpCircle,
  Plus,
  Redo2,
  Settings,
  Undo2,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { IconButton } from "@butteryui/react";
import { Grid3x3 } from "lucide-react";

export const page: DocsPage = {
  section: "components/actions",
  title: "IconButton",
  description:
    "A square button that shows only an icon, named by a label that also appears as its tooltip.",
  order: 50,
  status: "stable",
  since: "0.4.0",
};

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

const ICONS = { Settings, Bell, Plus, Undo2 } as const;

const ICON_NAMES = ["Settings", "Bell", "Plus", "Undo2"] as const;

export const live: LiveDemo = {
  controls: {
    icon: { kind: "choice", options: ICON_NAMES, initial: "Settings" },
    label: { kind: "text", initial: "Settings" },
    variant: {
      kind: "choice",
      options: ["ghost", "primary"],
      initial: "ghost",
    },
    size: { kind: "choice", options: ["md", "sm"], initial: "md" },
    dot: { kind: "toggle", initial: false },
  },
  render: ({ icon, label, variant, size, dot }) => (
    <IconButton
      icon={ICONS[demoChoice(icon, ICON_NAMES)]}
      label={String(label)}
      variant={demoChoice(variant, ["ghost", "primary"])}
      size={demoChoice(size, ["md", "sm"])}
      dot={dot === true}
    />
  ),
  code: ({ icon, label, variant, size, dot }) =>
    `<IconButton icon={${demoChoice(icon, ICON_NAMES)}} label="${String(label)}" variant="${String(variant)}" size="${String(size)}"${dot === true ? " dot" : ""} />`,
};

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
    title: "With a dot",
    description:
      "An accent dot for something new behind the button; its name says so too.",
    render: () => (
      <Inline gap={1} align="center">
        <IconButton icon={Bell} label="Notifications" dot />
        <IconButton icon={HelpCircle} label="What's new" dot size="sm" />
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
