import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { MetricCard } from "@butteryui/react";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";

const DAYS = [
  "Oct 8",
  "Oct 9",
  "Oct 10",
  "Oct 11",
  "Oct 12",
  "Oct 13",
  "Oct 14",
];

/** A metric whose numbers arrive after a moment: its skeleton holds every part in place until then. */
export function MetricThatLoads(): ReactElement {
  const [values, setValues] = useState<readonly number[] | undefined>(
    undefined,
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setValues([18, 21, 19, 24, 27, 31, 29]);
    }, 1500);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <MetricCard
      title="Bags roasted"
      value={values === undefined ? undefined : "169"}
      delta={0.082}
      labels={DAYS}
      series={[{ key: "bags", label: "Bags", values: values ?? [] }]}
      updated="Updated just now"
      href="#roastery"
      loading={values === undefined}
    />
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ see }) => {
  await see("169");
};
