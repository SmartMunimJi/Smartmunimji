// src/pages/Auth/LoginPage.js

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import AlertMessage from "../../components/AlertMessage";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // To store { type: 'error'/'success', text: '...' }

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    switch (role) {
      case "CUSTOMER":
        return "/customer/dashboard";
      case "SELLER":
        return "/seller/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // API Endpoint: POST /sm/auth/login
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });

      if (response.data.status === "success") {
        const { jwtToken, userId, role } = response.data.data;
        // Use the login function from AuthContext
        login(jwtToken, userId, role);
        // Navigate to the role-specific dashboard
        navigate(getDashboardPath(role));
      } else {
        // Handle cases where API returns success but with a fail status
        setMessage({
          type: "error",
          text: response.data.message || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      // Handle API call errors (e.g., 401, 404, 500)
      const errorMsg =
        error.response?.data?.message || "An unexpected error occurred.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "450px", margin: "40px auto" }}>
      <h2>Login to Smart Munim Ji</h2>
      <form onSubmit={handleLogin}>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Don't have an account? <Link to="/register-choice">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;
