import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import {
  createTheme,
  Divider,
  Inline,
  Morph,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import type { ColorScheme, Density, RadiusScale } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import {
  Avatar,
  Button,
  ButteryProvider,
  celebrate,
  Checkbox,
  Field,
  SegmentedControl,
  StatusBadge,
  SwatchGrid,
  Switch,
  toast,
  useButtery,
} from "@butteryui/react";
import type { Swatch } from "@butteryui/react";
import { Progress } from "../Progress.tsx";
import "./intro.css";

type Accent = "buttery" | "sea" | "violet" | "rose" | "apricot";

/**
 * Each accent: the color `createTheme` gets (none for buttery's own blue) and the palette gradients the
 * stage sits on in light and dark, from the same hue family.
 */
const ACCENTS: Readonly<
  Record<
    Accent,
    {
      readonly label: string;
      readonly color: string | undefined;
      readonly light: string;
      readonly dark: string;
    }
  >
> = {
  buttery: {
    label: "buttery's own",
    color: undefined,
    light: "mist",
    dark: "navy",
  },
  sea: { label: "Sea", color: "#009298", light: "mint", dark: "forest" },
  violet: { label: "Violet", color: "#6463d4", light: "lilac", dark: "ink" },
  rose: { label: "Rose", color: "#d25d96", light: "blush", dark: "plum" },
  apricot: {
    label: "Apricot",
    color: "#e36650",
    light: "peach",
    dark: "rust",
  },
};

const SWATCHES: readonly Swatch<Accent>[] = (
  Object.keys(ACCENTS) as Accent[]
).map((value) => ({
  value,
  label: ACCENTS[value].label,
  fill: ACCENTS[value].color ?? "var(--bt-accent)",
}));

const SCHEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const satisfies readonly { value: ColorScheme; label: string }[];

const DENSITIES = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
] as const satisfies readonly { value: Density; label: string }[];

const CORNERS = [
  { value: "soft", label: "Soft" },
  { value: "default", label: "Default" },
  { value: "crisp", label: "Crisp" },
] as const satisfies readonly { value: RadiusScale; label: string }[];

function backdrop(accent: Accent, scheme: ColorScheme): string | undefined {
  const id = ACCENTS[accent][scheme];
  const preset = gradients.find((candidate) => candidate.id === id);
  return preset ? gradientCss(preset) : undefined;
}

const TASKS = [
  { id: "notes", title: "Write the release notes", owner: "Mara Ellis" },
  { id: "video", title: "Record the walkthrough", owner: "Theo Park" },
  { id: "pricing", title: "Update the pricing page", owner: "Ana Ruiz" },
  { id: "email", title: "Schedule the launch email", owner: "Sam Okafor" },
] as const;

type TaskId = (typeof TASKS)[number]["id"];

const VIEWS = ["Tasks", "Team"] as const;

