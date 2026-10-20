import type { ReactElement } from "react";
import { Center, Text } from "@buttery/core";
import { AppShell, HeaderBar, Inspector, Stage } from "@buttery/react";

/** At phone width the inspector opens as a sheet, here from a button that says what it does. */
export function PhoneSheet(): ReactElement {
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
        header={<HeaderBar title="Spring launch" />}
        inspector={
          <Inspector label="Card settings">
            <Inspector.Section title="Card">
              <Inspector.Row label="Edge" />
            </Inspector.Section>
          </Inspector>
        }
      >
        <Stage label="Card preview" size={{ width: 1080, height: 1350 }}>
          <Center>
            <Text variant="title">Spring launch</Text>
          </Center>
        </Stage>
      </AppShell>
    </div>
  );
}
