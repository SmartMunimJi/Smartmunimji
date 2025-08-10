// src/pages/Customer/CustomerDashboard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  justify-content: space-between;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  min-height: 200px; /* Ensure cards have a consistent height */

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.large};
`;

const NavButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-top: ${({ theme }) =>
    theme.spacing.md}; /* Ensure space between text and button */
  transition: background-color 0.2s;
  width: 100%; /* Make button fill card width */

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const CardDescription = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-grow: 1; /* Allows description to take up available space */
`;

// --- Simple Inline SVG Icons ---
// You could create a separate `icons.js` file for all these if they become many
const RegisterProductIcon = () => (
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
    <line x1="12" y1="18" x2="12" y2="12"></line>
    <line x1="9" y1="15" x2="15" y2="15"></line>
  </svg>
);
const ViewProductsIcon = () => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <path d="M9 21V9"></path>
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
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
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
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);
const SellersIcon = () => (
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

// --- Component Logic ---
const CustomerDashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <DashboardHeader>
        <h2>Customer Dashboard</h2>
        <p>
          Welcome back! From here you can manage all your product warranties
          with Smart Munim Ji.
        </p>
      </DashboardHeader>

      <DashboardGrid>
        {/* Card 1: Register a New Product */}
        <NavCard>
          <CardTitle>
            <RegisterProductIcon /> Register a New Product
          </CardTitle>
          <CardDescription>
            Have a new purchase? Add it here to keep track of its warranty and
            easily submit claims.
          </CardDescription>
          <NavButton onClick={() => navigate("/customer/products/register")}>
            Register Product
          </NavButton>
        </NavCard>

        {/* Card 2: View My Products */}
        <NavCard>
          <CardTitle>
            <ViewProductsIcon /> View My Products
          </CardTitle>
          <CardDescription>
            See all your registered products, check their warranty status, and
            initiate claims.
          </CardDescription>
          <NavButton onClick={() => navigate("/customer/products")}>
            View My Products
          </NavButton>
        </NavCard>

        {/* Card 3: My Warranty Claims */}
        <NavCard>
          <CardTitle>
            <ClaimsIcon /> My Warranty Claims
          </CardTitle>
          <CardDescription>
            Track the status of your submitted warranty claims and view seller
            responses.
          </CardDescription>
          <NavButton onClick={() => navigate("/customer/claims")}>
            View Claims Status
          </NavButton>
        </NavCard>

        {/* Card 4: My Sellers */}
        <NavCard>
          <CardTitle>
            <SellersIcon /> My Sellers
          </CardTitle>
          <CardDescription>
            View a list of sellers from whom you've registered products.
          </CardDescription>
          <NavButton onClick={() => navigate("/customer/my-sellers")}>
            View My Sellers
          </NavButton>
        </NavCard>

        {/* Card 5: Manage My Profile */}
        <NavCard>
          <CardTitle>
            <ProfileIcon /> Manage My Profile
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details.
          </CardDescription>
          <NavButton onClick={() => navigate("/customer/profile")}>
            Go to Profile
          </NavButton>
        </NavCard>
      </DashboardGrid>
    </>
  );
};

export default CustomerDashboard;
