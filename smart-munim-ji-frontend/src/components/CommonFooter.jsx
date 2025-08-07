// src/components/CommonFooter.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./CommonFooter.css";

const CommonFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <p>&copy; {currentYear} Smart Munim Ji. All Rights Reserved.</p>
        <p>
          {/* These links are placeholders. You can create pages for them later. */}
          <Link to="/terms-of-service">Terms of Service</Link> |{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
};

export default CommonFooter;
