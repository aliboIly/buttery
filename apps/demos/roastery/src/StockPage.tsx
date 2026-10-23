import { AppPage, BarChart, PageHeader } from "@butteryui/react";
import type { ReactElement } from "react";
import { STOCK, bagCount, daily, dayLabels, sum } from "./data.ts";
import { kilograms } from "./format.ts";
import { StockList } from "./stock.tsx";
import { PageFooter } from "./page-footer.tsx";

const WEEKS = 8;
const KILOGRAMS_PER_BAG = 0.34;
const WEEK_ENDS = Array.from(
  { length: WEEKS },
  (_, index) => (WEEKS - 1 - index) * 7,
);

/** Green coffee in each warehouse, and how much was roasted each week. */
export function StockPage(): ReactElement {
  return (
    <AppPage
      footer={<PageFooter />}
      header={
        <PageHeader
          title="Green coffee"
          description="Lots on the shelf and how long they'll last."
          value={kilograms(sum(STOCK.map((lot) => lot.kilograms)))}
        />
      }
    >
      <AppPage.Section title="Roasted each week">
        <BarChart
          label="Coffee roasted each week"
          labels={WEEK_ENDS.map((endAge) => dayLabels(7, endAge)[0] ?? "")}
          labelsHeading="Week of"
          series={[
            {
              key: "roasted",
              label: "Roasted",
              values: WEEK_ENDS.map((endAge) =>
                Math.round(sum(daily(bagCount, 7, endAge)) * KILOGRAMS_PER_BAG),
              ),
            },
          ]}
          formatValue={kilograms}
          size="sm"
        />
      </AppPage.Section>
      <AppPage.Section title="By warehouse">
        <StockList />
      </AppPage.Section>
    </AppPage>
  );
}
