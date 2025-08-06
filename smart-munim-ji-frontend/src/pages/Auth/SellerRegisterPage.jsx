// src/pages/Auth/SellerRegisterPage.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { SELLER_TERMS } from "../../utils/termsAndConditions";
import AlertMessage from "../../components/AlertMessage";

const SellerRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "", // Manager's Name
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "", // Manager's Phone
    shopName: "",
    businessName: "", // Optional
    businessEmail: "",
    businessPhoneNumber: "",
    address: "", // Business Address
  });
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    // Required fields validation
    if (!formData.name) newErrors.name = "Manager's name is required.";
    if (!formData.email) newErrors.email = "Login email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Login email is invalid.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!formData.shopName) newErrors.shopName = "Shop name is required.";
    if (!formData.businessEmail)
      newErrors.businessEmail = "Business email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.businessEmail))
      newErrors.businessEmail = "Business email is invalid.";
    if (!formData.address) newErrors.address = "Business address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm() || !agreedToTerms) {
      if (!agreedToTerms) {
        setMessage({
          type: "error",
          text: "You must agree to the Terms & Conditions to register.",
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      // API Endpoint: POST /sm/auth/register/seller
      const response = await apiService.post("/auth/register/seller", formData);

      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: "Registration successful! Your account is pending admin approval. You will be redirected to login.",
        });
        setTimeout(() => navigate("/login"), 4000);
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Registration failed.",
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "An unexpected error occurred.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "700px", margin: "40px auto" }}>
      <h2>Register as a Seller</h2>
      <p style={{ color: "var(--text-light)" }}>
        Create a seller account to start managing your products and warranties.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {message && <AlertMessage message={message.text} type={message.type} />}

        {/* Manager Details */}
        <h3>Manager Details</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <label htmlFor="name">Manager's Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="phoneNumber">Manager's Phone</label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Login Credentials */}
        <h3>Login Credentials</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <label htmlFor="email">Login Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Business Details */}
        <h3 style={{ marginTop: "20px" }}>Business Details</h3>
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
              name="shopName"
              id="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className={errors.shopName ? "input-error" : ""}
            />
            {errors.shopName && (
              <p className="error-message">{errors.shopName}</p>
            )}
          </div>
          <div>
            <label htmlFor="businessName">Business Name (Optional)</label>
            <input
              type="text"
              name="businessName"
              id="businessName"
              value={formData.businessName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="businessEmail">Business Email</label>
            <input
              type="email"
              name="businessEmail"
              id="businessEmail"
              value={formData.businessEmail}
              onChange={handleChange}
              className={errors.businessEmail ? "input-error" : ""}
            />
            {errors.businessEmail && (
              <p className="error-message">{errors.businessEmail}</p>
            )}
          </div>
          <div>
            <label htmlFor="businessPhoneNumber">Business Phone</label>
            <input
              type="tel"
              name="businessPhoneNumber"
              id="businessPhoneNumber"
              value={formData.businessPhoneNumber}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <label htmlFor="address">Business Address</label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? "input-error" : ""}
          />
          {errors.address && <p className="error-message">{errors.address}</p>}
        </div>

        {/* Terms & Conditions */}
        <div
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            border: "1px solid var(--border-color)",
            padding: "10px",
            borderRadius: "4px",
            margin: "20px 0",
            whiteSpace: "pre-wrap",
            fontSize: "0.8em",
            backgroundColor: "#f9f9f9",
          }}
        >
          {SELLER_TERMS}
        </div>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            style={{ marginRight: "10px" }}
          />
          <label htmlFor="agreeToTerms">
            I have read and agree to the Seller Terms & Conditions.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !agreedToTerms}
          style={{ width: "100%" }}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SellerRegisterPage;
