import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AppPage, Button, PageHeader } from "@butteryui/react";

const WAITING = [
  "Order 1042 for Ines Vale",
  "Order 1047 for Oskar Lind",
  "Order 1051 for Mira Okafor",
];

/** A contained page: its header, then sections 32px apart, the first with an action at the end of its heading. */
export function OrdersPage(): ReactElement {
  const [all, setAll] = useState(false);
  return (
    <AppPage header={<PageHeader title="Orders" value="1,284" />}>
      <AppPage.Section
        title="Needs attention"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setAll(!all);
            }}
          >
            {all ? "Show less" : "See all"}
          </Button>
        }
      >
        {all ? (
          <Stack gap={1}>
            {WAITING.map((order) => (
              <Text key={order} variant="body">
                {order}
              </Text>
            ))}
          </Stack>
        ) : (
          <Text variant="body">Three orders are waiting on beans.</Text>
        )}
      </AppPage.Section>
      <AppPage.Section title="This week">
        <Text variant="body">212 orders shipped.</Text>
      </AppPage.Section>
    </AppPage>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "See all");
  await see("Order 1047 for Oskar Lind");
  await press("button", "Show less");
  await see("Three orders are waiting on beans.");
};
