import type { ReactElement, ReactNode } from "react";
import { Menu, Settings2 } from "lucide-react";
import {
  Icon,
  Inline,
  Popover,
  Pressable,
  Stack,
  Sticky,
  Surface,
  Text,
} from "@buttery/core";
import { setSetting } from "./location.ts";
import type { Settings } from "./location.ts";
import { pageGroups, pages } from "./pages.tsx";

interface ToggleProps {
  readonly label: string;
  readonly options: readonly string[];
  readonly value: string;
  readonly onChange: (value: string) => void;
}

function Toggle({
  label,
  options,
  value,
  onChange,
}: ToggleProps): ReactElement {
  return (
    <div className="pg-toggle" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <Pressable
          key={option}
          role="radio"
          aria-checked={option === value}
          className="pg-toggle-option"
          onClick={() => {
            onChange(option);
          }}
        >
          <Text variant="control">{option}</Text>
        </Pressable>
      ))}
    </div>
  );
}

function SettingsControls({
  settings,
  stacked,
}: {
  readonly settings: Settings;
  readonly stacked: boolean;
}): ReactElement {
  const controls = (
    <>
      <Toggle
        label="Color scheme"
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
    </>
  );
  return stacked ? (
    <Stack gap={3} align="start">
      {controls}
    </Stack>
  ) : (
    <Inline gap={2}>{controls}</Inline>
  );
}

function PageLinks({ current }: { readonly current: string }): ReactElement {
  return (
    <Stack gap={5}>
      {pageGroups.map((group) => (
        <Stack key={group.title} gap={1}>
          <Text variant="caption" className="pg-nav-group">
            {group.title}
          </Text>
          {group.pages.map((page) => (
            <Pressable key={page.route} asChild>
              <a
                href={`#/${page.route}`}
                className="pg-nav-link"
                aria-current={page.route === current ? "page" : undefined}
              >
                <Text variant="control" truncate>
                  {page.title}
                </Text>
              </a>
            </Pressable>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

interface ChromeProps {
  readonly current: string;
  readonly settings: Settings;
  readonly children: ReactNode;
}

/** The playground's shell: a header with the display settings, a page list, and the page. */
export function Chrome({
  current,
  settings,
  children,
}: ChromeProps): ReactElement {
  const title = pages.find((page) => page.route === current)?.title ?? "Pages";
  return (
    <div className="pg-shell">
      <Surface level="card" padX={4} asChild>
        <header className="pg-header">
          <Text variant="title-sm" truncate className="pg-brand">
            🧈 buttery playground
          </Text>
          <span className="pg-narrow">
            <Popover>
              <Popover.Trigger asChild>
                <Pressable className="pg-menu-button">
                  <Icon icon={Menu} />
                  <Text variant="control" truncate>
                    {title}
                  </Text>
                </Pressable>
              </Popover.Trigger>
              <Popover.Content
                align="start"
                aria-label="Pages"
                className="pg-menu"
              >
                <PageLinks current={current} />
              </Popover.Content>
            </Popover>
          </span>
          <span className="pg-wide">
            <SettingsControls settings={settings} stacked={false} />
          </span>
          <span className="pg-narrow">
            <Popover>
              <Popover.Trigger asChild>
                <Pressable
                  className="pg-icon-button"
                  aria-label="Display settings"
                >
                  <Icon icon={Settings2} />
                </Pressable>
              </Popover.Trigger>
              <Popover.Content
                align="end"
                aria-label="Display settings"
                className="pg-menu"
              >
                <SettingsControls settings={settings} stacked />
              </Popover.Content>
            </Popover>
          </span>
        </header>
      </Surface>
      <div className="pg-body">
        <Sticky variant="aside" className="pg-sidebar pg-wide">
          <nav aria-label="Pages">
            <PageLinks current={current} />
          </nav>
        </Sticky>
        <main className="pg-main">{children}</main>
      </div>
    </div>
  );
}
