import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { PreferencesMatrix } from "@buttery/react";
import type { PreferenceChannel, PreferenceTab } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "PreferencesMatrix",
  description:
    "On and off choices in groups, against channels such as email and push.",
  order: 60,
  status: "new",
  since: "0.8.0",
};

const CHANNEL_SETS = ["email and push", "email, text and push"] as const;
const TAB_SETS = ["one tab", "two tabs"] as const;

const CHANNELS: Readonly<
  Record<(typeof CHANNEL_SETS)[number], readonly PreferenceChannel[]>
> = {
  "email and push": [
    { id: "email", label: "Email" },
    { id: "push", label: "Push" },
  ],
  "email, text and push": [
    { id: "email", label: "Email" },
    { id: "text", label: "Text" },
    { id: "push", label: "Push" },
  ],
};

const SHOP: PreferenceTab = {
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
  ],
};

const TEAM: PreferenceTab = {
  id: "team",
  label: "Team",
  groups: [
    {
      id: "people",
      title: "People",
      rows: [{ id: "joined", label: "Someone joins the team" }],
    },
  ],
};

const TABS: Readonly<
  Record<(typeof TAB_SETS)[number], readonly PreferenceTab[]>
> = {
  "one tab": [SHOP],
  "two tabs": [SHOP, TEAM],
};

const SHOP_CODE = `{
      id: "shop",
      label: "Shop",
      groups: [
        {
          id: "money",
          title: "Money",
          rows: [
            { id: "payouts", label: "Payouts" },
            { id: "disputes", label: "Disputes", description: "Always emailed", locked: { email: true } },
          ],
        },
      ],
    },`;

const TEAM_CODE = `{
      id: "team",
      label: "Team",
      groups: [
        { id: "people", title: "People", rows: [{ id: "joined", label: "Someone joins the team" }] },
      ],
    },`;

export const live: LiveDemo = {
  controls: {
    channels: {
      kind: "choice",
      options: CHANNEL_SETS,
      initial: "email, text and push",
    },
    tabs: { kind: "choice", options: TAB_SETS, initial: "two tabs" },
  },
  render: ({ channels, tabs }) => (
    <PreferencesMatrix
      label="Notifications"
      channels={CHANNELS[demoChoice(channels, CHANNEL_SETS)]}
      tabs={TABS[demoChoice(tabs, TAB_SETS)]}
      defaultValue={{ payouts: ["email"] }}
    />
  ),
  code: ({ channels, tabs }) => {
    const columns = CHANNELS[demoChoice(channels, CHANNEL_SETS)]
      .map((channel) => `{ id: "${channel.id}", label: "${channel.label}" }`)
      .join(", ");
    const shown =
      demoChoice(tabs, TAB_SETS) === "two tabs"
        ? `${SHOP_CODE}\n    ${TEAM_CODE}`
        : SHOP_CODE;
    return `<PreferencesMatrix
  label="Notifications"
  channels={[${columns}]}
  tabs={[
    ${shown}
  ]}
  defaultValue={{ payouts: ["email"] }}
/>`;
  },
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
