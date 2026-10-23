import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SettingsSection, Switch } from "@buttery/react";

/** A settings section: the first switch turns the emails on, and the ones under it pick what they cover. */
export function OrderEmails(): ReactElement {
  const [email, setEmail] = useState(false);
  const [orders, setOrders] = useState(true);
  const [refunds, setRefunds] = useState(false);
  const topics = [
    ...(orders ? ["new orders"] : []),
    ...(refunds ? ["refunds"] : []),
  ];
  const summary = !email
    ? "No emails"
    : topics.length === 0
      ? "Emails are on, but about nothing yet"
      : `Emails about ${topics.join(" and ")}`;
  return (
    <SettingsSection
      title="Shop emails"
      description="Takes effect as soon as you flip a switch."
    >
      <Stack gap={4}>
        <Switch
          label="Email me about my shop"
          checked={email}
          onCheckedChange={setEmail}
        />
        <Switch
          label="New orders"
          checked={orders}
          onCheckedChange={setOrders}
          disabled={!email}
        />
        <Switch
          label="Refunds"
          checked={refunds}
          onCheckedChange={setRefunds}
          disabled={!email}
        />
        <Text variant="body" tone="secondary">
          {summary}
        </Text>
      </Stack>
    </SettingsSection>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("No emails");
  await press("switch", "Email me about my shop");
  await see("Emails about new orders");
  await press("switch", "Refunds");
  await see("Emails about new orders and refunds");
};
