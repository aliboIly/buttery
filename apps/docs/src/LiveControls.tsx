import type { ReactElement } from "react";
import { Grid, Stack, Text } from "@buttery/core";
import type { DemoControl, DemoValues } from "@buttery/core";
import {
  SegmentedControl,
  Select,
  Slider,
  Switch,
  TextField,
} from "@buttery/react";

/** A prop's control on a live demo: a segmented control or a select, a switch, a text field or a slider. */
function Control({
  name,
  control,
  value,
  onChange,
}: {
  readonly name: string;
  readonly control: DemoControl;
  readonly value: string | number | boolean;
  readonly onChange: (value: string | number | boolean) => void;
}): ReactElement {
  switch (control.kind) {
    case "choice":
      return (
        <Stack gap={1.5}>
          <Text variant="caption" tone="secondary" aria-hidden="true">
            {name}
          </Text>
          {control.options.length <= 4 ? (
            <SegmentedControl
              label={name}
              options={control.options}
              value={String(value)}
              onValueChange={onChange}
            />
          ) : (
            <Select
              variant="outline"
              label={name}
              options={control.options.map((option) => ({
                value: option,
                label: option,
              }))}
              value={String(value)}
              onValueChange={onChange}
            />
          )}
        </Stack>
      );
    case "toggle":
      return (
        <Switch
          label={name}
          checked={value === true}
          onCheckedChange={onChange}
        />
      );
    case "text":
      return (
        <TextField
          label={name}
          value={String(value)}
          onValueChange={onChange}
        />
      );
    case "number":
      return (
        <Slider
          label={name}
          min={control.min}
          max={control.max}
          step={control.step}
          value={typeof value === "number" ? value : control.initial}
          onValueChange={onChange}
        />
      );
    default: {
      const unknown: never = control;
      return unknown;
    }
  }
}

/** The controls of a live demo, one per prop, each named by the prop it sets. */
export function LiveControls({
  controls,
  values,
  onChange,
}: {
  readonly controls: Readonly<Record<string, DemoControl>>;
  readonly values: DemoValues;
  readonly onChange: (name: string, value: string | number | boolean) => void;
}): ReactElement {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4} className="docs-controls">
      {Object.entries(controls).map(([name, control]) => (
        <Control
          key={name}
          name={name}
          control={control}
          value={values[name] ?? control.initial}
          onChange={(value) => {
            onChange(name, value);
          }}
        />
      ))}
    </Grid>
  );
}

/**
 * JSX of `name` with `values` as its props, leaving out switches that are off, and `children` between its
 * tags, for a live demo's code.
 */
export function jsxOf(name: string, values: DemoValues): string {
  const props = Object.entries(values)
    .filter(([prop]) => prop !== "children")
    .filter(([, value]) => value !== false)
    .map(([prop, value]) => {
      if (typeof value === "boolean") return prop;
      if (typeof value === "number") return `${prop}={${String(value)}}`;
      return `${prop}="${value}"`;
    });
  const open = [name, ...props].join(" ");
  const children = values["children"];
  return children === undefined || children === ""
    ? `<${open} />`
    : `<${open}>${String(children)}</${name}>`;
}

/** Each control's starting value, by prop. */
export function initialValues(
  controls: Readonly<Record<string, DemoControl>>,
): DemoValues {
  return Object.fromEntries(
    Object.entries(controls).map(([name, control]) => [name, control.initial]),
  );
}
