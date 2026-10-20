import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "FloatingLanes",
  kind: "layer",
  purpose:
    "Hosts free-floating UI in lanes that stack items and keep clear of sticky bars and anchored toolbars.",
  useWhen: [
    "Notices that float over the app, such as an update that's ready or an export that's running (bottom-end, top-end)",
    "Custom free-floating UI that has to keep clear of sticky bars and toolbars",
  ],
  avoidWhen: [
    "Toasts: call toast() from @buttery/react, which uses the bottom-center lane and keeps three at most",
    "UI anchored to an element: use Popover",
    "Inline status messages: put them in flow",
  ],
  related: ["Toaster", "Layer", "Sticky", "Popover"],
  a11y: 'Lanes are plain containers and items bring their own semantics. To announce an item, keep a live region (role="status") mounted outside the lane and change its text: a region that mounts along with its content often goes unannounced.',
  motion: "presence",
};
