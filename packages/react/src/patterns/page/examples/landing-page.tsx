import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Page, Section, SegmentedControl } from "@buttery/react";

/** A page as the main landmark, its sections taking turns on the two backgrounds, with prices by the billing period. */
export function LandingPage(): ReactElement {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  return (
    <Page asChild>
      <main>
        <Section title="Cards that look finished">
          <Text variant="body-lg">Write a title, pick a finish, export.</Text>
        </Section>
        <Section tone="muted" title="One price for every size">
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
