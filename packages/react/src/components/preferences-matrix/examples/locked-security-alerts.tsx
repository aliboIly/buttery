import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { PreferencesMatrix } from "@butteryui/react";

/** Preferences in two tabs, with security alerts locked on by email. */
export function LockedSecurityAlerts(): ReactElement {
  return (
    <PreferencesMatrix
      label="Your notifications"
      channels={[
        { id: "email", label: "Email" },
        { id: "text", label: "Text" },
      ]}
      tabs={[
        {
          id: "account",
          label: "Account",
          groups: [
            {
              id: "security",
              title: "Security",
              rows: [
                {
                  id: "sign-in",
                  label: "New sign-in",
                  description: "Always emailed, so you hear about it",
                  locked: { email: true },
                },
              ],
            },
          ],
        },
        {
          id: "orders",
          label: "Orders",
          groups: [
            {
              id: "wholesale",
              title: "Wholesale",
              rows: [{ id: "new-order", label: "A café places an order" }],
            },
          ],
        },
      ]}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("tab", "Orders");
  await see("A café places an order");
};
