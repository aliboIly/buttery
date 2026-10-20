import type { ReactElement } from "react";
import { HeaderBar } from "@buttery/react";

/** A plain header with a title and one action, for a settings window. */
export function SettingsHeader({
  onDone,
}: {
  readonly onDone: () => void;
}): ReactElement {
  return (
    <HeaderBar title="Settings" dragRegion>
      <HeaderBar.Actions>
        <HeaderBar.Action label="Done" onSelect={onDone} />
      </HeaderBar.Actions>
    </HeaderBar>
  );
}
