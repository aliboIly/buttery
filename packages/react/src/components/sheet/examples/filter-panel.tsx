import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SegmentedControl, Sheet, Switch } from "@butteryui/react";
import { SlidersHorizontal } from "lucide-react";

type Roast = "All" | "Light" | "Medium" | "Dark";

interface Coffee {
  readonly name: string;
  readonly roast: Exclude<Roast, "All">;
  readonly decaf: boolean;
}

const COFFEES: readonly Coffee[] = [
  { name: "Guji", roast: "Light", decaf: false },
  { name: "Huila", roast: "Medium", decaf: false },
  { name: "Halfmoon House", roast: "Dark", decaf: false },
  { name: "Night Owl", roast: "Medium", decaf: true },
  { name: "Kirinyaga", roast: "Light", decaf: false },
];

function coffees(count: number): string {
  return `${String(count)} ${count === 1 ? "coffee" : "coffees"}`;
}

/** Filters in a drawer on a phone and at the window's start from 640px, opened and closed from state the list keeps. */
export function FilterPanel(): ReactElement {
  const [open, setOpen] = useState(false);
  const [roast, setRoast] = useState<Roast>("All");
  const [decaf, setDecaf] = useState(false);
  const shown = COFFEES.filter(
    (coffee) =>
      (roast === "All" || coffee.roast === roast) && (!decaf || coffee.decaf),
  );
  const chosen = (roast === "All" ? 0 : 1) + (decaf ? 1 : 0);
  return (
    <Stack gap={3} align="start">
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button variant="soft" iconStart={SlidersHorizontal}>
            {chosen === 0 ? "Filters" : `Filters (${String(chosen)})`}
          </Button>
        </Sheet.Trigger>
        <Sheet.Content side={{ base: "bottom", md: "start" }}>
          <Sheet.Header
            title="Filter the coffees"
            description={`${coffees(shown.length)} match.`}
          />
          <Sheet.Body>
            <SegmentedControl<Roast>
              label="Roast"
              options={["All", "Light", "Medium", "Dark"]}
              value={roast}
              onValueChange={setRoast}
            />
            <Switch
              label="Decaf only"
              hint="Swiss Water Process, no chemicals."
              checked={decaf}
              onCheckedChange={setDecaf}
            />
          </Sheet.Body>
          <Sheet.Footer>
            <Button
              variant="primary"
              size="cta"
              shape="rounded"
              onClick={() => {
                setOpen(false);
              }}
            >
              {`Show ${coffees(shown.length)}`}
            </Button>
            <Button
              variant="soft"
              size="cta"
              shape="rounded"
              aria-disabled={chosen === 0}
              onClick={() => {
                setRoast("All");
                setDecaf(false);
              }}
            >
              Clear filters
            </Button>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet>
      <Text variant="body-sm" tone="secondary">
        {shown.map((coffee) => coffee.name).join(", ") || "No coffee matches."}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Filters");
  await see("5 coffees match.");
  await press("radio", "Medium");
  await see("2 coffees match.");
  await press("switch", "Decaf only");
  await press("button", "Show 1 coffee");
  await see("Night Owl");
  await see("Filters (2)");
};
