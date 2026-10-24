import { useState } from "react";
import type { ReactElement } from "react";
import {
  Breadcrumbs,
  Button,
  SettingRow,
  SettingsPage,
  SettingsSection,
  TextField,
  toast,
} from "@butteryui/react";
import { useLink } from "../router.tsx";

/** The shop's details, saved as a form, and the emails it sends, each turned on or off, under Settings. */
export function ShopSettingsPage(): ReactElement {
  const link = useLink();
  const [saved, setSaved] = useState({
    name: "My shop",
    email: "hello@shop.example",
  });
  const [name, setName] = useState(saved.name);
  const [email, setEmail] = useState(saved.email);
  const [orderEmails, setOrderEmails] = useState(true);
  return (
    <SettingsPage
      title="Shop details"
      breadcrumbs={
        <Breadcrumbs items={[{ label: "Settings", href: link("/settings") }]} />
      }
      description="The shop's name and email, and what it emails you about."
    >
      <SettingsSection
        title="Name and email"
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
    </SettingsPage>
  );
}
