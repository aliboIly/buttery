import type { ReactElement } from "react";
import { Grid, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** Two equal columns of label and value pairs. */
export function SettingsPairs(): ReactElement {
  return (
    <Grid columns={2} gap={4}>
      <Stack gap={1}>
        <Text variant="caption">Width</Text>
        <Text variant="label" tabular>
          1080 px
        </Text>
      </Stack>
      <Stack gap={1}>
        <Text variant="caption">Height</Text>
        <Text variant="label" tabular>
          1350 px
        </Text>
      </Stack>
    </Grid>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("1350 px");
};
