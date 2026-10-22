import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Inspector, NumberField, Tooltip } from "@buttery/react";

/** Tooltips that explain terse labels in an inspector, shown as each field takes focus. */
export function PrintSettings(): ReactElement {
  return (
    <Inspector label="Print settings">
      <Inspector.Section title="Print">
        <Inspector.Row>
          <Tooltip label="Extra edge the printer trims off, so color runs to the cut">
            <NumberField
              label="Bleed"
              unit="mm"
              min={0}
              max={10}
              defaultValue={3}
            />
          </Tooltip>
        </Inspector.Row>
        <Inspector.Row>
          <Tooltip label="Room inside the cut that text stays clear of">
            <NumberField
              label="Margin"
              unit="mm"
              min={0}
              max={20}
              defaultValue={5}
            />
          </Tooltip>
        </Inspector.Row>
      </Inspector.Section>
    </Inspector>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ key, see }) => {
  await key("Tab");
  await see("Extra edge the printer trims off, so color runs to the cut");
  await key("Tab");
  await see("Room inside the cut that text stays clear of");
};
