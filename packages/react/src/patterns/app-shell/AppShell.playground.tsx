import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Text } from "@buttery/core";
import type { DemoSection, DemoWidth, DocsPage } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import {
  AppShell,
  HeaderBar,
  IconButton,
  Inspector,
  Slider,
  Stage,
} from "@buttery/react";
import { Redo2, Undo2 } from "lucide-react";

export const page: DocsPage = {
  section: "patterns",
  title: "AppShell",
  description:
    'A whole app screen: an editor (a header and a stage beside an inspector that becomes a sheet on narrow screens) or, with layout="sidebar", a dashboard (a sidebar beside a top bar and the page).',
  order: 120,
  status: "stable",
  since: "0.6.0",
  home: "patterns/app-shell",
};

export const width: DemoWidth = "desktop";

const BACKDROP = gradients.find((preset) => preset.id === "mint");

function Editor(): ReactElement {
  const [scale, setScale] = useState(80);
  return (
    <div style={{ blockSize: "calc(var(--bt-bento-row) * 2)" }}>
      <AppShell
        inspectorLabel="Card settings"
        header={
          <HeaderBar title="Launch card">
            <HeaderBar.Actions>
              <HeaderBar.Action label="Crop" onSelect={() => undefined} />
              <HeaderBar.Action label="Duplicate" onSelect={() => undefined} />
            </HeaderBar.Actions>
            <HeaderBar.Separator />
            <IconButton icon={Undo2} label="Undo" />
            <IconButton icon={Redo2} label="Redo" disabled />
          </HeaderBar>
        }
        inspector={
          <Inspector label="Card settings">
            <Inspector.Section
              title="Card"
              resettable={scale !== 80}
              onReset={() => {
                setScale(80);
              }}
            >
              <Inspector.Row>
                <Slider
                  label="Scale"
                  format="%"
                  min={20}
                  max={100}
                  resetValue={80}
                  value={scale}
                  onValueChange={setScale}
                />
              </Inspector.Row>
            </Inspector.Section>
          </Inspector>
        }
      >
        <Stage
          label="Card preview"
          size={{ width: 1600, height: 900 }}
          background={BACKDROP ? gradientCss(BACKDROP) : undefined}
        >
          <Center>
            <Text variant="title" style={{ scale: String(scale / 80) }}>
              Launch card
            </Text>
          </Center>
        </Stage>
      </AppShell>
    </div>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Editor",
    description:
      "The header over the stage and the inspector beside them; narrower than 840px, the inspector opens as a sheet from the Edit button.",
    render: () => <Editor />,
  },
];
