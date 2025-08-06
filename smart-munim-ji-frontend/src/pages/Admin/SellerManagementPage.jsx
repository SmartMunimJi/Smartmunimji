// src/pages/Admin/SellerManagementPage.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SellerManagementPage = () => {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const contractStatusOptions = [
    "PENDING",
    "ACTIVE",
    "DEACTIVATED",
    "SUSPENDED",
  ];

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setIsLoading(true);
    try {
      // API Endpoint: GET /sm/admin/sellers
      const response = await apiService.get("/admin/sellers");
      setSellers(response.data.data.sellers);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403)
        logout();
      setMessage({ type: "error", text: "Failed to fetch sellers." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (sellerId, newStatus) => {
    setMessage(null);
    try {
      // API Endpoint: PUT /sm/admin/sellers/:sellerId/status
      await apiService.put(`/admin/sellers/${sellerId}/status`, {
        contractStatus: newStatus,
      });
      setSellers(
        sellers.map((seller) =>
          seller.sellerId === sellerId
            ? { ...seller, contractStatus: newStatus }
            : seller
        )
      );
      setMessage({ type: "success", text: "Seller status updated." });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update seller status." });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "var(--success-green)";
      case "DEACTIVATED":
      case "SUSPENDED":
        return "var(--error-red)";
      case "PENDING":
        return "#ffc107"; // A yellow/orange color for pending
      default:
        return "var(--text-light)";
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Seller Management</h2>
        <button onClick={() => navigate("/admin/sellers/create")}>
          Create New Seller
        </button>
      </div>
      {message && <AlertMessage message={message.text} type={message.type} />}
      <div className="table-container">
        <table>
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
                      fontWeight: "bold",
                    }}
                  >
                    {seller.contractStatus}
                  </span>
                </td>
                <td>
                  <select
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
                  </select>
                </td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/admin/sellers/edit/${seller.sellerId}`)
                    }
                    style={{ padding: "8px 12px", fontSize: "14px" }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerManagementPage;
