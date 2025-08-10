// src/components/Navbar.jsx

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth.js"; // Ensure .js for hooks

// --- Styled Components for the Navbar ---

const NavContainer = styled.nav`
  position: relative; /* Essential for absolute positioning of the mobile menu */
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Pushes content to the right, opposite of logo */
  height: 100%; /* Ensure it takes full height of header for vertical alignment */
`;

const NavMenu = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg}; /* Space between desktop nav items */

  /* Responsive styles for mobile/tablet: Hide desktop menu and display hamburger menu */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    /* Controls visibility based on the $isOpen prop from React state */
    display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
    flex-direction: column; /* Stack items vertically in mobile menu */
    position: absolute;
    top: 55px; /* Position it right below the header */
    right: 0;
    background: ${({ theme }) => theme.colors.surface};
    padding: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: ${({ theme }) => theme.shadows.card};
    min-width: 200px; /* Ensure menu has a readable width */
    z-index: 20; /* Make sure menu appears above other content */
    border: 1px solid ${({ theme }) => theme.colors.border};

    & > li {
      /* Add some vertical spacing for mobile menu items */
      width: 100%;
      text-align: center;
      padding: ${({ theme }) => theme.spacing.sm} 0;
    }
  }
`;

const NavItem = styled.li`
  /* Basic styling for list items, more specific styling on StyledNavLink/LogoutButton */
`;

const StyledNavLink = styled(NavLink)`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  padding: ${({ theme }) => theme.spacing.sm} 0; /* Padding for click area */
  position: relative;
  transition: color 0.2s ease-in-out;
  display: block; /* Ensures the whole link area is clickable */

  /* Underline effect on hover and for active link */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary};
    transform: scaleX(0); /* Hidden by default */
    transition: transform 0.3s ease;
  }

  &:hover::after,
  &.active::after {
    transform: scaleX(1); /* Reveal on hover or if active */
  }

  /* Specific color for the active link */
  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }

  /* Ensure text is readable in mobile menu */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md} 0;
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSizes.small};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  transition: all 0.2s ease-in-out;
  width: 100%; /* Full width in mobile menu */

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
  }
`;

const HamburgerButton = styled.button`
  display: none; /* Hidden on desktop */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 30; /* Ensure it's clickable above other elements */

  /* Only visible on mobile/tablet */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }

  /* Simple SVG for the hamburger icon, inherits color from parent (theme.colors.primary) */
  svg {
    stroke: ${({ theme }) => theme.colors.primary};
    width: 30px; /* Adjust size */
    height: 30px;
  }
`;

// --- The Navbar Component Logic ---

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Destructure jwtToken and userRole for robust checking
  const { isAuthenticated, userRole, jwtToken, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    navigate("/login"); // Redirect to login page after logout
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false); // Helper to close menu on nav item click
  };

  const getDashboardPath = () => {
    switch (userRole) {
      case "CUSTOMER":
        return "/customer/dashboard";
      case "SELLER":
        return "/seller/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/"; // Fallback for unexpected roles or if role is null
    }
  };

  // --- ROBUST AUTHENTICATION CHECK ---
  // A user is considered logged in for UI purposes ONLY if they are authenticated,
  // have a role, AND a JWT token is present in the AuthContext state.
  // This prevents showing logged-in menu based on stale localStorage if token isn't truly loaded.
  const isLoggedIn = isAuthenticated && userRole && jwtToken;

  return (
    <NavContainer>
      {/* Hamburger button for mobile/tablet */}
      <HamburgerButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12h18M3 6h18M3 18h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </HamburgerButton>

      {/* Navigation menu controlled by $isOpen prop for responsiveness */}
      <NavMenu $isOpen={isMobileMenuOpen}>
        {isLoggedIn ? (
          // Links for Authenticated Users
          <>
            <NavItem>
              <StyledNavLink to={getDashboardPath()} onClick={closeMobileMenu}>
                Dashboard
              </StyledNavLink>
            </NavItem>
            {/* Conditional role-based links could go here if needed, e.g.: */}
            {userRole === "CUSTOMER" && (
              <>
                <NavItem>
                  <StyledNavLink
                    to="/customer/products"
                    onClick={closeMobileMenu}
                  >
                    My Products
                  </StyledNavLink>
                </NavItem>
                <NavItem>
                  <StyledNavLink
                    to="/customer/claims"
                    onClick={closeMobileMenu}
                  >
                    My Claims
                  </StyledNavLink>
                </NavItem>
                <NavItem>
                  <StyledNavLink
                    to="/customer/profile"
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </StyledNavLink>
                </NavItem>
              </>
            )}
            {userRole === "SELLER" && (
              <>
                <NavItem>
                  <StyledNavLink
                    to="/seller/products"
                    onClick={closeMobileMenu}
                  >
                    My Products
                  </StyledNavLink>
                </NavItem>
                <NavItem>
                  <StyledNavLink to="/seller/claims" onClick={closeMobileMenu}>
                    Manage Claims
                  </StyledNavLink>
                </NavItem>
                <NavItem>
                  <StyledNavLink
                    to="/seller/statistics"
                    onClick={closeMobileMenu}
                  >
                    Statistics
                  </StyledNavLink>
                </NavItem>
                <NavItem>
                  <StyledNavLink to="/seller/profile" onClick={closeMobileMenu}>
                    Profile
                  </StyledNavLink>
                </NavItem>
              </>
            )}
            {userRole === "ADMIN" && (
              <>
                <NavItem>
                  <StyledNavLink to="/admin/users" onClick={closeMobileMenu}>
                    Users
                  </StyledNavLink>
                </NavItem>
                <NavItem>
                  <StyledNavLink to="/admin/sellers" onClick={closeMobileMenu}>
                    Sellers
                  </StyledNavLink>
                </NavItem>
                <NavItem>
                  <StyledNavLink to="/admin/logs" onClick={closeMobileMenu}>
                    Logs
                  </StyledNavLink>
                </NavItem>
                <NavItem>
                  <StyledNavLink
                    to="/admin/statistics"
                    onClick={closeMobileMenu}
                  >
                    Statistics
                  </StyledNavLink>
                </NavItem>
              </>
            )}
            <NavItem>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </NavItem>
          </>
        ) : (
          // Links for Unauthenticated Users
          <>
            <NavItem>
              <StyledNavLink to="/login" onClick={closeMobileMenu}>
                Login
              </StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/register-choice" onClick={closeMobileMenu}>
                Register
              </StyledNavLink>
            </NavItem>
          </>
        )}
      </NavMenu>
    </NavContainer>
  );
};

export default Navbar;
