// src/components/CommonHeader.js

import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar"; // We'll create Navbar next
import "./CommonHeader.css"; // We will create this small CSS file for specific header styles

const CommonHeader = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          {/* You can replace this text with an img tag for your logo later */}
          <img
            src="smart-munim-ji-frontend\public\icon.png"
            alt="Smart Munim Ji Logo"
          />
          <h1 className="logo-text">Smart Munim Ji</h1>
        </Link>
        <Navbar />
      </div>
    </header>
  );
};

export default CommonHeader;
