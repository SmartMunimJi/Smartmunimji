// src/pages/HomePage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css"; // We'll create a small CSS file for specific styling

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <div className="card hero-card">
        <h1>Welcome to Smart Munim Ji!</h1>
        <p className="subtitle">
          Your ultimate solution for managing product warranties and
          facilitating claims with ease.
        </p>

        <div className="features-section">
          <div className="feature-box">
            <h3>For Customers</h3>
            <p>
              Seamlessly register your purchases, store digital proof, track
              warranty periods automatically, and initiate claims directly with
              sellers in just a few clicks. Never lose a receipt again!
            </p>
          </div>
          <div className="feature-box">
            <h3>For Sellers</h3>
            <p>
              Provide a modern, reliable warranty service. Our platform allows
              you to validate purchases in real-time, manage all claims from a
              centralized dashboard, and build greater trust with your
              customers.
            </p>
          </div>
        </div>

        <button onClick={() => navigate("/login")} className="cta-button">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomePage;
