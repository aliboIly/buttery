import type { ReactElement } from "react";
import { QuickActions } from "@buttery/react";
import { Download, Plus, RefreshCw, Send, Upload } from "lucide-react";

/** More actions than room: the lowest priority ones fold into "…". */
export function NarrowShortcuts(): ReactElement {
  return (
    <div style={{ maxInlineSize: "var(--bt-w-dialog)" }}>
      <QuickActions label="Order actions">
        <QuickActions.Action
          icon={Plus}
          label="New order"
          priority={3}
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Send}
          label="Send invoices"
          priority={2}
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={RefreshCw}
          label="Sync stock"
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Upload}
          label="Import"
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Download}
          label="Export"
          onSelect={() => undefined}
        />
      </QuickActions>
    </div>
  );
}
