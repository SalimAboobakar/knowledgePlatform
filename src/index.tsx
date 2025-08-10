import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Prevent extension errors from appearing in console
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMessage = args.join(" ");
  if (
    errorMessage.includes("chrome-extension") ||
    errorMessage.includes("quillbot") ||
    errorMessage.includes("net::ERR_FAILED") ||
    errorMessage.includes("Content Security Policy") ||
    errorMessage.includes("Failed to fetch this Firebase app")
  ) {
    return; // Don't log extension and Firebase CSP errors
  }
  originalConsoleError.apply(console, args);
};

// Prevent unhandled promise rejections from extensions
window.addEventListener("unhandledrejection", (event) => {
  const errorMessage = event.reason?.toString() || "";
  if (
    errorMessage.includes("chrome-extension") ||
    errorMessage.includes("quillbot") ||
    errorMessage.includes("net::ERR_FAILED") ||
    errorMessage.includes("Content Security Policy") ||
    errorMessage.includes("Failed to fetch this Firebase app")
  ) {
    event.preventDefault();
    return false;
  }
});

// Prevent general errors from extensions
window.addEventListener("error", (event) => {
  const errorMessage = event.message || "";
  const filename = event.filename || "";
  if (
    filename.includes("chrome-extension") ||
    filename.includes("quillbot") ||
    errorMessage.includes("net::ERR_FAILED") ||
    errorMessage.includes("Content Security Policy") ||
    errorMessage.includes("Failed to fetch this Firebase app")
  ) {
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
