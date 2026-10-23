import type { ReactElement } from "react";
import { Monitor, Moon, Settings2, Sun } from "lucide-react";
import { Popover, Stack, Text } from "@butteryui/core";
import { Button, Field, SegmentedControl } from "@butteryui/react";
import type { SegmentedControlOption } from "@butteryui/react";
import { setSetting } from "./location.ts";
import type { Settings } from "./location.ts";

const THEMES = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

const DENSITIES = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
] as const;

const MOTIONS = [
  { value: "system", label: "System" },
  { value: "full", label: "Full" },
  { value: "reduced", label: "Reduced" },
] as const;

/** One setting: its name over a segmented control as wide as the panel, so the three rows line up. */
function Setting<Value extends string>({
  label,
  options,
  value,
  onChange,
}: {
  readonly label: string;
  readonly options: readonly SegmentedControlOption<Value>[];
  readonly value: string;
  readonly onChange: (value: Value) => void;
}): ReactElement {
  const chosen = options.find((option) => option.value === value)?.value;
  return (
    <Field label={label}>
      {(control) => (
        <SegmentedControl
          layout="fill"
          label={label}
          aria-labelledby={control["aria-labelledby"]}
          options={options}
          value={chosen ?? options[0]?.value}
          onValueChange={onChange}
        />
      )}
    </Field>
  );
}

/** The display settings: color scheme, density and motion, which stay in the URL from page to page. */
export function DisplaySettings({
  settings,
}: {
  readonly settings: Settings;
}): ReactElement {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          iconStart={Settings2}
          aria-label="Display settings"
          className="pg-display docs-tool"
        >
          <span className="pg-display-text">Display settings</span>
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        aria-label="Display settings"
        className="docs-display-panel"
      >
        <Stack gap={5}>
          <Text variant="title-sm">Display</Text>
          <Setting
            label="Theme"
            options={THEMES}
            value={settings.theme}
            onChange={(value) => {
              setSetting("theme", value);
            }}
          />
          <Setting
            label="Density"
            options={DENSITIES}
            value={settings.density}
            onChange={(value) => {
              setSetting("density", value);
            }}
          />
          <Setting
            label="Motion"
            options={MOTIONS}
            value={settings.motion}
            onChange={(value) => {
              setSetting("motion", value);
            }}
          />
        </Stack>
      </Popover.Content>
    </Popover>
  );
}
