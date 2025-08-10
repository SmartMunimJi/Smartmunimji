// src/pages/Auth/LoginPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components"; // Import styled-components
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js"; // Use our custom hook
import AlertMessage from "../../components/AlertMessage.jsx"; // Ensure .jsx extension

// --- Styled Components for LoginPage ---

const LoginPageContainer = styled.div`
  max-width: 450px;
  margin: ${({ theme }) => theme.spacing.xxl} auto; /* Use theme spacing */
  padding: ${({ theme }) => theme.spacing.xl}; /* Use theme spacing */
  background: ${({ theme }) => theme.colors.surface}; /* Use theme colors */
  border-radius: ${({ theme }) => theme.radii.md}; /* Use theme radii */
  box-shadow: ${({ theme }) => theme.shadows.card}; /* Use theme shadows */
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) =>
    theme.colors.primary}; /* Ensure title color is primary */
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg}; /* Use theme spacing for gap */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text}; /* Consistent text color */
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.text}; /* Consistent text color */
  background-color: ${({ theme }) =>
    theme.colors.surface}; /* Ensure background is white */

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight}; /* Subtle focus highlight */
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary}; /* Placeholder color */
  }
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out; /* Smooth transitions */

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    opacity: 0.7; /* Faded appearance for disabled state */
    cursor: not-allowed;
  }
`;

const RegisterLinkContainer = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) =>
    theme.colors.textSecondary}; /* Consistent text color */

  a {
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.primary}; /* Link color from theme */
  }
`;

// --- LoginPage Component Logic ---

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // To store { type: 'error'/'success', text: '...' }

  const { login } = useAuth(); // Use useAuth hook for login functionality
  const navigate = useNavigate();

  // Helper to get dashboard path based on role from backend report
  const getDashboardPath = (role) => {
    switch (role) {
      case "CUSTOMER":
        return "/customer/dashboard";
      case "SELLER":
        return "/seller/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/"; // Fallback to home if role is unexpected
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    setIsLoading(true); // Start loading state
    setMessage(null); // Clear previous messages

    try {
      // API Endpoint: POST /sm/auth/login as per backend documentation
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });

      // Backend report confirms 'status: "success"' for successful login
      if (response.data.status === "success") {
        const { jwtToken, userId, role } = response.data.data;
        // Use the login function from AuthContext to update global state and localStorage
        login(jwtToken, userId, role);
        // Navigate to the role-specific dashboard
        navigate(getDashboardPath(role));
      } else {
        // Handle cases where API returns 200 OK but with a 'fail' status
        setMessage({
          type: "error",
          text: response.data.message || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      // Robust error handling based on backend documentation (400, 401, 403, 500 etc.)
      const errorResponse = error.response;
      let errorMsg = "An unexpected error occurred. Please try again.";

      if (errorResponse) {
        // Use backend's specific message if available
        errorMsg = errorResponse.data?.message || errorMsg;

        // Specific handling for common auth errors (though ProtectedRoute will catch subsequent 401/403)
        if (errorResponse.status === 401) {
          errorMsg =
            errorResponse.data?.message ||
            "Invalid credentials. Please check your email and password.";
        } else if (errorResponse.status === 403) {
          errorMsg =
            errorResponse.data?.message ||
            "Account is inactive or forbidden. Please contact support.";
        } else if (errorResponse.status === 400) {
          errorMsg =
            errorResponse.data?.message ||
            "Bad request. Please ensure all fields are correct.";
        }
      } else {
        // Network errors (no response from server)
        errorMsg = "Network error: Could not connect to the server.";
      }
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  return (
    <LoginPageContainer>
      <Title>Login to Smart Munim Ji</Title>
      {message && <AlertMessage message={message.text} type={message.type} />}

      <StyledForm onSubmit={handleLogin}>
        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter Your Registered e-mail"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </SubmitButton>
      </StyledForm>

      <RegisterLinkContainer>
        Don't have an account? <Link to="/register-choice">Register here</Link>
      </RegisterLinkContainer>
    </LoginPageContainer>
  );
};

export default LoginPage;
