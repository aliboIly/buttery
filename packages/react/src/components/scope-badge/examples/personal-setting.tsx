import { Inline, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { ScopeBadge } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

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

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Only you");
  await see("Details open");
};
