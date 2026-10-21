import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import { Footer } from "@buttery/react";

/** A brand, two columns of links and the small print. */
export function SiteFooter(): ReactElement {
  return (
    <Footer
      brand={
        <Stack gap={2}>
          <Text variant="title">Card Studio</Text>
          <Text variant="body-sm" tone="secondary">
            Cards for launch days, made in a minute.
          </Text>
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
  );
}
