import type { ReactElement } from "react";
import { Stack, Surface, Text, demoChoice } from "@butteryui/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import { ArrowLink, MorphMenu } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "MorphMenu",
  description:
    "A row of menu triggers whose menus open in one floating panel that reshapes from menu to menu instead of closing and reopening.",
  order: 40,
  status: "stable",
  since: "0.7.0",
};

function Story(): ReactElement {
  return (
    <Stack gap={2}>
      <Text variant="control" tone="secondary">
        New
      </Text>
      <Text variant="title">The presenter view</Text>
      <Text variant="body-sm" tone="secondary">
        Notes and the next slide, on your screen only.
      </Text>
    </Stack>
  );
}

const OPEN = { None: "", Product: "product", Guides: "guides" } as const;

function LiveMenus({
  layout,
  open,
}: {
  readonly layout: "bar" | "stack";
  readonly open: string;
}): ReactElement {
  return (
    <Surface
      level="card"
      padX={4}
      style={{ minBlockSize: "calc(var(--bt-bento-row) * 1.25)" }}
    >
      <MorphMenu label="Demo menus" layout={layout} defaultValue={open}>
        <MorphMenu.Item
          label="Product"
          value="product"
          featured={<Story />}
          footer={<ArrowLink href="#features">See all features</ArrowLink>}
        >
          <MorphMenu.Column title="Make">
            <MorphMenu.Entry
              href="#slides"
              title="Slides"
              caption="Layouts and notes"
            />
            <MorphMenu.Entry
              href="#themes"
              title="Themes"
              caption="Fonts and colors"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Item label="Guides" value="guides">
          <MorphMenu.Column title="Learn">
            <MorphMenu.Entry
              href="#first-deck"
              title="Your first deck"
              caption="Ten minutes from blank to done"
            />
            <MorphMenu.Entry
              href="#shortcuts"
              title="Shortcuts"
              caption="Every key on one page"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
      </MorphMenu>
    </Surface>
  );
}

function menusCode({ layout, open }: DemoValues): string {
  const value = OPEN[demoChoice(open, ["None", "Product", "Guides"])];
  const props = [
    ...(layout === "stack" ? ['layout="stack"'] : []),
    ...(value === "" ? [] : [`defaultValue="${value}"`]),
  ];
  return [
    `<MorphMenu${props.length === 0 ? "" : ` ${props.join(" ")}`}>`,
    '  <MorphMenu.Item label="Product" value="product" featured={<Story />} footer={<ArrowLink href="/features">See all features</ArrowLink>}>',
    '    <MorphMenu.Column title="Make">',
    '      <MorphMenu.Entry href="/slides" title="Slides" caption="Layouts and notes" />',
    "    </MorphMenu.Column>",
    "  </MorphMenu.Item>",
    '  <MorphMenu.Item label="Guides" value="guides">…</MorphMenu.Item>',
    '  <MorphMenu.Link href="/pricing">Pricing</MorphMenu.Link>',
    "</MorphMenu>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    layout: { kind: "choice", options: ["bar", "stack"], initial: "bar" },
    open: {
      kind: "choice",
      options: ["None", "Product", "Guides"],
      initial: "None",
    },
  },
  render: ({ layout, open }) => {
    const shape = demoChoice(layout, ["bar", "stack"]);
    const value = OPEN[demoChoice(open, ["None", "Product", "Guides"])];
    return <LiveMenus key={`${shape}-${value}`} layout={shape} open={value} />;
  },
  code: menusCode,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Menus in one panel",
    description:
      "Rest on a trigger for 150ms and its menu unfolds under the row in dur-fast. Move along the row and the panel reshapes on spring.snappy while the columns crossfade, the new ones sliding in from the side you came from. Leave and it folds up after 100ms.",
    render: () => (
      <Surface
        level="card"
        padX={4}
        style={{ minBlockSize: "calc(var(--bt-bento-row) * 1.25)" }}
      >
        <MorphMenu label="Demo menus">
          <MorphMenu.Item
            label="Product"
            featured={<Story />}
            footer={<ArrowLink href="#features">See all features</ArrowLink>}
          >
            <MorphMenu.Column title="Make">
              <MorphMenu.Entry
                href="#slides"
                title="Slides"
                caption="Layouts and notes"
              />
              <MorphMenu.Entry
                href="#themes"
                title="Themes"
                caption="Fonts and colors"
              />
              <MorphMenu.Entry
                href="#sizes"
                title="Sizes"
                caption="Wide, square or tall"
              />
            </MorphMenu.Column>
            <MorphMenu.Column title="Share">
              <MorphMenu.Entry
                href="#export"
                title="Export"
                caption="PDF or PNG files"
              />
              <MorphMenu.Entry
                href="#copy"
                title="Copy"
                caption="On the clipboard"
              />
            </MorphMenu.Column>
          </MorphMenu.Item>
          <MorphMenu.Item label="Guides">
            <MorphMenu.Column title="Learn">
              <MorphMenu.Entry
                href="#first-deck"
                title="Your first deck"
                caption="Ten minutes from blank to done"
              />
              <MorphMenu.Entry
                href="#shortcuts"
                title="Shortcuts"
                caption="Every key on one page"
              />
            </MorphMenu.Column>
          </MorphMenu.Item>
          <MorphMenu.Item label="Company">
            <MorphMenu.Column>
              <MorphMenu.Entry href="#about" title="About" />
              <MorphMenu.Entry href="#careers" title="Careers" />
              <MorphMenu.Entry href="#press" title="Press kit" />
            </MorphMenu.Column>
          </MorphMenu.Item>
          <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
        </MorphMenu>
      </Surface>
    ),
  },
];
