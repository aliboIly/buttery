import type { ReactElement } from "react";

const DAYS = [0, 1, 2, 3, 4];

/** Next week's roasts on a little calendar: the announcement's picture. */
export function WeekPlan(): ReactElement {
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="Next week's roasts, filled in on a calendar"
    >
      <rect width="400" height="300" fill="var(--bt-bg-section)" />
      <rect
        x="32"
        y="40"
        width="336"
        height="220"
        rx="12"
        fill="var(--bt-bg-surface)"
      />
      {DAYS.map((day) => (
        <g key={day} transform={`translate(${String(52 + day * 62)} 64)`}>
          <rect width="48" height="8" rx="4" fill="var(--bt-skeleton-strong)" />
          <rect
            y="24"
            width="48"
            height={String(40 + ((day * 23) % 60))}
            rx="8"
            fill="var(--bt-accent-subtle)"
          />
          <rect
            y={String(72 + ((day * 23) % 60))}
            width="48"
            height="40"
            rx="8"
            fill="var(--bt-skeleton)"
          />
        </g>
      ))}
    </svg>
  );
}
