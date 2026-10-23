import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import { AppPage, PageHeader } from "@buttery/react";

export function App(): ReactElement {
  return (
    <AppPage
      data-tauri-drag-region="deep"
      header={
        <PageHeader
          title="🧈 buttery starter"
          description="Your app starts here."
        />
      }
    >
      <AppPage.Section title="Next steps">
        <Text variant="body" tone="secondary">
          Build the first screen in src/App.tsx from buttery&apos;s components
          and patterns, then run the layout checks in e2e/ to see it holds at
          every size.
        </Text>
      </AppPage.Section>
    </AppPage>
  );
}
