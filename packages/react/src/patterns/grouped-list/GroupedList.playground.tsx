import { Menu } from "@buttery/core";
import type { DemoFrame, DemoSection, DocsPage } from "@buttery/core";
import { Avatar, GroupedList, InitialsTile } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "GroupedList",
  description:
    "Things grouped in one well: card rows with media, a title, a line and a value, under optional titles with a \u2026 menu, and a dashed row that adds one more.",
  order: 70,
  status: "new",
  since: "0.7.0",
};

const warehouseActions = (
  <>
    <Menu.Item>Rename</Menu.Item>
    <Menu.Item>Move stock</Menu.Item>
  </>
);

export const frame: DemoFrame = "page";

export const demos: readonly DemoSection[] = [
  {
    title: "Groups in one well",
    description:
      "Rows that lead somewhere are links and lift on hover; the first group has no title.",
    render: () => (
      <GroupedList>
        <GroupedList.Group>
          <GroupedList.Item
            title="All warehouses"
            description="Green coffee on hand"
            media={<InitialsTile name="All warehouses" size="md" />}
            value="2,140 kg"
          />
        </GroupedList.Group>
        <GroupedList.Group title="Harbor Street" actions={warehouseActions}>
          <GroupedList.Item
            title="Guji, Ethiopia"
            description="Washed · arrived 3 Oct"
            media={<InitialsTile name="Guji Ethiopia" size="md" />}
            value="640 kg"
            href="#guji"
          />
          <GroupedList.Item
            title="Huila, Colombia"
            description="Washed · arrived 19 Sep"
            media={<InitialsTile name="Huila Colombia" size="md" />}
            value="410 kg"
            href="#huila"
          />
        </GroupedList.Group>
        <GroupedList.Group title="Mill Lane" actions={warehouseActions}>
          <GroupedList.Item
            title="Cerrado, Brazil"
            description="Natural · arrived 28 Aug"
            media={<InitialsTile name="Cerrado Brazil" size="md" />}
            value="1,090 kg"
            href="#cerrado"
          />
        </GroupedList.Group>
        <GroupedList.Add label="Add a warehouse" />
      </GroupedList>
    ),
  },
  {
    title: "People, with long names",
    description:
      "A title too long for its row ends in an ellipsis; a long line wraps under it.",
    render: () => (
      <GroupedList>
        <GroupedList.Group title="Wholesale buyers who reorder every fortnight without a reminder">
          <GroupedList.Item
            title="Marguerite Okonkwo-Lindqvist, head of purchasing"
            description="Corner Bakery Cooperative · 12 kg every other Monday, ground for filter, delivered before opening"
            media={<Avatar name="Marguerite Okonkwo-Lindqvist" size="md" />}
            value="€1,240"
          />
          <GroupedList.Item
            title="Tomás Ferreira"
            description="Blue Door Café"
            media={<Avatar name="Tomás Ferreira" size="md" />}
            value="€380"
          />
        </GroupedList.Group>
        <GroupedList.Add label="Invite a buyer" />
      </GroupedList>
    ),
  },
];
