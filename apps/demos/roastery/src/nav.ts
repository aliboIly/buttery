import type { IconComponentProps } from "@butteryui/core";
import type { SearchPage } from "@butteryui/react";
import {
  CalendarDays,
  Ellipsis,
  House,
  Landmark,
  Package,
  Receipt,
  Repeat,
  Settings,
  Store,
  Users,
  UsersRound,
} from "lucide-react";
import type { ComponentType } from "react";

/** Where the demo is: a page, and the record or tab it shows. */
export type Place =
  | { readonly page: "overview" }
  | { readonly page: "orders" }
  | { readonly page: "customers" }
  | { readonly page: "customer"; readonly id: string }
  | { readonly page: "subscriptions" }
  | { readonly page: "payouts" }
  | { readonly page: "roasts" }
  | { readonly page: "stock" }
  | { readonly page: "wholesale"; readonly tab: "accounts" | "prices" }
  | { readonly page: "settings" }
  | { readonly page: "setting"; readonly id: string }
  | { readonly page: "search"; readonly search: string };

/** A page the sidebar links to. */
export interface NavPage {
  readonly label: string;
  /** Its path in the demo, such as `/orders`, which the sidebar links to from the demo's base. */
  readonly href: string;
  /** Its icon. The sidebar draws it outside a group; search shows it, or its group's. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Whether it's the page shown, so the sidebar marks it current. */
  readonly current?: ((place: Place) => boolean) | undefined;
}

/** One block of the sidebar, in order. */
export type NavBlock =
  | { readonly kind: "page"; readonly page: NavPage }
  | { readonly kind: "recent" }
  | {
      readonly kind: "section";
      readonly title: string;
      readonly blocks: readonly NavBlock[];
    }
  | {
      readonly kind: "group";
      readonly label: string;
      readonly icon: ComponentType<IconComponentProps>;
      readonly pages: readonly NavPage[];
      /** A group of leftovers, such as More, which isn't part of where its pages sit. */
      readonly overflow?: boolean | undefined;
    };

/** The roastery's navigation: the sidebar draws it, and the search's pages come from it. */
export const NAV: readonly NavBlock[] = [
  {
    kind: "page",
    page: {
      label: "Home",
      href: "/",
      icon: House,
      current: (place) => place.page === "overview",
    },
  },
  {
    kind: "page",
    page: {
      label: "Orders",
      href: "/orders",
      icon: Receipt,
      current: (place) => place.page === "orders",
    },
  },
  {
    kind: "page",
    page: {
      label: "Subscriptions",
      href: "/subscriptions",
      icon: Repeat,
      current: (place) => place.page === "subscriptions",
    },
  },
  {
    kind: "page",
    page: {
      label: "Customers",
      href: "/customers",
      icon: Users,
      current: (place) =>
        place.page === "customers" || place.page === "customer",
    },
  },
  {
    kind: "page",
    page: {
      label: "Payouts",
      href: "/payouts",
      icon: Landmark,
      current: (place) => place.page === "payouts",
    },
  },
  { kind: "recent" },
  {
    kind: "section",
    title: "Roastery",
    blocks: [
      {
        kind: "page",
        page: {
          label: "Roast plan",
          href: "/roasts",
          icon: CalendarDays,
          current: (place) => place.page === "roasts",
        },
      },
      {
        kind: "page",
        page: {
          label: "Green coffee",
          href: "/stock",
          icon: Package,
          current: (place) => place.page === "stock",
        },
      },
      {
        kind: "group",
        label: "Wholesale",
        icon: Store,
        pages: [
          {
            label: "Accounts",
            href: "/wholesale",
            current: (place) =>
              place.page === "wholesale" && place.tab === "accounts",
          },
          {
            label: "Price lists",
            href: "/wholesale/prices",
            current: (place) =>
              place.page === "wholesale" && place.tab === "prices",
          },
        ],
      },
    ],
  },
  {
    kind: "group",
    label: "More",
    icon: Ellipsis,
    overflow: true,
    pages: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        current: (place) =>
          place.page === "settings" ||
          (place.page === "setting" && place.id !== "team"),
      },
      {
        label: "Team",
        href: "/settings/team",
        icon: UsersRound,
        current: (place) => place.page === "setting" && place.id === "team",
      },
    ],
  },
];

/** The navigation's roastery pages, for search: each with the group it sits in as its path. */
export function navPages(blocks: readonly NavBlock[] = NAV): SearchPage[] {
  return blocks.flatMap((block): SearchPage[] => {
    switch (block.kind) {
      case "page":
        return [
          {
            label: block.page.label,
            href: block.page.href,
            icon: block.page.icon,
          },
        ];
      case "recent":
        return [];
      case "section":
        return navPages(block.blocks);
      case "group":
        return block.pages.map((page) => ({
          label: page.label,
          href: page.href,
          icon: page.icon ?? block.icon,
          path: block.overflow === true ? undefined : [block.label],
        }));
      default: {
        const unknown: never = block;
        return unknown;
      }
    }
  });
}
