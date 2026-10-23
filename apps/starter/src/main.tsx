import "@butteryui/core/styles.css";
import "@butteryui/react/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ButteryProvider } from "@butteryui/react";
import { App } from "./App.tsx";

const container = document.getElementById("root");
if (!container) throw new Error("index.html needs a #root element.");

createRoot(container).render(
  <StrictMode>
    <ButteryProvider>
      <App />
    </ButteryProvider>
  </StrictMode>,
);
