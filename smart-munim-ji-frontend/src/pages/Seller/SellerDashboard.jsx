// src/pages/Seller/SellerDashboard.js

import React from "react";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const navigate = useNavigate();

  // In a future iteration, you could fetch summary data here, like:
  // - Number of pending claims
  // - Total products registered this month
  // This would make the dashboard more dynamic.

  return (
    <div>
      <div className="card" style={{ marginBottom: "30px" }}>
        <h2>Seller Dashboard</h2>
        <p>
          Welcome! Manage your registered products, handle warranty claims, and
          view your shop's statistics.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Card 1: Manage Warranty Claims */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>Manage Warranty Claims</h3>
          <p>
            Review and update the status of all warranty claims submitted for
            your products.
          </p>
          <button onClick={() => navigate("/seller/claims")}>
            View Claims
          </button>
        </div>

        {/* Card 2: View Registered Products */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>View Registered Products</h3>
          <p>
            See a complete list of products customers have registered with your
            shop.
          </p>
          <button onClick={() => navigate("/seller/products")}>
            View Products
          </button>
        </div>

        {/* Card 3: View Statistics */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>View Statistics</h3>
          <p>
            Check key metrics about your products, claims, and customer
            engagement.
          </p>
          <button onClick={() => navigate("/seller/statistics")}>
            View Statistics
          </button>
        </div>

        {/* Card 4: Manage Profile */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>Manage Shop Profile</h3>
          <p>Update your business information and contact details.</p>
          <button onClick={() => navigate("/seller/profile")}>
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
