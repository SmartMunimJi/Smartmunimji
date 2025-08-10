// src/pages/Admin/AdminDashboard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../hooks/useAuth.js"; // Using the hook for consistency, though not strictly needed for this component's logic

// --- Styled Components ---

const DashboardHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing.xl}; /* Use theme spacing */
  margin-bottom: ${({ theme }) => theme.spacing.xxl}; /* Use theme spacing */
  text-align: center; /* Center header content */

  h2 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxlarge};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.large};
    color: ${({ theme }) => theme.colors.textSecondary};
    max-width: 800px;
    margin: 0 auto;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  /* Responsive adjustment for smaller screens */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr; /* Stack cards vertically on smaller screens */
  }
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
  border: 1px solid ${({ theme }) => theme.colors.border}; /* Subtle border */

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15); /* More pronounced shadow on hover */
  }

  div {
    margin-bottom: ${({ theme }) =>
      theme.spacing.md}; /* Space between content and button */
  }
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xlarge}; /* Larger title */
  color: ${({ theme }) => theme.colors.primary}; /* Primary purple for titles */
  margin-bottom: ${({ theme }) => theme.spacing.sm}; /* Adjust margin */

  svg {
    stroke: ${({ theme }) => theme.colors.primary};
    width: 28px; /* Slightly larger icon */
    height: 28px;
  }
`;

const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NavButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-top: auto; /* Pushes button to the bottom if content varies */
  transition: background-color 0.2s ease-in-out;
  width: 100%; /* Full width button */

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// --- Simple Inline SVG Icons for Visual Appeal ---
// These are standard Feather Icons, chosen for their minimalist design.
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const SellersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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
const StatsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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
const LogsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  // We use useAuth just to show it's available, but no direct state access for this simple dashboard.
  // const { userRole } = useAuth();

  return (
    <>
      <DashboardHeader>
        <h2>Administrator Dashboard</h2>
        <p>
          Platform management and oversight tools. From here you can manage
          users, sellers, and monitor platform activity.
        </p>
      </DashboardHeader>

      <DashboardGrid>
        {/* User Management Card */}
        <NavCard>
          <div>
            <CardTitle>
              <UsersIcon /> User Management
            </CardTitle>
            <CardDescription>
              View, activate, or deactivate all customer accounts.
            </CardDescription>
          </div>
          <NavButton onClick={() => navigate("/admin/users")}>
            Manage Users
          </NavButton>
        </NavCard>

        {/* Seller Management Card */}
        <NavCard>
          <div>
            <CardTitle>
              <SellersIcon /> Seller Management
            </CardTitle>
            <CardDescription>
              Review, approve, and manage all seller accounts.
            </CardDescription>
          </div>
          <NavButton onClick={() => navigate("/admin/sellers")}>
            Manage Sellers
          </NavButton>
        </NavCard>

        {/* Platform Statistics Card */}
        <NavCard>
          <div>
            <CardTitle>
              <StatsIcon /> Platform Statistics
            </CardTitle>
            <CardDescription>
              View high-level statistics for the entire platform.
            </CardDescription>
          </div>
          <NavButton onClick={() => navigate("/admin/statistics")}>
            View Statistics
          </NavButton>
        </NavCard>

        {/* System Logs Card */}
        <NavCard>
          <div>
            <CardTitle>
              <LogsIcon /> System Logs
            </CardTitle>
            <CardDescription>
              Review system-wide activity logs for monitoring and debugging.
            </CardDescription>
          </div>
          <NavButton onClick={() => navigate("/admin/logs")}>
            View Logs
          </NavButton>
        </NavCard>
      </DashboardGrid>
    </>
  );
};

export default AdminDashboard;
