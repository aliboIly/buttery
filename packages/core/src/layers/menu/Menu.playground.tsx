import type { ReactElement } from "react";
import {
  demoChoice,
  Inline,
  Menu,
  Pressable,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";

export const page: DocsPage = {
  section: "components/overlays",
  title: "Menu",
  description:
    "A list of actions that opens from a trigger, on the floating surface in the dropdown layer.",
  order: 80,
  status: "stable",
  since: "0.5.0",
};

function Trigger({ label }: { readonly label: string }): ReactElement {
  return (
    <Surface asChild level="raised" padX={4} padY={2} radius="full">
      <Menu.Trigger asChild>
        <Pressable>
          <Text variant="button">{label}</Text>
        </Pressable>
      </Menu.Trigger>
    </Surface>
  );
}

const ALIGNS = ["end", "start", "center"] as const;

export const live: LiveDemo = {
  controls: {
    align: { kind: "choice", options: ALIGNS, initial: "end" },
    disabled: { kind: "toggle", initial: false },
    children: { kind: "text", initial: "Card actions" },
  },
  render: ({ align, disabled, children }) => {
    const edge = demoChoice(align, ALIGNS);
    return (
      <Inline justify={edge}>
        <Menu>
          <Surface asChild level="raised" padX={4} padY={2} radius="full">
            <Menu.Trigger asChild disabled={disabled === true}>
              <Pressable>
                <Text variant="button">{String(children)}</Text>
              </Pressable>
            </Menu.Trigger>
          </Surface>
          <Menu.Content align={edge}>
            <Menu.Item>Duplicate</Menu.Item>
            <Menu.Item>Move to Drafts</Menu.Item>
            <Menu.Separator />
            <Menu.Item tone="danger">Delete</Menu.Item>
          </Menu.Content>
        </Menu>
      </Inline>
    );
  },
  code: ({ align, disabled, children }) => {
    const edge = demoChoice(align, ALIGNS);
    return [
      `<Inline justify="${edge}">`,
      "  <Menu>",
      '    <Surface asChild level="raised" padX={4} padY={2} radius="full">',
      `      <Menu.Trigger asChild${disabled === true ? " disabled" : ""}>`,
      "        <Pressable>",
      `          <Text variant="button">${String(children)}</Text>`,
      "        </Pressable>",
      "      </Menu.Trigger>",
      "    </Surface>",
      `    <Menu.Content align="${edge}">`,
      "      <Menu.Item>Duplicate</Menu.Item>",
      "      <Menu.Item>Move to Drafts</Menu.Item>",
      "      <Menu.Separator />",
      '      <Menu.Item tone="danger">Delete</Menu.Item>',
      "    </Menu.Content>",
      "  </Menu>",
      "</Inline>",
    ].join("\n");
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "Actions",
    description:
      "Lined up with the trigger's end, 8px below it. It grows in from the trigger and fades out.",
    render: () => (
      <Inline justify="end">
        <Menu>
          <Trigger label="Card actions" />
          <Menu.Content>
            <Menu.Item>Duplicate</Menu.Item>
            <Menu.Item>Rename</Menu.Item>
            <Menu.Item disabled>Move to folder</Menu.Item>
            <Menu.Separator />
            <Menu.Item>Delete</Menu.Item>
          </Menu.Content>
        </Menu>
      </Inline>
    ),
  },
  {
    title: "Submenus",
    description:
      "An item that opens a second list beside it, once the pointer rests on it for 40ms or with ArrowRight.",
    render: () => (
      <Inline>
        <Menu>
          <Trigger label="Workspace" />
          <Menu.Content align="start">
            <Menu.Item>Settings</Menu.Item>
            <Menu.Sub>
              <Menu.SubTrigger>Switch workspace</Menu.SubTrigger>
              <Menu.SubContent>
                <Menu.Item>Harbor Beans</Menu.Item>
                <Menu.Item>Northside Roasters</Menu.Item>
              </Menu.SubContent>
            </Menu.Sub>
            <Menu.Separator />
            <Menu.Item>Sign out</Menu.Item>
          </Menu.Content>
        </Menu>
      </Inline>
    ),
  },
  {
    title: "Instant, as app chrome",
    description:
      'entrance="instant" shows the menu complete in the next frame and removes it at once.',
    render: () => (
      <Inline>
        <Menu entrance="instant">
          <Trigger label="Row actions" />
          <Menu.Content align="start">
            <Menu.Item>Refund</Menu.Item>
            <Menu.Item>Resend receipt</Menu.Item>
          </Menu.Content>
        </Menu>
      </Inline>
    ),
  },
  {
    title: "Groups and choices",
    description:
      "A heading names each group; in a radio group the chosen item shows a check.",
    render: () => (
      <Inline>
        <Menu>
          <Trigger label="View" />
          <Menu.Content align="start">
            <Menu.RadioGroup label="Sort by" defaultValue="newest">
              <Menu.RadioItem value="newest">Newest first</Menu.RadioItem>
              <Menu.RadioItem value="oldest">Oldest first</Menu.RadioItem>
              <Menu.RadioItem value="name">Name</Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.Separator />
            <Menu.Group label="Show">
              <Menu.Item>Archived cards</Menu.Item>
            </Menu.Group>
          </Menu.Content>
        </Menu>
      </Inline>
    ),
  },
];
