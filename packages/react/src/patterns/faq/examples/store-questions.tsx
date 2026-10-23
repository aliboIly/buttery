import { Mail } from "lucide-react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Faq } from "@butteryui/react";
import type { FaqGroup, FaqQuestion } from "@butteryui/react";

const GROUPS: readonly FaqGroup[] = [
  { value: "orders", label: "Orders and shipping" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "coffee", label: "Coffee and brewing" },
];

const QUESTIONS: readonly FaqQuestion[] = [
  {
    id: "store-arrival",
    group: "orders",
    question: "When will my coffee arrive?",
    answer:
      "Order by noon and we roast your coffee the next morning and ship it that afternoon. Most orders arrive in two to four days.",
  },
  {
    id: "store-shipping",
    group: "orders",
    question: "How much is shipping?",
    answer:
      "Standard shipping is $6, and free once an order reaches $40. Next-day delivery is $14.",
  },
  {
    id: "store-returns",
    group: "orders",
    question: "What if I don't like a coffee?",
    answer:
      "Tell us within 30 days, however much is left in the bag, and we'll send a different coffee or give your money back.",
    keywords: "refund return exchange",
  },
  {
    id: "store-skip",
    group: "subscriptions",
    question: "Can I skip or pause a subscription?",
    answer:
      "Yes, from your account, up to the day before a delivery roasts. Nothing is charged while it's paused.",
  },
  {
    id: "store-saving",
    group: "subscriptions",
    question: "How much does a subscription save?",
    answer:
      "Every bag is 10% off and every delivery ships free, so a 12 oz bag of roaster's choice comes to $16.20.",
  },
  {
    id: "store-grind",
    group: "coffee",
    question: "Should I buy whole beans or ground coffee?",
    answer:
      "Whole beans stay fresh longest. Without a grinder, choose your brewer and we grind for it the morning we roast.",
  },
  {
    id: "store-storage",
    group: "coffee",
    question: "How should I store my coffee?",
    answer:
      "Keep the bag sealed in a cupboard, away from heat and light, and skip the fridge.",
  },
];

/** The shop's questions beside their intro: topics in tabs, a search across them, a link to one answer and a way to write in. */
export function StoreQuestions(): ReactElement {
  return (
    <Faq
      title="Questions, answered"
      intro={
        <>
          What people ask us most. New here? Start with{" "}
          <a href="#store-arrival">when your coffee arrives</a>.
        </>
      }
      layout="split"
      search
      groups={GROUPS}
      questions={QUESTIONS}
      contact={
        <Faq.Contact
          title="Still wondering about something?"
          description="Write to hello@halfmoon.example and Rosa or Theo will answer within a day."
          actions={
            <Button variant="soft" iconStart={Mail} asChild>
              <a href="mailto:hello@halfmoon.example">Email the roastery</a>
            </Button>
          }
        />
      }
    />
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("link", "when your coffee arrives");
  await see(/^Order by noon and we roast your coffee the next morning/);
  await type("Search questions", "refund");
  await see("Orders and shipping");
  await press("button", /^What if I don't like a coffee\?/);
  await see(/^Tell us within 30 days/);
};
