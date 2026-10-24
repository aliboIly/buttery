import type { ReactElement } from "react";
import { AppPage, PageHeader, SettingsIndex } from "@butteryui/react";
import { CreditCard, Store } from "lucide-react";
import { useLink } from "../router.tsx";

/** Every group of settings, each setting opening its own page. */
export function SettingsPage(): ReactElement {
  const link = useLink();
  return (
    <AppPage
      header={
        <PageHeader
          title="Settings"
          description="The shop's details, its emails and its plan."
        />
      }
    >
      <AppPage.Section>
        <SettingsIndex>
          <SettingsIndex.Section title="Your shop">
            <SettingsIndex.Link
              icon={Store}
              title="Shop details"
              description="The name and email customers see, and the emails the shop sends you."
              href={link("/settings/shop")}
            />
          </SettingsIndex.Section>
          <SettingsIndex.Section title="Money">
            <SettingsIndex.Link
              icon={CreditCard}
              title="Plan"
              description="What the shop pays each month or year, and what each plan adds."
              href={link("/settings/plan")}
            />
          </SettingsIndex.Section>
        </SettingsIndex>
      </AppPage.Section>
    </AppPage>
  );
}
