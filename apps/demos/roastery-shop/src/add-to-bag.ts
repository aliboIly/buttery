import { use } from "react";
import { toast } from "@buttery/react";
import { addCoffee, setPlan, useBag } from "./bag.ts";
import type { CoffeeLine, Plan } from "./bag.ts";
import { coffeeOf, sizeLabel } from "./data.ts";
import { firstName } from "./plan.ts";
import { ShopContext } from "./shop-context.ts";

/** The id of the toast that says something went into the bag, which opening the bag closes. */
export const BAG_TOAST = "bag";

/** Puts coffee or a subscription in the bag and says so in a toast that can open the bag. */
export function useAddToBag(): {
  readonly addCoffee: (choice: Omit<CoffeeLine, "quantity">) => void;
  readonly addPlan: (plan: Plan) => void;
} {
  const [, setBag] = useBag();
  const { openBag } = use(ShopContext);
  const announce = (message: string): void => {
    toast.success(message, {
      id: BAG_TOAST,
      action: {
        label: "View bag",
        onAction: openBag,
        altText: "Open your bag with the Bag button at the top of the page.",
      },
    });
  };
  return {
    addCoffee: (choice) => {
      setBag((current) => addCoffee(current, choice));
      announce(
        `${coffeeOf(choice.coffee).name}, ${sizeLabel(choice.size)}, is in your bag.`,
      );
    },
    addPlan: (plan) => {
      setBag((current) => setPlan(current, plan));
      announce(
        plan.recipient === null
          ? "The subscription is in your bag."
          : `The gift for ${firstName(plan.recipient.name)} is in your bag.`,
      );
    },
  };
}
