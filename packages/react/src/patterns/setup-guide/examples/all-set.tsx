import type { ReactElement } from "react";
import { SetupGuide } from "@buttery/react";

/** A guide with every task done, saying so where the next task would be. */
export function AllSet(): ReactElement {
  return (
    <SetupGuide
      title="Wholesale setup"
      tasks={[
        { id: "terms", title: "Write your wholesale terms", done: true },
        { id: "prices", title: "Set wholesale prices", done: true },
      ]}
    />
  );
}
