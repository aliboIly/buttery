import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Footer } from "@butteryui/react";

/** A shop's footer as one row: its links, with the small print at the end of the row. */
export function SimpleFooter(): ReactElement {
  return (
    <Footer
      layout="simple"
      legal={
        <Text variant="caption" tone="secondary">
          © 2026 Halfmoon Roastery
        </Text>
      }
    >
      <Footer.Column title="Shop">
        <Footer.Link href="#coffees">Coffees</Footer.Link>
        <Footer.Link href="#subscriptions">Subscriptions</Footer.Link>
        <Footer.Link href="#gift-cards">Gift cards</Footer.Link>
      </Footer.Column>
      <Footer.Column title="Help">
        <Footer.Link href="#shipping">Shipping</Footer.Link>
        <Footer.Link href="#contact">Contact</Footer.Link>
      </Footer.Column>
    </Footer>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Subscriptions");
  await see("© 2026 Halfmoon Roastery");
};
