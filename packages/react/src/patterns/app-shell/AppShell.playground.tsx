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

const DESIGN = gradients.find((preset) => preset.id === "mint");

function Editor(): ReactElement {
  const [size, setSize] = useState(80);
  return (
    <div style={{ blockSize: "calc(var(--bt-bento-row) * 2)" }}>
      <AppShell
        inspectorLabel="Card settings"
        header={
          <HeaderBar title="Gift card for Rosa">
            <HeaderBar.Actions>
              <HeaderBar.Action label="Preview" onSelect={() => undefined} />
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
              title="Message"
              resettable={size !== 80}
              onReset={() => {
                setSize(80);
              }}
            >
              <Inspector.Row>
                <Slider
                  label="Text size"
                  format="%"
                  min={20}
                  max={100}
                  resetValue={80}
                  value={size}
                  onValueChange={setSize}
                />
              </Inspector.Row>
            </Inspector.Section>
          </Inspector>
        }
      >
        <Stage
          label="Gift card preview"
          size={{ width: 1600, height: 900 }}
          background={DESIGN ? gradientCss(DESIGN) : undefined}
        >
          <Center>
            <Text variant="title" style={{ scale: String(size / 80) }}>
              Happy birthday, Rosa
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
