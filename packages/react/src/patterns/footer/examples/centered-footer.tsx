import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Footer } from "@butteryui/react";

/** A help center's footer with everything centered: its name, three columns of links and the small print. */
export function CenteredFooter(): ReactElement {
  return (
    <Footer
      layout="centered"
      brand={
        <Stack gap={2}>
          <Text variant="title">Deckhand Help</Text>
          <Text variant="body-sm" tone="secondary">
            Answers for every step from a blank deck to the meeting.
          </Text>
        </Stack>
      }
      legal={
        <Text variant="caption" tone="secondary">
          © 2026 Deckhand
        </Text>
      }
    >
      <Footer.Column title="Start">
        <Footer.Link href="#first-deck">Your first deck</Footer.Link>
        <Footer.Link href="#themes">Themes</Footer.Link>
      </Footer.Column>
      <Footer.Column title="Share">
        <Footer.Link href="#export">Export</Footer.Link>
        <Footer.Link href="#present">Present</Footer.Link>
      </Footer.Column>
      <Footer.Column title="Account">
        <Footer.Link href="#billing">Billing</Footer.Link>
        <Footer.Link href="#team">Your team</Footer.Link>
      </Footer.Column>
    </Footer>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Deckhand Help");
  await see("Your first deck");
  await see("© 2026 Deckhand");
};
