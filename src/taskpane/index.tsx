import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./index.css";

/* global document, Office, module, require, HTMLElement */

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Render application after Office initializes */
Office.onReady(() => {
  root?.render(<App />);
});
