import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import { Tabs } from "@buttery/react";

const SECTIONS = [
  "General",
  "Team",
  "Billing",
  "Shipping",
  "Taxes",
  "Notifications",
] as const;

/** More tabs than room: the last ones fold into "…" and stay one press away. */
export function NarrowTabs(): ReactElement {
  return (
    <div style={{ maxInlineSize: "var(--bt-w-dialog)" }}>
      <Tabs defaultValue="General">
        <Tabs.List label="Settings">
          {SECTIONS.map((section) => (
            <Tabs.Tab key={section} value={section}>
              {section}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {SECTIONS.map((section) => (
          <Tabs.Panel key={section} value={section}>
            <Text variant="body">{`${section} settings`}</Text>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
