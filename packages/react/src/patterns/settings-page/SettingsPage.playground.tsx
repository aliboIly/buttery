import type { DemoSection, DemoFrame, DocsPage } from "@buttery/core";
import {
  Breadcrumbs,
  Button,
  ScopeBadge,
  SettingRow,
  SettingsPage,
  SettingsSection,
} from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "Settings pages",
  description:
    "A settings detail page in the page grammar: breadcrumbs, a title, one line, then sections.",
  order: 270,
  status: "new",
  since: "0.7.0",
};

export const frame: DemoFrame = "page";

export const demos: readonly DemoSection[] = [
  {
    title: "A settings page",
    description:
      "Breadcrumbs, the title with its scope, one line about it, then its sections.",
    render: () => (
      <SettingsPage
        title="Fraud checks"
        breadcrumbs={
          <Breadcrumbs
            items={[{ label: "Settings", href: "#settings-page" }]}
          />
        }
        badge={
          <ScopeBadge
            label="All shops"
            info="Changes here apply to every Halfmoon shop."
          />
        }
        description="Which payments are checked before they're accepted."
        footer={<a href="#settings-page">Share feedback</a>}
      >
        <SettingsSection title="Subscriptions" divider>
          <SettingRow
            title="Screen renewals"
            state="Screening every renewal."
            action={<Button size="sm">Manage screening</Button>}
          />
        </SettingsSection>
      </SettingsPage>
    ),
  },
];
