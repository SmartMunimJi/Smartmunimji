// src/components/Navbar.jsx

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
// This is the corrected line:
import { useAuth } from "../hooks/useAuth.js";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
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
        return "/";
    }
  };

  return (
    <nav className="main-nav">
      <ul>
        {isAuthenticated ? (
          // --- Links for Authenticated Users ---
          <>
            <li>
              <NavLink to={getDashboardPath()}>Dashboard</NavLink>
            </li>
            {/* Add more role-specific links here if needed */}
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          // --- Links for Unauthenticated Users ---
          <>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/register-choice">Register</NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
