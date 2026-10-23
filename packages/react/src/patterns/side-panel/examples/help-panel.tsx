import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  AppPage,
  AppShell,
  Button,
  PageHeader,
  SidePanel,
  Sidebar,
  TextArea,
  TopBar,
} from "@buttery/react";
import { CircleHelp, Flame, Package } from "lucide-react";

/** A help panel the top bar opens, docked beside the page from 1280px of shell and a sheet under that. */
export function HelpPanel(): ReactElement {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  return (
    <div style={{ blockSize: "calc(var(--bt-bento-row) * 2)" }}>
      <AppShell
        layout="sidebar"
        sidebar={
          <Sidebar label="Main">
            <Sidebar.Item label="Orders" href="#orders" icon={Package} />
            <Sidebar.Item label="Roast plan" href="#roast-plan" icon={Flame} />
          </Sidebar>
        }
        topBar={
          <TopBar
            actions={
              <TopBar.Action
                label="Help"
                icon={CircleHelp}
                aria-expanded={open}
                onSelect={() => {
                  setOpen(!open);
                }}
              />
            }
          />
        }
        panel={
          <SidePanel
            title="Help"
            open={open}
            onOpenChange={setOpen}
            menu={
              <Menu.Item
                tone="danger"
                onSelect={() => {
                  setAsked("");
                }}
              >
                Clear the conversation
              </Menu.Item>
            }
            footer={
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setAsked(question);
                  setQuestion("");
                }}
              >
                <Stack gap={2}>
                  <TextArea
                    label="Ask a question"
                    rows={2}
                    value={question}
                    onValueChange={setQuestion}
                  />
                  <Button type="submit" variant="primary" size="sm">
                    Ask
                  </Button>
                </Stack>
              </form>
            }
          >
            <Text variant="body-sm">
              {asked === ""
                ? "Ask anything about roasting, orders or payouts."
                : `You asked: ${asked}`}
            </Text>
          </SidePanel>
        }
      >
        <AppPage header={<PageHeader title="Orders" />}>
          <AppPage.Section title="Today">
            <Text variant="body">Twelve orders to roast and pack.</Text>
          </AppPage.Section>
        </AppPage>
      </AppShell>
    </div>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Help");
  await type("Ask a question", "When do payouts arrive?");
  await press("button", "Ask");
  await see("You asked: When do payouts arrive?");
};
