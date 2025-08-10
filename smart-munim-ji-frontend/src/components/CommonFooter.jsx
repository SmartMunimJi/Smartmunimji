// src/components/CommonFooter.jsx

import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom"; // Assuming these links might lead to static pages

// --- Styled Components ---

const AppFooter = styled.footer`
  background-color: ${({ theme }) =>
    theme.colors.text}; /* Dark background for footer */
  color: ${({ theme }) =>
    theme.colors.background}; /* Light text on dark background */
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  margin-top: auto; /* Pushes the footer to the bottom of the flex container (in App.jsx) */
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow above footer */
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const FooterText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) =>
    theme.colors.textSecondary}; /* Use textSecondary for softer contrast */
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.accent}; /* Light purple for links */
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin: 0 ${({ theme }) => theme.spacing.xs}; /* Small spacing between links */

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const LinkGroup = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allows links to wrap on small screens */
  justify-content: center; /* Center links when wrapped */
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: 0; /* Reset gap if links already have margin */
  }
`;

// --- Component Logic ---

const CommonFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AppFooter>
      <FooterContainer>
        <FooterText>
          &copy; {currentYear} Smart Munim Ji. All Rights Reserved.
        </FooterText>
        <LinkGroup>
          <FooterLink to="/terms-of-service">Terms of Service</FooterLink>
          <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
          {/* Add more links as needed, e.g., <FooterLink to="/contact">Contact Us</FooterLink> */}
        </LinkGroup>
      </FooterContainer>
    </AppFooter>
  );
};

export default CommonFooter;
