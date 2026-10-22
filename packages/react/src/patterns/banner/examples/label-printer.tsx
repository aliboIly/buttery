import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AppPage, Banner, PageHeader } from "@buttery/react";
import { Printer } from "lucide-react";

const TO_PACK = [
  "Order 1051 for Ines Vale",
  "Order 1052 for Oskar Lind",
  "Order 1053 for Mira Okafor",
];

/** A suggestion above the orders it helps with, which stays dismissed on later visits. */
export function LabelPrinterBanner(): ReactElement {
  return (
    <AppPage header={<PageHeader title="Orders" />}>
      <Banner
        icon={Printer}
        action={{
          label: "Connect a label printer",
          href: "#settings-printing",
        }}
        estimate="3 min"
        storageKey="example-label-printer"
      >
        Print a shipping label from any order without leaving the page.
      </Banner>
      <AppPage.Section title="To pack">
        <Stack gap={2}>
          {TO_PACK.map((order) => (
            <Text key={order} variant="body">
              {order}
            </Text>
          ))}
        </Stack>
      </AppPage.Section>
    </AppPage>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Print a shipping label from any order without leaving the page.");
  await press("button", "Dismiss");
  await see("Order 1052 for Oskar Lind");
};
