import { useLayoutEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack } from "@butteryui/core";
import type { DemoControl, DemoValues } from "@butteryui/core";
import {
  Field,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  TextField,
} from "@butteryui/react";

/** How wide a segmented control would be with every label whole: its segments share the widest label's width. */
function wholeWidth(track: Element): number {
  const segments = [...track.querySelectorAll('[data-bt-part="segment"]')];
  const widest = Math.max(
    0,
    ...segments.map((segment) => {
      const label = segment.querySelector('[data-bt-part="label"]');
      const style = getComputedStyle(segment);
      return (
        (label?.scrollWidth ?? 0) +
        Number.parseFloat(style.paddingInlineStart) +
        Number.parseFloat(style.paddingInlineEnd)
      );
    }),
  );
  const style = getComputedStyle(track);
  return (
    widest * segments.length +
    Number.parseFloat(style.paddingInlineStart) +
    Number.parseFloat(style.paddingInlineEnd)
  );
}

/**
 * A choice's control: a segmented control while every option's label fits whole side by side, a select
 * when there are more than four options or the labels would truncate, such as long file types. It's labelled
 * as a field, as the text field and the slider are, so the controls in a row start at one height.
 */
function ChoiceControl({
  name,
  options,
  value,
  onChange,
}: {
  readonly name: string;
  readonly options: readonly string[];
  readonly value: string;
  readonly onChange: (value: string) => void;
}): ReactElement {
  const few = options.length <= 4;
  const cell = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(few);

  useLayoutEffect(() => {
    const element = cell.current;
    if (!element || !few) return undefined;
    let needed = 0;
    const measure = (): void => {
      const track = element.querySelector('[data-bt="SegmentedControl"]');
      if (track) needed = wholeWidth(track);
      setFits(needed <= element.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [few]);

  return (
    <Field ref={cell} label={name}>
      {(control) =>
        few && fits ? (
          <SegmentedControl
            layout="fill"
            label={name}
            aria-labelledby={control["aria-labelledby"]}
            options={options}
            value={value}
            onValueChange={onChange}
          />
        ) : (
          <Select
            variant="outline"
            label={name}
            aria-labelledby={control["aria-labelledby"]}
            options={options.map((option) => ({
              value: option,
              label: option,
            }))}
            value={value}
            onValueChange={onChange}
          />
        )
      }
    </Field>
  );
}

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
        <ChoiceControl
          name={name}
          options={control.options}
          value={String(value)}
          onChange={onChange}
        />
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
          labelPosition="top"
          min={control.min}
          max={control.max}
          step={control.step}
          value={typeof value === "number" ? value : control.initial}
          resetValue={control.initial}
          onValueChange={onChange}
        />
      );
    default: {
      const unknown: never = control;
      return unknown;
    }
  }
}

/**
 * The controls of a live demo, one per prop, each named by the prop it sets: the labelled fields first, two to
 * a row, then the switches in rows of their own, so a switch never sits on the label line beside a field.
 */
export function LiveControls({
  controls,
  values,
  onChange,
}: {
  readonly controls: Readonly<Record<string, DemoControl>>;
  readonly values: DemoValues;
  readonly onChange: (name: string, value: string | number | boolean) => void;
}): ReactElement {
  const entries = Object.entries(controls);
  const rows = (
    list: readonly (readonly [string, DemoControl])[],
  ): ReactElement | null =>
    list.length === 0 ? null : (
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        {list.map(([name, control]) => (
          <div
            key={name}
            data-docs-control={name}
            data-order={entries.findIndex(([other]) => other === name)}
          >
            <Control
              name={name}
              control={control}
              value={values[name] ?? control.initial}
              onChange={(value) => {
                onChange(name, value);
              }}
            />
          </div>
        ))}
      </Grid>
    );
  return (
    <Stack gap={4} className="docs-controls">
      {rows(entries.filter(([, control]) => control.kind !== "toggle"))}
      {rows(entries.filter(([, control]) => control.kind === "toggle"))}
    </Stack>
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
