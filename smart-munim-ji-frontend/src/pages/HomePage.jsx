// src/pages/HomePage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// --- Styled Components ---
const HomePageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-top: ${({ theme }) => theme.spacing.xxl};
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.xl};
    margin-top: ${({ theme }) => theme.spacing.xl};
  }
`;

const WelcomeIcon = styled.img`
  width: 150px; /* Adjust size as needed */
  height: auto;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DescriptionSection = styled.div`
  margin: ${({ theme }) => theme.spacing.xxl} 0;
  text-align: left;
  padding: 0 ${({ theme }) => theme.spacing.lg};

  p {
    font-size: ${({ theme }) => theme.fontSizes.medium};
    line-height: 1.8;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const GetStartedButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xxl}`};
  font-size: ${({ theme }) => theme.fontSizes.large};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

// --- Component Logic ---
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <HomePageContainer>
      <WelcomeIcon src="/welcome.png" alt="Welcome Icon" />
      <Title>Welcome to Smart Munim Ji!</Title>
      <Subtitle>
        Your ultimate solution for managing product warranties and facilitating
        claims with ease.
      </Subtitle>

      <DescriptionSection>
        <p>
          <strong>For Customers:</strong> Seamlessly register your purchases
          using an Order ID, store digital proof of purchase, track warranty
          periods automatically, and initiate warranty claims directly with
          sellers in just a few clicks. Never lose a receipt again!
        </p>
        <p>
          <strong>For Sellers:</strong> Provide a modern, reliable warranty
          service. Our platform allows you to validate customer purchases in
          real-time via your own API, manage all warranty claims from a
          centralized dashboard, and build greater trust with your customers.
        </p>
        <p>
          Experience a smarter way to handle product warranties, ensuring peace
          of mind for both buyers and sellers.
        </p>
      </DescriptionSection>

      <GetStartedButton onClick={() => navigate("/login")}>
        Get Started
      </GetStartedButton>
    </HomePageContainer>
  );
};

export default HomePage;
