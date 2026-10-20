import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Text } from "@buttery/core";
import {
  AppShell,
  HeaderBar,
  Inspector,
  SegmentedControl,
  Stage,
} from "@buttery/react";

type Shape = "wide" | "square";

/** A small editor: header, stage and inspector, with the inspector driving the stage's shape. */
export function EditorScreen(): ReactElement {
  const [shape, setShape] = useState<Shape>("wide");
  return (
    <div style={{ blockSize: "calc(var(--bt-bento-row) * 1.5)" }}>
      <AppShell
        inspectorLabel="Card settings"
        header={<HeaderBar title="Spring launch" />}
        inspector={
          <Inspector label="Card settings">
            <Inspector.Section title="Canvas">
              <Inspector.Row label="Shape">
                <SegmentedControl<Shape>
                  label="Shape"
                  options={[
                    { value: "wide", label: "Wide" },
                    { value: "square", label: "Square" },
                  ]}
                  value={shape}
                  onValueChange={setShape}
                />
              </Inspector.Row>
            </Inspector.Section>
          </Inspector>
        }
      >
        <Stage
          label="Card preview"
          size={
            shape === "wide"
              ? { width: 1600, height: 900 }
              : { width: 1200, height: 1200 }
          }
        >
          <Center>
            <Text variant="title">Spring launch</Text>
          </Center>
        </Stage>
      </AppShell>
    </div>
  );
}
