import { Menu, Stack, Text } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import {
  AppPage,
  AppShell,
  ArrowLink,
  Button,
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
  order: 110,
  status: "new",
  since: "0.8.0",
};

function LivePanel({
  title,
  expanded,
  footer,
}: {
  readonly title: string;
  readonly expanded: boolean;
  readonly footer: boolean;
}): ReactElement {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        blockSize: "calc(var(--bt-bento-row) * 2)",
      }}
    >
      {open ? null : (
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          Show the panel
        </Button>
      )}
      <SidePanel
        key={String(expanded)}
        title={title}
        open={open}
        onOpenChange={setOpen}
        defaultExpanded={expanded}
        menu={
          <>
            <Menu.Item>Open the roasting guide</Menu.Item>
            <Menu.Item>Contact support</Menu.Item>
          </>
        }
        footer={
          footer ? <TextArea label="Ask a question" rows={2} /> : undefined
        }
      >
        <Stack gap={3}>
          <Text variant="title-sm">Popular this week</Text>
          <ArrowLink href="#side-panel">Change a roast profile</ArrowLink>
          <ArrowLink href="#side-panel">When payouts arrive</ArrowLink>
        </Stack>
      </SidePanel>
    </div>
  );
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Roasting help" },
    defaultExpanded: { kind: "toggle", initial: false },
    footer: { kind: "toggle", initial: true },
  },
  render: ({ title, defaultExpanded, footer }) => (
    <LivePanel
      title={String(title)}
      expanded={defaultExpanded === true}
      footer={footer === true}
    />
  ),
  code: ({ title, defaultExpanded, footer }) =>
    [
      "<SidePanel",
      `  title="${String(title)}"`,
      "  open={open}",
      "  onOpenChange={setOpen}",
      ...(defaultExpanded === true ? ["  defaultExpanded"] : []),
      "  menu={",
      "    <>",
      "      <Menu.Item>Open the roasting guide</Menu.Item>",
      "      <Menu.Item>Contact support</Menu.Item>",
      "    </>",
      "  }",
      ...(footer === true
        ? ['  footer={<TextArea label="Ask a question" rows={2} />}']
        : []),
      ">",
      "  <Stack gap={3}>",
      '    <Text variant="title-sm">Popular this week</Text>',
      '    <ArrowLink href="/help/roast-profiles">Change a roast profile</ArrowLink>',
      '    <ArrowLink href="/help/payouts">When payouts arrive</ArrowLink>',
      "  </Stack>",
      "</SidePanel>",
    ].join("\n"),
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
