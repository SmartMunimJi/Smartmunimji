// src/pages/Customer/ClaimStatusPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components ---
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
    white-space: nowrap;
  }

  th {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  tbody tr:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.accent};
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
        return "#007bff"; // A standard blue
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

const ViewProductsButton = styled(Link)`
  text-decoration: none;
  button {
    padding: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    border: none;
    border-radius: ${({ theme }) => theme.radii.sm};
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;

    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryLight};
    }
  }
`;

// --- Component Logic ---
const ClaimStatusPage = () => {
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
        // API Endpoint: GET /sm/customer/claims - Backend returns data directly under 'data'
        const response = await apiService.get("/customer/claims");
        if (response.data.status === "success") {
          setClaims(response.data.data || []); // Ensure it's an array
        } else {
          setMessage({
            type: "error",
            text: response.data.message || "Could not fetch your claims.",
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
              "An error occurred while fetching your claims.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, [logout, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer className="card">
      <HeaderContainer>
        <h2>My Warranty Claims</h2>
      </HeaderContainer>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {claims.length === 0 ? (
        <EmptyState>
          <p>You have not submitted any warranty claims yet.</p>
          <ViewProductsButton to="/customer/products">
            <button>View My Products to Start a Claim</button>
          </ViewProductsButton>
        </EmptyState>
      ) : (
        <div className="table-container">
          <StyledTable>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Issue Description</th>
                <th>Claimed On</th>
                <th>Status</th>
                <th>Seller Response Notes</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.claimId}>
                  <td>{claim.productName}</td>
                  <td>{claim.issueDescription}</td>
                  <td>{formatDateForDisplay(claim.claimedAt)}</td>
                  <td>
                    <StatusSpan $status={claim.claimStatus}>
                      {claim.claimStatus}
                    </StatusSpan>
                  </td>
                  <td>{claim.sellerResponseNotes || "No response yet."}</td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </div>
      )}
    </PageContainer>
  );
};

export default ClaimStatusPage;
