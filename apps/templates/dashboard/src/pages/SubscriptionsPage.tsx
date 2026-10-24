import type { ReactElement } from "react";
import { AppPage, FeatureIntro, PageHeader, toast } from "@butteryui/react";
import { CalendarClock, Repeat, Truck } from "lucide-react";

/** Subscriptions before they're turned on: what they'd do for the shop, and the button that starts them. */
export function SubscriptionsPage(): ReactElement {
  return (
    <AppPage
      header={
        <PageHeader
          title="Subscriptions"
          description="Products customers get again on a schedule."
        />
      }
    >
      <AppPage.Section>
        <FeatureIntro
          title="Sell refills on a schedule"
          description="Customers pick how often, and each delivery is charged when it ships."
          benefits={[
            { icon: Repeat, text: "Every two, four or eight weeks" },
            {
              icon: CalendarClock,
              text: "Customers skip or pause from their email",
            },
            { icon: Truck, text: "Deliveries join the day's orders" },
          ]}
          action={{
            label: "Turn on subscriptions",
            onClick: () => {
              toast.success(
                "Subscriptions are on. Pick the products that offer them.",
              );
            },
          }}
        />
      </AppPage.Section>
    </AppPage>
  );
}
