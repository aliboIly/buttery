import { Menu } from "@buttery/core";
import type { ReactElement } from "react";
import { GroupedList, InitialsTile } from "@buttery/react";

/** Green coffee on hand: the total, then each warehouse's lots, each lot linking to its page. */
export function StockByWarehouse(): ReactElement {
  return (
    <GroupedList>
      <GroupedList.Group>
        <GroupedList.Item
          title="All warehouses"
          media={<InitialsTile name="All warehouses" size="md" />}
          value="2,140 kg"
        />
      </GroupedList.Group>
      <GroupedList.Group
        title="Harbor Street"
        actions={
          <>
            <Menu.Item>Rename</Menu.Item>
            <Menu.Item>Move stock</Menu.Item>
          </>
        }
      >
        <GroupedList.Item
          title="Guji, Ethiopia"
          description="Washed · arrived 3 Oct"
          media={<InitialsTile name="Guji Ethiopia" size="md" />}
          value="640 kg"
          href="#lots-guji"
        />
        <GroupedList.Item
          title="Huila, Colombia"
          description="Washed · arrived 19 Sep"
          media={<InitialsTile name="Huila Colombia" size="md" />}
          value="410 kg"
          href="#lots-huila"
        />
      </GroupedList.Group>
      <GroupedList.Group title="Mill Lane">
        <GroupedList.Item
          title="Cerrado, Brazil"
          description="Natural · arrived 28 Aug"
          media={<InitialsTile name="Cerrado Brazil" size="md" />}
          value="1,090 kg"
          href="#lots-cerrado"
        />
      </GroupedList.Group>
    </GroupedList>
  );
}
