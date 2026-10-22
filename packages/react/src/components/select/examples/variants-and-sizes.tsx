import type { ReactElement } from "react";
import { Grid, Inline, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Field, Select } from "@buttery/react";
import type { SelectOption } from "@buttery/react";

type Roast = "light" | "medium" | "dark";
type Bag = "250" | "500" | "1000";

const ROASTS: readonly SelectOption<Roast>[] = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "dark", label: "Dark" },
];

const BAGS: readonly SelectOption<Bag>[] = [
  { value: "250", label: "250 g" },
  { value: "500", label: "500 g" },
  { value: "1000", label: "1 kg" },
];

/** The ghost pill for toolbars and the outline box for forms, each at its medium and small size. */
export function VariantsAndSizes(): ReactElement {
  return (
    <Stack gap={4}>
      <Inline gap={2} align="center" wrap>
        <Select label="Roast" options={ROASTS} defaultValue="medium" />
        <Select label="Bag" size="sm" options={BAGS} defaultValue="250" />
      </Inline>
      <Grid columns={2} gap={3}>
        <Field label="Roast level">
          {(control) => (
            <Select
              {...control}
              label="Roast level"
              variant="outline"
              options={ROASTS}
              defaultValue="medium"
            />
          )}
        </Field>
        <Field label="Bag size">
          {(control) => (
            <Select
              {...control}
              label="Bag size"
              variant="outline"
              size="sm"
              options={BAGS}
              defaultValue="250"
            />
          )}
        </Field>
      </Grid>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("combobox", "Bag size 250 g");
  await press("option", "1 kg");
  await press("combobox", "Bag size 1 kg");
  await press("option", "500 g");
  await see("500 g");
};
