import {
  ClipboardCopy,
  Copy,
  FolderOpen,
  Hash,
  Link,
  List,
  Plus,
  Quote,
  Trash2,
  Type,
} from "lucide-react";
import { useState } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Grid, Stack, Surface, Text, cx } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { ContextMenu } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "ContextMenu",
  description:
    "A menu of actions for what's under the pointer: it opens where a right-click or a long press lands, or at the focused element from the keyboard.",
  order: 35,
  status: "new",
  since: "0.9.0",
};

interface CardProps extends ComponentPropsWithRef<"div"> {
  /** What the card is, which names it. */
  readonly name: string;
  /** The line under the name. */
  readonly hint?: string | undefined;
}

/** A card to right-click, the trigger each demo's menu opens from; it takes the trigger's props through `asChild`. */
function Card({
  name,
  hint = "Right-click it, or focus it and press Shift+F10",
  className,
  ...rest
}: CardProps): ReactElement {
  return (
    <Surface
      {...rest}
      level="card"
      padX={5}
      padY={4}
      radius="lg"
      tabIndex={0}
      role="region"
      aria-label={name}
      className={cx("bt-focus", className)}
    >
      <Stack gap={2}>
        <Text variant="label">{name}</Text>
        <Text variant="caption">{hint}</Text>
      </Stack>
    </Surface>
  );
}

const TONES = ["danger", "neutral"] as const;

export const live: LiveDemo = {
  controls: {
    open: { kind: "toggle", initial: false },
    disabled: { kind: "toggle", initial: false },
    children: { kind: "text", initial: "Fall wholesale pitch" },
    shortcut: { kind: "toggle", initial: true },
    tone: { kind: "choice", options: TONES, initial: "danger" },
  },
  render: ({ open, disabled, children, shortcut, tone }) => {
    const title = String(children);
    const keys = shortcut === true;
    return (
      <ContextMenu open={open === true ? true : undefined}>
        <ContextMenu.Trigger asChild disabled={disabled === true}>
          <Surface
            level="card"
            padX={5}
            padY={4}
            radius="lg"
            tabIndex={0}
            role="region"
            aria-label={title}
            className="bt-focus"
          >
            <Stack gap={2}>
              <Text variant="label">{title}</Text>
              <Text variant="caption">
                Right-click it, or focus it and press Shift+F10
              </Text>
            </Stack>
          </Surface>
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label={title}>
          <ContextMenu.Item icon={FolderOpen}>Open</ContextMenu.Item>
          <ContextMenu.Item icon={Copy} shortcut={keys ? "mod+d" : undefined}>
            Duplicate
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item
            icon={Trash2}
            tone={tone === "neutral" ? "neutral" : "danger"}
            shortcut={keys ? "backspace" : undefined}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    );
  },
  code: ({ open, disabled, children, shortcut, tone }) => {
    const title = String(children);
    const keys = shortcut === true;
    return [
      `<ContextMenu${open === true ? " open" : ""}>`,
      `  <ContextMenu.Trigger asChild${disabled === true ? " disabled" : ""}>`,
      `    <Surface level="card" padX={5} padY={4} radius="lg" tabIndex={0} role="region" aria-label="${title}" className="bt-focus">`,
      "      <Stack gap={2}>",
      `        <Text variant="label">${title}</Text>`,
      '        <Text variant="caption">Right-click it, or focus it and press Shift+F10</Text>',
      "      </Stack>",
      "    </Surface>",
      "  </ContextMenu.Trigger>",
      `  <ContextMenu.Content aria-label="${title}">`,
      "    <ContextMenu.Item icon={FolderOpen}>Open</ContextMenu.Item>",
      `    <ContextMenu.Item icon={Copy}${keys ? ' shortcut="mod+d"' : ""}>Duplicate</ContextMenu.Item>`,
      "    <ContextMenu.Separator />",
      `    <ContextMenu.Item icon={Trash2}${tone === "neutral" ? "" : ' tone="danger"'}${keys ? ' shortcut="backspace"' : ""}>Delete</ContextMenu.Item>`,
      "  </ContextMenu.Content>",
      "</ContextMenu>",
    ].join("\n");
  },
};

const LAYOUTS = [
  { value: "title", label: "Title", icon: Type },
  { value: "points", label: "Title and points", icon: List },
  { value: "numbers", label: "Big numbers", icon: Hash },
  { value: "quote", label: "Quote", icon: Quote },
] as const;

