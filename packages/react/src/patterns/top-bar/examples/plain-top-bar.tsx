import type { ReactElement } from "react";
import { TopBar } from "@buttery/react";
import { Settings } from "lucide-react";

/** A top bar with no search: just its actions and the create button. */
export function PlainTopBar(): ReactElement {
  return (
    <TopBar
      actions={
        <TopBar.Action
          icon={Settings}
          label="Settings"
          onSelect={() => undefined}
        />
      }
      create={{ label: "New roast", onSelect: () => undefined }}
    />
  );
}
