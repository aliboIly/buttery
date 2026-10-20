import type { ReactElement } from "react";
import { SplitButton } from "@buttery/react";

/** Publish now, or pick a later time from the menu; one entry is unavailable. */
export function PublishLater(): ReactElement {
  return (
    <SplitButton
      menuLabel="More ways to publish"
      onClick={() => undefined}
      items={[
        { label: "Publish tomorrow at 9:00", onSelect: () => undefined },
        {
          label: "Publish to a group",
          onSelect: () => undefined,
          disabled: true,
        },
      ]}
    >
      Publish
    </SplitButton>
  );
}
