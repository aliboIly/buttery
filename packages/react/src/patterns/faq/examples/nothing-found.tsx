import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Faq } from "@butteryui/react";

/** A search that finds nothing shows what to try and a way back to every question. */
export function NothingFound(): ReactElement {
  return (
    <Faq
      search
      variant="contained"
      questions={[
        {
          id: "gift-length",
          question: "How long can a gift subscription last?",
          answer: "Three, six or twelve deliveries, paid for up front.",
        },
        {
          id: "gift-note",
          question: "Can I add a note to a gift?",
          answer: "Yes. We print it on a card and tuck it in the first box.",
        },
        {
          id: "gift-date",
          question: "Can a gift start on a date I choose?",
          answer:
            "Pick the date at checkout and we email them that morning, then roast their first bag.",
        },
      ]}
    />
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Search questions", "decaf");
  await see('No questions match "decaf"');
  await press("button", "Show all questions");
  await see("Can I add a note to a gift?");
};
