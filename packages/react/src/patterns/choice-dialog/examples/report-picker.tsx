import { Text } from "@buttery/core";
import { useState } from "react";
import type { ReactElement } from "react";
import { Button, ChoiceDialog } from "@buttery/react";
import { CalendarRange, Coffee } from "lucide-react";

/** Choices that stay on the page: picking a report runs it here rather than following a link. */
export function ReportPicker(): ReactElement {
  const [report, setReport] = useState<string | undefined>(undefined);
  return (
    <>
      <ChoiceDialog
        trigger={<Button>Run a report</Button>}
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
      {report === undefined ? null : (
        <Text tone="secondary">{`Running ${report}`}</Text>
      )}
    </>
  );
}
