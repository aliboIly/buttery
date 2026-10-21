import { useState } from "react";
import type { ReactElement } from "react";
import { SearchField } from "@buttery/react";

/** A top bar's search: soft, and focused from anywhere with "/". */
export function TopBarSearch(): ReactElement {
  const [query, setQuery] = useState("");
  return (
    <SearchField
      variant="soft"
      label="Search orders, customers and beans"
      placeholder="Search"
      shortcut="/"
      value={query}
      onValueChange={setQuery}
    />
  );
}
