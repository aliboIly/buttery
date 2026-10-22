import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SettingsSection, toast } from "@buttery/react";

/** A section that loads on its own while the rest of the page is ready. */
export function SessionsThatLoad(): ReactElement {
  const [sessions, setSessions] = useState<readonly string[] | undefined>(
    undefined,
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSessions(["Portland, this browser", "Seattle, 3 days ago"]);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <SettingsSection
      title="Sessions"
      description="Where you're signed in."
      action={
        <Button
          size="sm"
          aria-disabled={
            sessions === undefined || sessions.length < 2 || undefined
          }
          onClick={() => {
            const others = (sessions?.length ?? 1) - 1;
            setSessions(sessions?.slice(0, 1));
            toast(
              others === 1
                ? "Signed out of 1 other session."
                : `Signed out of ${String(others)} other sessions.`,
            );
          }}
        >
          Sign out everywhere else
        </Button>
      }
      loading={sessions === undefined}
    >
      {sessions?.map((session) => (
        <Text key={session} variant="body-sm">
          {session}
        </Text>
      ))}
    </SettingsSection>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Seattle, 3 days ago");
  await press("button", "Sign out everywhere else");
  await see("Signed out of 1 other session.");
};
