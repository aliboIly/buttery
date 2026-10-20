import { motion } from "motion/react";
import { RadioGroup } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Grid,
  Inline,
  Loop,
  Morph,
  Presence,
  Pressable,
  SharedIndicator,
  spring,
  Stack,
  Stagger,
  Surface,
  Text,
  useAnimationTracking,
  useLayoutAnimation,
} from "@buttery/core";
import type { PresencePreset, SpringToken } from "@buttery/core";
import { celebrate } from "@buttery/react";
import "./motion-page.css";

const SPRINGS = Object.keys(spring) as SpringToken[];
const PRESETS: readonly PresencePreset[] = [
  "fade",
  "rise",
  "pop",
  "toast",
  "menu",
];

function Button({
  label,
  testId,
  onPress,
}: {
  readonly label: string;
  readonly testId: string;
  readonly onPress: (target: HTMLButtonElement) => void;
}): ReactElement {
  return (
    <Surface asChild level="raised" padX={4} padY={2} radius="full">
      <Pressable
        data-testid={testId}
        onClick={(event) => {
          onPress(event.currentTarget);
        }}
      >
        <Text variant="button">{label}</Text>
      </Pressable>
    </Surface>
  );
}

function SpringDemo({ token }: { readonly token: SpringToken }): ReactElement {
  const [end, setEnd] = useState(false);
  const layoutAnimation = useLayoutAnimation(token);
  const tracking = useAnimationTracking();
  return (
    <div className="mo-row">
      <Text variant="label" className="mo-name">
        {token}
      </Text>
      <div className="mo-track" data-end={end ? "" : undefined}>
        <motion.span
          {...tracking}
          {...layoutAnimation}
          layoutDependency={end}
          className="mo-dot"
          data-testid={`spring-${token}`}
        />
      </div>
      <Button
        label="Move"
        testId={`spring-${token}-move`}
        onPress={() => {
          setEnd((current) => !current);
        }}
      />
    </div>
  );
}

function PresenceDemo({
  preset,
}: {
  readonly preset: PresencePreset;
}): ReactElement {
  const [show, setShow] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Button
        label={show ? `Hide ${preset}` : `Show ${preset}`}
        testId={`presence-${preset}-toggle`}
        onPress={() => {
          setShow((current) => !current);
        }}
      />
      <div className="mo-slot">
        <Presence
          show={show}
          preset={preset}
          data-testid={`presence-${preset}`}
        >
          <Surface level="floating" padX={4} padY={3}>
            <Text variant="label">{preset}</Text>
          </Surface>
        </Presence>
      </div>
    </Stack>
  );
}

function MorphDemo(): ReactElement {
  const [long, setLong] = useState(false);
  return (
    <Stack gap={3}>
      <Inline>
        <Button
          label={long ? "Shorter" : "Longer"}
          testId="morph-toggle"
          onPress={() => {
            setLong((current) => !current);
          }}
        />
      </Inline>
      <Surface level="card" pad={4} className="mo-morph">
        <Morph contentKey={long ? "long" : "short"} data-testid="morph">
          <Text variant="body">
            {long
              ? "Pick an edge, a backdrop and a little depth. Everything updates as you go, so try a few before you settle on one you like."
              : "Pick an edge and a backdrop."}
          </Text>
        </Morph>
      </Surface>
    </Stack>
  );
}

const EDGES = ["Plain", "Outline", "Glow"] as const;

function IndicatorDemo(): ReactElement {
  const [edge, setEdge] = useState<string>("Plain");
  return (
    <RadioGroup.Root
      value={edge}
      onValueChange={setEdge}
      aria-label="Edge"
      asChild
    >
      <Inline gap="0.5" pad="0.5" className="mo-segmented">
        <SharedIndicator.Group>
          {EDGES.map((option) => (
            <RadioGroup.Item key={option} value={option} asChild>
              <SharedIndicator active={option === edge} asChild>
                <Pressable
                  className="mo-segment"
                  data-testid={`edge-${option}`}
                >
                  <Text
                    variant="control"
                    tone={option === edge ? "default" : "secondary"}
                  >
                    {option}
                  </Text>
                </Pressable>
              </SharedIndicator>
            </RadioGroup.Item>
          ))}
        </SharedIndicator.Group>
      </Inline>
    </RadioGroup.Root>
  );
}

const TOTALS = ["1,204", "1,318", "1,472"] as const;

/** One demo per motion preset, for the sampling tests and for judging the motion by eye. */
export function MotionPage(): ReactElement {
  return (
    <Stack gap={12} className="mo-page">
      <Stack gap={4}>
        <Text variant="heading-1" asChild>
          <h1>Motion</h1>
        </Text>
        <Text variant="body-lg">
          Every preset in one place. Switch motion to reduced in the settings:
          springs land at once and fades take 100ms.
        </Text>
      </Stack>

      <Stack gap={4} asChild>
        <section aria-label="Springs">
          <Text variant="title" asChild>
            <h2>Springs</h2>
          </Text>
          <Surface level="section" pad={6} radius="lg">
            <Stack gap={3}>
              {SPRINGS.map((token) => (
                <SpringDemo key={token} token={token} />
              ))}
            </Stack>
          </Surface>
        </section>
      </Stack>

      <Stack gap={4} asChild>
        <section aria-label="Presence">
          <Text variant="title" asChild>
            <h2>Presence</h2>
          </Text>
          <Surface level="section" pad={6} radius="lg">
            <Inline gap={6} wrap align="start">
              {PRESETS.map((preset) => (
                <PresenceDemo key={preset} preset={preset} />
              ))}
            </Inline>
          </Surface>
        </section>
      </Stack>

      <Stack gap={4} asChild>
        <section aria-label="Morph and indicator">
          <Text variant="title" asChild>
            <h2>Morph and indicator</h2>
          </Text>
          <Surface level="section" pad={6} radius="lg">
            <Stack gap={6}>
              <MorphDemo />
              <Inline>
                <IndicatorDemo />
              </Inline>
            </Stack>
          </Surface>
        </section>
      </Stack>

      <Stack gap={4} asChild>
        <section aria-label="Arrivals, loops and celebrations">
          <Text variant="title" asChild>
            <h2>Arrivals, loops and celebrations</h2>
          </Text>
          <Surface level="section" pad={6} radius="lg">
            <Stack gap={6}>
              <Grid columns={3} gap={4} asChild>
                <Stagger data-testid="stagger">
                  {["Templates", "Brand kits", "Exports"].map((title) => (
                    <Stagger.Item key={title}>
                      <Surface level="card" pad={4}>
                        <Text variant="label">{title}</Text>
                      </Surface>
                    </Stagger.Item>
                  ))}
                </Stagger>
              </Grid>
              <Loop steps={TOTALS.length} aria-hidden="true">
                {(step) => (
                  <Morph contentKey={step}>
                    <Text variant="heading-2" tabular>
                      {TOTALS[step]}
                    </Text>
                  </Morph>
                )}
              </Loop>
              <Inline>
                <Button
                  label="Celebrate"
                  testId="celebrate"
                  onPress={(target) => {
                    celebrate(target);
                  }}
                />
              </Inline>
            </Stack>
          </Surface>
        </section>
      </Stack>
    </Stack>
  );
}
