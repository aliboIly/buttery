import { Inline, Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import {
  Button,
  IconButton,
  NotificationNudge,
  SearchField,
} from "@buttery/react";
import { Bell } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

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

export const demos: readonly DemoSection[] = [
  {
    title: "Opens by itself, once",
    description:
      "It doesn't take focus: press Tab on the bell to go into it. Later, the action, Escape or a press outside closes it.",
    render: () => <TopBarNudge />,
  },
];
