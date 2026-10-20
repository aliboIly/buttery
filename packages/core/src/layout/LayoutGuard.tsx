import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Layer } from "../layers/layer/Layer.tsx";
import { runLayoutChecks } from "./checks.ts";
import type { LayoutRule, LayoutViolation } from "./checks.ts";
import { layoutCheckTokens } from "./tokens.ts";

interface Mark {
  readonly key: string;
  readonly violation: LayoutViolation;
  readonly rect: DOMRect;
}

const GUARD_RULES: readonly LayoutRule[] = ["overlap", "overflow", "scale"];

function isInsideGuard(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement;
  return (
    element?.closest('[data-bt="LayoutGuard"], [data-bt-layer="dev"]') !== null
  );
}

function report(violations: readonly LayoutViolation[]): void {
  if (violations.length === 0) return;
  const noun = violations.length === 1 ? "problem" : "problems";
  console.groupCollapsed(
    `[buttery:LayoutGuard] ${String(violations.length)} layout ${noun}. ⌥⇧L hides the outlines.`,
  );
  for (const violation of violations) console.warn(JSON.stringify(violation));
  console.groupEnd();
}

export interface LayoutGuardProps {
  /** Show outlines when it mounts. Defaults to `true`; ⌥⇧L toggles them. */
  readonly defaultVisible?: boolean | undefined;
}

/**
 * The development overlay that keeps layouts honest. It re-checks overlap, overflow and off-scale spacing
 * whenever the page changes, outlines offenders in red with a label, and logs each new set of problems to
 * the console in the same JSON format `expectButtery` uses. ⌥⇧L toggles the outlines and ⌥⇧G a 12-column
 * page grid. `ButteryProvider` mounts it in development builds.
 *
 * @example
 * <ButteryProvider>
 *   <App />
 * </ButteryProvider>
 */
export function LayoutGuard({
  defaultVisible = true,
}: LayoutGuardProps): ReactElement | null {
  const [visible, setVisible] = useState(defaultVisible);
  const [showGrid, setShowGrid] = useState(false);
  const [marks, setMarks] = useState<readonly Mark[]>([]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!event.altKey || !event.shiftKey) return;
      if (event.code === "KeyL") {
        event.preventDefault();
        setVisible((current) => !current);
      } else if (event.code === "KeyG") {
        event.preventDefault();
        setShowGrid((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const tokens = layoutCheckTokens();
    let timer = 0;
    let lastReport = "";
    const observer = new MutationObserver((records) => {
      if (records.every((record) => isInsideGuard(record.target))) return;
      schedule();
    });
    const run = (): void => {
      const violations = runLayoutChecks({ tokens, rules: GUARD_RULES });
      observer.takeRecords();
      const serialized = JSON.stringify(violations);
      if (serialized !== lastReport) {
        lastReport = serialized;
        report(violations);
      }
      setMarks(
        violations.flatMap((violation, index) => {
          const element = document.querySelector(violation.a);
          return element
            ? [
                {
                  key: `${String(index)}:${violation.a}`,
                  violation,
                  rect: element.getBoundingClientRect(),
                },
              ]
            : [];
        }),
      );
    };
    function schedule(): void {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 300);
    }
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [visible]);

  if (!visible && !showGrid) return null;
  return (
    <Layer band="dev">
      <div data-bt="LayoutGuard" aria-hidden="true">
        {showGrid ? (
          <div data-bt-part="grid">
            {Array.from({ length: 12 }, (_, index) => (
              <span key={index} data-bt-part="column" />
            ))}
          </div>
        ) : null}
        {visible
          ? marks.map(({ key, violation, rect }) => (
              <div
                key={key}
                data-bt-part="mark"
                style={{
                  insetInlineStart: `${String(rect.left)}px`,
                  insetBlockStart: `${String(rect.top)}px`,
                  inlineSize: `${String(rect.width)}px`,
                  blockSize: `${String(rect.height)}px`,
                }}
              >
                <span data-bt-part="label">
                  {violation.rule}: {violation.message}
                </span>
              </div>
            ))
          : null}
      </div>
    </Layer>
  );
}
