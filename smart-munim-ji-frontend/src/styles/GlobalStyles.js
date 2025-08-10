// src/styles/GlobalStyles.js

import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  /* 1. CSS Reset & Base Defaults */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 100%; /* Ensures 1rem = 16px by default */
    height: 100%;
    scroll-behavior: smooth;
  }

  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.primary};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased; /* Smoother fonts on macOS/iOS */
    -moz-osx-font-smoothing: grayscale; /* Smoother fonts on macOS/iOS */
    min-height: 100vh; /* Ensure body takes at least full viewport height */
    display: flex;
    flex-direction: column; /* Allows footer to stick to bottom if content is short */
  }

  /* 2. Typography Styles (using theme.js values) */
  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h1 { font-size: ${({ theme }) => theme.fontSizes.xxlarge}; }
  h2 { font-size: ${({ theme }) => theme.fontSizes.xlarge}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes.large}; }
  h4 { font-size: ${({ theme }) =>
    theme.fontSizes.medium}; } /* Added for better hierarchy */
  h5 { font-size: ${({ theme }) => theme.fontSizes.small}; }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease-in-out;

    &:hover {
      text-decoration: underline;
      color: ${({ theme }) => theme.colors.primaryLight};
    }
  }

  /* 3. Base Button Styling (using theme.js values) */
  button {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    border: none;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    border-radius: ${({ theme }) => theme.radii.sm};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.medium};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  }

  button:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    opacity: 1; /* Ensure full opacity on hover for clarity */
  }

  button:disabled,
  button[disabled] {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* 4. Base Form & Input Styling (using theme.js values) */
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="tel"],
  input[type="date"],
  textarea,
  select {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) =>
      theme.spacing.xs}; /* Reduced margin for error text */
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
    box-sizing: border-box; /* Include padding in width */
    font-size: ${({ theme }) => theme.fontSizes.medium};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.surface};
    transition: border-color 0.2s ease-in-out;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(${({ theme }) =>
      theme.colors.primary
        .slice(1)
        .match(/.{2}/g)
        .map((h) => parseInt(h, 16))
        .join(", ")}, 0.2); /* Subtle focus ring */
  }

  /* Input validation error styles (can be applied via props in styled-components too) */
  .input-error { /* Used when passing prop $hasError={true} to styled input */
    border-color: ${({ theme }) => theme.colors.error} !important;
  }

  .error-message { /* Used when rendering error text below input */
    color: ${({ theme }) => theme.colors.error};
    font-size: ${({ theme }) => theme.fontSizes.small};
    margin-top: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) =>
      theme.spacing.md}; /* Space after error message */
  }

  /* 5. Utility & Layout Classes (Global) */
  .container {
    max-width: ${({ theme }) => theme.breakpoints.largeDesktop};
    margin: ${({ theme }) =>
      theme.spacing.xl} auto; /* Top/Bottom margin, auto left/right */
    padding: 0 ${({ theme }) =>
      theme.spacing.lg}; /* Padding for smaller screens */

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      padding: 0 ${({ theme }) =>
        theme.spacing.md}; /* Smaller padding on very small screens */
      margin: ${({ theme }) =>
        theme.spacing.lg} auto; /* Adjust top/bottom margin for mobile */
    }
  }

  .card {
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: ${({ theme }) => theme.shadows.card};
    padding: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  /* 6. Table Styling (Global, for any native tables before full styled-component refactor) */
  .table-container {
    overflow-x: auto; /* Enables horizontal scroll on smaller screens */
    width: 100%;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px; /* Ensure tables don't get too squished */
  }

  table th, table td {
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    white-space: nowrap; /* Prevent text wrapping in table cells by default */
  }

  table th {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-transform: uppercase;
    font-size: ${({ theme }) => theme.fontSizes.small};
  }

  /* Alternating row colors for readability */
  table tbody tr:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  table tbody tr:hover {
    background-color: ${({ theme }) =>
      theme.colors.accent}; /* Light purple on hover */
  }

  /* 7. Alert Message Global Styles (used by AlertMessage.jsx) */
  .alert-message {
    padding: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.radii.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    border: 1px solid transparent;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }

  .alert-success {
    background-color: rgba(${({ theme }) =>
      theme.colors.success
        .slice(1)
        .match(/.{2}/g)
        .map((h) => parseInt(h, 16))
        .join(", ")}, 0.15);
    border-color: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.success};
  }

  .alert-error {
    background-color: rgba(${({ theme }) =>
      theme.colors.error
        .slice(1)
        .match(/.{2}/g)
        .map((h) => parseInt(h, 16))
        .join(", ")}, 0.15);
    border-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.error};
  }

  .alert-info {
    background-color: rgba(${({ theme }) =>
      theme.colors.primary
        .slice(1)
        .match(/.{2}/g)
        .map((h) => parseInt(h, 16))
        .join(", ")}, 0.1);
    border-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  }
`;
