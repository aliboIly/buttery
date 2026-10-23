import { Flame, Pin, Plus, Scale, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Grid,
  Icon,
  Inline,
  Pressable,
  Stack,
  Surface,
  Text,
  useApplePlatform,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ContextMenu, StatusBadge } from "@butteryui/react";

const STATUSES = {
  queued: { label: "To roast", tone: "neutral" },
  roasting: { label: "Roasting", tone: "warning" },
  done: { label: "Done", tone: "success" },
} as const;

type Status = keyof typeof STATUSES;

function isStatus(value: string): value is Status {
  return Object.hasOwn(STATUSES, value);
}

interface Batch {
  readonly id: number;
  readonly coffee: string;
  readonly kilos: number;
  readonly status: Status;
  readonly pinned: boolean;
}

const FIRST_BATCHES: readonly Batch[] = [
  { id: 1, coffee: "Guji", kilos: 12, status: "done", pinned: false },
  { id: 2, coffee: "Huila", kilos: 8, status: "roasting", pinned: false },
  { id: 3, coffee: "House blend", kilos: 20, status: "queued", pinned: true },
];

/** A roast day board with menus inside menus: right-click the board to add a batch or hide the weights, or a batch to set its status, pin it or delete it. */
export function RoastBoard(): ReactElement {
  const apple = useApplePlatform();
  const [batches, setBatches] = useState<readonly Batch[]>(FIRST_BATCHES);
  const [weights, setWeights] = useState(true);
  const change = (id: number, update: Partial<Batch>): void => {
    setBatches(
      batches.map((batch) =>
        batch.id === id ? { ...batch, ...update } : batch,
      ),
    );
  };
  const pinnedFirst = [...batches].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned),
  );
  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <Surface
          level="section"
          pad={3}
          tabIndex={0}
          role="region"
          aria-label="Monday's roasts"
          className="bt-focus"
        >
          <Stack gap={3}>
            <Text variant="caption">{`Monday's roasts · ${String(batches.length)} batches`}</Text>
            <Grid columns={{ base: 1, md: 3 }} gap={2}>
              {pinnedFirst.map((batch) => (
                <ContextMenu key={batch.id}>
                  <ContextMenu.Trigger asChild>
                    <Surface asChild level="card" pad={3} radius="lg">
                      <Pressable>
                        <Stack gap={2}>
                          <Inline gap={2} justify="between">
                            <Text variant="label" truncate>
                              {batch.coffee}
                            </Text>
                            {batch.pinned ? (
                              <Icon icon={Pin} label="Pinned" />
                            ) : null}
                          </Inline>
                          {weights ? (
                            <Text variant="caption" tabular>
                              {`${String(batch.kilos)} kg`}
                            </Text>
                          ) : null}
                          <Inline>
                            <StatusBadge tone={STATUSES[batch.status].tone}>
                              {STATUSES[batch.status].label}
                            </StatusBadge>
                          </Inline>
                        </Stack>
                      </Pressable>
                    </Surface>
                  </ContextMenu.Trigger>
                  <ContextMenu.Content aria-label={batch.coffee}>
                    <ContextMenu.Sub>
                      <ContextMenu.SubTrigger icon={Flame}>
                        Status
                      </ContextMenu.SubTrigger>
                      <ContextMenu.SubContent>
                        <ContextMenu.RadioGroup
                          value={batch.status}
                          onValueChange={(status) => {
                            if (isStatus(status)) change(batch.id, { status });
                          }}
                        >
                          {Object.entries(STATUSES).map(([value, status]) => (
                            <ContextMenu.RadioItem key={value} value={value}>
                              {status.label}
                            </ContextMenu.RadioItem>
                          ))}
                        </ContextMenu.RadioGroup>
                      </ContextMenu.SubContent>
                    </ContextMenu.Sub>
                    <ContextMenu.CheckboxItem
                      icon={Pin}
                      shortcut="p"
                      checked={batch.pinned}
                      onCheckedChange={(pinned) => {
                        change(batch.id, { pinned });
                      }}
                    >
                      Pin to the top
                    </ContextMenu.CheckboxItem>
                    <ContextMenu.Separator />
                    <ContextMenu.Item
                      icon={Trash2}
                      tone="danger"
                      shortcut={apple ? "backspace" : "delete"}
                      onSelect={() => {
                        setBatches(batches.filter(({ id }) => id !== batch.id));
                      }}
                    >
                      Delete
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu>
              ))}
            </Grid>
          </Stack>
        </Surface>
      </ContextMenu.Trigger>
      <ContextMenu.Content aria-label="Monday's roasts">
        <ContextMenu.Item
          icon={Plus}
          shortcut="n"
          onSelect={() => {
            setBatches([
              ...batches,
              {
                id: Math.max(0, ...batches.map(({ id }) => id)) + 1,
                coffee: "New batch",
                kilos: 10,
                status: "queued",
                pinned: false,
              },
            ]);
          }}
        >
          Add a batch
        </ContextMenu.Item>
        <ContextMenu.CheckboxItem
          icon={Scale}
          checked={weights}
          onCheckedChange={setWeights}
        >
          Show weights
        </ContextMenu.CheckboxItem>
      </ContextMenu.Content>
    </ContextMenu>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ focus, key, press, see }) => {
  await focus("button", /^Huila/);
  await key("ContextMenu");
  await key("ArrowRight");
  await key("ArrowDown");
  await key("ArrowDown");
  await key("Enter");
  await focus("button", /^Huila\s*8 kg\s*Done/);
  await focus("region", "Monday's roasts");
  await key("ContextMenu");
  await press("menuitem", "Add a batch");
  await see("Monday's roasts · 4 batches");
  await see("New batch");
};
