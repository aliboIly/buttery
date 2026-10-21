import { AppPage, FeatureIntro, PageHeader, toast } from "@buttery/react";
import { FileText, Package, Store } from "lucide-react";
import type { ReactElement } from "react";

function CafeCases(): ReactElement {
  const cases = [0, 1, 2];
  return (
    <svg
      viewBox="0 0 480 300"
      role="img"
      aria-label="Three cases of coffee, each labelled for a café"
    >
      <rect width="480" height="300" rx="16" fill="var(--bt-bg-section)" />
      {cases.map((index) => (
        <g
          key={index}
          transform={`translate(${String(56 + index * 128)} ${String(96 - index * 12)})`}
        >
          <rect width="112" height="128" rx="12" fill="var(--bt-bg-surface)" />
          <rect
            x="16"
            y="20"
            width="56"
            height="10"
            rx="5"
            fill="var(--bt-text-strong)"
          />
          <rect
            x="16"
            y="40"
            width="80"
            height="8"
            rx="4"
            fill="var(--bt-skeleton-strong)"
          />
          <rect
            x="16"
            y="92"
            width="40"
            height="16"
            rx="8"
            fill="var(--bt-accent-subtle)"
          />
        </g>
      ))}
    </svg>
  );
}

/** Wholesale before it's set up: what it does and the step that starts it. */
export function WholesalePage(): ReactElement {
  return (
    <AppPage header={<PageHeader title="Wholesale" />}>
      <AppPage.Section>
        <FeatureIntro
          title="Sell cases to cafés on terms"
          description="Cafés order by the case and pay by invoice, 30 days after delivery."
          benefits={[
            { icon: Store, text: "Each café gets its own prices" },
            { icon: FileText, text: "Invoices go out with every delivery" },
            { icon: Package, text: "Cases roast with your retail orders" },
          ]}
          action={{
            label: "Set up wholesale",
            onClick: () => {
              toast.success("Wholesale is ready for your first café.");
            },
          }}
          docs={{ label: "How wholesale works", href: "#/roastery/settings" }}
          media={<CafeCases />}
        />
      </AppPage.Section>
    </AppPage>
  );
}
