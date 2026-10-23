import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { TabNav } from "@butteryui/react";

/** A router's own links as tabs, with asChild and a label for the overflow menu. */
export function RouterLinks(): ReactElement {
  return (
    <TabNav label="Settings">
      <TabNav.Link asChild current label="General">
        <a href="#settings-general">General</a>
      </TabNav.Link>
      <TabNav.Link asChild label="Team">
        <a href="#settings-team">Team</a>
      </TabNav.Link>
      <TabNav.Link asChild label="Billing">
        <a href="#settings-billing">Billing</a>
      </TabNav.Link>
    </TabNav>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("General");
  await see("Billing");
};
