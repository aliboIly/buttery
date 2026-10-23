import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { InitialsTile, TextField } from "@butteryui/react";

/** A new workspace's settings: the tile and the title follow the name as it's typed. */
export function WorkspaceSettings(): ReactElement {
  const [name, setName] = useState("");
  const shown = name.trim() === "" ? "New workspace" : name;
  return (
    <Stack gap={4}>
      <Inline gap={3} align="center">
        <InitialsTile name={shown} size="lg" />
        <Text variant="title-sm" truncate>
          {shown}
        </Text>
      </Inline>
      <TextField
        label="Workspace name"
        placeholder="New workspace"
        value={name}
        onValueChange={setName}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, see }) => {
  await see("NW");
  await type("Workspace name", "Harbor Beans");
  await see("HB");
};
