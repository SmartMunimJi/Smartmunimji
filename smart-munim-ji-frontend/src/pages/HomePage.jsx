// src/pages/HomePage.js

import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Smart Munim Ji!</h1>
      <p style={{ fontSize: "1.2em", color: "var(--text-light)" }}>
        Your ultimate solution for managing product warranties and facilitating
        claims with ease.
      </p>

      <div style={{ margin: "40px 0", textAlign: "left", padding: "0 20px" }}>
        <p>
          <strong>For Customers:</strong> Seamlessly register your purchases
          using an Order ID, store digital proof of purchase, track warranty
          periods automatically, and initiate warranty claims directly with
          sellers in just a few clicks. Never lose a receipt again!
        </p>
        <p>
          <strong>For Sellers:</strong> Provide a modern, reliable warranty
          service. Our platform allows you to validate customer purchases in
          real-time via your own API, manage all warranty claims from a
          centralized dashboard, and build greater trust with your customers.
        </p>
      </div>

      <button
        onClick={() => navigate("/login")}
        style={{ padding: "15px 40px", fontSize: "18px" }}
      >
        Get Started
      </button>
    </div>
  );
};

export default HomePage;
