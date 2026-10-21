import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { AreaChart } from "@buttery/react";

/** Revenue that loads after a moment: a pill shows in the chart's box until the values arrive. */
export function RevenueWhileLoading(): ReactElement {
  const [values, setValues] = useState<readonly number[] | undefined>(
    undefined,
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setValues([9400, 9850, 10300, 10100, 10750, 11200]);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <AreaChart
      label="Subscription revenue"
      labels={["May", "Jun", "Jul", "Aug", "Sep", "Oct"]}
      series={[{ key: "revenue", label: "Revenue", values: values ?? [] }]}
      loading={values === undefined}
      size="sm"
    />
  );
}
