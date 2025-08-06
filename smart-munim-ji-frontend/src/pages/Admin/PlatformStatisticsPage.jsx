// src/pages/Admin/PlatformStatisticsPage.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

// Reusable StatCard component for this page
const StatCard = ({ title, value, subtext }) => (
  <div className="card" style={{ textAlign: "center" }}>
    <h3
      style={{
        color: "var(--text-light)",
        fontSize: "1.2em",
        marginBottom: "5px",
      }}
    >
      {title}
    </h3>
    <p
      style={{
        color: "var(--primary-purple)",
        fontSize: "3em",
        fontWeight: "bold",
        margin: "0",
      }}
    >
      {value}
    </p>
    {subtext && <small style={{ color: "var(--text-light)" }}>{subtext}</small>}
  </div>
);

const PlatformStatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // API Endpoint: GET /sm/admin/statistics
        const response = await apiService.get("/admin/statistics");
        setStats(response.data.data.statistics);
      } catch (error) {
        if (error.response?.status === 401) logout();
        setMessage({ type: "error", text: "Failed to fetch statistics." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [logout]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="card" style={{ marginBottom: "30px" }}>
        <h2>Platform-Wide Statistics</h2>
        <p>A comprehensive overview of all activity on Smart Munim Ji.</p>
      </div>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {stats ? (
        <>
          {/* Top-level stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <StatCard title="Total Customers" value={stats.totalCustomers} />
            <StatCard
              title="Total Products"
              value={stats.totalProductsRegistered}
            />
            <StatCard title="Total Claims" value={stats.totalClaims.total} />
          </div>

          {/* Seller Stats */}
          <div className="card" style={{ marginTop: "30px" }}>
            <h3>Seller Overview</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <StatCard
                title="Total Sellers"
                value={stats.totalSellers.total}
              />
              <StatCard title="Active" value={stats.totalSellers.ACTIVE} />
              <StatCard title="Pending" value={stats.totalSellers.PENDING} />
              <StatCard
                title="Deactivated"
                value={stats.totalSellers.DEACTIVATED}
              />
            </div>
          </div>

          {/* Claims Breakdown */}
          <div className="card" style={{ marginTop: "30px" }}>
            <h3>Claims Breakdown</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <StatCard title="Requested" value={stats.totalClaims.REQUESTED} />
              <StatCard title="Accepted" value={stats.totalClaims.ACCEPTED} />
              <StatCard
                title="In Progress"
                value={stats.totalClaims.IN_PROGRESS}
              />
              <StatCard title="Resolved" value={stats.totalClaims.RESOLVED} />
              <StatCard title="Denied" value={stats.totalClaims.DENIED} />
            </div>
          </div>
        </>
      ) : (
        !message && <p>Statistics data is not available.</p>
      )}
    </div>
  );
};

export default PlatformStatisticsPage;
