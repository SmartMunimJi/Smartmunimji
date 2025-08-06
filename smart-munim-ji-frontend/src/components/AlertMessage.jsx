// src/components/AlertMessage.js

import React from "react";
import "./AlertMessage.css"; // We created this CSS file in a previous step

/**
 * A reusable component to display feedback messages.
 * @param {object} props - Component props.
 * @param {string} props.message - The message text to display.
 * @param {'success' | 'error' | 'info'} props.type - The type of message, which determines its color.
 */
const AlertMessage = ({ message, type }) => {
  // If no message is provided, render nothing
  if (!message) {
    return null;
  }

  // Determine the CSS class based on the message type
  const alertClass = `alert-message alert-${type}`;

  return (
    <div className={alertClass} role="alert">
      {message}
    </div>
  );
};

export default AlertMessage;
