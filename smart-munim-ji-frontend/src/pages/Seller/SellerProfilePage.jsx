// src/pages/Seller/SellerProfilePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SellerProfilePage = () => {
  const [profile, setProfile] = useState({
    shopName: "",
    businessName: "",
    businessEmail: "",
    businessPhoneNumber: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // API Endpoint: GET /sm/seller/profile
        const response = await apiService.get("/seller/profile");
        if (response.data.status === "success" && response.data.data.profile) {
          setProfile(response.data.data.profile);
        } else {
          setMessage({
            type: "error",
            text: "Could not fetch your profile data.",
          });
        }
      } catch (error) {
        // ** ROBUST ERROR HANDLING **
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: "An error occurred while fetching your profile.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [logout, navigate]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    try {
      // API Endpoint: PUT /sm/seller/profile
      const response = await apiService.put("/seller/profile", profile);
      if (response.data.status === "success") {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Update failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "An unexpected error occurred.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeactivationRequest = async () => {
    if (
      window.confirm(
        "Are you sure you want to request account deactivation? This action is pending admin approval and cannot be undone."
      )
    ) {
      setIsUpdating(true);
      setMessage(null);
      try {
        // API Endpoint: POST /sm/seller/deactivate-request
        await apiService.post("/seller/deactivate-request");
        setMessage({
          type: "success",
          text: "Deactivation request sent successfully. An admin will review it.",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error.response?.data?.message ||
            "Failed to send deactivation request.",
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "40px auto" }}>
      <h2>Shop Profile</h2>
      {message && <AlertMessage message={message.text} type={message.type} />}

      <form onSubmit={handleSubmit}>
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
              value={profile.shopName || ""}
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
              value={profile.businessName || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="businessEmail">Business Email</label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={profile.businessEmail || ""}
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
              value={profile.businessPhoneNumber || ""}
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
            value={profile.address || ""}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isUpdating}
          style={{ width: "100%", marginTop: "20px" }}
        >
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </form>

      <div
        style={{
          borderTop: "1px solid var(--border-color)",
          marginTop: "30px",
          paddingTop: "20px",
        }}
      >
        <h3>Account Actions</h3>
        <button
          onClick={handleDeactivationRequest}
          disabled={isUpdating}
          style={{ backgroundColor: "var(--error-red)" }}
        >
          Request Account Deactivation
        </button>
      </div>
    </div>
  );
};

export default SellerProfilePage;