const SORTS = [
  { value: "day", label: "Roast day" },
  { value: "coffee", label: "Coffee" },
  { value: "weight", label: "Weight" },
] as const;

/** A board whose menu turns its weights on and off and picks how its batches sort. */
function BoardOptions(): ReactElement {
  const [weights, setWeights] = useState(true);
  const [sort, setSort] = useState("day");
  const sortLabel =
    SORTS.find((option) => option.value === sort)?.label ?? "Roast day";
  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <Card
          name="Monday roasts"
          hint={`Sorted by ${sortLabel.toLowerCase()}, weights ${weights ? "shown" : "hidden"}`}
        />
      </ContextMenu.Trigger>
      <ContextMenu.Content aria-label="Monday roasts">
        <ContextMenu.CheckboxItem
          shortcut="mod+shift+w"
          checked={weights}
          onCheckedChange={setWeights}
        >
          Show weights
        </ContextMenu.CheckboxItem>
        <ContextMenu.Separator />
        <ContextMenu.RadioGroup
          label="Sort by"
          value={sort}
          onValueChange={setSort}
        >
          {SORTS.map((option) => (
            <ContextMenu.RadioItem key={option.value} value={option.value}>
              {option.label}
            </ContextMenu.RadioItem>
          ))}
        </ContextMenu.RadioGroup>
      </ContextMenu.Content>
    </ContextMenu>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Right-click, a long press or Shift+F10",
    description:
      "The menu's corner opens beside the pointer, or beside the middle of the focused card, and it grows in from there. Items show their icons and shortcuts, and Delete is drawn in danger.",
    render: () => (
      <ContextMenu>
        <ContextMenu.Trigger asChild>
          <Card name="Café price list" />
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Café price list">
          <ContextMenu.Item icon={FolderOpen}>Open</ContextMenu.Item>
          <ContextMenu.Item icon={Copy} shortcut="mod+d">
            Duplicate
          </ContextMenu.Item>
          <ContextMenu.Item icon={Link} shortcut="mod+shift+c">
            Copy link
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item icon={Trash2} tone="danger" shortcut="backspace">
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    ),
  },
  {
    title: "Submenus",
    description:
      "An item that opens a second list beside it, once the pointer rests on it for 40ms or with ArrowRight.",
    render: () => (
      <ContextMenu>
        <ContextMenu.Trigger asChild>
          <Card name="Slide 3: The coffees on offer" />
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Slide 3: The coffees on offer">
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger icon={Plus}>
              New slide after
            </ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              {LAYOUTS.map((layout) => (
                <ContextMenu.Item key={layout.value} icon={layout.icon}>
                  {layout.label}
                </ContextMenu.Item>
              ))}
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
          <ContextMenu.Item icon={ClipboardCopy}>
            Copy as image
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    ),
  },
  {
    title: "Checkbox and radio items",
    description:
      "A checkbox item shows a check while it's on, and its shortcut flips it from the card. In a radio group the chosen item shows one, under a heading that names the group.",
    render: () => <BoardOptions />,
  },
  {
    title: "Disabled items and a disabled card",
    description:
      "A disabled item stays in the list and the arrow keys skip it. A disabled trigger leaves the right-click to the browser's own menu.",
    render: () => (
      <Grid columns={2} gap={4}>
        <ContextMenu>
          <ContextMenu.Trigger asChild>
            <Card name="Archived price list" />
          </ContextMenu.Trigger>
          <ContextMenu.Content aria-label="Archived price list">
            <ContextMenu.Item icon={FolderOpen}>Open</ContextMenu.Item>
            <ContextMenu.Item icon={Copy} shortcut="mod+d" disabled>
              Duplicate
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item icon={Trash2} tone="danger" disabled>
              Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu>
        <ContextMenu>
          <ContextMenu.Trigger asChild disabled>
            <Card
              name="Shared price list"
              hint="Right-click shows the browser's own menu"
            />
          </ContextMenu.Trigger>
          <ContextMenu.Content aria-label="Shared price list">
            <ContextMenu.Item icon={FolderOpen}>Open</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu>
      </Grid>
    ),
  },
  {
    title: "Instant, as app chrome",
    description:
      'entrance="instant" shows the menu complete in the next frame and removes it at once.',
    render: () => (
      <ContextMenu entrance="instant">
        <ContextMenu.Trigger asChild>
          <Card name="Order 1042" />
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="Order 1042">
          <ContextMenu.Item>Resend the invoice</ContextMenu.Item>
          <ContextMenu.Item tone="danger">Refund</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    ),
  },
];
