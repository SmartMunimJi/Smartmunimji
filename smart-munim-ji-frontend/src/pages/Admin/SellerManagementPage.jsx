// src/pages/Admin/SellerManagementPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components (reusing some from UserManagementPage if applicable, or defining new ones) ---
const PageContainer = styled.div`
  /* As in UserManagementPage */
`;
const HeaderContainer = styled.div`
  /* As in UserManagementPage */
`;
const StyledTable = styled.table`
  /* As in UserManagementPage */
`;
const StatusSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.small};
  cursor: pointer;
  background-color: white;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.fontSizes.small};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;
const EmptyState = styled.div`
  /* As in UserManagementPage */
`;

// --- Component Logic ---
const SellerManagementPage = () => {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const contractStatusOptions = [
    "PENDING",
    "ACTIVE",
    "DEACTIVATED",
    "TERMINATED",
  ];

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      // API Endpoint: GET /sm/admin/sellers
      const response = await apiService.get("/admin/sellers");
      // --- FIX: Access data correctly ---
      if (response.data.status === "success") {
        setSellers(response.data.data || []); // Ensure it's an array
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to fetch sellers.",
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
            "An error occurred while fetching sellers.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (sellerId, newStatus) => {
    setMessage(null);
    try {
      // API Endpoint: PUT /sm/admin/sellers/:sellerId/status
      const response = await apiService.put(
        `/admin/sellers/${sellerId}/status`,
        { contractStatus: newStatus }
      );
      if (response.data.status === "success") {
        setSellers(
          sellers.map((seller) =>
            seller.sellerId === sellerId
              ? { ...seller, contractStatus: newStatus }
              : seller
          )
        );
        setMessage({
          type: "success",
          text: "Seller contract status updated successfully.",
        });
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to update seller status.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "An error occurred while updating seller status.",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return theme.colors.success;
      case "DEACTIVATED":
      case "TERMINATED":
        return theme.colors.error;
      case "PENDING":
        return "#ffc107"; // A yellow/orange color for pending
      default:
        return theme.colors.textSecondary;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageContainer className="card">
      <HeaderContainer>
        <h2>Seller Management</h2>
        <ActionButton onClick={() => navigate("/admin/sellers/create")}>
          Create New Seller
        </ActionButton>
      </HeaderContainer>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {sellers.length === 0 ? (
        <EmptyState>No sellers registered yet.</EmptyState>
      ) : (
        <div className="table-container">
          <StyledTable>
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Business Email</th>
                <th>Status</th>
                <th>Change Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.sellerId}>
                  <td>{seller.shopName}</td>
                  <td>{seller.businessEmail}</td>
                  <td>
                    <span
                      style={{
                        color: getStatusColor(seller.contractStatus),
                        fontWeight: theme.fontWeights.bold,
                      }}
                    >
                      {seller.contractStatus}
                    </span>
                  </td>
                  <td>
                    <StatusSelect
                      value={seller.contractStatus}
                      onChange={(e) =>
                        handleStatusChange(seller.sellerId, e.target.value)
                      }
                    >
                      {contractStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </StatusSelect>
                  </td>
                  <td>
                    <ActionButton
                      onClick={() =>
                        navigate(`/admin/sellers/edit/${seller.sellerId}`)
                      }
                    >
                      Edit
                    </ActionButton>
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

export default SellerManagementPage;
