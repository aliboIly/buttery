import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Breadcrumbs } from "@buttery/react";

const PAGES = [
  {
    label: "Settings",
    href: "/settings",
    about: "Everything about how the roastery runs.",
  },
  {
    label: "Plans and billing",
    href: "/settings/plans",
    about: "Your plan, your invoices and the card they're paid with.",
  },
  {
    label: "Roaster plan",
    href: "/settings/plans/roaster",
    about: "Billed on the 1st of each month.",
  },
] as const;

/** A nested settings page whose trail leads back up, each crumb opening its page and a top page showing none. */
export function NestedSettingsPage(): ReactElement {
  const [depth, setDepth] = useState(PAGES.length - 1);
  const page = PAGES[depth] ?? PAGES[0];
  const open = (href: string, event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setDepth(PAGES.findIndex((entry) => entry.href === href));
  };
  return (
    <Stack gap={2}>
      {depth > 0 ? (
        <Breadcrumbs items={PAGES.slice(0, depth)} onNavigate={open} />
      ) : null}
      <Text variant="title-lg" asChild>
        <h1>{page.label}</h1>
      </Text>
      <Text variant="body-sm">{page.about}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", "Plans and billing");
  await see("Your plan, your invoices and the card they're paid with.");
  await press("link", "Settings");
  await see("Everything about how the roastery runs.");
};
