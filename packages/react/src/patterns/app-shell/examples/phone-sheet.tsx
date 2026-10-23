import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  AppShell,
  Button,
  HeaderBar,
  Inspector,
  Stage,
  Switch,
} from "@buttery/react";

/** At phone width the inspector opens as a sheet; with open kept in useState, Done in the sheet closes it. */
export function PhoneSheet(): ReactElement {
  const [open, setOpen] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  return (
    <div
      style={{
        blockSize: "calc(var(--bt-bento-row) * 1.5)",
        maxInlineSize: "var(--bt-w-dialog)",
      }}
    >
      <AppShell
        inspectorLabel="Card settings"
        openInspectorLabel="Adjust card"
        open={open}
        onOpenChange={setOpen}
        header={<HeaderBar title="Gift card for Theo" />}
        inspector={
          <Inspector
            label="Card settings"
            footer={
              <Inspector.Footer>
                <Button
                  variant="primary"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Done
                </Button>
              </Inspector.Footer>
            }
          >
            <Inspector.Section title="Front">
              <Inspector.Row>
                <Switch
                  label="Show the amount"
                  checked={showAmount}
                  onCheckedChange={setShowAmount}
                />
              </Inspector.Row>
            </Inspector.Section>
          </Inspector>
        }
      >
        <Stage label="Gift card preview" size={{ width: 1080, height: 1350 }}>
          <Center>
            <Stack gap={1} align="center">
              <Text variant="title">Happy birthday, Theo</Text>
              {showAmount ? (
                <Text variant="caption">$40 of Halfmoon coffee</Text>
              ) : null}
            </Stack>
          </Center>
        </Stage>
      </AppShell>
    </div>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Adjust card");
  await press("switch", "Show the amount");
  await press("button", "Done");
  await see("$40 of Halfmoon coffee");
};
