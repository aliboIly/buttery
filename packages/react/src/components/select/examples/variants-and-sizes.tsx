import type { ReactElement } from "react";
import { Grid, Inline, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Field, Select } from "@buttery/react";
import type { SelectOption } from "@buttery/react";

type Theme = "plain" | "paper" | "ink";
type Transition = "none" | "fade" | "push";

const THEMES: readonly SelectOption<Theme>[] = [
  { value: "plain", label: "Plain" },
  { value: "paper", label: "Paper" },
  { value: "ink", label: "Ink" },
];

const TRANSITIONS: readonly SelectOption<Transition>[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "push", label: "Push" },
];

/** The ghost pill for toolbars and the outline box for forms, each at its medium and small size. */
export function VariantsAndSizes(): ReactElement {
  return (
    <Stack gap={4}>
      <Inline gap={2} align="center" wrap>
        <Select label="Theme" options={THEMES} defaultValue="paper" />
        <Select
          label="Transition"
          size="sm"
          options={TRANSITIONS}
          defaultValue="none"
        />
      </Inline>
      <Grid columns={2} gap={3}>
        <Field label="Deck theme">
          {(control) => (
            <Select
              {...control}
              label="Deck theme"
              variant="outline"
              options={THEMES}
              defaultValue="paper"
            />
          )}
        </Field>
        <Field label="Slide transition">
          {(control) => (
            <Select
              {...control}
              label="Slide transition"
              variant="outline"
              size="sm"
              options={TRANSITIONS}
              defaultValue="none"
            />
          )}
        </Field>
      </Grid>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("combobox", "Slide transition None");
  await press("option", "Push");
  await press("combobox", "Slide transition Push");
  await press("option", "Fade");
  await see("Fade");
};
