import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Breadcrumbs } from "@buttery/react";

/** In a narrow column the trail shows only the page one level up, so going back stays one tap away. */
export function TrailOnAPhone(): ReactElement {
  const [opened, setOpened] = useState<string | undefined>(undefined);
  return (
    <Stack gap={2} style={{ maxInlineSize: "var(--bt-w-dialog)" }}>
      <Breadcrumbs
        items={[
          { label: "Settings", href: "/settings" },
          { label: "Team", href: "/settings/team" },
        ]}
        onNavigate={(href, event) => {
          event.preventDefault();
          setOpened(href);
        }}
      />
      <Text variant="body-sm">
        {opened === undefined ? "Rosa Delgado" : `Opened ${opened}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", "Team");
  await see("Opened /settings/team");
};
