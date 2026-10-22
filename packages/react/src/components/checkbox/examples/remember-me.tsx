import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Checkbox } from "@buttery/react";

/** A sign-in form's keep-me-signed-in box, its ticked state kept in the form's own state. */
export function RememberMe(): ReactElement {
  const [remember, setRemember] = useState(true);
  return (
    <Stack gap={2} align="start">
      <Checkbox
        label="Keep me signed in"
        name="remember"
        checked={remember}
        onCheckedChange={(next) => {
          setRemember(next === true);
        }}
      />
      <Text variant="body-sm" tone="secondary">
        {remember
          ? "You'll stay signed in on this device"
          : "You'll be signed out when you close the app"}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("You'll stay signed in on this device");
  await press("checkbox", "Keep me signed in");
  await see("You'll be signed out when you close the app");
};
