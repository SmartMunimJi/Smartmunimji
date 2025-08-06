// src/pages/Customer/CustomerDashboard.js

import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const CustomerDashboard = () => {
  const { userId } = useContext(AuthContext); // Can be used to fetch user-specific data
  const navigate = useNavigate();

  // In a real-world scenario, you might fetch summary data here:
  // e.g., total registered products, active claims, etc.

  return (
    <div>
      <div className="card" style={{ marginBottom: "30px" }}>
        <h2>Customer Dashboard</h2>
        <p>
          Welcome back! From here you can manage all your product warranties.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Card 1: Register a New Product */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>Register a New Product</h3>
          <p>Have a new purchase? Add it here to keep track of its warranty.</p>
          <button onClick={() => navigate("/customer/products/register")}>
            Register Product
          </button>
        </div>

        {/* Card 2: View My Products */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>View My Products</h3>
          <p>
            See all your registered products, check warranty status, and
            initiate claims.
          </p>
          <button onClick={() => navigate("/customer/products")}>
            View My Products
          </button>
        </div>

        {/* Card 3: My Profile */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>Manage My Profile</h3>
          <p>Update your personal information and address details.</p>
          <button onClick={() => navigate("/customer/profile")}>
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
