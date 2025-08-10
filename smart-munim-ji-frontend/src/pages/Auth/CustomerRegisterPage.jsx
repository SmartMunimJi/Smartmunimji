// src/pages/Auth/CustomerRegisterPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components"; // Import styled-components
import apiService from "../../api/apiService"; // API service for backend calls
import { CUSTOMER_TERMS } from "../../utils/termsAndConditions.js"; // T&C content
import AlertMessage from "../../components/AlertMessage.jsx"; // Reusable alert component

// --- Styled Components ---

const RegisterContainer = styled.div`
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing.xl} auto; /* Use theme spacing */
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin: ${({ theme }) => theme.spacing.lg} auto;
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg}; /* Spacing between form groups */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  width: 100%; /* Ensure inputs take full width */

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0; /* Small top margin, no other margins */
`;

const TermsContainer = styled.div`
  max-height: 180px; /* Increased height for better readability */
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  white-space: pre-wrap; /* Preserves line breaks in the text */
  font-size: ${({ theme }) => theme.fontSizes.small};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) =>
    theme.spacing.sm}; /* Space between checkbox and label */
  margin-top: ${({ theme }) =>
    theme.spacing.md}; /* Space above the checkbox group */

  input[type="checkbox"] {
    transform: scale(1.1); /* Slightly larger checkbox */
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
  margin-top: ${({ theme }) => theme.spacing.md}; /* Space above the button */
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: ${({ theme }) =>
    theme.spacing.xl}; /* Space above the login link */
  font-size: ${({ theme }) => theme.fontSizes.small};
  a {
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
`;

// --- Component Logic ---
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
    // Clear error for the field being typed in
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";

    if (!formData.email.trim()) newErrors.email = "Email address is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email address is invalid.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    else if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required.";

    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required.";
    // Optional: Add regex for phone number format

    if (!formData.address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    const formIsValid = validateForm();
    if (!formIsValid) {
      setMessage({
        type: "error",
        text: "Please correct the highlighted fields.",
      });
      return;
    }

    if (!agreedToTerms) {
      setMessage({
        type: "error",
        text: "You must agree to the Terms & Conditions to register.",
      });
      return;
    }

    setIsLoading(true);

    try {
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
        setFormData({
          // Clear form after successful registration
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phoneNumber: "",
          address: "",
        });
        setAgreedToTerms(false);
        setErrors({});
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessage({
          type: "error",
          text:
            response.data.message || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "An unexpected error occurred during registration.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <Title>Register as a Customer</Title>
      <Subtitle>
        Create your account to start managing your warranties.
      </Subtitle>

      <StyledForm onSubmit={handleSubmit} noValidate>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <FormGroup>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            $hasError={!!errors.name}
            placeholder="Enter Your Full Name"
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            $hasError={!!errors.email}
            placeholder="Enter Your Email Address"
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            $hasError={!!errors.password}
            placeholder="Minimum 6 characters"
          />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            $hasError={!!errors.confirmPassword}
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword && (
            <ErrorText>{errors.confirmPassword}</ErrorText>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            $hasError={!!errors.phoneNumber}
            placeholder="Enter Contact Number"
          />
          {errors.phoneNumber && <ErrorText>{errors.phoneNumber}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            $hasError={!!errors.address}
            placeholder="Enter your address"
          />
          {errors.address && <ErrorText>{errors.address}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Terms & Conditions</Label>
          <TermsContainer>{CUSTOMER_TERMS}</TermsContainer>
        </FormGroup>

        <CheckboxGroup>
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <Label htmlFor="agreeToTerms">
            I have read and agree to the Customer Terms & Conditions.
          </Label>
        </CheckboxGroup>

        <SubmitButton type="submit" disabled={isLoading || !agreedToTerms}>
          {isLoading ? "Registering..." : "Create Account"}
        </SubmitButton>
      </StyledForm>

      <LoginLink>
        Already have an account? <Link to="/login">Login here</Link>
      </LoginLink>
    </RegisterContainer>
  );
};

export default CustomerRegisterPage;
