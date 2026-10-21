import { Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { HoverActions, IconButton } from "@buttery/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

/** Saved pickup addresses, each with a remove action that shows on hover or keyboard focus. */
export function SavedAddresses(): ReactElement {
  const [addresses, setAddresses] = useState([
    "12 Mill Street, Portland",
    "40 Oak Lane, Portland",
  ]);
  return (
    <Stack gap={1}>
      {addresses.map((address) => (
        <HoverActions
          key={address}
          actions={
            <IconButton
              icon={Trash2}
              label={`Remove ${address}`}
              size="sm"
              onClick={() => {
                setAddresses((current) =>
                  current.filter((other) => other !== address),
                );
              }}
            />
          }
        >
          <Text variant="body-sm">{address}</Text>
        </HoverActions>
      ))}
      <Text variant="caption">{`${String(addresses.length)} saved`}</Text>
    </Stack>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Remove 40 Oak Lane, Portland");
  await see("1 saved");
};
