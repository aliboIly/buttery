import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import { Section } from "@buttery/react";

/** A small centered band on the app background, between two louder ones. */
export function QuietBand(): ReactElement {
  return (
    <Section size="sm" tone="muted" align="center" title="Kept in step">
      <Text variant="body-lg">Undo and redo remember every change.</Text>
    </Section>
  );
}
