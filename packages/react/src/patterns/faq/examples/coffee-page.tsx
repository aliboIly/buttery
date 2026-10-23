import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Faq } from "@butteryui/react";

/** A coffee's own page ends with three short questions about it: no groups, no search. */
export function CoffeePage(): ReactElement {
  return (
    <Faq
      title="Good to know"
      size="sm"
      questions={[
        {
          id: "guji-espresso",
          question: "Is Guji good for espresso?",
          answer:
            "It pulls a bright, floral shot. For a rounder one to drink with milk, try Cerrado.",
        },
        {
          id: "guji-grind",
          question: "Can you grind it for me?",
          answer:
            "Yes. Choose your brewer when you add it to your bag and we grind it the morning we roast.",
        },
        {
          id: "guji-fresh",
          question: "How long does a bag stay fresh?",
          answer:
            "It tastes best from about four days to four weeks after the roast date on the bag.",
        },
      ]}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Can you grind it for me?");
  await see(
    "Yes. Choose your brewer when you add it to your bag and we grind it the morning we roast.",
  );
};
