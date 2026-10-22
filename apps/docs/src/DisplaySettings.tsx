import { useId } from "react";
import type { ReactElement } from "react";
import { Settings2 } from "lucide-react";
import { RadioGroup } from "radix-ui";
import { Popover, Pressable, Stack, Text } from "@buttery/core";
import { Button } from "@buttery/react";
import { setSetting } from "./location.ts";
import type { Settings } from "./location.ts";

interface ToggleProps {
  readonly label: string;
  readonly options: readonly string[];
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/** One setting: its name over its options, which it names. */
function Toggle({
  label,
  options,
  value,
  onChange,
}: ToggleProps): ReactElement {
  const labelId = useId();
  return (
    <Stack gap={1.5} align="start">
      <Text id={labelId} variant="caption" tone="secondary">
        {label}
      </Text>
      <RadioGroup.Root
        className="pg-toggle"
        aria-labelledby={labelId}
        orientation="horizontal"
        value={value}
        onValueChange={onChange}
      >
        {options.map((option) => (
          <RadioGroup.Item key={option} value={option} asChild>
            <Pressable className="pg-toggle-option">
              <Text variant="control">{option}</Text>
            </Pressable>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </Stack>
  );
}

function SettingsControls({
  settings,
}: {
  readonly settings: Settings;
}): ReactElement {
  return (
    <Stack gap={4} align="start">
      <Toggle
        label="Theme"
        options={["system", "light", "dark"]}
        value={settings.theme}
        onChange={(value) => {
          setSetting("theme", value);
        }}
      />
      <Toggle
        label="Density"
        options={["comfortable", "compact"]}
        value={settings.density}
        onChange={(value) => {
          setSetting("density", value);
        }}
      />
      <Toggle
        label="Motion"
        options={["system", "full", "reduced"]}
        value={settings.motion}
        onChange={(value) => {
          setSetting("motion", value);
        }}
      />
    </Stack>
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
        className="pg-menu"
      >
        <SettingsControls settings={settings} />
      </Popover.Content>
    </Popover>
  );
}
