// src/pages/Admin/AdminDashboard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js"; // Using the hook for consistency, though not strictly needed here

const AdminDashboard = () => {
  const navigate = useNavigate();
  // const { userRole } = useAuth(); // Example: could be used for a personalized welcome message

  return (
    <div>
      <div className="card" style={{ marginBottom: "30px" }}>
        <h2>Administrator Dashboard</h2>
        <p>
          Platform management and oversight tools. From here you can manage
          users, sellers, and monitor platform activity.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Card 1: User Management */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>User Management</h3>
          <p>
            View, activate, or deactivate all customer accounts on the platform.
          </p>
          <button onClick={() => navigate("/admin/users")}>Manage Users</button>
        </div>

        {/* Card 2: Seller Management */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>Seller Management</h3>
          <p>
            Review, approve, and manage all seller accounts and their contract
            status.
          </p>
          <button onClick={() => navigate("/admin/sellers")}>
            Manage Sellers
          </button>
        </div>

        {/* Card 3: Platform Statistics */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>Platform Statistics</h3>
          <p>View high-level statistics for the entire platform.</p>
          <button onClick={() => navigate("/admin/statistics")}>
            View Statistics
          </button>
        </div>

        {/* Card 4: System Logs */}
        <div className="card" style={{ textAlign: "center" }}>
          <h3>System Logs</h3>
          <p>Review system-wide activity logs for monitoring and debugging.</p>
          <button onClick={() => navigate("/admin/logs")}>View Logs</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
