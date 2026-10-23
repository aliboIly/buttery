import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, FormDialog, TextField } from "@butteryui/react";

/** The two widths: "sm" (400px, the default) for a value or two, and "md" (560px) for fields side by side. */
export function Sizes(): ReactElement {
  const [email, setEmail] = useState("orders@halfmoon.example");
  const [draftEmail, setDraftEmail] = useState(email);
  const [address, setAddress] = useState({
    street: "12 Harbor Street",
    town: "Portside",
  });
  const [street, setStreet] = useState(address.street);
  const [town, setTown] = useState(address.town);
  return (
    <Stack gap={3} align="start">
      <Inline gap={2} wrap>
        <FormDialog
          trigger={<Button>Change the email</Button>}
          onOpenChange={(open) => {
            if (open) setDraftEmail(email);
          }}
          title="Change the order email"
          valid={draftEmail.includes("@")}
          onSubmit={() => {
            setEmail(draftEmail);
          }}
          submitLabel="Save email"
        >
          <TextField
            label="Order email"
            type="email"
            value={draftEmail}
            onValueChange={setDraftEmail}
          />
        </FormDialog>
        <FormDialog
          size="md"
          trigger={<Button>Edit the address</Button>}
          onOpenChange={(open) => {
            if (!open) return;
            setStreet(address.street);
            setTown(address.town);
          }}
          title="Edit the delivery address"
          valid={street.trim() !== "" && town.trim() !== ""}
          onSubmit={() => {
            setAddress({ street: street.trim(), town: town.trim() });
          }}
          submitLabel="Save address"
        >
          <Grid columns={2} gap={3}>
            <TextField
              label="Street"
              value={street}
              onValueChange={setStreet}
            />
            <TextField label="Town" value={town} onValueChange={setTown} />
          </Grid>
        </FormDialog>
      </Inline>
      <Stack gap={2}>
        <Text variant="caption">{`Order email: ${email}`}</Text>
        <Text variant="caption">{`Ships to ${address.street}, ${address.town}`}</Text>
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Edit the address");
  await type("Town", " East");
  await press("button", "Save address");
  await see("Ships to 12 Harbor Street, Portside East");
};
