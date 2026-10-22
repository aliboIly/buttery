import type { DemoFrame, DemoSection, DocsPage } from "@buttery/core";
import { SettingsIndex } from "@buttery/react";
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

export const page: DocsPage = {
  section: "components/navigation",
  title: "SettingsIndex",
  description:
    "A settings home page: titled sections of links, each with an icon, a title and a line on what's inside, in up to three columns.",
  order: 80,
  status: "new",
  since: "0.7.0",
};

export const frame: DemoFrame = "page";

export const demos: readonly DemoSection[] = [
  {
    title: "Three groups of settings",
    description:
      "Three columns from 1024px of room, two from 640, one under that; a long line wraps.",
    render: () => (
      <SettingsIndex>
        <SettingsIndex.Section title="You">
          <SettingsIndex.Link
            icon={User}
            title="Profile"
            description="Your name, email address and password."
            href="#settings-profile"
          />
          <SettingsIndex.Link
            icon={Bell}
            title="Notifications"
            description="Which emails and alerts you get, and when."
            href="#settings-notifications"
          />
        </SettingsIndex.Section>
        <SettingsIndex.Section title="Your shop">
          <SettingsIndex.Link
            icon={Building2}
            title="Business details"
            description="The roastery's name, address and tax number."
            href="#settings-business"
          />
          <SettingsIndex.Link
            icon={Truck}
            title="Shipping"
            description="Rates by region, packaging and local pickup."
            href="#settings-shipping"
          />
          <SettingsIndex.Link
            icon={Percent}
            title="Discounts"
            description="Codes, subscription offers and wholesale price breaks for cafés that order every week."
            href="#settings-discounts"
          />
          <SettingsIndex.Link
            icon={Users}
            title="Team"
            description="Who can roast, pack and refund."
            href="#settings-team"
          />
        </SettingsIndex.Section>
        <SettingsIndex.Section title="Money">
          <SettingsIndex.Link
            icon={Landmark}
            title="Payouts"
            description="Your bank and when sales arrive."
            href="#settings-payouts"
          />
          <SettingsIndex.Link
            icon={CreditCard}
            title="Payment methods"
            description="Cards, wallets and invoices."
            href="#settings-payments"
          />
          <SettingsIndex.Link
            icon={Receipt}
            title="Invoices"
            description="Numbering, terms and the footer."
            href="#settings-invoices"
          />
          <SettingsIndex.Link
            icon={ShieldCheck}
            title="Fraud rules"
            description="When an order waits for a look."
            href="#settings-fraud"
          />
          <SettingsIndex.More
            title="Find more settings"
            description="Add-ons for tax, labels and accounting."
            href="#settings-more"
          />
        </SettingsIndex.Section>
      </SettingsIndex>
    ),
  },
];
