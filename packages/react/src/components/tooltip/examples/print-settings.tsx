import type { ReactElement } from "react";
import { Grid } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Inspector, NumberField, Tooltip } from "@butteryui/react";

/** Tooltips that explain terse labels in an inspector, shown as each field takes focus. */
export function PrintSettings(): ReactElement {
  return (
    <Inspector.Section title="Print">
      <Inspector.Row block>
        <Grid columns={2} gap={2}>
          <Tooltip label="Extra edge the printer trims off, so color runs to the cut">
            <NumberField
              label="Bleed"
              labelPosition="top"
              unit="mm"
              min={0}
              max={10}
              defaultValue={3}
            />
          </Tooltip>
          <Tooltip label="Room inside the cut that text stays clear of">
            <NumberField
              label="Margin"
              labelPosition="top"
              unit="mm"
              min={0}
              max={20}
              defaultValue={5}
            />
          </Tooltip>
        </Grid>
      </Inspector.Row>
    </Inspector.Section>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ key, see }) => {
  await key("Tab");
  await see("Extra edge the printer trims off, so color runs to the cut");
  await key("Tab");
  await see("Room inside the cut that text stays clear of");
};
