import "@fontsource-variable/inter/index.css";
import "./main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("index.html needs a #root element.");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
