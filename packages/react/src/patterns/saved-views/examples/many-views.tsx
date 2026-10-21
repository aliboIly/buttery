import type { ReactElement } from "react";
import { SavedViews } from "@buttery/react";

/** More views than room: the last ones fold away and stay in the … menu. */
export function ManyViews(): ReactElement {
  return (
    <div style={{ maxInlineSize: "var(--bt-w-dialog)" }}>
      <SavedViews
        label="Customer views"
        views={[
          { id: "all", label: "Everyone" },
          { id: "subscribers", label: "Subscribers" },
          { id: "lapsed", label: "Lapsed" },
          { id: "wholesale", label: "Wholesale" },
          { id: "local", label: "Picks up in store" },
        ]}
      />
    </div>
  );
}
