import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Footer, Page, Section, TextField } from "@buttery/react";

/** The end of a landing page: a brand column with a newsletter signup, two columns of links and the small print. */
export function SiteFooter(): ReactElement {
  const [email, setEmail] = useState("");
  const [signedUp, setSignedUp] = useState(false);
  const valid = email.includes("@");
  return (
    <Page>
      <Section size="sm" title="Cards for launch days">
        <Text variant="body-lg">Made in a minute, ready for every post.</Text>
      </Section>
      <Footer
        brand={
          <Stack gap={4}>
            <Stack gap={2}>
              <Text variant="title">Card Studio</Text>
              <Text variant="body-sm" tone="secondary">
                A letter on Fridays with new backdrops and finishes.
              </Text>
            </Stack>
            {signedUp ? (
              <Text variant="body-sm">
                Thanks. The next letter goes out on Friday.
              </Text>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (valid) setSignedUp(true);
                }}
              >
                <Stack gap={2} align="start">
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onValueChange={setEmail}
                  />
                  <Button type="submit" aria-disabled={!valid}>
                    Subscribe
                  </Button>
                </Stack>
              </form>
            )}
          </Stack>
        }
        legal={
          <Inline gap={4} justify="between">
            <Text variant="caption" tone="secondary">
              © 2026 Card Studio
            </Text>
            <Footer.Link href="#privacy">Privacy</Footer.Link>
          </Inline>
        }
      >
        <Footer.Column title="Product">
          <Footer.Link href="#features">Features</Footer.Link>
          <Footer.Link href="#export">Export</Footer.Link>
        </Footer.Column>
        <Footer.Column title="Help">
          <Footer.Link href="#guides">Guides</Footer.Link>
          <Footer.Link href="#contact">Contact</Footer.Link>
        </Footer.Column>
      </Footer>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Email", "rosa@halfmoon.example");
  await press("button", "Subscribe");
  await see("Thanks. The next letter goes out on Friday.");
};
