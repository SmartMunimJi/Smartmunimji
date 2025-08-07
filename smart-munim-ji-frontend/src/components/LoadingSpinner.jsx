// src/components/LoadingSpinner.jsx

import React from "react";
import "./LoadingSpinner.css"; // Make sure this CSS file exists and is populated

/**
 * A simple, reusable CSS spinner component.
 * It's displayed conditionally to indicate a loading state.
 */
const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
