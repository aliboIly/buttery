import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  AppShell,
  HeaderBar,
  Inspector,
  SegmentedControl,
  Stage,
  ValueBadge,
} from "@buttery/react";

type Shape = "wide" | "square";

const SIZES = {
  wide: { width: 1600, height: 900, label: "1600 × 900" },
  square: { width: 1200, height: 1200, label: "1200 × 1200" },
};

/** A small editor: header, stage and inspector, with the inspector driving the stage's shape. */
export function EditorScreen(): ReactElement {
  const [shape, setShape] = useState<Shape>("wide");
  const size = SIZES[shape];
  return (
    <div style={{ blockSize: "calc(var(--bt-bento-row) * 1.5)" }}>
      <AppShell
        inspectorLabel="Card settings"
        header={<HeaderBar title="Spring launch" />}
        inspector={
          <Inspector label="Card settings">
            <Inspector.Section title="Canvas">
              <Inspector.Row
                label="Shape"
                extra={
                  <ValueBadge reserve={[SIZES.wide.label, SIZES.square.label]}>
                    {size.label}
                  </ValueBadge>
                }
              >
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
          size={{ width: size.width, height: size.height }}
        >
          <Center>
            <Text variant="title">Spring launch</Text>
          </Center>
        </Stage>
      </AppShell>
    </div>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Edit");
  await press("radio", "Square");
  await see("1200 × 1200");
};
