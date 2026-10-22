import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ColorPicker } from "@buttery/react";

/** A picker that keeps its own color and reports the one each drag, key or typed code settles on. */
export function CardFill(): ReactElement {
  const [picked, setPicked] = useState("#f5d06f");
  return (
    <Stack gap={3}>
      <ColorPicker
        label="Card fill"
        defaultValue="#f5d06f"
        onValueCommit={setPicked}
      />
      <Text variant="caption" tone="secondary" tabular>
        {`Picked ${picked}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ type, key, see }) => {
  await type("Hex code", "{selectall}2563EB");
  await key("Enter");
  await see("Picked #2563eb");
};
