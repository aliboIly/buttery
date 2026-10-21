import type { ExamplePlay } from "@buttery/core";
import { CatalogPage } from "@buttery/react";
import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";

const CATEGORIES = [
  { label: "Shipping", href: "/add-ons/shipping" },
  { label: "Money", href: "/add-ons/money" },
];

const ITEMS: Readonly<Record<string, readonly string[]>> = {
  "/add-ons/shipping": ["Label printing", "Rates by region"],
  "/add-ons/money": ["Bookkeeping"],
};

/** Categories that switch the section shown, the current one marked. */
export function Categories(): ReactElement {
  const [current, setCurrent] = useState("/add-ons/shipping");
  const open = (href: string, event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setCurrent(href);
  };
  const category = CATEGORIES.find((entry) => entry.href === current);
  return (
    <CatalogPage
      title="Add-ons"
      filters={
        <CatalogPage.Categories
          categories={CATEGORIES}
          current={current}
          onNavigate={open}
        />
      }
    >
      <CatalogPage.Section title={category?.label ?? ""}>
        {(ITEMS[current] ?? []).map((title) => (
          <CatalogPage.Item
            key={title}
            title={title}
            href={`${current}#${title}`}
          />
        ))}
      </CatalogPage.Section>
    </CatalogPage>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", "Money");
  await see("Bookkeeping");
};
