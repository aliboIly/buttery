import { Inline, Stack, Text, demoChoice } from "@butteryui/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import {
  Button,
  IconButton,
  NotificationNudge,
  SearchField,
} from "@butteryui/react";
import { Bell } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "NotificationNudge",
  description:
    "A small popover that points at a button with news, once: a title, a line, an action and Later, opening by itself without taking focus.",
  order: 90,
  status: "new",
  since: "0.8.0",
};

function TopBarNudge(): ReactElement {
  const [round, setRound] = useState(0);
  return (
    <Stack gap={4}>
      <Inline gap={2} align="center" justify="between">
        <SearchField label="Search" placeholder="Search orders" />
        <NotificationNudge
          key={round}
          title="2 customers asked about delivery"
          description="Reply before Tuesday's roast ships."
          action={{ label: "Read messages", href: "#messages" }}
        >
          <IconButton icon={Bell} label="Notifications" dot />
        </NotificationNudge>
      </Inline>
      <Inline>
        <Button
          size="sm"
          onClick={() => {
            setRound((count) => count + 1);
          }}
        >
          Open it by itself again
        </Button>
      </Inline>
    </Stack>
  );
}

const SIDES = {
  bottom: "below",
  top: "above",
  left: "to the left of",
  right: "to the right of",
} as const;

type Side = keyof typeof SIDES;

function LiveNudge({
  title,
  side,
}: {
  readonly title: string;
  readonly side: Side;
}): ReactElement {
  return (
    <Stack gap={4}>
      <Inline gap={2} align="center" justify="between">
        <SearchField label="Search" placeholder="Search orders" />
        <NotificationNudge
          title={title}
          description="Reply before Tuesday's roast ships."
          action={{ label: "Read messages", href: "#messages" }}
          side={side}
        >
          <IconButton icon={Bell} label="Notifications" dot />
        </NotificationNudge>
      </Inline>
      <Text variant="caption">{`Opens ${SIDES[side]} the bell: ${title}`}</Text>
    </Stack>
  );
}

function nudgeCode({ title, side }: DemoValues): string {
  return [
    "<NotificationNudge",
    `  title="${String(title)}"`,
    '  description="Reply before Tuesday\'s roast ships."',
    '  action={{ label: "Read messages", href: "/messages" }}',
    `  side="${String(side)}"`,
    '  storageKey="delivery-questions"',
    ">",
    '  <IconButton icon={Bell} label="Notifications" dot />',
    "</NotificationNudge>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "2 customers asked about delivery" },
    side: {
      kind: "choice",
      options: ["bottom", "top", "left", "right"],
      initial: "bottom",
    },
  },
  render: ({ title, side }) => (
    <LiveNudge
      title={String(title)}
      side={demoChoice(side, ["bottom", "top", "left", "right"])}
    />
  ),
  code: nudgeCode,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Opens by itself, once",
    description:
      "It doesn't take focus: press Tab on the bell to go into it. Later, the action, Escape or a press outside closes it.",
    render: () => <TopBarNudge />,
  },
];
