import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, PreferencesMatrix } from "@buttery/react";
import type { PreferenceValue } from "@buttery/react";

const START: PreferenceValue = { payouts: ["email"], disputes: ["email"] };

/** A settings section for the shop's notifications: the matrix holds a draft, and Save or Cancel settle it. */
export function NotificationSettings(): ReactElement {
  const [saved, setSaved] = useState<PreferenceValue>(START);
  const [draft, setDraft] = useState<PreferenceValue>(START);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("No changes yet");
  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text variant="title-sm">Notifications</Text>
        <Text variant="body-sm" tone="secondary">
          Choose how the shop tells you about money and stock.
        </Text>
      </Stack>
      <PreferencesMatrix
        label="Shop notifications"
        channels={[
          { id: "email", label: "Email" },
          { id: "text", label: "Text" },
          { id: "push", label: "Push" },
        ]}
        tabs={[
          {
            id: "shop",
            label: "Shop",
            groups: [
              {
                id: "money",
                title: "Money",
                rows: [
                  { id: "payouts", label: "Payouts" },
                  {
                    id: "disputes",
                    label: "Disputes",
                    description: "Always emailed",
                    locked: { email: true },
                  },
                ],
              },
              {
                id: "stock",
                title: "Stock",
                rows: [
                  {
                    id: "low",
                    label: "Low green coffee",
                    description: "When a coffee drops under 20 kg",
                  },
                ],
              },
            ],
          },
        ]}
        value={draft}
        onValueChange={(next) => {
          setDraft(next);
          setDirty(true);
          setStatus("Unsaved changes");
        }}
      />
      <Inline gap={3} align="center" justify="between">
        <Text variant="body-sm" tone="secondary">
          {status}
        </Text>
        <Inline gap={2}>
          <Button
            aria-disabled={!dirty}
            onClick={() => {
              setDraft(saved);
              setDirty(false);
              setStatus("Changes discarded");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            aria-disabled={!dirty}
            onClick={() => {
              setSaved(draft);
              setDirty(false);
              setStatus("Changes saved");
            }}
          >
            Save changes
          </Button>
        </Inline>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Push for Low green coffee");
  await see("Unsaved changes");
  await press("button", "Save changes");
  await see("Changes saved");
};
