import type { DemoSection, DocsPage } from "@buttery/core";
import { Breadcrumbs } from "@buttery/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "Breadcrumbs",
  description:
    "The trail of pages above a nested page, as links above its title.",
  order: 10,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "A trail",
    description:
      "The pages above the one shown, outermost first; the page itself is its title.",
    render: () => (
      <Breadcrumbs
        items={[
          { label: "Settings", href: "#breadcrumbs" },
          { label: "Plans and billing", href: "#breadcrumbs" },
        ]}
      />
    ),
  },
  {
    title: "On a phone",
    description:
      "Under 480px of its own width it shows the page one level up, after a back chevron.",
    render: () => (
      <div style={{ inlineSize: "100%", maxInlineSize: "var(--bt-w-dialog)" }}>
        <Breadcrumbs
          items={[
            { label: "Settings", href: "#breadcrumbs" },
            { label: "Plans and billing", href: "#breadcrumbs" },
          ]}
        />
      </div>
    ),
  },
];
