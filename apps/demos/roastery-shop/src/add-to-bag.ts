import { use } from "react";
import { toast } from "@buttery/react";
import { addCoffee, setPlan, useBag } from "./bag.ts";
import type { CoffeeLine, Plan } from "./bag.ts";
import { coffeeOf, sizeLabel } from "./data.ts";
import { ShopContext } from "./shop-context.ts";

/** Puts coffee or a subscription in the bag and says so in a toast that can open the bag. */
export function useAddToBag(): {
  readonly addCoffee: (choice: Omit<CoffeeLine, "quantity">) => void;
  readonly addPlan: (plan: Plan) => void;
} {
  const [bag, setBag] = useBag();
  const { openBag } = use(ShopContext);
  const announce = (message: string): void => {
    toast.success(message, {
      id: "bag",
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
        `Added ${coffeeOf(choice.coffee).name}, ${sizeLabel(choice.size)}.`,
      );
    },
    addPlan: (plan) => {
      setBag((current) => setPlan(current, plan));
      announce(
        bag.plan === null
          ? "Your subscription is in the bag."
          : "Your subscription in the bag is updated.",
      );
    },
  };
}
