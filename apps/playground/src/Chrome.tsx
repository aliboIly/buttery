import type { ReactElement, ReactNode } from "react";
import { setSetting } from "./location.ts";
import type { Settings } from "./location.ts";
import { pages } from "./pages.tsx";

interface ChromeProps {
  readonly current: string;
  readonly settings: Settings;
  readonly children: ReactNode;
}

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
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === value}
          className="pg-toggle-option bt-text bt-press"
          data-role="control"
          onClick={() => {
            onChange(option);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function Chrome({
  current,
  settings,
  children,
}: ChromeProps): ReactElement {
  return (
    <div className="pg-chrome">
      <header className="pg-bar bt-surface" data-level="card">
        <span className="bt-text" data-role="title-sm">
          🧈 buttery playground
        </span>
        <nav className="pg-nav" aria-label="Pages">
          {pages.map((page) => (
            <a
              key={page.route}
              href={`#/${page.route}`}
              className="pg-nav-link bt-text"
              data-role="control"
              aria-current={page.route === current ? "page" : undefined}
            >
              {page.title}
            </a>
          ))}
        </nav>
        <div className="pg-settings">
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
        </div>
      </header>
      <main className="pg-main">{children}</main>
    </div>
  );
}
