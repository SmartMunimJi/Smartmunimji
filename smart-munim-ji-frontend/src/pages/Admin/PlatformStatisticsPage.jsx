// src/pages/Admin/PlatformStatisticsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

// Reusable StatCard component for a clean and consistent UI
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
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // API Endpoint: GET /sm/admin/statistics
        const response = await apiService.get("/admin/statistics");
        if (response.data.status === "success") {
          setStats(response.data.data.statistics);
        } else {
          setMessage({
            type: "error",
            text: "Could not fetch statistics data.",
          });
        }
      } catch (error) {
        // ROBUST ERROR HANDLING:
        // If the token is invalid/expired, log out and redirect to the login page.
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout();
          navigate("/login");
        } else {
          // For all other errors, display a user-friendly message.
          setMessage({
            type: "error",
            text: "An error occurred while fetching platform statistics.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [logout, navigate]); // Dependencies for the effect

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
              <StatCard
                title="Suspended"
                value={stats.totalSellers.SUSPENDED}
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
              <Stat_Card title="Denied" value={stats.totalClaims.DENIED} />
            </div>
          </div>
        </>
      ) : (
        // Only show this message if there wasn't a specific error
        !message && <p>Statistics data could not be loaded.</p>
      )}
    </div>
  );
};

export default PlatformStatisticsPage;
