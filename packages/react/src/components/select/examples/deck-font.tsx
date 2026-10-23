import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Select } from "@butteryui/react";
import type { SelectOption } from "@butteryui/react";

type Font = "sans" | "serif" | "mono" | "rounded";

const FONTS: readonly SelectOption<Font>[] = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
  { value: "rounded", label: "Rounded" },
];

/** A select that keeps its own value, starting on the deck's sans font; the trigger shows each font picked. */
export function DeckFont(): ReactElement {
  return <Select label="Font" options={FONTS} defaultValue="sans" />;
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("combobox", "Font, Sans");
  await press("option", "Serif");
  await press("combobox", "Font, Serif");
  await press("option", "Rounded");
  await see("Rounded");
};
