// src/components/CommonFooter.js

import React from "react";
import "./CommonFooter.css";

const CommonFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <p>&copy; {currentYear} Smart Munim Ji. All Rights Reserved.</p>
        <p>
          <a href="/terms">Terms of Service</a> |{" "}
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
};

export default CommonFooter;
