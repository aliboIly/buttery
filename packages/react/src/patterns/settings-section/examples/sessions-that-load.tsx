import { Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { Button, SettingsSection } from "@buttery/react";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";

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
      action={<Button size="sm">Sign out everywhere else</Button>}
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

export const play: ExamplePlay = async ({ see }) => {
  await see("Portland, this browser");
};
