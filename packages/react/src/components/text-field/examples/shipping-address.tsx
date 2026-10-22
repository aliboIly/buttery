import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, TextField } from "@buttery/react";

/** A shipping address form: a field for each line, two side by side where they're short, checked on Save. */
export function ShippingAddress(): ReactElement {
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState("");
  const missing = (value: string): string | undefined =>
    tried && value.trim() === ""
      ? "Fill this in to ship the order."
      : undefined;
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setTried(true);
        if ([name, street, postcode].every((value) => value.trim() !== "")) {
          setSaved(`Shipping to ${name}, ${street}, ${postcode}`);
        }
      }}
    >
      <Stack gap={4}>
        <TextField
          label="Full name"
          autoComplete="name"
          value={name}
          onValueChange={setName}
          error={missing(name)}
        />
        <TextField
          label="Street"
          autoComplete="address-line1"
          value={street}
          onValueChange={setStreet}
          error={missing(street)}
        />
        <Grid columns={2} gap={3}>
          <TextField
            label="Postcode"
            autoComplete="postal-code"
            value={postcode}
            onValueChange={setPostcode}
            error={missing(postcode)}
          />
          <TextField
            label="City"
            hint="Optional"
            autoComplete="address-level2"
            value={city}
            onValueChange={setCity}
          />
        </Grid>
        <Inline gap={3}>
          <Button type="submit" variant="primary">
            Save address
          </Button>
          {saved === "" ? null : (
            <Text variant="body" tone="secondary" truncate>
              {saved}
            </Text>
          )}
        </Inline>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Full name", "Sam Rivera");
  await type("Street", "12 Mill Lane");
  await press("button", "Save address");
  await see("Fill this in to ship the order.");
  await type("Postcode", "40512");
  await press("button", "Save address");
  await see("Shipping to Sam Rivera, 12 Mill Lane, 40512");
};
