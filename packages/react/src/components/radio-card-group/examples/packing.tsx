import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { RadioCardGroup, TextField } from "@buttery/react";

/** How a bag is packed, left uncontrolled: choosing the gift box opens a field for its card. */
export function Packing(): ReactElement {
  return (
    <RadioCardGroup
      label="Packing"
      defaultValue="bag"
      options={[
        {
          value: "bag",
          label: "Resealable bag",
          description: "Kraft paper with a one-way valve.",
        },
        {
          value: "gift",
          label: "Gift box",
          description: "Wrapped, with a handwritten note.",
          detail: <TextField label="Card message" name="message" />,
        },
      ]}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Gift box");
  await see("Card message");
};
