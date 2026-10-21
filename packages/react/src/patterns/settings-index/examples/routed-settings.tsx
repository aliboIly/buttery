import { Stack, Text } from "@buttery/core";
import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import { SettingsIndex } from "@buttery/react";
import { Bell, User } from "lucide-react";

/** Links handed to a router: the page changes without a reload. */
export function RoutedSettings(): ReactElement {
  const [page, setPage] = useState("/settings");
  const go = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setPage(event.currentTarget.getAttribute("href") ?? page);
  };
  return (
    <Stack gap={3}>
      <SettingsIndex>
        <SettingsIndex.Section title="You">
          <SettingsIndex.Link
            icon={User}
            title="Profile"
            description="Your name and password."
            href="/settings/profile"
            onClick={go}
          />
          <SettingsIndex.Link
            icon={Bell}
            title="Notifications"
            description="Which emails you get."
            href="/settings/notifications"
            onClick={go}
          />
        </SettingsIndex.Section>
      </SettingsIndex>
      <Text variant="caption">{`On ${page}`}</Text>
    </Stack>
  );
}
