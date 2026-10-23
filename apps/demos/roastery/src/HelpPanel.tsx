import { Menu, Stack, Text } from "@butteryui/core";
import {
  ArrowLink,
  Button,
  SidePanel,
  TextArea,
  toast,
} from "@butteryui/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { ARTICLES } from "./search.ts";

/** The help panel: popular articles, the one opened from search, and a question for support. */
export function HelpPanel({
  open,
  onOpenChange,
  article,
  onArticleChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly article: string | null;
  readonly onArticleChange: (article: string | null) => void;
}): ReactElement {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState<readonly string[]>([]);
  const shown = ARTICLES.find((entry) => entry.id === article);
  const ask = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const text = question.trim();
    if (text === "") return;
    setAsked((list) => [...list, text]);
    setQuestion("");
  };
  return (
    <SidePanel
      title="Help"
      open={open}
      onOpenChange={onOpenChange}
      menu={
        <>
          <Menu.Item
            onSelect={() => {
              toast("The help center opens in a new tab in the real app.");
            }}
          >
            Open the help center
          </Menu.Item>
          <Menu.Item
            onSelect={() => {
              toast("Support replies to rosa@halfmoon.example within a day.");
            }}
          >
            Email support
          </Menu.Item>
          <Menu.Item
            tone="danger"
            onSelect={() => {
              setAsked([]);
              onArticleChange(null);
            }}
          >
            Clear the conversation
          </Menu.Item>
        </>
      }
      footer={
        <form onSubmit={ask}>
          <Stack gap={2}>
            <TextArea
              label="Ask support"
              rows={2}
              value={question}
              onValueChange={setQuestion}
            />
            <Button type="submit" variant="primary" size="sm">
              Ask
            </Button>
          </Stack>
        </form>
      }
    >
      {shown === undefined ? (
        <Stack gap={3}>
          <Text variant="title-sm">Popular this week</Text>
          {ARTICLES.slice(0, 4).map((entry) => (
            <ArrowLink
              key={entry.id}
              href="#help"
              onClick={(event) => {
                event.preventDefault();
                onArticleChange(entry.id);
              }}
            >
              {entry.title}
            </ArrowLink>
          ))}
        </Stack>
      ) : (
        <Stack gap={3}>
          <div>
            <Button
              size="sm"
              variant="ghost"
              iconStart={ArrowLeft}
              onClick={() => {
                onArticleChange(null);
              }}
            >
              All help
            </Button>
          </div>
          <Text variant="title-sm">{shown.title}</Text>
          <Text variant="body-sm">{shown.body}</Text>
        </Stack>
      )}
      {asked.map((entry, index) => (
        <Stack key={`${entry}-${String(index)}`} gap={1}>
          <Text variant="label">{entry}</Text>
          <Text variant="body-sm">Support replies here within a day.</Text>
        </Stack>
      ))}
    </SidePanel>
  );
}
