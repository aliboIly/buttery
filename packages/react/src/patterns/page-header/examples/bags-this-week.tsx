import { Plus } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { PageHeader } from "@butteryui/react";

/** A header whose value comes from state: each batch added puts 12 more bags in the week. */
export function BagsThisWeek(): ReactElement {
  const [bags, setBags] = useState(148);
  return (
    <PageHeader
      title="Roasts"
      value={`${String(bags)} bags`}
      valueInfo="Bags planned to roast this week."
      description="Plan the week's batches by coffee and by day."
      actions={
        <PageHeader.Action
          variant="primary"
          icon={Plus}
          label="Add a batch"
          onSelect={() => {
            setBags(bags + 12);
          }}
        />
      }
    />
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("148 bags");
  await press("button", "Add a batch");
  await see("160 bags");
};
