import type { ReactElement } from "react";
import { QuickActions } from "@buttery/react";
import { Download, Plus, Send } from "lucide-react";

/** The few things people do most on an orders page, under its header. */
export function OrderShortcuts(): ReactElement {
  return (
    <QuickActions>
      <QuickActions.Action
        icon={Plus}
        label="New order"
        priority={2}
        onSelect={() => undefined}
      />
      <QuickActions.Action
        icon={Send}
        label="Send invoices"
        onSelect={() => undefined}
      />
      <QuickActions.Action
        icon={Download}
        label="Export"
        onSelect={() => undefined}
      />
    </QuickActions>
  );
}
