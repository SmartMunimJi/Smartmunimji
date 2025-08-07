// src/components/AlertMessage.jsx

import React from "react";
import "./AlertMessage.css";

/**
 * A reusable component to display feedback messages (e.g., success, error).
 * @param {object} props - Component props.
 * @param {string} props.message - The text content of the alert.
 * @param {'success' | 'error' | 'info'} props.type - The type of alert, which determines its styling.
 */
const AlertMessage = ({ message, type }) => {
  // If no message is provided, the component renders nothing.
  if (!message) {
    return null;
  }

  // Dynamically determines the CSS class based on the 'type' prop.
  // Defaults to 'info' if the type is invalid.
  const alertClass = `alert-message alert-${type || "info"}`;

  return (
    <div className={alertClass} role="alert">
      {message}
    </div>
  );
};

export default AlertMessage;
