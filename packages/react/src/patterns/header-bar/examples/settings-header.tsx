import type { ReactElement } from "react";
import { HeaderBar, toast } from "@buttery/react";

/** A plain header with a title and one action, for a settings window. */
export function SettingsHeader(): ReactElement {
  return (
    <HeaderBar title="Settings" dragRegion>
      <HeaderBar.Actions>
        <HeaderBar.Action
          label="Done"
          onSelect={() => {
            toast("Settings saved", { id: "settings" });
          }}
        />
      </HeaderBar.Actions>
    </HeaderBar>
  );
}
