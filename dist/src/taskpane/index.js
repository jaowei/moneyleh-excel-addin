import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
/* global document, Office, module, require, HTMLElement */
const title = "Contoso Task Pane Add-in";
const rootElement = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;
/* Render application after Office initializes */
Office.onReady(() => {
    root?.render(React.createElement(FluentProvider, { theme: webLightTheme },
        React.createElement(App, { title: title })));
});
if (module.hot) {
    module.hot.accept("./components/App", () => {
        const NextApp = require("./components/App").default;
        root?.render(NextApp);
    });
}
//# sourceMappingURL=index.js.map