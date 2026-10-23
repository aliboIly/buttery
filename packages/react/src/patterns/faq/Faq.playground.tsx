import { demoChoice } from "@butteryui/core";
import type {
  DemoFrame,
  DemoSection,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import { Button, Faq } from "@butteryui/react";
import type { FaqGroup, FaqLayout, FaqQuestion } from "@butteryui/react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "patterns",
  title: "FAQ",
  description:
    "Questions and answers in a titled section: groups to switch between, a search that filters as you type, a link to each question and a way to ask another.",
  order: 65,
  status: "new",
  since: "0.9.0",
};

export const frame: DemoFrame = "page";

const LAYOUTS = ["stacked", "split", "two-column"] as const;
const VARIANTS = ["divided", "contained", "cards", "plain"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const GROUPS: readonly FaqGroup[] = [
  { value: "orders", label: "Orders" },
  { value: "subscriptions", label: "Subscriptions" },
];

/** Questions with ids of their own, so each demo's anchors stay unique on the page. */
function questions(prefix: string): readonly FaqQuestion[] {
  return [
    {
      id: `${prefix}-arrival`,
      group: "orders",
      question: "When will my coffee arrive?",
      answer:
        "Order by noon and we roast it the next morning, then ship it that afternoon. Most bags arrive in two to four days.",
    },
    {
      id: `${prefix}-shipping`,
      group: "orders",
      question: "How much is shipping?",
      answer:
        "Standard shipping is $6, and free once an order reaches $40. Next-day delivery is $14.",
    },
    {
      id: `${prefix}-returns`,
      group: "orders",
      question: "What if I don't like a coffee?",
      answer:
        "Tell us within 30 days, however much is left, and we'll send a different coffee or refund you.",
      keywords: "refund return",
    },
    {
      id: `${prefix}-skip`,
      group: "subscriptions",
      question: "Can I skip a delivery?",
      answer:
        "Yes, from your account, up to the day before it roasts. Nothing is charged for a skipped delivery.",
    },
    {
      id: `${prefix}-saving`,
      group: "subscriptions",
      question: "How much does a subscription save?",
      answer:
        "Every bag is 10% off and every delivery ships free, so a bag of roaster's choice comes to $16.20.",
    },
    {
      id: `${prefix}-cancel`,
      group: "subscriptions",
      question: "Can I cancel at any time?",
      answer:
        "Yes. Cancel from your account and nothing more is charged after the delivery that's already roasting.",
    },
  ];
}

function Contact(): ReactElement {
  return (
    <Faq.Contact
      description="Write to hello@halfmoon.example and Rosa or Theo will answer within a day."
      actions={
        <Button variant="soft" asChild>
          <a href="mailto:hello@halfmoon.example">Email the roastery</a>
        </Button>
      }
    />
  );
}

export const live: LiveDemo = {
  controls: {
    layout: { kind: "choice", options: LAYOUTS, initial: "split" },
    variant: { kind: "choice", options: VARIANTS, initial: "divided" },
    size: { kind: "choice", options: SIZES, initial: "md" },
    search: { kind: "toggle", initial: true },
    groups: { kind: "toggle", initial: true },
  },
  render: ({ layout, variant, size, search, groups }) => (
    <Faq
      title="Questions, answered"
      intro="What people ask the roastery most."
      layout={demoChoice(layout, LAYOUTS)}
      variant={demoChoice(variant, VARIANTS)}
      size={demoChoice(size, SIZES)}
      search={search === true}
      questions={questions("live")}
      {...(groups === true ? { groups: GROUPS } : {})}
      contact={<Contact />}
    />
  ),
  code: ({ layout, variant, size, search, groups }) =>
    [
      "<Faq",
      '  title="Questions, answered"',
      '  intro="What people ask the roastery most."',
      `  layout="${String(layout)}"`,
      `  variant="${String(variant)}"`,
      `  size="${String(size)}"`,
      ...(search === true ? ["  search"] : []),
      ...(groups === true
        ? [
            '  groups={[{ value: "orders", label: "Orders" }, { value: "subscriptions", label: "Subscriptions" }]}',
          ]
        : []),
      "  questions={[",
      `    { id: "shipping",${groups === true ? ' group: "orders",' : ""} question: "How much is shipping?", answer: "Standard shipping is $6, and free from $40." },`,
      "  ]}",
      '  contact={<Faq.Contact description="Write to hello@halfmoon.example." actions={<Button variant="soft" asChild><a href="mailto:hello@halfmoon.example">Email the roastery</a></Button>} />}',
      "/>",
    ].join("\n"),
};

const LAYOUT_TEXT: Readonly<Record<FaqLayout, string>> = {
  stacked:
    "One column at most 720px wide: the intro, the questions, then the contact.",
  split:
    "The intro and the contact beside the questions from 640px of room, stacked under that.",
  "two-column":
    "The questions in two columns under the intro from 640px of room, one under that.",
};

export const demos: readonly DemoSection[] = [
  ...LAYOUTS.map((layout): DemoSection => ({
    title: `layout="${layout}"`,
    description: LAYOUT_TEXT[layout],
    render: () => (
      <Faq
        title="Questions, answered"
        intro="What people ask the roastery most."
        layout={layout}
        questions={questions(layout)}
        groups={GROUPS}
        contact={<Contact />}
      />
    ),
  })),
  {
    title: "With a search",
    description:
      "The search looks through every group's questions and answers as you type, marking what matches; when nothing does, a way to clear it shows in their place.",
    render: () => (
      <Faq
        search
        variant="cards"
        questions={questions("search")}
        groups={GROUPS}
      />
    ),
  },
];
