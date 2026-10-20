import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "FloatingLanes",
  kind: "layer",
  purpose:
    "Hosts free-floating UI in lanes that stack items and keep clear of sticky bars and anchored toolbars.",
  useWhen: ["Toasts (bottom-center) and notices (bottom-end, top-end)"],
  avoidWhen: [
    "UI anchored to an element: use Popover",
    "Inline status messages: put them in flow",
  ],
  related: ["Layer", "Sticky", "Popover"],
  a11y: 'Lanes are plain containers and items bring their own semantics. To announce an item, keep a live region (role="status") mounted outside the lane and change its text: a region that mounts along with its content often goes unannounced.',
  motion: "presence",
};
