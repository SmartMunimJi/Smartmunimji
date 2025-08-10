// src/pages/Auth/SellerRegisterPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiService from "../../api/apiService";
import { SELLER_TERMS } from "../../utils/termsAndConditions";
import AlertMessage from "../../components/AlertMessage.jsx"; // Ensure .jsx extension

// --- Styled Components for Seller Registration Page ---

const RegisterContainer = styled.div`
  max-width: 800px; /* Slightly wider for seller forms */
  margin: ${({ theme }) => theme.spacing.xl} auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) =>
    theme.spacing.md}; /* Spacing between form groups/sections */
`;

const SectionTitle = styled.h3`
  margin-top: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns by default */
  gap: ${({ theme }) => theme.spacing.lg}; /* Gap between columns and rows */

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr; /* Stack columns on mobile */
  }
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

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0; /* Tight spacing below input */
`;

const TermsContainer = styled.div`
  max-height: 180px; /* Slightly taller for more content */
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  white-space: pre-wrap; /* Preserves line breaks */
  font-size: ${({ theme }) => theme.fontSizes.small};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.lg}; /* More space above button */
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
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

// --- SellerRegisterPage Component Logic ---

const SellerRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    shopName: "",
    businessName: "",
    businessEmail: "",
    businessPhoneNumber: "",
    address: "",
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
    if (!formData.name) newErrors.name = "Manager's name is required.";
    if (!formData.email) newErrors.email = "Login email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Login email is invalid.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    // phoneNumber for manager is optional based on schema for customer, but required for seller
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Manager's phone number is required.";
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

    if (!validateForm()) {
      setMessage({
        type: "error",
        text: "Please correct the errors in the form.",
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
      // API Endpoint: POST /sm/auth/register/seller
      const response = await apiService.post("/auth/register/seller", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber, // Manager's phone
        shopName: formData.shopName,
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        businessPhoneNumber: formData.businessPhoneNumber,
        address: formData.address, // Business address
      });

      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: "Registration successful! Your account is pending admin approval. You will be redirected to login.",
        });
        // Clear form after successful submission
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phoneNumber: "",
          shopName: "",
          businessName: "",
          businessEmail: "",
          businessPhoneNumber: "",
          address: "",
        });
        setAgreedToTerms(false);
        setTimeout(() => navigate("/login"), 4000);
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Registration failed.",
        });
      }
    } catch (error) {
      // Robust error handling for API responses
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
      <Title>Register as a Seller</Title>
      <Subtitle>
        Create a seller account to start managing your products and warranties.
        Your account will be activated after admin approval.
      </Subtitle>

      <StyledForm onSubmit={handleSubmit} noValidate>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <SectionTitle>Manager & Login Details</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="name">Manager's Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              $hasError={!!errors.name}
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor="email">Login Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              $hasError={!!errors.email}
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
            />
            {errors.confirmPassword && (
              <ErrorText>{errors.confirmPassword}</ErrorText>
            )}
          </FormGroup>
          <FormGroup>
            <Label htmlFor="phoneNumber">Manager's Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              $hasError={!!errors.phoneNumber}
            />
            {errors.phoneNumber && <ErrorText>{errors.phoneNumber}</ErrorText>}
          </FormGroup>
        </FormGrid>

        <SectionTitle>Business Details</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              name="shopName"
              type="text"
              value={formData.shopName}
              onChange={handleChange}
              $hasError={!!errors.shopName}
            />
            {errors.shopName && <ErrorText>{errors.shopName}</ErrorText>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor="businessName">Business Name (Optional)</Label>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              name="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={handleChange}
              $hasError={!!errors.businessEmail}
            />
            {errors.businessEmail && (
              <ErrorText>{errors.businessEmail}</ErrorText>
            )}
          </FormGroup>
          <FormGroup>
            <Label htmlFor="businessPhoneNumber">Business Phone Number</Label>
            <Input
              id="businessPhoneNumber"
              name="businessPhoneNumber"
              type="tel"
              value={formData.businessPhoneNumber}
              onChange={handleChange}
            />
          </FormGroup>
        </FormGrid>
        <FormGroup style={{ gridColumn: "1 / -1" }}>
          {" "}
          {/* Ensure address takes full width */}
          <Label htmlFor="address">Business Address</Label>
          <Input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            $hasError={!!errors.address}
          />
          {errors.address && <ErrorText>{errors.address}</ErrorText>}
        </FormGroup>

        <SectionTitle>Terms & Conditions</SectionTitle>
        <TermsContainer>{SELLER_TERMS}</TermsContainer>

        <CheckboxGroup>
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <Label
            htmlFor="agreeToTerms"
            style={{ marginBottom: 0, fontWeight: "normal" }}
          >
            I have read and agree to the Seller Terms & Conditions.
          </Label>
        </CheckboxGroup>

        <SubmitButton type="submit" disabled={isLoading || !agreedToTerms}>
          {isLoading ? "Registering..." : "Register as Seller"}
        </SubmitButton>
      </StyledForm>

      <LoginLink>
        Already have an account? <Link to="/login">Go back to Login</Link>
      </LoginLink>
    </RegisterContainer>
  );
};

export default SellerRegisterPage;
