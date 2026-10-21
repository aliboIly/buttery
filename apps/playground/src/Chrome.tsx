import { useEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { Settings2 } from "lucide-react";
import { RadioGroup } from "radix-ui";
import {
  Popover,
  Pressable,
  SharedIndicator,
  Stack,
  Sticky,
  Text,
  useFloatingObstacle,
} from "@buttery/core";
import { Button, MorphMenu, NavBar } from "@buttery/react";
import { setSetting } from "./location.ts";
import type { Settings } from "./location.ts";
import { pageGroups } from "./pages.tsx";

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
    <RadioGroup.Root
      className="pg-toggle"
      aria-label={label}
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
  );
}

function SettingsControls({
  settings,
}: {
  readonly settings: Settings;
}): ReactElement {
  return (
    <Stack gap={3} align="start">
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

function PageLinks({ current }: { readonly current: string }): ReactElement {
  return (
    <Stack gap={6}>
      {pageGroups.map((group) => (
        <Stack key={group.title} gap={1}>
          <Text variant="caption" className="pg-nav-group">
            {group.title}
          </Text>
          <SharedIndicator.Group>
            {group.pages.map((page) => (
              <SharedIndicator
                key={page.route}
                active={page.route === current}
                asChild
              >
                <Pressable asChild className="bt-hover-tint">
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
              </SharedIndicator>
            ))}
          </SharedIndicator.Group>
        </Stack>
      ))}
    </Stack>
  );
}

/** Splits `items` into columns of at most `size`, so a long group reads as a grid in its menu. */
function columns<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function DisplaySettings({
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
          className="pg-display"
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

interface ChromeProps {
  readonly current: string;
  readonly settings: Settings;
  readonly children: ReactNode;
}

/** The playground's shell: a nav bar with every page and the display settings, a page list, and the page. */
export function Chrome({
  current,
  settings,
  children,
}: ChromeProps): ReactElement {
  const obstacle = useFloatingObstacle();
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    nav.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [current]);

  return (
    <div className="pg-shell">
      <NavBar
        ref={obstacle}
        behavior="sticky"
        contained={false}
        label="Playground"
        className="pg-top"
        brand={<a href="#/tokens">🧈 buttery playground</a>}
        actions={<DisplaySettings settings={settings} />}
      >
        {pageGroups.map((group) => (
          <MorphMenu.Item key={group.title} label={group.title}>
            {columns(group.pages, 8).map((column) => (
              <MorphMenu.Column key={column[0]?.route}>
                {column.map((page) => (
                  <MorphMenu.Entry
                    key={page.route}
                    href={`#/${page.route}`}
                    title={page.title}
                    aria-current={page.route === current ? "page" : undefined}
                  />
                ))}
              </MorphMenu.Column>
            ))}
          </MorphMenu.Item>
        ))}
      </NavBar>
      <div className="pg-body">
        <Sticky variant="aside" className="pg-sidebar bt-scroll-fade">
          <nav ref={nav} aria-label="Pages">
            <PageLinks current={current} />
          </nav>
        </Sticky>
        <main className="pg-main">{children}</main>
      </div>
    </div>
  );
}
