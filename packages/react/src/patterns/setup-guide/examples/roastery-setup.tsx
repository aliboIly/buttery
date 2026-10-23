import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SetupGuide } from "@butteryui/react";

/** A new roastery's setup, two of three tasks done, floating at the window's bottom end once it's shown. */
export function RoasterySetup(): ReactElement {
  const [shown, setShown] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setShown(!shown);
        }}
      >
        {shown ? "Hide the setup guide" : "Show the setup guide"}
      </Button>
      {shown ? (
        <SetupGuide
          title="Get your shop ready"
          tasks={[
            { id: "coffee", title: "Add your first coffee", done: true },
            { id: "shipping", title: "Set shipping rates", done: true },
            {
              id: "bank",
              title: "Connect your bank",
              description: "Where payouts go every Friday.",
              action: { label: "Connect", href: "#settings-payouts" },
            },
          ]}
          onDismiss={() => {
            setShown(false);
          }}
        />
      ) : null}
    </>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Show the setup guide");
  await see("Get your shop ready");
  await press("button", "Show all steps");
  await see("Where payouts go every Friday.");
};
