import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Select } from "@buttery/react";
import type { SelectOption } from "@buttery/react";

type Grind = "whole" | "filter" | "espresso" | "press";

const GRINDS: readonly SelectOption<Grind>[] = [
  { value: "whole", label: "Whole bean" },
  { value: "filter", label: "Filter" },
  { value: "espresso", label: "Espresso" },
  { value: "press", label: "French press" },
];

/** A select that keeps its own value, starting on whole beans; the trigger shows each grind picked. */
export function CoffeeGrind(): ReactElement {
  return <Select label="Grind" options={GRINDS} defaultValue="whole" />;
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("combobox", "Grind, Whole bean");
  await press("option", "Espresso");
  await press("combobox", "Grind, Espresso");
  await press("option", "French press");
  await see("French press");
};
