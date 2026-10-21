import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { Button, LoadingPill } from "@buttery/react";

/** A refresh that takes a while: the pill appears only once it's been loading for 300ms. */
export function SlowRefresh(): ReactElement {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);
  return (
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
  );
}
