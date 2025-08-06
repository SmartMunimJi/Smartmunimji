// src/pages/Admin/SellerCreateEditPage.js

import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SellerCreateEditPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const isEditMode = Boolean(sellerId);

  const [formData, setFormData] = useState({
    shopName: "",
    businessName: "",
    businessEmail: "",
    businessPhoneNumber: "",
    address: "",
    apiBaseUrl: "",
    apiKey: "",
  });
  const [isLoading, setIsLoading] = useState(isEditMode); // Only load on mount if in edit mode
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchSellerData = async () => {
        try {
          // API Endpoint: GET /sm/admin/sellers/:sellerId (This is a conceptual endpoint, assuming it exists)
          // For now, we'll get the full list and filter, but a direct GET is better.
          const response = await apiService.get(`/admin/sellers`);
          const seller = response.data.data.sellers.find(
            (s) => s.sellerId === Number(sellerId)
          );
          if (seller) {
            setFormData(seller);
          } else {
            setMessage({ type: "error", text: "Seller not found." });
          }
        } catch (error) {
          if (error.response?.status === 401) logout();
          setMessage({ type: "error", text: "Failed to fetch seller data." });
        } finally {
          setIsLoading(false);
        }
      };
      fetchSellerData();
    }
  }, [sellerId, isEditMode, logout]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const apiCall = isEditMode
      ? apiService.put(`/admin/sellers/${sellerId}`, formData) // PUT /sm/admin/sellers/:sellerId
      : apiService.post("/admin/sellers", formData); // POST /sm/admin/sellers

    try {
      const response = await apiCall;
      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: `Seller ${isEditMode ? "updated" : "created"} successfully!`,
        });
        setTimeout(() => navigate("/admin/sellers"), 2000);
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Operation failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "40px auto" }}>
      <h2>{isEditMode ? "Edit Seller" : "Create New Seller"}</h2>
      <form onSubmit={handleSubmit}>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <h3>Business Information</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <label htmlFor="shopName">Shop Name</label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="businessName">Business Name (Optional)</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="businessEmail">Business Email</label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="businessPhoneNumber">Business Phone</label>
            <input
              type="tel"
              id="businessPhoneNumber"
              name="businessPhoneNumber"
              value={formData.businessPhoneNumber || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        <div style={{ marginTop: "20px" }}>
          <label htmlFor="address">Business Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <h3 style={{ marginTop: "30px" }}>API Configuration</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <label htmlFor="apiBaseUrl">API Base URL</label>
            <input
              type="text"
              id="apiBaseUrl"
              name="apiBaseUrl"
              value={formData.apiBaseUrl || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="apiKey">API Key</label>
            <input
              type="text"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{ width: "100%", marginTop: "30px" }}
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Seller"
            : "Create Seller"}
        </button>
      </form>
    </div>
  );
};

export default SellerCreateEditPage;
