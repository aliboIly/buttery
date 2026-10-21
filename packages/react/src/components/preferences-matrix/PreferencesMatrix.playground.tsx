import type { DemoSection, DocsPage } from "@buttery/core";
import { PreferencesMatrix } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "PreferencesMatrix",
  description:
    "On and off choices in groups, against channels such as email and push.",
  order: 60,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Notification preferences",
    description:
      "Groups of rows against the channels; a locked cell holds its value greyed.",
    render: () => (
      <PreferencesMatrix
        label="Notifications"
        channels={[
          { id: "email", label: "Email" },
          { id: "text", label: "Text" },
          { id: "push", label: "Push" },
        ]}
        tabs={[
          {
            id: "shop",
            label: "Shop",
            groups: [
              {
                id: "money",
                title: "Money",
                rows: [
                  { id: "payouts", label: "Payouts" },
                  {
                    id: "disputes",
                    label: "Disputes",
                    description: "Always emailed",
                    locked: { email: true },
                  },
                ],
              },
              {
                id: "stock",
                title: "Stock",
                rows: [{ id: "low", label: "Low green coffee" }],
              },
            ],
          },
          {
            id: "team",
            label: "Team",
            groups: [
              {
                id: "people",
                title: "People",
                rows: [{ id: "joined", label: "Someone joins the team" }],
              },
            ],
          },
        ]}
        defaultValue={{ payouts: ["email"] }}
      />
    ),
  },
];
