// src/pages/Auth/RegisterChoicePage.js

import React from "react";
import { Link } from "react-router-dom";

const RegisterChoicePage = () => {
  return (
    <div
      className="card"
      style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}
    >
      <h2>How would you like to register?</h2>
      <p style={{ color: "var(--text-light)", marginBottom: "30px" }}>
        Choose your role to get started with Smart Munim Ji.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Link to="/register/customer">
          <button style={{ width: "100%", padding: "15px 25px" }}>
            Register as a Customer
          </button>
        </Link>
        <Link to="/register/seller">
          <button style={{ width: "100%", padding: "15px 25px" }}>
            Register as a Seller
          </button>
        </Link>
      </div>

      <p style={{ marginTop: "30px", textAlign: "center" }}>
        Already have an account? <Link to="/login">Go back to Login</Link>
      </p>
    </div>
  );
};

export default RegisterChoicePage;
