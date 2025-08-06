// src/pages/Auth/CustomerRegisterPage.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { CUSTOMER_TERMS } from "../../utils/termsAndConditions";
import AlertMessage from "../../components/AlertMessage";

const CustomerRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email address is invalid.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required.";
    if (!formData.address) newErrors.address = "Address is required.";

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
      // API Endpoint: POST /sm/auth/register/customer
      const response = await apiService.post("/auth/register/customer", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });

      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: "Registration successful! You will be redirected to login.",
        });
        setTimeout(() => navigate("/login"), 3000);
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
    <div className="card" style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h2>Register as a Customer</h2>
      <p style={{ color: "var(--text-light)" }}>
        Create your account to start managing your warranties.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {message && <AlertMessage message={message.text} type={message.type} />}

        {/* Form Fields */}
        <div>
          <label htmlFor="name">Full Name</label>
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
          <label htmlFor="email">Email Address</label>
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

        <div>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={errors.phoneNumber ? "input-error" : ""}
          />
          {errors.phoneNumber && (
            <p className="error-message">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="address">Address</label>
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
          {CUSTOMER_TERMS}
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
            I have read and agree to the Customer Terms & Conditions.
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

export default CustomerRegisterPage;
