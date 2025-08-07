// src/pages/Auth/CustomerRegisterPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { CUSTOMER_TERMS } from "../../utils/termsAndConditions.js";
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear specific error on change for better UX
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email address is invalid.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;
    if (!agreedToTerms) {
      setMessage({
        type: "error",
        text: "You must agree to the Terms & Conditions to register.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { name, email, password, phoneNumber, address } = formData;
      const response = await apiService.post("/auth/register/customer", {
        name,
        email,
        password,
        phoneNumber,
        address,
      });

      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: "Registration successful! You will be redirected to login.",
        });
        setTimeout(() => navigate("/login"), 3000);
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
            style={{ marginRight: "10px", width: "auto" }}
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
