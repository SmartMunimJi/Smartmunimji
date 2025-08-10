// src/pages/Admin/PlatformStatisticsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";

// Import our impressive components
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";
import ClaimsPieChart from "../../components/charts/ClaimsPieChart.jsx";
import SimpleBarChart from "../../components/charts/SimpleBarChart.jsx";

// --- Styled Components ---
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-top: ${({ theme }) => theme.spacing.xl};

  h3 {
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatCard = ({ title, value }) => {
  const theme = useTheme();
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h3
        style={{
          color: theme.colors.textSecondary,
          fontSize: "1.2em",
          marginBottom: "5px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: theme.colors.primary,
          fontSize: "3em",
          fontWeight: "bold",
          margin: "0",
        }}
      >
        {value}
      </p>
    </div>
  );
};

// --- Component Logic ---
const PlatformStatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // API Endpoint: GET /sm/admin/statistics
        const response = await apiService.get("/admin/statistics");
        // Data object is directly under 'data' and has a flat structure
        if (response.data.status === "success") {
          setStats(response.data.data);
        } else {
          setMessage({
            type: "error",
            text:
              response.data.message || "Could not fetch platform statistics.",
          });
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
            text:
              error.response?.data?.message ||
              "An error occurred while fetching platform statistics.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [logout, navigate]);

  // --- Data Transformation for Charts (only if stats is available) ---
  const claimsPieData = stats
    ? [
        { name: "REQUESTED", value: stats.claimsRequested || 0 },
        { name: "ACCEPTED", value: stats.claimsAccepted || 0 },
        { name: "DENIED", value: stats.claimsDenied || 0 },
        { name: "IN_PROGRESS", value: stats.claimsInProgress || 0 },
        { name: "RESOLVED", value: stats.claimsResolved || 0 },
      ].filter((entry) => entry.value > 0) // Filter out zero values for cleaner pie chart slices
    : [];

  const sellersBarData = stats
    ? [
        { name: "ACTIVE", count: stats.activeSellers || 0 },
        { name: "PENDING", count: stats.pendingSellers || 0 },
        { name: "DEACTIVATED", count: stats.deactivatedSellers || 0 },
        { name: "TERMINATED", count: stats.terminatedSellers || 0 },
      ].filter((entry) => entry.count > 0) // Filter out zero values for cleaner bar chart bars
    : [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="card">
        <h2>Platform-Wide Statistics</h2>
        <p>A comprehensive overview of all activity on Smart Munim Ji.</p>
      </div>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {stats ? (
        <>
          {/* Top-level summary stats */}
          <StatsGrid>
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers || 0}
            />
            <StatCard title="Total Sellers" value={stats.totalSellers || 0} />
            <StatCard
              title="Total Products Registered"
              value={stats.totalProductsRegistered || 0}
            />
            <StatCard
              title="Total Warranty Claims"
              value={stats.totalWarrantyClaims || 0}
            />
          </StatsGrid>

          {/* Claims Breakdown Chart */}
          <ChartContainer>
            <h3>Claims Breakdown</h3>
            {claimsPieData.length > 0 &&
            claimsPieData.some((d) => d.value > 0) ? (
              <ClaimsPieChart data={claimsPieData} />
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: theme.colors.textSecondary,
                }}
              >
                No claim data to display.
              </p>
            )}
          </ChartContainer>

          {/* Seller Status Bar Chart */}
          <ChartContainer>
            <h3>Seller Status Overview</h3>
            {sellersBarData.length > 0 &&
            sellersBarData.some((d) => d.count > 0) ? (
              <SimpleBarChart
                data={sellersBarData}
                xAxisKey="name"
                dataKey="count"
                fillColor={theme.colors.primary} // Use primary purple for the bars
              />
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: theme.colors.textSecondary,
                }}
              >
                No seller status data to display.
              </p>
            )}
          </ChartContainer>
        </>
      ) : (
        !message && (
          <p style={{ textAlign: "center", color: theme.colors.textSecondary }}>
            Statistics data could not be loaded.
          </p>
        )
      )}
    </>
  );
};

export default PlatformStatisticsPage;
