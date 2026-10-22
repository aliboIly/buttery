import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Pressable, Stack, Sticky, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const SETTINGS = [
  "Order emails",
  "Roast reminders",
  "Weekly summary",
  "Low stock alerts",
  "New subscriber alerts",
  "Shipping updates",
  "Review requests",
  "Tasting notes",
  "Price changes",
  "Team mentions",
];

/** A settings panel whose Save stays at the bottom while the list scrolls, and waits until something changes. */
export function PanelFooter(): ReactElement {
  const [saved, setSaved] = useState<readonly string[]>(["Order emails"]);
  const [draft, setDraft] = useState<readonly string[]>(saved);
  const changes = SETTINGS.filter(
    (setting) => saved.includes(setting) !== draft.includes(setting),
  ).length;
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Notifications"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <Stack gap={1} padX={2} padY={2}>
        {SETTINGS.map((setting) => {
          const on = draft.includes(setting);
          return (
            <Surface
              key={setting}
              asChild
              level="app"
              padX={3}
              padY={2}
              radius="md"
            >
              <Pressable
                aria-label={setting}
                aria-pressed={on}
                onClick={() => {
                  setDraft(
                    on
                      ? draft.filter((other) => other !== setting)
                      : [...draft, setting],
                  );
                }}
              >
                <Inline gap={3} justify="between" align="center">
                  <Text variant="body">{setting}</Text>
                  <Text variant="caption">{on ? "On" : "Off"}</Text>
                </Inline>
              </Pressable>
            </Surface>
          );
        })}
      </Stack>
      <Sticky edge="bottom">
        <Surface level="card" padX={4} padY={3}>
          <Inline gap={3} justify="between" align="center">
            <Text variant="caption">
              {changes === 0
                ? "No unsaved changes"
                : `${String(changes)} unsaved ${changes === 1 ? "change" : "changes"}`}
            </Text>
            <Surface asChild level="raised" padX={4} padY={2} radius="full">
              <Pressable
                aria-disabled={changes === 0}
                onClick={() => {
                  setSaved(draft);
                }}
              >
                <Text variant="button">Save changes</Text>
              </Pressable>
            </Surface>
          </Inline>
        </Surface>
      </Sticky>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("No unsaved changes");
  await press("button", "Roast reminders");
  await see("1 unsaved change");
  await press("button", "Save changes");
  await see("No unsaved changes");
};
