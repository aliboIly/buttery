import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import { AppPage, Button, PageHeader } from "@buttery/react";

/** A contained page: its header, then sections 32px apart. */
export function OrdersPage(): ReactElement {
  return (
    <AppPage header={<PageHeader title="Orders" value="1,284" />}>
      <AppPage.Section
        title="Needs attention"
        actions={<Button size="sm">See all</Button>}
      >
        <Text variant="body">Three orders are waiting on beans.</Text>
      </AppPage.Section>
      <AppPage.Section title="This week">
        <Text variant="body">212 orders shipped.</Text>
      </AppPage.Section>
    </AppPage>
  );
}
