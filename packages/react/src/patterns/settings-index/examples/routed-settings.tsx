import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Breadcrumbs, SettingsIndex } from "@buttery/react";
import { Bell, User } from "lucide-react";

const PAGES: Readonly<Record<string, { title: string; body: string }>> = {
  "/settings/profile": {
    title: "Profile",
    body: "Your name, your email and your password.",
  },
  "/settings/notifications": {
    title: "Notifications",
    body: "Email me when an order comes in.",
  },
};

/** Links handed to a router: a setting opens in place, and its trail leads back to the index. */
export function RoutedSettings(): ReactElement {
  const [path, setPath] = useState("/settings");
  const go = (href: string, event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setPath(href);
  };
  const page = PAGES[path];
  if (page !== undefined)
    return (
      <Stack gap={2}>
        <Breadcrumbs
          items={[{ label: "Settings", href: "/settings" }]}
          onNavigate={go}
        />
        <Text variant="title-lg" asChild>
          <h1>{page.title}</h1>
        </Text>
        <Text variant="body-sm">{page.body}</Text>
      </Stack>
    );
  return (
    <SettingsIndex>
      <SettingsIndex.Section title="You">
        <SettingsIndex.Link
          icon={User}
          title="Profile"
          description="Your name and password."
          href="/settings/profile"
          onNavigate={go}
        />
        <SettingsIndex.Link
          icon={Bell}
          title="Notifications"
          description="Which emails you get."
          href="/settings/notifications"
          onNavigate={go}
        />
      </SettingsIndex.Section>
    </SettingsIndex>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", /^Notifications/);
  await see("Email me when an order comes in.");
  await press("link", "Settings");
  await see("Your name and password.");
};
