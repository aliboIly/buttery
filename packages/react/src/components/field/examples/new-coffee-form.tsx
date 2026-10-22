import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  Button,
  Field,
  SegmentedControl,
  Select,
  TextField,
} from "@buttery/react";

type Roast = "Light" | "Medium" | "Dark";
type Grind = "whole" | "espresso" | "filter";

const GRINDS = [
  { value: "whole", label: "Whole bean" },
  { value: "espresso", label: "Espresso" },
  { value: "filter", label: "Filter" },
] as const;

/** A shop's form for a new coffee: Field labels the roast and the grind, and shows the grind's error on save. */
export function NewCoffeeForm(): ReactElement {
  const [name, setName] = useState("Ethiopia Guji");
  const [roast, setRoast] = useState<Roast>("Medium");
  const [grind, setGrind] = useState<Grind | undefined>(undefined);
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState<string | undefined>(undefined);
  const chosen = GRINDS.find((option) => option.value === grind);
  const save = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setTried(true);
    if (chosen === undefined) return;
    setSaved(
      `Added ${name}, a ${roast.toLowerCase()} roast sold as ${chosen.label.toLowerCase()}`,
    );
  };
  return (
    <form onSubmit={save}>
      <Stack gap={5}>
        <TextField label="Name" value={name} onValueChange={setName} />
        <Field label="Roast" hint="Shown on the bag's label.">
          {(control) => (
            <SegmentedControl<Roast>
              {...control}
              label="Roast"
              options={["Light", "Medium", "Dark"]}
              value={roast}
              onValueChange={setRoast}
            />
          )}
        </Field>
        <Field
          label="Grind"
          required
          error={
            tried && chosen === undefined
              ? "Choose how the coffee is sold."
              : undefined
          }
        >
          {(control) => (
            <Select<Grind>
              {...control}
              label="Grind"
              variant="outline"
              options={GRINDS}
              value={grind}
              onValueChange={setGrind}
            />
          )}
        </Field>
        <Inline gap={3} align="center">
          <Button type="submit" variant="primary">
            Add the coffee
          </Button>
          <Text variant="body-sm" tone="secondary">
            {saved ?? "Not added yet"}
          </Text>
        </Inline>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add the coffee");
  await see("Choose how the coffee is sold.");
  await press("combobox", /^Grind/);
  await press("option", "Espresso");
  await press("button", "Add the coffee");
  await see("Added Ethiopia Guji, a medium roast sold as espresso");
};
