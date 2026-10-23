import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, LoadingPill } from "@buttery/react";

/** A refresh that takes a while: the pill appears only once it's been loading for 300ms, and goes when it's done. */
export function SlowRefresh(): ReactElement {
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
      setRefreshed(true);
    }, 1500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);
  return (
    <Stack gap={3} align="start">
      <Inline gap={3} align="center">
        <Button
          onClick={() => {
            setLoading(true);
          }}
        >
          Refresh
        </Button>
        <LoadingPill loading={loading} label="Refreshing orders" />
      </Inline>
      <Text variant="body-sm" tone="secondary">
        {refreshed ? "Orders updated just now" : "Orders updated an hour ago"}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Refresh");
  await see("Refreshing orders");
  await see("Orders updated just now");
};
