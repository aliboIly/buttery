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
  a11y: 'Lanes are plain containers; each item brings its own role (a toast uses role="status").',
  motion: "presence",
};
