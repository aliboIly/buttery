import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Switch, toast } from "@buttery/react";

type Save = "idle" | "succeeding" | "failing";

/** A pretend save that confirms with a success toast, or, with Fail the next save on, explains the failure with a danger one under the same id. */
export function SaveResultToast(): ReactElement {
  const [save, setSave] = useState<Save>("idle");
  const [failNext, setFailNext] = useState(false);

  useEffect(() => {
    if (save === "idle") return undefined;
    const timer = window.setTimeout(() => {
      setSave("idle");
      if (save === "failing") {
        setFailNext(false);
        toast.danger("Couldn't save the theme", { id: "save" });
      } else {
        toast.success("Theme saved", { id: "save" });
      }
    }, 600);
    return () => {
      window.clearTimeout(timer);
    };
  }, [save]);

  return (
    <Inline gap={3} align="center" wrap>
      <Button
        loading={save !== "idle"}
        onClick={() => {
          setSave(failNext ? "failing" : "succeeding");
        }}
      >
        Save theme
      </Button>
      <Switch
        label="Fail the next save"
        checked={failNext}
        onCheckedChange={setFailNext}
      />
    </Inline>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("button", "Save theme");
  await see("Theme saved");
  await press("switch", "Fail the next save");
  await press("button", "Save theme");
  await see("Couldn't save the theme");
  await key("F8");
  await key("Escape");
};
