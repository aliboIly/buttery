import { Bell, MapPin, Repeat } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import {
  Accordion,
  ArrowLink,
  SegmentedControl,
  Switch,
} from "@butteryui/react";

const EVERY = ["1 week", "2 weeks", "4 weeks"] as const;

type Every = (typeof EVERY)[number];

function isEvery(value: string): value is Every {
  return EVERY.some((every) => every === value);
}

/** A customer's account in parts that open several at once, each with the controls that change it. */
export function AccountSections(): ReactElement {
  const [every, setEvery] = useState<Every>("2 weeks");
  const [roastDay, setRoastDay] = useState(true);
  return (
    <Accordion
      type="multiple"
      variant="contained"
      defaultValue={["subscription"]}
    >
      <Accordion.Item
        value="subscription"
        icon={Repeat}
        title="Subscription"
        description={`Huila, every ${every}`}
      >
        <Stack gap={3} align="start">
          <SegmentedControl
            label="Delivered every"
            options={EVERY}
            value={every}
            onValueChange={(next) => {
              if (isEvery(next)) setEvery(next);
            }}
          />
          <Text variant="body-sm">
            Your next bag roasts on Thursday morning.
          </Text>
        </Stack>
      </Accordion.Item>
      <Accordion.Item
        value="address"
        icon={MapPin}
        title="Shipping address"
        description="2210 SE Ankeny St, Portland"
      >
        <Stack gap={3} align="start">
          <Text variant="body-sm">
            Ines Vale, 2210 SE Ankeny St, Apt 4, Portland, OR 97214
          </Text>
          <ArrowLink href="#address">Change the address</ArrowLink>
        </Stack>
      </Accordion.Item>
      <Accordion.Item
        value="emails"
        icon={Bell}
        title="Emails"
        description={roastDay ? "On roast days" : "None"}
      >
        <Switch
          label="Tell me when my coffee roasts"
          checked={roastDay}
          onCheckedChange={setRoastDay}
        />
      </Accordion.Item>
    </Accordion>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "4 weeks");
  await see("Huila, every 4 weeks");
  await press("button", /^Emails/);
  await press("switch", "Tell me when my coffee roasts");
  await see("None");
};