/** A launch checklist made of buttery's components, which the showcase themes. */
function LaunchChecklist(): ReactElement {
  const [done, setDone] = useState<ReadonlySet<TaskId>>(
    () => new Set<TaskId>(["video"]),
  );
  const [view, setView] = useState<(typeof VIEWS)[number]>("Tasks");
  const [notify, setNotify] = useState(true);
  const left = TASKS.length - done.size;
  const tick = (id: TaskId, checked: boolean): void => {
    setDone((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const launch = (target: HTMLElement): void => {
    if (left > 0) {
      toast(
        `${String(left)} ${left === 1 ? "task" : "tasks"} to go before the launch`,
        {
          id: "launch",
        },
      );
      return;
    }
    celebrate(target);
    toast.success(
      notify ? "Launched, and the team has the email" : "Launched",
      {
        id: "launch",
      },
    );
  };
  return (
    <Surface level="card" pad={6} className="docs-showcase-card">
      <Stack gap={5}>
        <Inline gap={3} align="start" justify="between">
          <Stack gap={2}>
            <Text variant="title-md" asChild>
              <h3>Launch checklist</h3>
            </Text>
            <Text variant="body-sm" tone="secondary" tabular>
              {`Launches Friday · ${String(done.size)} of ${String(TASKS.length)} done`}
            </Text>
          </Stack>
          <StatusBadge tone={left === 0 ? "success" : "info"}>
            {left === 0 ? "Ready" : "In progress"}
          </StatusBadge>
        </Inline>
        <Progress
          label="Launch checklist"
          value={done.size}
          max={TASKS.length}
          valueText={`${String(done.size)} of ${String(TASKS.length)} done`}
        />
        <SegmentedControl
          layout="fill"
          label="Show"
          options={VIEWS}
          value={view}
          onValueChange={setView}
        />
        <Morph contentKey={view}>
          {view === "Tasks" ? (
            <Stack gap={3} asChild>
              <ul role="list" className="docs-showcase-list">
                {TASKS.map((task) => (
                  <Inline key={task.id} gap={3} align="center" asChild>
                    <li>
                      <span className="docs-showcase-grow">
                        <Checkbox
                          label={task.title}
                          checked={done.has(task.id)}
                          onCheckedChange={(checked) => {
                            tick(task.id, checked === true);
                          }}
                        />
                      </span>
                      <Avatar name={task.owner} size="sm" />
                    </li>
                  </Inline>
                ))}
              </ul>
            </Stack>
          ) : (
            <Stack gap={3} asChild>
              <ul role="list" className="docs-showcase-list">
                {TASKS.map((task) => (
                  <Inline key={task.id} gap={3} align="center" asChild>
                    <li>
                      <Avatar name={task.owner} size="sm" />
                      <Stack gap={1} className="docs-showcase-grow">
                        <Text variant="title-sm" truncate>
                          {task.owner}
                        </Text>
                        <Text variant="caption" tone="secondary" truncate>
                          {task.title}
                        </Text>
                      </Stack>
                      <StatusBadge
                        tone={done.has(task.id) ? "success" : "neutral"}
                      >
                        {done.has(task.id) ? "Done" : "To do"}
                      </StatusBadge>
                    </li>
                  </Inline>
                ))}
              </ul>
            </Stack>
          )}
        </Morph>
        <Divider />
        <Switch
          label="Email the team when it launches"
          checked={notify}
          onCheckedChange={setNotify}
        />
        <Inline gap={2} justify="end">
          <Button
            variant="primary"
            arrow="forward"
            onClick={(event) => {
              launch(event.currentTarget);
            }}
          >
            Launch
          </Button>
        </Inline>
      </Stack>
    </Surface>
  );
}

/**
 * A theme to try: the color scheme, density, accent and corners of a launch checklist made of buttery's
 * components, applied by a nested `ButteryProvider`. It follows the page's scheme and density until one is
 * picked.
 */
export function Showcase(): ReactElement {
  const page = useButtery();
  const [scheme, setScheme] = useState<ColorScheme | null>(null);
  const [density, setDensity] = useState<Density | null>(null);
  const [accent, setAccent] = useState<Accent>("buttery");
  const [corners, setCorners] = useState<RadiusScale>("default");
  const shownScheme = scheme ?? page.colorScheme;
  const shownDensity = density ?? page.density;
  const theme = useMemo(() => {
    const color = ACCENTS[accent].color;
    return createTheme(
      color === undefined
        ? { radius: corners }
        : { accent: color, primary: color, radius: corners },
    );
  }, [accent, corners]);
  return (
    <section aria-label="Theme playground" className="docs-showcase">
      <div className="docs-showcase-layout">
        <ButteryProvider
          colorScheme={shownScheme}
          density={shownDensity}
          theme={theme}
        >
          <div
            className="docs-showcase-stage"
            style={{ backgroundImage: backdrop(accent, shownScheme) }}
          >
            <LaunchChecklist />
          </div>
        </ButteryProvider>
        <Stack gap={4} className="docs-showcase-controls">
          <Field label="Theme">
            {(control) => (
              <SegmentedControl
                layout="fill"
                label="Theme"
                aria-labelledby={control["aria-labelledby"]}
                options={SCHEMES}
                value={shownScheme}
                onValueChange={setScheme}
              />
            )}
          </Field>
          <Field label="Density">
            {(control) => (
              <SegmentedControl
                layout="fill"
                label="Density"
                aria-labelledby={control["aria-labelledby"]}
                options={DENSITIES}
                value={shownDensity}
                onValueChange={setDensity}
              />
            )}
          </Field>
          <Field label="Brand color">
            {(control) => (
              <SwatchGrid<Accent>
                label="Brand color"
                aria-labelledby={control["aria-labelledby"]}
                columns={5}
                swatches={SWATCHES}
                value={accent}
                onValueChange={setAccent}
              />
            )}
          </Field>
          <Field label="Corners">
            {(control) => (
              <SegmentedControl
                layout="fill"
                label="Corners"
                aria-labelledby={control["aria-labelledby"]}
                options={CORNERS}
                value={corners}
                onValueChange={setCorners}
              />
            )}
          </Field>
        </Stack>
      </div>
    </section>
  );
}
