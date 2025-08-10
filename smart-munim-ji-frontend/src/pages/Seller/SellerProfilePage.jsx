// src/pages/Seller/SellerProfilePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components (as previously defined) ---
const ProfileContainer = styled.div`
  max-width: 800px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
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
  background-color: ${(props) => (props.$readOnly ? "#e9ecef" : "white")};

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

const DeactivateButton = styled(SubmitButton)`
  background-color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.md};
  &:hover {
    background-color: ${(props) =>
      props.theme.colors.error}D0; /* Slightly darker red on hover */
  }
`;

const SectionSeparator = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

// --- Component Logic ---
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
      setIsLoading(true);
      setMessage(null);
      try {
        // Corrected API Endpoint: GET /sm/seller/profile
        const response = await apiService.get("/seller/profile");
        if (response.data.status === "success") {
          // Access data directly under 'data'
          setProfile(response.data.data);
        } else {
          setMessage({
            type: "error",
            text: response.data.message || "Could not fetch your profile.",
          });
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text:
              error.response?.data?.message ||
              "An error occurred while fetching profile.",
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
        text: error.response?.data?.message || "An error occurred.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeactivationRequest = async () => {
    if (
      window.confirm(
        "Are you sure you want to request account deactivation? This action cannot be undone and requires admin approval."
      )
    ) {
      setIsUpdating(true);
      setMessage(null);
      try {
        // API Endpoint: POST /sm/seller/deactivate-request
        const response = await apiService.post("/seller/deactivate-request");
        if (response.data.status === "success") {
          setMessage({
            type: "success",
            text: "Deactivation request sent successfully. An admin will review it.",
          });
        } else {
          setMessage({
            type: "error",
            text:
              response.data.message || "Failed to send deactivation request.",
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to send request.",
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ProfileContainer>
      <Title>Shop Profile</Title>
      {message && <AlertMessage message={message.text} type={message.type} />}
      <StyledForm onSubmit={handleSubmit}>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              type="text"
              id="shopName"
              name="shopName"
              value={profile.shopName || ""}
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
              value={profile.businessName || ""}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={profile.businessEmail || ""}
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
              value={profile.businessPhoneNumber || ""}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </FormGrid>
        <FormGroup>
          <Label htmlFor="address">Business Address</Label>
          <Input
            type="text"
            id="address"
            name="address"
            value={profile.address || ""}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <SubmitButton type="submit" disabled={isUpdating}>
          {isUpdating ? "Updating Profile..." : "Update Profile"}
        </SubmitButton>
      </StyledForm>
      <SectionSeparator>
        <h3>Account Actions</h3>
        <DeactivateButton
          onClick={handleDeactivationRequest}
          disabled={isUpdating}
        >
          Request Account Deactivation
        </DeactivateButton>
      </SectionSeparator>
    </ProfileContainer>
  );
};

export default SellerProfilePage;
