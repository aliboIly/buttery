import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { MorphMenu } from "@butteryui/react";

/** With layout="stack", the menus are sections that open in place, one at a time, as in a phone sheet. */
export function Stacked(): ReactElement {
  return (
    <MorphMenu label="Help" layout="stack">
      <MorphMenu.Item label="Learn">
        <MorphMenu.Column title="Start here">
          <MorphMenu.Entry href="#first-deck" title="Your first deck" />
          <MorphMenu.Entry href="#shortcuts" title="Shortcuts" />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Item label="Support">
        <MorphMenu.Column title="Ask us">
          <MorphMenu.Entry href="#contact" title="Contact" />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Link href="#status">Status</MorphMenu.Link>
    </MorphMenu>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Learn");
  await see("Your first deck");
};
