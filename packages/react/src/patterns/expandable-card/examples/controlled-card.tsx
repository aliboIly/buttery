import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Stack, Text } from "@buttery/core";
import { Bento, Button, ExpandableCard } from "@buttery/react";

/** A card opened from elsewhere on the page too. */
export function ControlledCard(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={4}>
      <Button
        variant="soft"
        onClick={() => {
          setOpen(true);
        }}
      >
        Read about sizes
      </Button>
      <Bento>
        <ExpandableCard
          title="Any size"
          open={open}
          onOpenChange={setOpen}
          detail={<Text variant="body-lg">Square, wide or tall.</Text>}
        >
          <Center style={{ blockSize: "100%" }}>
            <Text variant="title">16:9</Text>
          </Center>
        </ExpandableCard>
      </Bento>
    </Stack>
  );
}
