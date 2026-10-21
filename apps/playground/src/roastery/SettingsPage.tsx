import { AppPage, PageHeader, SettingsIndex } from "@buttery/react";
import {
  Bell,
  Building2,
  CreditCard,
  Landmark,
  Percent,
  Receipt,
  ShieldCheck,
  Truck,
  User,
  Users,
} from "lucide-react";
import type { ReactElement } from "react";

/** Every setting, grouped by what it's about. */
export function SettingsPage(): ReactElement {
  return (
    <AppPage header={<PageHeader title="Settings" />}>
      <AppPage.Section>
        <SettingsIndex>
          <SettingsIndex.Section title="You">
            <SettingsIndex.Link
              icon={User}
              title="Profile"
              description="Your name, email address and password."
              href="#/roastery/settings"
            />
            <SettingsIndex.Link
              icon={Bell}
              title="Notifications"
              description="Which emails and alerts you get, and when."
              href="#/roastery/settings"
            />
          </SettingsIndex.Section>
          <SettingsIndex.Section title="Your shop">
            <SettingsIndex.Link
              icon={Building2}
              title="Business details"
              description="The roastery's name, address and tax number."
              href="#/roastery/settings"
            />
            <SettingsIndex.Link
              icon={Truck}
              title="Shipping and pickup"
              description="Rates by region, packaging and collecting at the roastery."
              href="#/roastery/settings"
            />
            <SettingsIndex.Link
              icon={Percent}
              title="Discounts"
              description="Codes, subscription offers and price breaks for cafés."
              href="#/roastery/settings"
            />
            <SettingsIndex.Link
              icon={Users}
              title="Team"
              description="Who can roast, pack and refund."
              href="#/roastery/settings"
            />
          </SettingsIndex.Section>
          <SettingsIndex.Section title="Money">
            <SettingsIndex.Link
              icon={Landmark}
              title="Payouts"
              description="Your bank and when sales arrive."
              href="#/roastery/payouts"
            />
            <SettingsIndex.Link
              icon={CreditCard}
              title="Payment methods"
              description="Cards, wallets and invoices."
              href="#/roastery/settings"
            />
            <SettingsIndex.Link
              icon={Receipt}
              title="Invoices"
              description="Numbering, terms and the footer."
              href="#/roastery/settings"
            />
            <SettingsIndex.Link
              icon={ShieldCheck}
              title="Fraud rules"
              description="When an order waits for a look."
              href="#/roastery/settings"
            />
          </SettingsIndex.Section>
        </SettingsIndex>
      </AppPage.Section>
    </AppPage>
  );
}
