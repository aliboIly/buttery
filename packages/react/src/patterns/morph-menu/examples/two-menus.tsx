import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { MorphMenu } from "@butteryui/react";

/** Two short menus and a plain link. */
export function TwoMenus(): ReactElement {
  return (
    <MorphMenu label="Help">
      <MorphMenu.Item label="Learn">
        <MorphMenu.Column title="Start here">
          <MorphMenu.Entry
            href="#first-deck"
            title="Your first deck"
            caption="Ten minutes from blank to done"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Item label="Support">
        <MorphMenu.Column title="Ask us">
          <MorphMenu.Entry
            href="#contact"
            title="Contact"
            caption="We answer within a day"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Link href="#status">Status</MorphMenu.Link>
    </MorphMenu>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Learn");
  await see("Ten minutes from blank to done");
};
