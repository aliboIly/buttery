import type { ReactElement } from "react";
import { MorphMenu } from "@buttery/react";

/** Two short menus and a plain link. */
export function TwoMenus(): ReactElement {
  return (
    <MorphMenu label="Help">
      <MorphMenu.Item label="Learn">
        <MorphMenu.Column title="Start here">
          <MorphMenu.Entry
            href="#first-card"
            title="Your first card"
            caption="Five minutes from blank to done"
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
