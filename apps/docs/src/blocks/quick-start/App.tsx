import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Inline, Stack, Surface, Text } from "@buttery/core";
import { Button, Switch, toast } from "@buttery/react";

export function App(): ReactElement {
  const [emails, setEmails] = useState(true);
  return (
    <Center>
      <Surface level="card" pad={6}>
        <Stack gap={5}>
          <Stack gap={2}>
            <Text variant="title-md" asChild>
              <h1>Order emails</h1>
            </Text>
            <Text variant="body-sm" tone="secondary">
              Tell customers when their coffee ships.
            </Text>
          </Stack>
          <Switch
            label="Send an email when an order ships"
            checked={emails}
            onCheckedChange={setEmails}
          />
          <Inline gap={2} justify="end">
            <Button
              variant="primary"
              onClick={() => {
                toast("Saved");
              }}
            >
              Save
            </Button>
          </Inline>
        </Stack>
      </Surface>
    </Center>
  );
}
