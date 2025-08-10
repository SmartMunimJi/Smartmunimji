// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // Ensure this path correctly points to App.jsx

// Find the root HTML element where the React app will be mounted
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the main App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
