import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Breadcrumbs } from "@buttery/react";

/** The pages above a plan's page, outermost first, with onNavigate where a router takes over each link. */
export function PlanTrail(): ReactElement {
  const [opened, setOpened] = useState<string | undefined>(undefined);
  return (
    <Stack gap={2}>
      <Breadcrumbs
        items={[
          { label: "Settings", href: "/settings" },
          { label: "Plans and billing", href: "/settings/plans" },
        ]}
        onNavigate={(href, event) => {
          event.preventDefault();
          setOpened(href);
        }}
      />
      <Text variant="body-sm" tone="secondary">
        {opened === undefined
          ? "On the Roaster plan page"
          : `Going to ${opened}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("On the Roaster plan page");
  await press("link", "Plans and billing");
  await see("Going to /settings/plans");
};
