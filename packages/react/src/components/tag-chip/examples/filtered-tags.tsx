import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Checkbox, TagChip } from "@butteryui/react";
import { useState } from "react";
import type { ReactElement } from "react";

const ADD_ONS = [
  { name: "Label printing", tags: ["New"] },
  { name: "Bookkeeping", tags: ["Popular", "Free trial"] },
];

/** Tags that a filter narrows down: only the add-ons with a free trial stay. */
export function FilteredTags(): ReactElement {
  const [trials, setTrials] = useState(false);
  const shown = ADD_ONS.filter(
    (addOn) => !trials || addOn.tags.includes("Free trial"),
  );
  return (
    <Stack gap={3}>
      <Checkbox
        label="Free trial only"
        checked={trials}
        onCheckedChange={(next) => {
          setTrials(next === true);
        }}
      />
      <Text variant="caption">
        {shown.length === 1 ? "1 add-on" : `${String(shown.length)} add-ons`}
      </Text>
      {shown.map((addOn) => (
        <Stack key={addOn.name} gap={1}>
          <Text variant="label">{addOn.name}</Text>
          <Inline gap={2} align="center" wrap>
            {addOn.tags.map((tag) => (
              <TagChip
                key={tag}
                tone={tag === "Free trial" ? "success" : "info"}
              >
                {tag}
              </TagChip>
            ))}
          </Inline>
        </Stack>
      ))}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Free trial only");
  await see("1 add-on");
};
