import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Page, Section, SegmentedControl } from "@butteryui/react";

/** A page as the main landmark, its sections taking turns on the two backgrounds, with prices by the billing period. */
export function LandingPage(): ReactElement {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  return (
    <Page asChild>
      <main>
        <Section title="Decks that look designed">
          <Text variant="body-lg">
            Write the slides, pick a theme, present.
          </Text>
        </Section>
        <Section tone="muted" title="One price, every feature">
          <Stack gap={4} align="start">
            <SegmentedControl
              label="Billing period"
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
              value={period}
              onValueChange={setPeriod}
            />
            <Text variant="heading-2">
              {period === "monthly" ? "$12 a month" : "$120 a year"}
            </Text>
          </Stack>
        </Section>
      </main>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("$12 a month");
  await press("radio", "Yearly");
  await see("$120 a year");
};
