import type { ExamplePlay } from "@buttery/core";
import { SearchResults, matchesSearch } from "@buttery/react";
import type { RemoteSearchSource } from "@buttery/react";
import { CircleHelp } from "lucide-react";
import type { ReactElement } from "react";

const ARTICLES = [
  "When payouts arrive",
  "Change your payout bank",
  "Pause a subscription",
];

const HELP: RemoteSearchSource = {
  id: "help",
  label: "Help",
  remote: true,
  search: (query, signal) =>
    new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        resolve(
          ARTICLES.filter((title) => matchesSearch(query.text, title)).map(
            (title) => ({
              id: title,
              label: title,
              icon: CircleHelp,
              href: "#help",
            }),
          ),
        );
      }, 400);
      signal.addEventListener("abort", () => {
        window.clearTimeout(timer);
        reject(new DOMException("The search moved on.", "AbortError"));
      });
    }),
};

/** Help articles from a pretend server, the section waiting until they arrive. */
export function HelpResults(): ReactElement {
  return (
    <SearchResults
      width="medium"
      query={{ text: "payout", filters: [] }}
      sources={[HELP]}
    />
  );
}

export const play: ExamplePlay = async ({ see }) => {
  await see("2 results");
};
