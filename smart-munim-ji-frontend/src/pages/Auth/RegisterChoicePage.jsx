// src/pages/Auth/RegisterChoicePage.jsx

import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";

const ChoiceContainer = styled(motion.div)`
  max-width: 700px;
  margin: ${({ theme }) => theme.spacing.xxl} auto;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const OptionsWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const OptionCard = styled(motion(Link))`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  border: 2px solid transparent;
  transition: border-color 0.2s, transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LoginLink = styled.p`
  margin-top: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const RegisterChoicePage = () => {
  return (
    <ChoiceContainer>
      <Title>How would you like to register?</Title>
      <Subtitle>Choose your role to get started with Smart Munim Ji.</Subtitle>

      <OptionsWrapper>
        <OptionCard
          to="/register/customer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <h3>As a Customer</h3>
          <p>
            Register products, manage warranties, and file claims with ease.
          </p>
        </OptionCard>
        <OptionCard
          to="/register/seller"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <h3>As a Seller</h3>
          <p>
            Validate purchases, manage claims, and view your shop's statistics.
          </p>
        </OptionCard>
      </OptionsWrapper>

      <LoginLink>
        Already have an account? <Link to="/login">Go back to Login</Link>
      </LoginLink>
    </ChoiceContainer>
  );
};

export default RegisterChoicePage;
