import { createContext } from "react";
import type { CoffeeId } from "./data.ts";

/** What any part of the shop can ask the page to do. */
export interface ShopActions {
  /** Opens the bag. */
  readonly openBag: () => void;
  /** Scrolls to the coffees and opens one of them. */
  readonly showCoffee: (coffee: CoffeeId) => void;
}

export const ShopContext = createContext<ShopActions>({
  openBag: () => undefined,
  showCoffee: () => undefined,
});
