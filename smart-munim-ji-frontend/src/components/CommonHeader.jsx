// src/components/CommonHeader.jsx

import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar"; // This component will handle the dynamic navigation links
import "./CommonHeader.css"; // Styles specific to the header layout

/**
 * The main header component for the application.
 * It includes the site logo/name and the primary navigation bar.
 */
const CommonHeader = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          {/* This text can be replaced with an <img /> tag for a visual logo */}
          <h1 className="logo-text">Smart Munim Ji</h1>
        </Link>

        {/* The Navbar component is responsible for rendering the correct links */}
        <Navbar />
      </div>
    </header>
  );
};

export default CommonHeader;
