// src/pages/Customer/CustomerProfilePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components (reusing common styles) ---
const ProfileContainer = styled.div`
  max-width: 700px;
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

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
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

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: bold;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
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
const CustomerProfilePage = () => {
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
      setMessage(null);
      try {
        // API Endpoint: GET /sm/customer/profile - Backend returns data directly under 'data'
        const response = await apiService.get("/customer/profile");
        if (response.data.status === "success") {
          // --- FIX: Access data correctly ---
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
              "An error occurred while fetching your profile.",
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

    // Filter out fields that are read-only or not meant to be updated
    const updatePayload = {
      name: profile.name,
      address: profile.address,
    };

    try {
      // API Endpoint: PUT /sm/customer/profile
      const response = await apiService.put("/customer/profile", updatePayload);

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
    <ProfileContainer>
      <Title>My Profile</Title>
      <Subtitle>View and update your personal information.</Subtitle>

      <StyledForm onSubmit={handleSubmit}>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            value={profile.email || ""}
            readOnly
            $readOnly
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            type="tel"
            id="phoneNumber"
            value={profile.phone_number || ""}
            readOnly
            $readOnly
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="name">Full Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={profile.name || ""}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="address">Address</Label>
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
          {isUpdating ? "Updating..." : "Update Profile"}
        </SubmitButton>
      </StyledForm>
    </ProfileContainer>
  );
};

export default CustomerProfilePage;
