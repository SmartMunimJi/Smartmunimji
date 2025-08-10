// src/components/AlertMessage.jsx

import React from "react";
import styled from "styled-components";

// --- Styled Components for AlertMessage ---

const StyledAlert = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
  border: 1px solid transparent; /* Default border */
  width: 100%;
  box-sizing: border-box; /* Include padding in width */

  /* Conditional styling based on 'type' prop */
  background-color: ${(props) => {
    switch (props.$type) {
      case "success":
        return (
          props.theme.colors.success + "20"
        ); /* Light background for success */
      case "error":
        return props.theme.colors.error + "20"; /* Light background for error */
      case "info":
        return props.theme.colors.accent + "20"; /* Light background for info */
      default:
        return props.theme.colors.background;
    }
  }};

  color: ${(props) => {
    switch (props.$type) {
      case "success":
        return props.theme.colors.success;
      case "error":
        return props.theme.colors.error;
      case "info":
        return props.theme.colors.primary;
      default:
        return props.theme.colors.text;
    }
  }};

  border-color: ${(props) => {
    switch (props.$type) {
      case "success":
        return props.theme.colors.success;
      case "error":
        return props.theme.colors.error;
      case "info":
        return props.theme.colors.primary;
      default:
        return props.theme.colors.border;
    }
  }};
`;

/**
 * A reusable component to display feedback messages (success, error, info).
 * It now uses styled-components for consistent theming.
 *
 * @param {object} props - Component props.
 * @param {string} props.message - The message text to display.
 * @param {'success' | 'error' | 'info'} props.type - The type of message (determines color/style).
 */
const AlertMessage = ({ message, type }) => {
  // If no message is provided, render nothing
  if (!message) {
    return null;
  }

  return (
    // Pass the type prop to the styled component with a dollar sign prefix
    // to prevent it from being passed to the underlying DOM element directly.
    <StyledAlert $type={type} role="alert">
      {message}
    </StyledAlert>
  );
};

export default AlertMessage;
