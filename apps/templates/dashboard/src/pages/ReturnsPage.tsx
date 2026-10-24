import type { ReactElement } from "react";
import { AppPage, Button, EmptyState, PageHeader } from "@butteryui/react";
import { RotateCcw } from "lucide-react";
import { useLink } from "../router.tsx";

/** Returns, before there are any: what will show here, and where to say how returns work. */
export function ReturnsPage(): ReactElement {
  const link = useLink();
  return (
    <AppPage
      header={
        <PageHeader
          title="Returns"
          description="What customers send back, and the refunds for it."
        />
      }
    >
      <AppPage.Section>
        <EmptyState
          icon={RotateCcw}
          title="No returns yet"
          description="When a customer sends something back, it shows up here with its refund."
          actions={
            <Button asChild>
              <a href={link("/settings/shop")}>Set up the shop</a>
            </Button>
          }
        />
      </AppPage.Section>
    </AppPage>
  );
}
