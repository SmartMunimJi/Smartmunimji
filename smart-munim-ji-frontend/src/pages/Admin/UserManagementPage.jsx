// src/pages/Admin/UserManagementPage.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // API Endpoint: GET /sm/admin/users
      const response = await apiService.get("/admin/users");
      setUsers(response.data.data.users);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403)
        logout();
      setMessage({ type: "error", text: "Failed to fetch users." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setMessage(null);
    try {
      // API Endpoint: PUT /sm/admin/users/:userId/status
      await apiService.put(`/admin/users/${userId}/status`, {
        status: newStatus,
      });

      // Update the user status in the local state for immediate UI feedback
      setUsers(
        users.map((user) =>
          user.userId === userId ? { ...user, status: newStatus } : user
        )
      );
      setMessage({
        type: "success",
        text: "User status updated successfully.",
      });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update user status." });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2>User Management</h2>
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
            {users.map((user) => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
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
                      onClick={() => handleStatusChange(user.userId, "ACTIVE")}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
