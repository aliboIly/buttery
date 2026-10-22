import type { ReactElement, ReactNode } from "react";
import {
  Center,
  Grid,
  Icon,
  Inline,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import { gradients } from "@buttery/core/palettes";
import { Bento, Section, Stat, StatStrip } from "@buttery/react";
import { Flame, Package, Timer, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BagArt, backdrop } from "./BagArt.tsx";
import { coffeeOf } from "./data.ts";
import type { CoffeeId } from "./data.ts";

function labelColor(coffee: CoffeeId): string | undefined {
  return gradients.find((preset) => preset.id === coffeeOf(coffee).label)
    ?.toHex;
}

/** A picture rising from the bottom of a bento card, inset from its sides, on a pale backdrop. */
function Picture({
  tint,
  children,
}: {
  /** The `@buttery/core/palettes` gradient behind it. */
  readonly tint: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className="shop-picture">
      <Center
        className="shop-picture-panel shop-backdrop"
        style={backdrop(tint)}
      >
        {children}
      </Center>
    </div>
  );
}

const ROAST_PLAN: readonly {
  readonly time: string;
  readonly coffee: CoffeeId;
  readonly batch: string;
}[] = [
  { time: "7:00", coffee: "guji", batch: "12 kg" },
  { time: "8:10", coffee: "house", batch: "12 kg" },
  { time: "9:20", coffee: "huila", batch: "10 kg" },
];

const HARVESTS: readonly {
  readonly coffee: CoffeeId;
  readonly harvest: string;
}[] = [
  { coffee: "huila", harvest: "7th harvest" },
  { coffee: "guji", harvest: "5th harvest" },
  { coffee: "cerrado", harvest: "4th harvest" },
];

const DAY: readonly {
  readonly icon: LucideIcon;
  readonly time: string;
  readonly step: string;
}[] = [
  { icon: Flame, time: "7 am", step: "Roast" },
  { icon: Timer, time: "11 am", step: "Rest" },
  { icon: Package, time: "2 pm", step: "Pack" },
  { icon: Truck, time: "4 pm", step: "Ship" },
];

function Dot({ coffee }: { readonly coffee: CoffeeId }): ReactElement {
  return (
    <span
      className="shop-dot"
      style={{ backgroundColor: labelColor(coffee) }}
      aria-hidden="true"
    />
  );
}

/** How the roastery works, in a bento: the roast days, the farms, the roast date and the day an order ships. */
export function Story(): ReactElement {
  return (
    <>
      <Section
        id="story"
        tone="muted"
        title="How we roast"
        body="One twelve-kilo roaster in an old machine shop on SE Water Avenue, running five mornings a week. Nothing waits on a shelf."
      >
        <Bento>
          <Bento.Card title="Roasted five mornings a week" span={8}>
            <Picture tint="cream">
              <Surface level="card" pad={4} className="shop-roast-plan">
                <Stack gap={3}>
                  <Inline gap={3} justify="between">
                    <Text variant="label">Thursday's roast</Text>
                    <Text variant="caption" tone="secondary">
                      3 batches
                    </Text>
                  </Inline>
                  <Stack gap={2} asChild>
                    <ul role="list">
                      {ROAST_PLAN.map((batch) => (
                        <li key={batch.time} className="shop-roast-row">
                          <Text variant="label" tabular tone="secondary">
                            {batch.time}
                          </Text>
                          <Inline gap={2}>
                            <Dot coffee={batch.coffee} />
                            <Text variant="label">
                              {coffeeOf(batch.coffee).name}
                            </Text>
                          </Inline>
                          <Text variant="label" tabular tone="secondary">
                            {batch.batch}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </Stack>
                </Stack>
              </Surface>
            </Picture>
          </Bento.Card>
          <Bento.Card title="The same farms, harvest after harvest" span={4}>
            <Picture tint="mint">
              <Stack gap={2} className="shop-harvests">
                {HARVESTS.map((farm) => (
                  <Surface key={farm.coffee} level="card" padX={4} padY={3}>
                    <Inline gap={2} justify="between">
                      <Inline gap={2}>
                        <Dot coffee={farm.coffee} />
                        <Text variant="label" truncate>
                          {`${coffeeOf(farm.coffee).name}, ${coffeeOf(farm.coffee).origin}`}
                        </Text>
                      </Inline>
                      <Text variant="caption" tone="secondary">
                        {farm.harvest}
                      </Text>
                    </Inline>
                  </Surface>
                ))}
              </Stack>
            </Picture>
          </Bento.Card>
          <Bento.Card title="A roast date on every bag" span={4}>
            <Picture tint="peach">
              <Inline gap={4}>
                <BagArt label="apricot" className="shop-story-bag" />
                <Surface level="card" padX={4} padY={3}>
                  <Stack gap={2}>
                    <Text variant="caption" tone="secondary">
                      Roasted on
                    </Text>
                    <Text variant="title-md" tabular>
                      Oct 20
                    </Text>
                  </Stack>
                </Surface>
              </Inline>
            </Picture>
          </Bento.Card>
          <Bento.Card title="Packed by two, on its way by four" span={8}>
            <Picture tint="mist">
              <Grid columns={{ base: 2, md: 4 }} gap={3} className="shop-day">
                {DAY.map((moment) => (
                  <Surface key={moment.step} level="card" pad={3}>
                    <Stack gap={2}>
                      <Icon icon={moment.icon} />
                      <Stack gap={1}>
                        <Text variant="label">{moment.step}</Text>
                        <Text variant="caption" tone="secondary" tabular>
                          {moment.time}
                        </Text>
                      </Stack>
                    </Stack>
                  </Surface>
                ))}
              </Grid>
            </Picture>
          </Bento.Card>
        </Bento>
      </Section>
      <Section id="numbers" size="sm" aria-label="Halfmoon in numbers">
        <StatStrip>
          <Stat value={5} label="roast days a week" />
          <Stat value={12} suffix=" kg" label="in every batch we roast" />
          <Stat value={6} label="farms we buy from every year" />
          <Stat value={1850} label="bags sent out last month" />
        </StatStrip>
      </Section>
    </>
  );
}
