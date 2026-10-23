import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Section } from "@butteryui/react";

/** A small centered band on the app background, between two louder ones. */
export function QuietBand(): ReactElement {
  return (
    <Section size="sm" tone="muted" align="center" title="Kept in step">
      <Text variant="body-lg">Undo and redo remember every change.</Text>
    </Section>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Kept in step");
  await see("Undo and redo remember every change.");
};
