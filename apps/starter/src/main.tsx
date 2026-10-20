import "@buttery/core/styles.css";
import "@buttery/react/styles.css";
import "./main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ButteryProvider } from "@buttery/react";
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
