import type { ReactElement } from "react";
import { SearchResults, parseSearch } from "@butteryui/react";
import type { LocalSearchSource } from "@butteryui/react";

/** Everything a search from the top bar finds, orders first, five at a time. */
export function SearchPage({
  text,
  sources,
}: {
  readonly text: string;
  readonly sources: readonly LocalSearchSource[];
}): ReactElement {
  return (
    <SearchResults
      key={text}
      query={parseSearch(text, [], { sent: true })}
      sources={sources}
      pageSize={5}
      emptyHint="Try a customer's name, an order number or a product."
    />
  );
}
