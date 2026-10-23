import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import { Button, Faq, Section } from "@buttery/react";
import { Mail } from "lucide-react";
import { ADDRESS, QUESTIONS, QUESTION_GROUPS } from "./data.ts";

/**
 * The questions customers ask, in three topics with a search across them, beside a way to ask another. Each
 * question's id is an anchor, so a link to `#returns` opens that answer.
 */
export function Questions({
  open,
  onOpenChange,
}: {
  /** The questions that are open, by id. */
  readonly open: readonly string[];
  readonly onOpenChange: (open: readonly string[]) => void;
}): ReactElement {
  return (
    <Section id="questions" tone="muted">
      <Faq
        title="Questions, answered"
        intro="What people ask us most, from shipping to storing a bag."
        layout="split"
        variant="cards"
        search
        groups={QUESTION_GROUPS}
        questions={QUESTIONS}
        value={open}
        onValueChange={onOpenChange}
        contact={
          <Stack gap={4}>
            <Faq.Contact
              title="Still wondering about something?"
              description="Write to hello@halfmoon.example and Rosa or Theo will answer within a day, Monday to Friday."
              actions={
                <Button variant="soft" iconStart={Mail} asChild>
                  <a href="mailto:hello@halfmoon.example">Email the roastery</a>
                </Button>
              }
            />
            <Surface level="card" pad={6}>
              <Stack gap={3}>
                <Text variant="title" asChild>
                  <h3>Come by the counter</h3>
                </Text>
                <Text variant="body-sm" tone="secondary">
                  {`We're at ${ADDRESS} in Portland, Tuesday to Saturday from 8 to 2. Buy a bag, taste what came out of the roaster that morning and say hello.`}
                </Text>
              </Stack>
            </Surface>
          </Stack>
        }
      />
    </Section>
  );
}
