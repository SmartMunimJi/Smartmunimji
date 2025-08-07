// src/pages/Admin/UserManagementPage.jsx

import React, { useState, useEffect } from "react";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // API Endpoint: GET /sm/admin/users
        const response = await apiService.get("/admin/users");
        if (response.data.status === "success") {
          // Filter out any non-customer roles if the API returns them
          const customerUsers = response.data.data.users.filter(
            (u) => u.role === "CUSTOMER"
          );
          setUsers(customerUsers || []);
        }
      } catch (error) {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout();
        } else {
          setMessage({ type: "error", text: "Failed to fetch users." });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [logout]);

  const handleStatusChange = async (userId, newStatus) => {
    // Clear previous messages
    setMessage(null);
    try {
      // API Endpoint: PUT /sm/admin/users/:userId/status
      await apiService.put(`/admin/users/${userId}/status`, {
        status: newStatus,
      });

      // Update the user status in the local state for immediate UI feedback
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.userId === userId ? { ...user, status: newStatus } : user
        )
      );
      setMessage({
        type: "success",
        text: "User status updated successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update user status.",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card">
      <h2>User Management (Customers)</h2>
      <p style={{ color: "var(--text-light)" }}>
        Activate or deactivate customer accounts.
      </p>
      {message && <AlertMessage message={message.text} type={message.type} />}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || "N/A"}</td>
                  <td>
                    <span
                      style={{
                        color:
                          user.status === "ACTIVE"
                            ? "var(--success-green)"
                            : "var(--error-red)",
                        fontWeight: "bold",
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.status === "ACTIVE" ? (
                      <button
                        onClick={() =>
                          handleStatusChange(user.userId, "INACTIVE")
                        }
                        style={{
                          backgroundColor: "var(--error-red)",
                          padding: "8px 12px",
                          fontSize: "14px",
                        }}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleStatusChange(user.userId, "ACTIVE")
                        }
                        style={{
                          backgroundColor: "var(--success-green)",
                          padding: "8px 12px",
                          fontSize: "14px",
                        }}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No customer users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
