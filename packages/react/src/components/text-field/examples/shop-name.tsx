import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { TextField } from "@buttery/react";

function addressFor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A shop's name kept in state, which also writes the web address the shop will get. */
export function ShopName(): ReactElement {
  const [name, setName] = useState("");
  const address = addressFor(name);
  return (
    <Stack gap={2}>
      <TextField
        label="Shop name"
        autoComplete="organization"
        value={name}
        onValueChange={setName}
      />
      <Text variant="caption" tone="secondary">
        {address === ""
          ? "Name your shop to get its address"
          : `Your shop's address: ${address}.example.com`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ type, see }) => {
  await see("Name your shop to get its address");
  await type("Shop name", "Morning Roast");
  await see("Your shop's address: morning-roast.example.com");
};
