// src/components/LoadingSpinner.jsx

import React from "react";
import styled, { keyframes } from "styled-components";

// --- Styled Components ---

// Define the spin animation using keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled container for centering the spinner
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}; /* Use theme spacing */
  width: 100%;
  height: 100%; /* Ensure it takes full height of parent if used for full-page loading */
`;

// Styled spinner element
const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid ${({ theme }) => theme.colors.accent}; /* Light background part of spinner */
  border-top: 5px solid ${({ theme }) => theme.colors.primary}; /* Primary color for spinning part */
  border-radius: 50%;
  animation: ${spin} 1s linear infinite; /* Apply the animation */
`;

// --- Component Logic ---

const LoadingSpinner = () => {
  return (
    <SpinnerContainer>
      <Spinner />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
