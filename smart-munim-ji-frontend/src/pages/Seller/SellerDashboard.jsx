// src/pages/Seller/SellerDashboard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
// No need for useAuth here as it's purely navigation, but keeping import structure consistent.
// import { useAuth } from '../../hooks/useAuth.js';

// --- Styled Components ---

const DashboardHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const NavCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Pushes button to bottom */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  min-height: 200px; /* Ensure consistent card height */

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }

  p {
    flex-grow: 1; /* Allows paragraph to take available space */
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  svg {
    stroke: ${({ theme }) => theme.colors.primary};
  }
`;

const NavButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-top: ${({ theme }) => theme.spacing.md};
  transition: background-color 0.2s;
  width: 100%; /* Make button fill card width */

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

// --- Simple Inline SVG Icons ---
// You can create a separate file for these if they become many
const ClaimsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);
const ProductsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);
const StatisticsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20V10"></path>
    <path d="M18 20V4"></path>
    <path d="M6 20V16"></path>
  </svg>
);
const ProfileIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// --- SellerDashboard Component Logic ---

const SellerDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <DashboardHeader>
        <h2>Seller Dashboard</h2>
        <p>
          Welcome! Manage your registered products, handle warranty claims, and
          view your shop's statistics.
        </p>
      </DashboardHeader>

      <DashboardGrid>
        {/* Card 1: Manage Warranty Claims */}
        <NavCard>
          <CardTitle>
            <ClaimsIcon /> Manage Warranty Claims
          </CardTitle>
          <p>
            Review and update the status of all warranty claims submitted for
            your products.
          </p>
          <NavButton onClick={() => navigate("/seller/claims")}>
            View Claims
          </NavButton>
        </NavCard>

        {/* Card 2: View Registered Products */}
        <NavCard>
          <CardTitle>
            <ProductsIcon /> View Registered Products
          </CardTitle>
          <p>
            See a complete list of products customers have registered with your
            shop.
          </p>
          <NavButton onClick={() => navigate("/seller/products")}>
            View Products
          </NavButton>
        </NavCard>

        {/* Card 3: View Statistics */}
        <NavCard>
          <CardTitle>
            <StatisticsIcon /> View Statistics
          </CardTitle>
          <p>
            Check key metrics about your products, claims, and customer
            engagement.
          </p>
          <NavButton onClick={() => navigate("/seller/statistics")}>
            View Statistics
          </NavButton>
        </NavCard>

        {/* Card 4: Manage Profile */}
        <NavCard>
          <CardTitle>
            <ProfileIcon /> Manage Shop Profile
          </CardTitle>
          <p>Update your business information and contact details.</p>
          <NavButton onClick={() => navigate("/seller/profile")}>
            Go to Profile
          </NavButton>
        </NavCard>
      </DashboardGrid>
    </>
  );
};

export default SellerDashboard;
