import { Menu, Stack, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import {
  AppPage,
  AppShell,
  ArrowLink,
  PageHeader,
  SidePanel,
  Sidebar,
  TextArea,
  TopBar,
} from "@buttery/react";
import { CircleHelp, Package } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "SidePanel",
  description:
    "A panel beside the page, such as help, that narrows the page instead of covering it.",
  order: 60,
  status: "new",
  since: "0.7.0",
};

function NarrowShell(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        inlineSize: "100%",
        maxInlineSize: "var(--bt-w-app-page-md)",
        blockSize: "calc(var(--bt-bento-row) * 2)",
      }}
    >
      <AppShell
        layout="sidebar"
        sidebar={
          <Sidebar label="Main">
            <Sidebar.Item
              label="Orders"
              href="#side-panel"
              icon={Package}
              current
            />
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
            footer={<TextArea label="Ask a question" rows={2} />}
          >
            <Stack gap={3}>
              <Text variant="title-sm">Popular this week</Text>
              <ArrowLink href="#side-panel">Change a roast profile</ArrowLink>
              <ArrowLink href="#side-panel">When payouts arrive</ArrowLink>
            </Stack>
          </SidePanel>
        }
      >
        <AppPage width="full" header={<PageHeader title="Orders" />}>
          <AppPage.Section>
            <Text>Help opens over this page as a sheet.</Text>
          </AppPage.Section>
        </AppPage>
      </AppShell>
    </div>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Its parts",
    description:
      "Outside a shell it docks where it's placed: its title, a menu, expand and close, a body that scrolls and a pinned footer.",
    render: () => (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          blockSize: "calc(var(--bt-bento-row) * 2)",
        }}
      >
        <SidePanel
          title="Roasting help"
          defaultOpen
          menu={
            <>
              <Menu.Item>Open the roasting guide</Menu.Item>
              <Menu.Item>Contact support</Menu.Item>
              <Menu.Item tone="danger">Clear the conversation</Menu.Item>
            </>
          }
          footer={<TextArea label="Ask a question" rows={2} />}
        >
          <Stack gap={3}>
            <Text variant="title-sm">Popular this week</Text>
            <ArrowLink href="#side-panel">Change a roast profile</ArrowLink>
            <ArrowLink href="#side-panel">Pause a subscription</ArrowLink>
            <ArrowLink href="#side-panel">When payouts arrive</ArrowLink>
          </Stack>
        </SidePanel>
      </div>
    ),
  },
  {
    title: "As a sheet",
    description:
      "In a shell under 1280px wide, Help opens it as a sheet at the window's end over a dim scrim, and the page keeps its width.",
    render: () => <NarrowShell />,
  },
];
