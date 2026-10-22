import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { PreferencesMatrix } from "@buttery/react";
import type { PreferenceValue } from "@buttery/react";

/** Team notifications across email and push, controlled, with a summary of what's on. */
export function TeamNotifications(): ReactElement {
  const [value, setValue] = useState<PreferenceValue>({ payouts: ["email"] });
  const on = Object.values(value).flat().length;
  return (
    <Stack gap={4}>
      <PreferencesMatrix
        label="Team notifications"
        channels={[
          { id: "email", label: "Email" },
          { id: "push", label: "Push" },
        ]}
        tabs={[
          {
            id: "shop",
            label: "Shop",
            groups: [
              {
                id: "money",
                title: "Money",
                rows: [
                  { id: "payouts", label: "Payouts" },
                  { id: "refunds", label: "Refunds" },
                ],
              },
            ],
          },
        ]}
        value={value}
        onValueChange={setValue}
      />
      <Text variant="caption">{`${String(on)} on`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Push for Refunds");
  await see("2 on");
};
