import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ScopeBadge } from "@butteryui/react";

/** A setting that's only yours, its badge controlled so the page can say when its details are open. */
export function PersonalSetting(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Inline gap={2} align="center">
      <Text variant="title-lg" asChild>
        <h1>Email digest</h1>
      </Text>
      <ScopeBadge
        label="Only you"
        info="Your teammates choose their own digests."
        open={open}
        onOpenChange={setOpen}
      />
      <Text variant="caption">{open ? "Details open" : "Details closed"}</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("button", "Only you");
  await see("Details open");
  await key("Escape");
  await see("Details closed");
};
