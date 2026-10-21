import { Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { Breadcrumbs } from "@buttery/react";
import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";

const TRAIL = [
  { label: "Settings", href: "/settings" },
  { label: "Plans and billing", href: "/settings/plans" },
];

/** A nested settings page whose trail leads back up, each crumb opening its page. */
export function NestedSettingsPage(): ReactElement {
  const [page, setPage] = useState("Roaster's plan");
  const open = (href: string, event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setPage(TRAIL.find((crumb) => crumb.href === href)?.label ?? page);
  };
  return (
    <Stack gap={2}>
      <Breadcrumbs items={TRAIL} onNavigate={open} />
      <Text variant="title-lg" asChild>
        <h1>{page}</h1>
      </Text>
    </Stack>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", "Plans and billing");
  await see("Plans and billing");
};
