import { Text } from "@buttery/core";
import type { DemoFrame, DemoSection, DocsPage } from "@buttery/core";
import { Breadcrumbs, Button, DetailPage } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "Detail page",
  description:
    "A page about one thing: the main column and an aside with its action and links.",
  order: 170,
  status: "new",
  since: "0.7.0",
};

export const frame: DemoFrame = "page";

export const demos: readonly DemoSection[] = [
  {
    title: "A price list",
    description:
      "The aside sits beside the main column from 1100px of column, and under it below that.",
    render: () => (
      <DetailPage
        title="Café price list"
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Wholesale", href: "#detail-page" },
              { label: "Price lists", href: "#detail-page" },
            ]}
          />
        }
        description="Wholesale, by the 5 kg bag"
        action={
          <Button variant="primary" size="md">
            Send to cafés
          </Button>
        }
        aside={
          <>
            <DetailPage.Links
              title="In this list"
              links={[
                { label: "Single origins", href: "#detail-page" },
                { label: "Blends", href: "#detail-page" },
              ]}
            />
            <DetailPage.Links
              title="Resources"
              links={[{ label: "How prices are set", href: "#detail-page" }]}
            />
          </>
        }
      >
        <Text variant="title-lg">$18.40 a kilo</Text>
        <Text variant="body-sm">
          Nyeri AA and Huila, roasted to order and shipped on Tuesdays.
        </Text>
      </DetailPage>
    ),
  },
];
