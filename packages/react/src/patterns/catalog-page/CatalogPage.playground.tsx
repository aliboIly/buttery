import type { DemoFrame, DemoSection, DocsPage } from "@buttery/core";
import {
  Button,
  CatalogPage,
  Checkbox,
  InitialsTile,
  SearchField,
  TagChip,
} from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "Catalog page",
  description:
    "A page of things to browse: filters beside a featured block and grids of cards.",
  order: 50,
  status: "new",
  since: "0.7.0",
};

export const frame: DemoFrame = "page";

export const demos: readonly DemoSection[] = [
  {
    title: "Add-ons",
    description:
      "The filter column sits beside the catalog from 900px of column, and above it below that.",
    render: () => (
      <CatalogPage
        title="Add-ons"
        description="Tools that work with the roastery."
        filters={
          <>
            <SearchField label="Search add-ons" />
            <CatalogPage.Categories
              categories={[
                { label: "Featured", href: "#catalog-page" },
                { label: "Shipping", href: "#catalog-page/shipping" },
                { label: "Money", href: "#catalog-page/money" },
              ]}
              current="#catalog-page"
            />
            <CatalogPage.Group title="Filter">
              <Checkbox label="Free trial" />
              <Checkbox label="New" />
            </CatalogPage.Group>
            <Button variant="primary" size="sm">
              Suggest an add-on
            </Button>
          </>
        }
      >
        <CatalogPage.Featured title="Featured">
          <CatalogPage.Item
            title="Label printing"
            href="#catalog-page"
            description="Print shipping labels at the counter, straight from an order."
            note="First month free"
            media={<InitialsTile name="Label printing" size="lg" />}
            tags={<TagChip tone="info">New</TagChip>}
          />
          <CatalogPage.Item
            title="Bookkeeping"
            href="#catalog-page"
            description="Sales, refunds and payouts in your books every night."
            note="Free for 30 days"
            media={<InitialsTile name="Bookkeeping" size="lg" />}
            tags={
              <>
                <TagChip tone="warning">Popular</TagChip>
                <TagChip tone="success">Free trial</TagChip>
              </>
            }
          />
        </CatalogPage.Featured>
      </CatalogPage>
    ),
  },
];
