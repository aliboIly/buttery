import { useState } from "react";
import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AppPage, Button, ChoiceDialog, PageHeader } from "@buttery/react";
import { CalendarRange, Coffee } from "lucide-react";

/** A reports page whose choices stay on it: picking a report runs it in its section rather than following a link. */
export function ReportPicker(): ReactElement {
  const [report, setReport] = useState<string | undefined>(undefined);
  return (
    <AppPage header={<PageHeader title="Reports" />}>
      <AppPage.Section
        title="This month"
        actions={
          <ChoiceDialog
            trigger={<Button size="sm">Run a report</Button>}
            title="Which report?"
            choices={[
              {
                id: "origins",
                icon: Coffee,
                title: "Sales by origin",
                description: "Bags sold per coffee this month.",
                onSelect: () => {
                  setReport("Sales by origin");
                },
              },
              {
                id: "weekly",
                icon: CalendarRange,
                title: "Week over week",
                description: "Revenue against the week before.",
                onSelect: () => {
                  setReport("Week over week");
                },
              },
            ]}
          />
        }
      >
        <Text variant="body" tone="secondary">
          {report === undefined ? "No report run yet" : `Running ${report}`}
        </Text>
      </AppPage.Section>
    </AppPage>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Run a report");
  await press("button", /^Sales by origin/);
  await see("Running Sales by origin");
};
