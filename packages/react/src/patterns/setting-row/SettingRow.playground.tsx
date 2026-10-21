import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, SettingRow, SettingsSection } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "SettingRow",
  description:
    "One setting: what it is, its current state, and its one action.",
  order: 32,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "In a section",
    description:
      "Rows under a hairline; primary only for the one that turns something on.",
    render: () => (
      <SettingsSection title="Fraud checks" divider>
        <SettingRow
          title="Screen subscription renewals"
          state="Screening every renewal."
          action={<Button size="sm">Manage screening</Button>}
        />
        <SettingRow
          title="Check saved cards"
          state="Off. Cards saved for later payments aren't checked."
          action={
            <Button size="sm" variant="primary">
              Turn on
            </Button>
          }
        />
      </SettingsSection>
    ),
  },
];
