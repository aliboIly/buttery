import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "AppPage",
  kind: "pattern",
  purpose:
    "A dashboard page in its shell: contained to 1280px or full width, padded by its column, with an optional right rail.",
  useWhen: [
    'Every page inside an AppShell layout="sidebar"',
    "A detail page with a right rail of facts beside it",
    "A page whose table should fill the height (fill)",
  ],
  avoidWhen: [
    "A marketing page: use Page with Section",
    "An editor's work area: use AppShell's inspector layout with a Stage",
  ],
  related: ["AppShell", "PageHeader", "DataTable"],
  a11y: "The page's main landmark. Each titled section is a region named by its h2; the right rail is a complementary landmark named by asideLabel.",
  motion: "morph",
};
