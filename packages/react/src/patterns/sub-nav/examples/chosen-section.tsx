import type { ReactElement } from "react";
import { SubNav } from "@buttery/react";

/** A sub nav told which section is current, such as by the app's router. */
export function ChosenSection(): ReactElement {
  return (
    <SubNav
      label="Release notes"
      items={[
        { id: "notes-2-4", label: "2.4" },
        { id: "notes-2-3", label: "2.3" },
        { id: "notes-2-2", label: "2.2" },
      ]}
      current="notes-2-3"
    />
  );
}
