// src/pages/Admin/UserManagementPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
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
  color: ${(props) =>
    props.$isActive ? props.theme.colors.success : props.theme.colors.error};
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin-right: ${({ theme }) => theme.spacing.xs};
  background-color: ${(props) =>
    props.$isDeactivate
      ? props.theme.colors.error
      : props.theme.colors.success};
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
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// --- Component Logic ---
const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme(); // To use theme colors in logic

  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array, runs once on mount

  const fetchUsers = async () => {
    setIsLoading(true);
    setMessage(null); // Clear previous messages
    try {
      // API Endpoint: GET /sm/admin/users
      const response = await apiService.get("/admin/users");
      // --- FIX: Access data correctly ---
      if (response.data.status === "success") {
        setUsers(response.data.data || []); // Ensure it's an array even if empty
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to fetch users.",
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
            "An error occurred while fetching users.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setMessage(null); // Clear messages before new action
    try {
      // API Endpoint: PUT /sm/admin/users/:userId/status
      const response = await apiService.put(`/admin/users/${userId}/status`, {
        isActive: newStatus === "ACTIVE",
      });
      if (response.data.status === "success") {
        // Update the user status in the local state for immediate UI feedback
        setUsers(
          users.map((user) =>
            user.userId === userId
              ? { ...user, isActive: newStatus === "ACTIVE" }
              : user
          )
        );
        setMessage({
          type: "success",
          text: "User status updated successfully.",
        });
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to update user status.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "An error occurred while updating user status.",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer className="card">
      <HeaderContainer>
        <h2>User Management</h2>
      </HeaderContainer>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {users.length === 0 ? (
        <EmptyState>No users registered yet.</EmptyState>
      ) : (
        <div className="table-container">
          {" "}
          {/* Keeps horizontal scroll on small screens */}
          <StyledTable>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.role}</td>
                  <td>
                    <StatusSpan $isActive={user.isActive}>
                      {user.isActive ? "ACTIVE" : "INACTIVE"}
                    </StatusSpan>
                  </td>
                  <td>
                    {user.isActive ? (
                      <ActionButton
                        onClick={() =>
                          handleStatusChange(user.userId, "INACTIVE")
                        }
                        $isDeactivate
                      >
                        Deactivate
                      </ActionButton>
                    ) : (
                      <ActionButton
                        onClick={() =>
                          handleStatusChange(user.userId, "ACTIVE")
                        }
                      >
                        Activate
                      </ActionButton>
                    )}
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

export default UserManagementPage;
