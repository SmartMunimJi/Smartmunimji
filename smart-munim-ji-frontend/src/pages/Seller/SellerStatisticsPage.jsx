// src/pages/Seller/SellerStatisticsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

// A local, reusable component for displaying a single statistic.
const StatCard = ({ title, value }) => (
  <div className="card" style={{ textAlign: "center" }}>
    <h3
      style={{
        color: "var(--text-light)",
        fontSize: "1.1em",
        textTransform: "uppercase",
        letterSpacing: "1px",
      }}
    >
      {title}
    </h3>
    <p
      style={{
        color: "var(--primary-purple)",
        fontSize: "2.5em",
        fontWeight: "bold",
        margin: "10px 0",
      }}
    >
      {value}
    </p>
  </div>
);

const SellerStatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // API Endpoint: GET /sm/seller/statistics
        const response = await apiService.get("/seller/statistics");
        if (response.data.status === "success") {
          setStats(response.data.data.statistics);
        } else {
          setMessage({ type: "error", text: "Could not fetch statistics." });
        }
      } catch (error) {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: "An error occurred while fetching statistics.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [logout, navigate]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="card" style={{ marginBottom: "30px" }}>
        <h2>My Shop Statistics</h2>
        <p>A high-level overview of your activity on Smart Munim Ji.</p>
      </div>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {stats ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <StatCard
              title="Total Products Registered"
              value={stats.totalProductsRegistered}
            />
            <StatCard
              title="Total Claims Received"
              value={stats.claimsByStatus.total}
            />
            <StatCard
              title="Pending Claims"
              value={stats.claimsByStatus.REQUESTED}
            />
          </div>
          <div className="card" style={{ marginTop: "30px" }}>
            <h3>Claims Breakdown by Status</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <StatCard
                title="Accepted"
                value={stats.claimsByStatus.ACCEPTED}
              />
              <StatCard
                title="In Progress"
                value={stats.claimsByStatus.IN_PROGRESS}
              />
              <StatCard
                title="Resolved"
                value={stats.claimsByStatus.RESOLVED}
              />
              <StatCard title="Denied" value={stats.claimsByStatus.DENIED} />
            </div>
          </div>
        </>
      ) : (
        !message && <p>Statistics data is not available.</p>
      )}
    </div>
  );
};

export default SellerStatisticsPage;
