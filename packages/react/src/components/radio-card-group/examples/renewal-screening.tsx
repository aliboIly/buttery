import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { RadioCardGroup, Select } from "@butteryui/react";

/** A screening choice whose second option opens a select of its own. */
export function RenewalScreening(): ReactElement {
  const [screening, setScreening] = useState("all");
  const [count, setCount] = useState("1");
  return (
    <Stack gap={4}>
      <RadioCardGroup
        label="Renewal screening"
        value={screening}
        onValueChange={setScreening}
        options={[
          {
            value: "all",
            label: "Screen every renewal",
            description: "Every renewal waits for a fraud check.",
          },
          {
            value: "some",
            label: "Screen the first renewals only",
            description: "Renewals after that go through without a check.",
            detail: (
              <Select
                label="Renewals to screen"
                variant="outline"
                value={count}
                onValueChange={setCount}
                options={[
                  { value: "1", label: "The first renewal" },
                  { value: "3", label: "The first three renewals" },
                ]}
              />
            ),
          },
        ]}
      />
      <Text variant="caption">
        {screening === "all"
          ? "Screening every renewal"
          : `Screening ${count === "1" ? "the first renewal" : "the first three renewals"}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Screen the first renewals only");
  await see("Screening the first renewal");
  await press("combobox", /^Renewals to screen/);
  await press("option", "The first three renewals");
  await see("Screening the first three renewals");
};
