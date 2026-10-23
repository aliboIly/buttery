import { Stack, Text, demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Accordion, Avatar } from "@buttery/react";
import type { AccordionSize, AccordionVariant } from "@buttery/react";
import { CreditCard, MapPin, Repeat } from "lucide-react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "Accordion",
  description:
    "A list of items that each open in place: a trigger row over a panel whose height follows its content.",
  order: 5,
  status: "new",
  since: "0.9.0",
};

const VARIANTS = ["divided", "contained", "cards", "plain"] as const;
const SIZES = ["sm", "md", "lg"] as const;

function Shipping({
  variant,
  size,
}: {
  readonly variant?: AccordionVariant;
  readonly size?: AccordionSize;
}): ReactElement {
  return (
    <Accordion variant={variant} size={size} defaultValue="arrival">
      <Accordion.Item value="arrival" title="When will my coffee arrive?">
        Order by noon and we roast it the next morning, then ship it that
        afternoon. Most bags arrive in two to four days.
      </Accordion.Item>
      <Accordion.Item value="shipping" title="How much is shipping?">
        Standard shipping is $6, and free once an order reaches $40.
      </Accordion.Item>
      <Accordion.Item value="returns" title="What if I don't like a coffee?">
        Tell us within 30 days and we'll send a different one or refund you.
      </Accordion.Item>
    </Accordion>
  );
}

export const live: LiveDemo = {
  controls: {
    variant: { kind: "choice", options: VARIANTS, initial: "divided" },
    size: { kind: "choice", options: SIZES, initial: "md" },
    type: {
      kind: "choice",
      options: ["single", "multiple"],
      initial: "single",
    },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ variant, size, type, disabled }) => {
    const items = (
      <>
        <Accordion.Item value="arrival" title="When will my coffee arrive?">
          Order by noon and we roast it the next morning, then ship it that
          afternoon. Most bags arrive in two to four days.
        </Accordion.Item>
        <Accordion.Item value="shipping" title="How much is shipping?">
          Standard shipping is $6, and free once an order reaches $40.
        </Accordion.Item>
        <Accordion.Item value="returns" title="What if I don't like a coffee?">
          Tell us within 30 days and we'll send a different one or refund you.
        </Accordion.Item>
      </>
    );
    const shared = {
      variant: demoChoice(variant, VARIANTS),
      size: demoChoice(size, SIZES),
      disabled: disabled === true,
    };
    return type === "multiple" ? (
      <Accordion {...shared} type="multiple" defaultValue={["arrival"]}>
        {items}
      </Accordion>
    ) : (
      <Accordion {...shared} defaultValue="arrival">
        {items}
      </Accordion>
    );
  },
  code: ({ variant, size, type, disabled }) =>
    [
      `<Accordion${type === "multiple" ? ' type="multiple"' : ""} variant="${String(variant)}" size="${String(size)}"${disabled === true ? " disabled" : ""}>`,
      '  <Accordion.Item value="arrival" title="When will my coffee arrive?">',
      "    Order by noon and we roast it the next morning, then ship it that afternoon.",
      "  </Accordion.Item>",
      '  <Accordion.Item value="shipping" title="How much is shipping?">',
      "    Standard shipping is $6, and free once an order reaches $40.",
      "  </Accordion.Item>",
      "</Accordion>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  ...VARIANTS.map((variant): DemoSection => ({
    title: `${variant.charAt(0).toUpperCase()}${variant.slice(1)}`,
    description: {
      divided:
        "Rows with a hairline between them, lined up with the text around them. The default.",
      contained: "Rows in one card, divided by hairlines, tinting on hover.",
      cards: "A card for each item, 8px apart.",
      plain: "Rows without lines that tint on hover, for a sidebar or a panel.",
    }[variant],
    render: () => <Shipping variant={variant} />,
  })),
  {
    title: "Sizes",
    description:
      "sm for a panel, md (the default) for an app page, lg for a page's own questions.",
    render: () => (
      <Stack gap={8}>
        {SIZES.map((size) => (
          <Stack key={size} gap={3}>
            <Text variant="caption">{`size="${size}"`}</Text>
            <Shipping size={size} />
          </Stack>
        ))}
      </Stack>
    ),
  },
  {
    title: "Icons, avatars and descriptions",
    description:
      "An icon sits on the title's first line; anything else in leading centers on the title and its description.",
    render: () => (
      <Accordion variant="contained" type="multiple">
        <Accordion.Item
          value="plan"
          icon={Repeat}
          title="Subscription"
          description="2 bags every 2 weeks"
        >
          Your next bag of Huila roasts on Thursday.
        </Accordion.Item>
        <Accordion.Item
          value="address"
          icon={MapPin}
          title="Shipping address"
          description="2210 SE Ankeny St, Portland"
        >
          Parcels leave the roastery at 4pm on roasting days.
        </Accordion.Item>
        <Accordion.Item
          value="card"
          icon={CreditCard}
          title="Payment"
          description="Card ending 4242"
        >
          You're charged the morning each delivery roasts.
        </Accordion.Item>
        <Accordion.Item
          value="rosa"
          leading={<Avatar name="Rosa Alvarez" size="sm" />}
          title="Rosa Alvarez"
          description="Roaster, answers wholesale mail"
        >
          Rosa replies to wholesale@halfmoon.example within a day.
        </Accordion.Item>
      </Accordion>
    ),
  },
  {
    title: "Disabled",
    description:
      "A disabled item can't open and leaves the tab order; the arrow keys skip it.",
    render: () => (
      <Accordion variant="cards">
        <Accordion.Item value="standard" title="Standard shipping">
          Two to four days anywhere in the US, $6 or free from $40.
        </Accordion.Item>
        <Accordion.Item
          value="pickup"
          title="Pick up at the counter"
          description="Back in spring, when the counter reopens"
          disabled
        >
          Collect your bag at 1180 SE Water Ave.
        </Accordion.Item>
      </Accordion>
    ),
  },
];
