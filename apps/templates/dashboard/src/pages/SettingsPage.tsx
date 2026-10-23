import { useState } from "react";
import type { ReactElement } from "react";
import {
  Button,
  SettingRow,
  SettingsPage as SettingsLayout,
  SettingsSection,
  TextField,
  toast,
} from "@buttery/react";

/** The shop's settings: its details, saved as a form, and the emails it sends, each turned on or off. */
export function SettingsPage(): ReactElement {
  const [saved, setSaved] = useState({
    name: "My shop",
    email: "hello@shop.example",
  });
  const [name, setName] = useState(saved.name);
  const [email, setEmail] = useState(saved.email);
  const [orderEmails, setOrderEmails] = useState(true);
  return (
    <SettingsLayout
      title="Settings"
      description="The shop's details, and the emails it sends."
    >
      <SettingsSection
        title="Shop details"
        description="Customers see these on receipts."
        dirty={name !== saved.name || email !== saved.email}
        onSave={() => {
          setSaved({ name, email });
          toast.success("The shop's details are saved.");
        }}
        onCancel={() => {
          setName(saved.name);
          setEmail(saved.email);
        }}
      >
        <TextField label="Shop name" value={name} onValueChange={setName} />
        <TextField
          label="Contact email"
          type="email"
          value={email}
          onValueChange={setEmail}
        />
      </SettingsSection>
      <SettingsSection
        title="Notifications"
        description="What the shop emails you about."
        divider
      >
        <SettingRow
          title="New orders"
          state={
            orderEmails ? "An email for every new order." : "Off. No emails."
          }
          action={
            <Button
              size="sm"
              variant={orderEmails ? "soft" : "primary"}
              onClick={() => {
                setOrderEmails((on) => !on);
              }}
            >
              {orderEmails ? "Turn off" : "Turn on"}
            </Button>
          }
        />
      </SettingsSection>
    </SettingsLayout>
  );
}
