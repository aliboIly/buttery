import type { ReactElement } from "react";
import { SplitButton } from "@buttery/react";

/** Export as the main action, with other formats in the menu. */
export function ExportOptions(): ReactElement {
  return (
    <SplitButton
      menuLabel="More export options"
      onClick={() => undefined}
      items={[
        { label: "Export as JPG", onSelect: () => undefined },
        { label: "Export as WebP", onSelect: () => undefined },
        { label: "Copy to clipboard", onSelect: () => undefined },
      ]}
    >
      Export PNG
    </SplitButton>
  );
}
