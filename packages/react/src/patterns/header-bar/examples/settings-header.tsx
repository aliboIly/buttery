import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { HeaderBar } from "@buttery/react";

/** A plain header for a settings window: the title, and one action that stays focusable once it's done. */
export function SettingsHeader(): ReactElement {
  const [saved, setSaved] = useState(false);
  return (
    <Stack gap={3}>
      <HeaderBar title="Settings" dragRegion>
        <HeaderBar.Actions>
          <HeaderBar.Action
            label="Save"
            disabled={saved}
            onSelect={() => {
              setSaved(true);
            }}
          />
        </HeaderBar.Actions>
      </HeaderBar>
      <Text variant="body-sm" tone="secondary">
        {saved ? "Settings saved" : "Two settings changed"}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Two settings changed");
  await press("button", "Save");
  await see("Settings saved");
};
