import { Surface, Text } from "@butteryui/core";
import type { DemoSection, DemoWidth, DocsPage } from "@butteryui/core";
import { AppPage, Button, PageHeader } from "@butteryui/react";

export const page: DocsPage = {
  section: "patterns",
  title: "AppPage",
  description:
    "A dashboard page in its shell: contained to 1280px or full width, padded by its column, with an optional right rail.",
  order: 110,
  status: "new",
  since: "0.8.0",
  home: "patterns/app-shell",
};

export const width: DemoWidth = "desktop";

export const demos: readonly DemoSection[] = [
  {
    title: "Header, sections and a right rail",
    description:
      "Sections sit 24px under the header and 32px apart; the rail moves beside them in a wide shell.",
    render: () => (
      <AppPage
        header={<PageHeader title="Ines Vale" value="14 orders" />}
        asideLabel="Customer details"
        aside={
          <Surface level="card" pad={4}>
            <Text variant="body-sm">Customer since March.</Text>
          </Surface>
        }
      >
        <AppPage.Section
          title="Orders"
          actions={<Button size="sm">See all</Button>}
        >
          <Text variant="body">The last order shipped on Tuesday.</Text>
        </AppPage.Section>
        <AppPage.Section title="Notes">
          <Text variant="body">Prefers a lighter roast.</Text>
        </AppPage.Section>
      </AppPage>
    ),
  },
];
