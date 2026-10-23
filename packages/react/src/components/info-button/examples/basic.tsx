import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { InfoButton } from "@butteryui/react";

/** An info button explaining a total: a tooltip on hover and focus, and a popover that stays on a press. */
export function BasicInfoButton(): ReactElement {
  return <InfoButton info="Every sale, before refunds and fees." />;
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Every sale, before refunds and fees.");
  await see("Every sale, before refunds and fees.");
};
