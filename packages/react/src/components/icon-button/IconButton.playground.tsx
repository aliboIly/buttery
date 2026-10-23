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
import { Inline, Stack } from "@butteryui/core";
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

function ToggleDemo({
  variant = "ghost",
  label = "Show the grid",
  start = false,
}: {
  readonly variant?: "ghost" | "soft";
  readonly label?: string;
  readonly start?: boolean;
}): ReactElement {
  const [on, setOn] = useState(start);
  return (
    <IconButton
      icon={Grid3x3}
      label={label}
      variant={variant}
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
      options: ["ghost", "soft", "outline", "primary"],
      initial: "ghost",
    },
    size: { kind: "choice", options: ["md", "sm", "lg"], initial: "md" },
    dot: { kind: "toggle", initial: false },
  },
  render: ({ icon, label, variant, size, dot }) => (
    <IconButton
      icon={ICONS[demoChoice(icon, ICON_NAMES)]}
      label={String(label)}
      variant={demoChoice(variant, ["ghost", "soft", "outline", "primary"])}
      size={demoChoice(size, ["md", "sm", "lg"])}
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
      "36px in headers and toolbars, 28px to close a dialog, 48px beside 48px buttons and fields. Hover or focus one for its tooltip.",
    render: () => (
      <Inline gap={1} align="center">
        <IconButton icon={Undo2} label="Undo" />
        <IconButton icon={Redo2} label="Redo" />
        <IconButton icon={HelpCircle} label="Help" />
        <IconButton icon={X} label="Close" size="sm" />
        <IconButton icon={Plus} label="Add a photo" size="lg" />
      </Inline>
    ),
  },
  {
    title: "Ghost, soft, outline and primary",
    description:
      "Ghost shows its background only on hover; soft sits on bg-control and outline draws a 1px edge, so either reads as a button at rest; primary is the round create button. Each at sm, md and lg.",
    render: () => (
      <Stack gap={3}>
        {(["ghost", "soft", "outline", "primary"] as const).map((variant) => (
          <Inline key={variant} gap={2} align="center">
            <IconButton
              icon={Settings}
              label={`Settings, ${variant}, small`}
              variant={variant}
              size="sm"
            />
            <IconButton
              icon={Settings}
              label={`Settings, ${variant}`}
              variant={variant}
            />
            <IconButton
              icon={Settings}
              label={`Settings, ${variant}, large`}
              variant={variant}
              size="lg"
            />
          </Inline>
        ))}
      </Stack>
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
    description:
      "A toggle holds its background while aria-pressed; a soft toggle fills with the primary color, as a ticked checkbox does.",
    render: () => (
      <Inline gap={1} align="center">
        <ToggleDemo />
        <ToggleDemo variant="soft" label="Show the rulers" start />
        <IconButton icon={Redo2} label="Redo" disabled />
        <IconButton icon={Redo2} label="Redo, soft" variant="soft" disabled />
        <IconButton
          icon={Redo2}
          label="Redo, outline"
          variant="outline"
          disabled
        />
      </Inline>
    ),
  },
];
