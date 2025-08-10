// src/pages/Seller/SellerClaimsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components (as previously defined, included for completeness) ---
const PageContainer = styled.div`
  /* Inherits card styling via className="card" for consistency */
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.md};

  th,
  td {
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.small};
  }

  th {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  tbody tr:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  /* Make rows clickable and visually indicate it */
  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    &:hover {
      background-color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const StatusSpan = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${(props) => {
    switch (props.$status) {
      case "ACCEPTED":
      case "RESOLVED":
        return props.theme.colors.success;
      case "DENIED":
        return props.theme.colors.error;
      case "IN_PROGRESS":
        return "#007bff"; // Standard blue
      case "REQUESTED":
      default:
        return props.theme.colors.textSecondary;
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// --- Component Logic ---
const SellerClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const response = await apiService.get("/seller/claims");
        if (response.data.status === "success") {
          // Ensure data.data is an array, and each item has a claimId
          setClaims(
            response.data.data.filter((claim) => claim.claimId != null) || []
          );
        } else {
          setMessage({
            type: "error",
            text: response.data.message || "Could not fetch claims.",
          });
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text:
              error.response?.data?.message ||
              "An error occurred while fetching claims.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, [logout, navigate]);

  const handleRowClick = (claimId) => {
    // Defensive check: only navigate if claimId is truly valid
    if (claimId != null) {
      navigate(`/seller/claims/${claimId}`);
    } else {
      console.error("Attempted to navigate with an undefined claimId.");
      setMessage({
        type: "error",
        text: "Error: Cannot view details for this claim (ID missing).",
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageContainer className="card">
      <HeaderContainer>
        <h2>Manage Warranty Claims</h2>
      </HeaderContainer>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {claims.length === 0 ? (
        <EmptyState>
          You have no warranty claims to manage at this time.
        </EmptyState>
      ) : (
        <div className="table-container">
          <StyledTable>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Product Name</th>
                <th>Claimed On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                // Only make row clickable if claim.claimId is present
                <tr
                  key={claim.claimId}
                  onClick={
                    claim.claimId != null
                      ? () => handleRowClick(claim.claimId)
                      : undefined
                  }
                  title={
                    claim.claimId != null
                      ? "Click to view details"
                      : "Claim ID missing"
                  }
                  style={{
                    cursor: claim.claimId != null ? "pointer" : "default",
                  }}
                >
                  <td>{claim.customerName}</td>
                  <td>{claim.productName}</td>
                  <td>{formatDateForDisplay(claim.claimedAt)}</td>
                  <td>
                    <StatusSpan $status={claim.claimStatus}>
                      {claim.claimStatus}
                    </StatusSpan>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </div>
      )}
    </PageContainer>
  );
};

export default SellerClaimsPage;
