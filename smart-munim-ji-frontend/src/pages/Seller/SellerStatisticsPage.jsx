// src/pages/Seller/SellerStatisticsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
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

  // --- FIX for NaN errors: Provide explicit dimensions for ResponsiveContainer to work ---
  width: 100%;
  height: 350px; /* Give it a default height to prevent NaN issues */

  h3 {
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StatTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xxlarge};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0;
`;

// --- Component Logic ---
const SellerStatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.get("/seller/statistics");
        if (response.data.status === "success") {
          setStats(response.data.data);
        } else {
          setMessage({
            type: "error",
            text: response.data.message || "Could not fetch seller statistics.",
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
              "An error occurred while fetching seller statistics.",
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
        { name: "REQUESTED", value: stats.activeWarrantyClaims || 0 }, // Using activeWarrantyClaims as REQUESTED if no specific field
        { name: "ACCEPTED", value: stats.acceptedWarrantyClaims || 0 },
        { name: "DENIED", value: stats.deniedWarrantyClaims || 0 },
        { name: "IN_PROGRESS", value: stats.inProgressWarrantyClaims || 0 },
        { name: "RESOLVED", value: stats.resolvedWarrantyClaims || 0 },
      ].filter((entry) => entry.value > 0)
    : [];

  const productsBarData = stats
    ? [
        { name: "Total Products", count: stats.totalProductsRegistered || 0 },
      ].filter((entry) => entry.count > 0)
    : [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="card">
        <h2>My Shop Statistics</h2>
        <p>A high-level overview of your activity on Smart Munim Ji.</p>
      </div>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {stats ? (
        <>
          <StatsGrid>
            <StatCard>
              <StatTitle>Total Products Registered</StatTitle>
              <StatValue>{stats.totalProductsRegistered || 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Active Claims</StatTitle>
              <StatValue>{stats.activeWarrantyClaims || 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Resolved Claims</StatTitle>
              <StatValue>{stats.resolvedWarrantyClaims || 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatTitle>Denied Claims</StatTitle>
              <StatValue>{stats.deniedWarrantyClaims || 0}</StatValue>
            </StatCard>
          </StatsGrid>

          <ChartContainer>
            <h3>Claims Status Breakdown</h3>
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

          <ChartContainer>
            <h3>Registered Products Overview</h3>
            {productsBarData.length > 0 &&
            productsBarData.some((d) => d.count > 0) ? (
              <SimpleBarChart
                data={productsBarData}
                xAxisKey="name"
                dataKey="count"
                fillColor={theme.colors.primary}
              />
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: theme.colors.textSecondary,
                }}
              >
                No product data to display.
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

export default SellerStatisticsPage;
