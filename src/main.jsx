import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import "./index.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Theme accentColor="iris" grayColor="slate" radius="large" scaling="95%">
      <App />
    </Theme>
  </React.StrictMode>
);
