// src/pages/NotFoundPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components"; // Import styled-components

// --- Styled Components ---
const NotFoundContainer = styled.div`
  text-align: center;
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing.xxl} auto; /* Use theme for margin */
  padding: ${({ theme }) => theme.spacing.xl}; /* Use theme for padding */
  background: ${({ theme }) =>
    theme.colors.surface}; /* Use theme for background */
  border-radius: ${({ theme }) =>
    theme.radii.md}; /* Use theme for border-radius */
  box-shadow: ${({ theme }) =>
    theme.shadows.card}; /* Use theme for box-shadow */
`;

const StatusCode = styled.h1`
  font-size: 6em; /* Large font size for impact */
  margin: 0;
  color: ${({ theme }) => theme.colors.primary}; /* Use theme for color */
`;

const PageTitle = styled.h2`
  margin-top: 0;
  color: ${({ theme }) => theme.colors.text}; /* Use theme for color */
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary}; /* Use theme for color */
  font-size: ${({ theme }) =>
    theme.fontSizes.large}; /* Use theme for font size */
  margin-bottom: ${({ theme }) => theme.spacing.lg}; /* Use theme for margin */
`;

const HomeButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl}; /* Use theme for padding */
  background-color: ${({ theme }) =>
    theme.colors.primary}; /* Use theme for background */
  color: ${({ theme }) => theme.colors.surface}; /* Use theme for text color */
  border: none;
  border-radius: ${({ theme }) =>
    theme.radii.sm}; /* Use theme for border-radius */
  font-size: ${({ theme }) =>
    theme.fontSizes.medium}; /* Use theme for font size */
  font-weight: ${({ theme }) =>
    theme.fontWeights.bold}; /* Use theme for font weight */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primaryLight}; /* Use theme for hover color */
  }
`;

// --- Component Logic ---
const NotFoundPage = () => {
  return (
    <NotFoundContainer>
      <StatusCode>404</StatusCode>
      <PageTitle>Page Not Found</PageTitle>
      <Description>
        Sorry, the page you are looking for does not exist or has been moved.
      </Description>
      <Link to="/">
        <HomeButton>Go to Homepage</HomeButton>
      </Link>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
