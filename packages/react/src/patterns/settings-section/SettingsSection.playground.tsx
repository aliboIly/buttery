import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, SettingsSection, TextField } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "patterns",
  title: "SettingsSection",
  description:
    "A settings page's section: a heading, one line, one action, then its content.",
  order: 31,
  status: "new",
  since: "0.7.0",
};

function AddressForm(): ReactElement {
  const [saved, setSaved] = useState("12 Mill Street, Portland");
  const [address, setAddress] = useState(saved);
  return (
    <SettingsSection
      title="Pickup address"
      description="Where customers collect their orders."
      dirty={address !== saved}
      onSave={() => {
        setSaved(address);
      }}
      onCancel={() => {
        setAddress(saved);
      }}
    >
      <TextField label="Address" value={address} onValueChange={setAddress} />
    </SettingsSection>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "With one action",
    description: "Its action sits at the end of the heading's row.",
    render: () => (
      <SettingsSection
        title="Passkeys"
        description="Sign in with your fingerprint or a security key."
        action={<Button size="sm">Add a passkey</Button>}
      >
        <p className="bt-text" data-role="body-sm">
          No passkeys yet.
        </p>
      </SettingsSection>
    ),
  },
  {
    title: "A form",
    description: "Save and Cancel stay disabled until something changes.",
    render: () => <AddressForm />,
  },
  {
    title: "Loading on its own",
    description: "A pill in the section's place while its data arrives.",
    render: () => (
      <SettingsSection
        title="Sessions"
        description="Where you're signed in."
        loading
      />
    ),
  },
];
