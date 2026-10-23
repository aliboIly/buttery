import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, ViewToggle } from "@butteryui/react";
import type { ViewMode } from "@butteryui/react";

/** The toggle disabled while the coffees load, since there's nothing to lay out yet, and back once they're in. */
export function WhileLoading(): ReactElement {
  const [view, setView] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);
  return (
    <Stack gap={3}>
      <Inline gap={3} align="center" justify="between">
        <Button
          size="sm"
          loading={loading}
          onClick={() => {
            setLoading(true);
          }}
        >
          Refresh
        </Button>
        <ViewToggle
          label="Show coffees as"
          value={view}
          onValueChange={setView}
          disabled={loading}
        />
      </Inline>
      <Text variant="body-sm" tone="secondary">
        {loading
          ? "Loading coffees"
          : `12 coffees as ${view === "grid" ? "cards" : "rows"}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Refresh");
  await see("Loading coffees");
  await see("12 coffees as cards");
  await press("radio", "List");
  await see("12 coffees as rows");
};
