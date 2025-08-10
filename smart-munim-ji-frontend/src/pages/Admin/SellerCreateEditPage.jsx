// src/pages/Admin/SellerCreateEditPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components ---
const FormContainer = styled.div`
  max-width: 800px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  background-color: white; /* Ensure consistent background */

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr; /* Stack on mobile */
  }
`;

const SectionTitle = styled.h3`
  margin-top: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: bold;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.xl};
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

// --- Component Logic ---
const SellerCreateEditPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isEditMode = Boolean(sellerId);

  const [formData, setFormData] = useState({
    name: "", // Manager name, only for create
    email: "", // Manager email, only for create
    password: "", // Only for create
    phoneNumber: "", // Manager phone, only for create
    shopName: "",
    businessName: "",
    businessEmail: "",
    businessPhoneNumber: "",
    address: "",
    contractStatus: "PENDING", // Default for create, fetched for edit
    apiBaseUrl: "",
    apiKey: "",
  });

  const [isLoading, setIsLoading] = useState(isEditMode); // Only load on mount if in edit mode
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const contractStatusOptions = [
    "PENDING",
    "ACTIVE",
    "DEACTIVATED",
    "TERMINATED",
  ];

  useEffect(() => {
    if (isEditMode) {
      const fetchSellerData = async () => {
        try {
          // Backend GET /sm/admin/sellers returns an array directly under data
          const response = await apiService.get("/admin/sellers");
          if (response.data.status === "success") {
            const fetchedSellers = response.data.data; // Correct data access
            const seller = fetchedSellers.find(
              (s) => s.sellerId === Number(sellerId)
            );
            if (seller) {
              setFormData({
                // Map backend fields to formData. Ensure all expected fields are covered.
                shopName: seller.shopName || "",
                businessName: seller.businessName || "",
                businessEmail: seller.businessEmail || "",
                businessPhoneNumber: seller.businessPhoneNumber || "",
                address: seller.address || "",
                contractStatus: seller.contractStatus || "PENDING",
                apiBaseUrl: seller.apiBaseUrl || "",
                apiKey: seller.apiKey || "",
                // Manager details are NOT included in /admin/sellers GET response for existing sellers
                // so we don't try to set them. They are only for POST /admin/sellers.
              });
            } else {
              setMessage({ type: "error", text: "Seller not found." });
            }
          } else {
            setMessage({
              type: "error",
              text: response.data.message || "Failed to fetch seller list.",
            });
          }
        } catch (error) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            logout();
            navigate("/login");
          } else {
            setMessage({
              type: "error",
              text:
                error.response?.data?.message ||
                "An error occurred fetching seller data.",
            });
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchSellerData();
    }
  }, [sellerId, isEditMode, logout, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    let payload = {
      shopName: formData.shopName,
      businessName: formData.businessName,
      businessEmail: formData.businessEmail,
      businessPhoneNumber: formData.businessPhoneNumber,
      address: formData.address,
      contractStatus: formData.contractStatus,
      apiBaseUrl: formData.apiBaseUrl,
      apiKey: formData.apiKey,
    };

    // Add manager/login details ONLY for create mode
    if (!isEditMode) {
      payload = {
        ...payload,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
      };
      // Basic validation for create-specific fields
      if (
        !payload.name ||
        !payload.email ||
        !payload.password ||
        !payload.phoneNumber
      ) {
        setMessage({
          type: "error",
          text: "Please fill all manager/login fields for new seller registration.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    const apiCall = isEditMode
      ? apiService.put(`/admin/sellers/${sellerId}`, payload) // PUT /sm/admin/sellers/:sellerId
      : apiService.post("/admin/sellers", payload); // POST /sm/admin/sellers

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
    <FormContainer>
      <FormTitle>{isEditMode ? "Edit Seller" : "Create New Seller"}</FormTitle>
      <StyledForm onSubmit={handleSubmit}>
        {message && <AlertMessage message={message.text} type={message.type} />}

        {!isEditMode && (
          <>
            <SectionTitle>Manager & Login Details</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="name">Manager's Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isEditMode}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Login Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={!isEditMode}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditMode}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="phoneNumber">Manager Phone</Label>
                <Input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required={!isEditMode}
                />
              </FormGroup>
            </FormGrid>
          </>
        )}

        <SectionTitle>Business Information</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              type="text"
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="businessName">Business Name (Optional)</Label>
            <Input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName || ""}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="businessPhoneNumber">Business Phone</Label>
            <Input
              type="tel"
              id="businessPhoneNumber"
              name="businessPhoneNumber"
              value={formData.businessPhoneNumber || ""}
              onChange={handleChange}
            />
          </FormGroup>
        </FormGrid>
        <FormGroup>
          <Label htmlFor="address">Business Address</Label>
          <Input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <SectionTitle>API Configuration</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="apiBaseUrl">API Base URL</Label>
            <Input
              type="text"
              id="apiBaseUrl"
              name="apiBaseUrl"
              value={formData.apiBaseUrl || ""}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              type="text"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey || ""}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </FormGrid>

        <FormGroup>
          <Label htmlFor="contractStatus">Contract Status</Label>
          <Select
            id="contractStatus"
            name="contractStatus"
            value={formData.contractStatus}
            onChange={handleChange}
            required
          >
            {contractStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </FormGroup>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Seller"
            : "Create Seller"}
        </SubmitButton>
      </StyledForm>
    </FormContainer>
  );
};

export default SellerCreateEditPage;
