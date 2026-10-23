import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Dialog, TextField } from "@buttery/react";

interface Member {
  readonly name: string;
  readonly status: string;
}

/** A team list whose Invite button opens a short form; sending it adds the person to the list. */
export function InviteTeammate(): ReactElement {
  const [members, setMembers] = useState<readonly Member[]>([
    { name: "Ana Ruiz", status: "Head roaster" },
    { name: "Sam Okafor", status: "Shipping" },
  ]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const send = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const invitee = name.trim();
    if (invitee === "") {
      setError("Enter a name to send the invite.");
      return;
    }
    setMembers([...members, { name: invitee, status: "Invited" }]);
    setOpen(false);
  };
  return (
    <Stack gap={3}>
      <Inline gap={3} align="center" justify="between">
        <Text variant="title-sm">Team</Text>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (next) {
              setName("");
              setError(undefined);
            }
          }}
        >
          <Dialog.Trigger asChild>
            <Button variant="soft" size="sm">
              Invite someone
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <form onSubmit={send}>
              <Dialog.Text
                title="Invite a teammate"
                body="They get an email with a link to join the roastery."
              />
              <Dialog.Body>
                <TextField
                  label="Name"
                  value={name}
                  error={error}
                  onValueChange={(next) => {
                    setName(next);
                    setError(undefined);
                  }}
                />
              </Dialog.Body>
              <Dialog.Actions>
                <Dialog.Close asChild>
                  <Button variant="soft" size="cta" shape="rounded">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  variant="primary"
                  size="cta"
                  shape="rounded"
                >
                  Send invite
                </Button>
              </Dialog.Actions>
            </form>
          </Dialog.Content>
        </Dialog>
      </Inline>
      <Stack gap={2}>
        {members.map((member) => (
          <Inline key={member.name} gap={2} align="center" justify="between">
            <Text variant="label">{member.name}</Text>
            <Text variant="caption" tone="secondary">
              {member.status}
            </Text>
          </Inline>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Invite someone");
  await press("button", "Send invite");
  await see("Enter a name to send the invite.");
  await type("Name", "Priya Shah");
  await press("button", "Send invite");
  await see("Priya Shah");
};
