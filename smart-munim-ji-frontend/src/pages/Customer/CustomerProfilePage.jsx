// src/pages/Customer/CustomerProfilePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const CustomerProfilePage = () => {
  // Initial state for profile is an object with empty strings
  const [profile, setProfile] = useState({
    name: "",
    address: "",
    email: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // API Endpoint: GET /sm/customer/profile
        const response = await apiService.get("/customer/profile");
        if (response.data.status === "success") {
          // Set profile data, providing defaults if any fields are null
          setProfile({
            name: response.data.data.profile.name || "",
            address: response.data.data.profile.address || "",
            email: response.data.data.profile.email || "",
            phoneNumber: response.data.data.profile.phoneNumber || "",
          });
        } else {
          setMessage({ type: "error", text: "Could not fetch your profile." });
        }
      } catch (error) {
        // ROBUST ERROR HANDLING
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
      // API Endpoint: PUT /sm/customer/profile
      const response = await apiService.put("/customer/profile", {
        name: profile.name,
        address: profile.address,
      });

      if (response.data.status === "success") {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to update profile.",
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "An unexpected error occurred.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card" style={{ maxWidth: "700px", margin: "40px auto" }}>
      <h2>My Profile</h2>
      <p style={{ color: "var(--text-light)" }}>
        View and update your personal information.
      </p>

      <form onSubmit={handleSubmit}>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="email">Email Address (Read-only)</label>
          <input
            type="email"
            id="email"
            value={profile.email}
            readOnly
            disabled
            style={{ backgroundColor: "#e9ecef" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="phoneNumber">Phone Number (Read-only)</label>
          <input
            type="tel"
            id="phoneNumber"
            value={profile.phoneNumber}
            readOnly
            disabled
            style={{ backgroundColor: "#e9ecef" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={isUpdating} style={{ width: "100%" }}>
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default CustomerProfilePage;
