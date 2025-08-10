// src/components/CommonHeader.jsx

import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components"; // Import styled-components
import Navbar from "./Navbar.jsx"; // Ensure Navbar is also .jsx

// --- Styled Components for CommonHeader ---

const AppHeader = styled.header`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) =>
    `${theme.spacing.sm} ${theme.spacing.lg}`}; /* Top/Bottom, Left/Right padding */
  box-shadow: ${({ theme }) => theme.shadows.card}; /* Use shadow from theme */
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary}; /* Brand accent line */
  position: sticky; /* Make header sticky at the top */
  top: 0;
  z-index: 1000; /* Ensure header stays on top of other content */
`;

const HeaderContainer = styled.div`
  max-width: ${({ theme }) =>
    theme.breakpoints.largeDesktop}; /* Constrain width for larger screens */
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0 ${({ theme }) => theme.spacing.md}; /* Adjust padding for smaller screens */
  }
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}; /* Space between icon and text */

  &:hover {
    text-decoration: none; /* Override default link hover underline */
  }
`;

const LogoIcon = styled.img`
  height: 35px; /* Adjust size of your icon */
  width: auto;
  /* Add any other specific styling for the icon here */
`;

const LogoText = styled.h1`
  margin: 0; /* Remove default h1 margin */
  font-size: ${({ theme }) =>
    theme.fontSizes.xlarge}; /* Use font size from theme */
  color: ${({ theme }) =>
    theme.colors.primary}; /* Use primary color from theme */

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) =>
      theme.fontSizes.large}; /* Smaller font on very small screens */
  }
`;

// --- CommonHeader Component ---

const CommonHeader = () => {
  return (
    <AppHeader>
      <HeaderContainer>
        <LogoLink to="/">
          {/* Your icon.png from the public folder */}
          <LogoIcon src="/icon.png" alt="Smart Munim Ji Logo" />
          <LogoText>Smart Munim Ji</LogoText>
        </LogoLink>
        <Navbar />
      </HeaderContainer>
    </AppHeader>
  );
};

export default CommonHeader;
