import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { GroupedList } from "@buttery/react";

interface Roast {
  readonly id: string;
  readonly coffee: string;
  readonly bags: number;
}

/** This week's roasts by day, each day with a dashed row that adds one more. */
export function RoastPlan(): ReactElement {
  const [days, setDays] = useState<Record<string, readonly Roast[]>>({
    Tuesday: [
      { id: "tue-1", coffee: "Guji, Ethiopia", bags: 24 },
      { id: "tue-2", coffee: "House espresso", bags: 40 },
    ],
    Thursday: [{ id: "thu-1", coffee: "Huila, Colombia", bags: 18 }],
  });
  const addRoast = (day: string): void => {
    setDays((current) => {
      const roasts = current[day] ?? [];
      return {
        ...current,
        [day]: [
          ...roasts,
          {
            id: `${day}-${String(roasts.length + 1)}`,
            coffee: "New roast",
            bags: 12,
          },
        ],
      };
    });
  };
  return (
    <GroupedList>
      {Object.entries(days).map(([day, roasts]) => (
        <GroupedList.Group key={day} title={day}>
          {roasts.map((roast) => (
            <GroupedList.Item
              key={roast.id}
              title={roast.coffee}
              description={`${String(roast.bags)} bags`}
              value={`${String(roast.bags * 5)} kg`}
            />
          ))}
          <GroupedList.Add
            label={`Add a roast on ${day}`}
            onClick={() => {
              addRoast(day);
            }}
          />
        </GroupedList.Group>
      ))}
    </GroupedList>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add a roast on Thursday");
  await see("New roast");
};
