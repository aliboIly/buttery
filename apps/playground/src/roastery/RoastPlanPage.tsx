import { AppPage, GroupedList, InitialsTile, PageHeader } from "@buttery/react";
import type { ReactElement } from "react";
import { ORDERS, SUBSCRIPTIONS, TODAY, coffeeOf, dayNumber } from "./data.ts";
import { number } from "./format.ts";

const DAYS = Array.from(
  { length: 5 },
  (_, index) =>
    new Date(
      TODAY.getFullYear(),
      TODAY.getMonth(),
      TODAY.getDate() + 1 + index,
    ),
);

const WEEKDAY = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

/** Bags of each coffee to roast on each of the next five days: orders waiting tomorrow, subscriptions as they come due. */
function plan(): Map<number, Map<string, number>> {
  const roasts = new Map<number, Map<string, number>>(
    DAYS.map((day) => [dayNumber(day), new Map<string, number>()]),
  );
  const add = (day: number, coffeeId: string, bags: number): void => {
    const coffees = roasts.get(day);
    coffees?.set(coffeeId, (coffees.get(coffeeId) ?? 0) + bags);
  };
  const tomorrow = dayNumber(TODAY) + 1;
  for (const order of ORDERS)
    if (order.status === "paid" || order.status === "roasting")
      add(tomorrow, order.coffeeId, order.bags);
  for (const subscription of SUBSCRIPTIONS)
    if (subscription.status === "active" && subscription.next !== null)
      add(
        dayNumber(subscription.next),
        subscription.coffeeId,
        subscription.bags,
      );
  return roasts;
}

/** What the roaster roasts over the next five days, by day and by coffee. */
export function RoastPlanPage(): ReactElement {
  const roasts = plan();
  const total = [...roasts.values()].reduce(
    (sum, coffees) =>
      sum + [...coffees.values()].reduce((bags, count) => bags + count, 0),
    0,
  );
  return (
    <AppPage
      header={
        <PageHeader
          title="Roast plan"
          value={`${number(total)} bags`}
          valueInfo="Bags to roast over the next five days: orders waiting to roast, then subscriptions as they come due."
        />
      }
    >
      <AppPage.Section title="Next five days">
        <GroupedList>
          {DAYS.map((day) => {
            const coffees = [...(roasts.get(dayNumber(day)) ?? [])].sort(
              ([, a], [, b]) => b - a,
            );
            return (
              <GroupedList.Group
                key={day.toISOString()}
                title={WEEKDAY.format(day)}
              >
                {coffees.length === 0 ? (
                  <GroupedList.Item
                    title="Nothing to roast"
                    description="A day for cupping and cleaning."
                  />
                ) : (
                  coffees.map(([coffeeId, bags]) => {
                    const coffee = coffeeOf(coffeeId);
                    return (
                      <GroupedList.Item
                        key={coffeeId}
                        title={coffee.name}
                        description={`${coffee.origin} · ${coffee.process} · ${coffee.roast}`}
                        media={<InitialsTile name={coffee.name} size="md" />}
                        value={`${number(bags)} ${bags === 1 ? "bag" : "bags"}`}
                      />
                    );
                  })
                )}
              </GroupedList.Group>
            );
          })}
        </GroupedList>
      </AppPage.Section>
    </AppPage>
  );
}
