import { Inline, Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { Button, TagChip } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** An add-on's name over the tags that say what kind it is, one of them following its trial. */
export function AddOnTags(): ReactElement {
  const [trying, setTrying] = useState(false);
  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Text variant="label">Label printing</Text>
        <Inline gap={2} align="center" wrap>
          <TagChip tone="info">New</TagChip>
          {trying ? (
            <TagChip tone="warning">Trial, 30 days left</TagChip>
          ) : (
            <TagChip tone="success">Free trial</TagChip>
          )}
        </Inline>
      </Stack>
      <Inline gap={2}>
        <Button
          size="sm"
          disabled={trying}
          onClick={() => {
            setTrying(true);
          }}
        >
          Start the free trial
        </Button>
      </Inline>
    </Stack>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Free trial");
  await press("button", "Start the free trial");
  await see("Trial, 30 days left");
};
