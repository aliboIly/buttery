import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "AppPage",
  kind: "pattern",
  purpose:
    "A dashboard page in its shell: contained to 1280px or full width, padded by its column, with an optional right rail.",
  useWhen: [
    'Every page inside an AppShell layout="sidebar"',
    "A one-page app without navigation, where it frames itself",
    "A detail page with a right rail of facts beside it",
    "A page whose table should fill the height (fill)",
  ],
  avoidWhen: [
    "A marketing page: use Page with Section",
    "An editor's work area: use AppShell's inspector layout with a Stage",
  ],
  related: ["AppShell", "PageHeader", "DataTable"],
  a11y: "The page's main landmark. Each titled section is a region named by its h2, its description a paragraph under it; the right rail is a complementary landmark named by asideLabel; the footer is a footer element after the page's content.",
  motion: "morph",
  keyboard: [],
  layout:
    'It centers in its column at most 1280px wide with its padding (--bt-w-app-page; 960 with width="medium", 820 with "narrow", the whole column with "full"), padded 32, 24 or 16 by the column\'s width, its sections 24 under the header and 32 apart. On its own, outside a shell, it fills its container and is its own column: the same padding steps follow its own width, and its header starts 24 from its top. A 320px right rail (--bt-w-aside) sits beside them from 1040px of column beside a full sidebar and under them otherwise, and a section\'s title truncates with an ellipsis and shows in full as its title.',
  reducedMotion:
    "When a banner or card above a section is dismissed, the sections after it take their new places at once instead of sliding up.",
};
