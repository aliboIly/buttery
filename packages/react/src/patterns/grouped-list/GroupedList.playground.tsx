import { Menu } from "@butteryui/core";
import type {
  DemoFrame,
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import { Avatar, GroupedList, InitialsTile } from "@butteryui/react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "GroupedList",
  description:
    "Things grouped in one well: card rows with media, a title, a line and a value, under optional titles with a \u2026 menu, and a dashed row that adds one more.",
  order: 70,
  status: "new",
  since: "0.8.0",
};

const warehouseActions = (
  <>
    <Menu.Item>Rename</Menu.Item>
    <Menu.Item>Move stock</Menu.Item>
  </>
);

export const frame: DemoFrame = "page";

const LOTS = [
  {
    id: "guji",
    coffee: "Guji, Ethiopia",
    detail: "Washed · arrived 3 Oct",
    kg: 640,
  },
  {
    id: "huila",
    coffee: "Huila, Colombia",
    detail: "Washed · arrived 19 Sep",
    kg: 410,
  },
  {
    id: "cerrado",
    coffee: "Cerrado, Brazil",
    detail: "Natural · arrived 28 Aug",
    kg: 1090,
  },
];

function LiveList({
  title,
  links,
  actions,
  add,
}: {
  readonly title: string;
  readonly links: boolean;
  readonly actions: boolean;
  readonly add: boolean;
}): ReactElement {
  const [lots, setLots] = useState(LOTS);
  return (
    <GroupedList>
      <GroupedList.Group
        title={title === "" ? undefined : title}
        actions={
          actions ? (
            <>
              <Menu.Item
                onSelect={() => {
                  setLots([...lots].sort((a, b) => b.kg - a.kg));
                }}
              >
                Sort by weight
              </Menu.Item>
              <Menu.Item
                onSelect={() => {
                  setLots(
                    [...lots].sort((a, b) => a.coffee.localeCompare(b.coffee)),
                  );
                }}
              >
                Sort by name
              </Menu.Item>
            </>
          ) : undefined
        }
      >
        {lots.map((lot) => (
          <GroupedList.Item
            key={lot.id}
            title={lot.coffee}
            description={lot.detail}
            media={<InitialsTile name={lot.coffee} size="md" />}
            value={`${lot.kg.toLocaleString("en-US")} kg`}
            href={links ? `#lots-${lot.id}` : undefined}
          />
        ))}
        {add ? (
          <GroupedList.Add
            label="Add a lot"
            onClick={() => {
              setLots([
                ...lots,
                {
                  id: `new-${String(lots.length + 1)}`,
                  coffee: "New lot",
                  detail: "Arriving next week",
                  kg: 0,
                },
              ]);
            }}
          />
        ) : null}
      </GroupedList.Group>
    </GroupedList>
  );
}

function listCode({ title, links, actions, add }: DemoValues): string {
  const groupProps = [
    ...(title === "" ? [] : [`title="${String(title)}"`]),
    ...(actions === true
      ? [
          "actions={<Menu.Item onSelect={sortByWeight}>Sort by weight</Menu.Item>}",
        ]
      : []),
  ];
  return [
    "<GroupedList>",
    `  <GroupedList.Group${groupProps.length === 0 ? "" : ` ${groupProps.join(" ")}`}>`,
    "    <GroupedList.Item",
    '      title="Guji, Ethiopia"',
    '      description="Washed · arrived 3 Oct"',
    '      media={<InitialsTile name="Guji, Ethiopia" size="md" />}',
    '      value="640 kg"',
    ...(links === true ? ['      href="/lots/guji"'] : []),
    "    />",
    ...(add === true
      ? ['    <GroupedList.Add label="Add a lot" onClick={addLot} />']
      : []),
    "  </GroupedList.Group>",
    "</GroupedList>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Harbor Street" },
    links: { kind: "toggle", initial: true },
    actions: { kind: "toggle", initial: true },
    add: { kind: "toggle", initial: true },
  },
  render: ({ title, links, actions, add }) => (
    <LiveList
      title={String(title)}
      links={links === true}
      actions={actions === true}
      add={add === true}
    />
  ),
  code: listCode,
};

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
