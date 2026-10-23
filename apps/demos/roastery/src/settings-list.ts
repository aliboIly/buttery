import type { IconComponentProps } from "@butteryui/core";
import {
  Bell,
  BellRing,
  Building2,
  CreditCard,
  Gem,
  Landmark,
  Percent,
  Receipt,
  ShieldCheck,
  Truck,
  User,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

/** One setting in the index. */
export interface Setting {
  readonly id: string;
  readonly icon: ComponentType<IconComponentProps>;
  readonly title: string;
  readonly description: string;
  /** Where the link goes when the setting lives on a page elsewhere in the demo. */
  readonly href?: string;
}

/** Every setting, grouped by what it's about, as the index lists them. */
export const SETTING_SECTIONS: readonly {
  readonly title: string;
  readonly settings: readonly Setting[];
}[] = [
  {
    title: "You",
    settings: [
      {
        id: "profile",
        icon: User,
        title: "Profile",
        description:
          "Your name, email address, password and where you're signed in.",
      },
      {
        id: "notifications",
        icon: Bell,
        title: "Notifications",
        description: "Which alerts the roastery emails you, and when.",
      },
    ],
  },
  {
    title: "Your shop",
    settings: [
      {
        id: "business",
        icon: Building2,
        title: "Business details",
        description: "The roastery's name, address and tax number.",
      },
      {
        id: "pickup",
        icon: Truck,
        title: "Pickup",
        description: "Whether customers can collect, and where.",
      },
      {
        id: "discounts",
        icon: Percent,
        title: "Discounts",
        description: "Codes, subscription offers and price breaks for cafés.",
      },
      {
        id: "team",
        icon: Users,
        title: "Team",
        description: "Who can roast, pack and refund.",
      },
      {
        id: "team-notifications",
        icon: BellRing,
        title: "Team notifications",
        description: "Who on the team hears about orders, roasts and money.",
      },
    ],
  },
  {
    title: "Money",
    settings: [
      {
        id: "plans",
        icon: Gem,
        title: "Plans and billing",
        description: "Your plan, what it costs and what it includes.",
      },
      {
        id: "payouts",
        icon: Landmark,
        title: "Payouts",
        description: "Your bank and when sales arrive.",
        href: "/payouts",
      },
      {
        id: "payments",
        icon: CreditCard,
        title: "Payment methods",
        description: "Cards, wallets and invoices.",
      },
      {
        id: "invoices",
        icon: Receipt,
        title: "Invoices",
        description: "Numbering, terms and the footer.",
      },
      {
        id: "fraud",
        icon: ShieldCheck,
        title: "Fraud rules",
        description: "When an order waits for a look.",
      },
    ],
  },
];

/** Every setting in one list. */
export const SETTINGS: readonly Setting[] = SETTING_SECTIONS.flatMap(
  (section) => section.settings,
);

/** Where a setting's link goes: its path in the demo, such as `/settings/pickup`. */
export function settingHref(setting: Setting): string {
  return setting.href ?? `/settings/${setting.id}`;
}
