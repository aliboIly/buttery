import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
import { AppPage, PageHeader } from "@buttery/react";

/** A detail page with a right rail beside it on a wide shell. */
export function CustomerPage(): ReactElement {
  return (
    <AppPage
      header={<PageHeader title="Ines Vale" />}
      asideLabel="Customer details"
      aside={
        <Surface level="card" pad={4}>
          <Text variant="body-sm">Customer since March, 14 orders.</Text>
        </Surface>
      }
    >
      <AppPage.Section title="Orders">
        <Text variant="body">The last order shipped on Tuesday.</Text>
      </AppPage.Section>
    </AppPage>
  );
}
