import { useState } from "react";
import type { ReactElement } from "react";
import { CatalogPage, InitialsTile } from "@butteryui/react";
import { PRODUCTS } from "../data.ts";
import type { ProductCategory } from "../data.ts";
import { useLink } from "../router.tsx";

const CATEGORIES: readonly {
  readonly id: ProductCategory;
  readonly label: string;
}[] = [
  { id: "bags", label: "Bags" },
  { id: "kitchen", label: "Kitchen" },
  { id: "home", label: "Home" },
];

/** What the shop sells, one category at a time, each product a link to its orders. */
export function ProductsPage(): ReactElement {
  const link = useLink();
  const [current, setCurrent] = useState<ProductCategory>("bags");
  const shown = CATEGORIES.find((category) => category.id === current);
  return (
    <CatalogPage
      title="Products"
      description="What the shop sells, by category."
      filters={
        <CatalogPage.Categories
          categories={CATEGORIES.map((category) => ({
            label: category.label,
            href: `#${category.id}`,
          }))}
          current={`#${current}`}
          onNavigate={(href, event) => {
            event.preventDefault();
            const next = CATEGORIES.find(
              (category) => `#${category.id}` === href,
            );
            if (next) setCurrent(next.id);
          }}
        />
      }
    >
      <CatalogPage.Section title={shown?.label ?? ""}>
        {PRODUCTS.filter((product) => product.category === current).map(
          (product) => (
            <CatalogPage.Item
              key={product.id}
              title={product.name}
              href={link(`/search?q=${encodeURIComponent(product.name)}`)}
              description={product.description}
              note={
                product.stock <= 3
                  ? `Only ${String(product.stock)} left`
                  : undefined
              }
              media={<InitialsTile name={product.name} />}
            />
          ),
        )}
      </CatalogPage.Section>
    </CatalogPage>
  );
}
