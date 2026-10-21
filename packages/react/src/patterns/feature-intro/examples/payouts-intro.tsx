import { useState } from "react";
import type { ReactElement } from "react";
import { FeatureIntro } from "@buttery/react";

/** An intro whose action opens a step in place rather than going to another page. */
export function PayoutsIntro(): ReactElement {
  const [adding, setAdding] = useState(false);
  return (
    <FeatureIntro
      title="Pay out to your bank every Friday"
      description="Move the week's sales to your account on a set day."
      action={{
        label: adding ? "Adding a bank account…" : "Add a bank account",
        onClick: () => {
          setAdding(true);
        },
      }}
    />
  );
}
