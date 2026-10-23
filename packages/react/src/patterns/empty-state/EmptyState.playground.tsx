import { Grid, demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { ArrowLink, Button, EmptyState } from "@butteryui/react";
import { ImagePlus, Receipt } from "lucide-react";

const SIZES = ["sm", "md", "lg"] as const;
const VARIANTS = ["plain", "dashed"] as const;

export const page: DocsPage = {
  section: "components/feedback",
  title: "EmptyState",
  description:
    "What shows where content will be: a title, a line about how to add some, and the actions that do.",
  order: 40,
  status: "stable",
  since: "0.6.0",
};

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "No orders yet" },
    description: {
      kind: "text",
      initial:
        "Orders show up here once a customer checks out, or when you add one by hand.",
    },
    icon: { kind: "toggle", initial: true },
    size: { kind: "choice", options: SIZES, initial: "md" },
    variant: { kind: "choice", options: VARIANTS, initial: "plain" },
  },
  render: ({ title, description, icon, size, variant }) => (
    <EmptyState
      icon={icon === true ? Receipt : undefined}
      title={String(title)}
      description={String(description)}
      docs={<ArrowLink href="#orders-guide">How orders work</ArrowLink>}
      size={demoChoice(size, SIZES)}
      variant={demoChoice(variant, VARIANTS)}
    />
  ),
  code: ({ title, description, icon, size, variant }) =>
    [
      "<EmptyState",
      ...(icon === true ? ["  icon={Receipt}"] : []),
      `  title="${String(title)}"`,
      `  description="${String(description)}"`,
      '  docs={<ArrowLink href="/help/orders">How orders work</ArrowLink>}',
      ...(size === "md" ? [] : [`  size="${String(size)}"`]),
      ...(variant === "plain" ? [] : [`  variant="${String(variant)}"`]),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Empty canvas",
    description:
      "The title, its line 12px under it, and two pills 24px under the text.",
    render: () => (
      <EmptyState
        title="An empty gift card"
        description="Pick one of the shop's designs, or upload a photo of your own."
        actions={
          <>
            <Button variant="primary">Pick a design</Button>
            <Button variant="secondary">Upload a photo</Button>
          </>
        }
      />
    ),
  },
  {
    title: "Text only",
    render: () => (
      <EmptyState
        title="No refunds yet"
        description="Refunds you give show up here."
      />
    ),
  },
  {
    title: "Sizes",
    description:
      "sm for a panel or a table: a 40px tile, the line 8 under the title and the actions 16 under the text. lg for a whole page: a 56px tile, a title-lg heading over body text and the actions 32 under it.",
    render: () => (
      <Grid columns={{ base: 1, md: 2 }} gap={8}>
        <EmptyState
          size="sm"
          icon={Receipt}
          title="No refunds yet"
          description="Refunds you give show up here."
          actions={
            <Button variant="secondary" size="sm">
              Give a refund
            </Button>
          }
        />
        <EmptyState
          size="lg"
          icon={Receipt}
          title="No orders yet"
          description="Orders show up here once a customer checks out."
          actions={
            <>
              <Button variant="primary">Add an order</Button>
              <Button variant="secondary">Import orders</Button>
            </>
          }
        />
      </Grid>
    ),
  },
  {
    title: "Dashed",
    description:
      "variant dashed draws the empty state inside a 2px dashed edge with 16px corners, as a drop target is, padded 24, 32 or 48 by its size.",
    render: () => (
      <EmptyState
        variant="dashed"
        icon={ImagePlus}
        title="Add photos of the bag"
        description="Drop them here, or pick them from your computer."
        actions={<Button variant="secondary">Choose photos</Button>}
      />
    ),
  },
];
