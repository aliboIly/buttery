import { useState } from "react";
import type { ReactElement } from "react";
import { Sidebar } from "@buttery/react";
import { House, Receipt } from "lucide-react";

/** A router takes over every item through onNavigate; the current page follows what it shows. */
export function RouterNav(): ReactElement {
  const [path, setPath] = useState("/");
  return (
    <Sidebar
      label="Main"
      onNavigate={(href, event) => {
        event.preventDefault();
        setPath(href);
      }}
    >
      <Sidebar.Item icon={House} label="Home" href="/" current={path === "/"} />
      <Sidebar.Item
        icon={Receipt}
        label="Orders"
        href="/orders"
        current={path === "/orders"}
      />
    </Sidebar>
  );
}
