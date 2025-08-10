// src/pages/Customer/ClaimWarrantyPage.jsx

import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import apiService from "../../api/apiService";
import AlertMessage from "../../components/AlertMessage.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx"; // Add if you use isLoading in this page

// --- Styled Components ---
const ClaimFormContainer = styled.div`
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

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  min-height: 150px;
  resize: vertical;

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
const ClaimWarrantyPage = () => {
  const { registeredProductId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve product name passed from the previous page for a better UI
  const productName = location.state?.productName || "this product";

  const [issueDescription, setIssueDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For API submission
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!issueDescription.trim()) {
      setMessage({
        type: "error",
        text: "Please describe the issue with your product.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // API Endpoint: POST /sm/customer/claims
      const response = await apiService.post("/customer/claims", {
        registeredProductId: Number(registeredProductId),
        issueDescription,
      });

      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: "Claim submitted successfully! You will be redirected.",
        });
        setTimeout(() => navigate("/customer/claims"), 3000); // Redirect to claims status page
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to submit claim.",
        });
      }
    } catch (error) {
      // --- ROBUST ERROR HANDLING ---
      // Check for specific backend messages (e.g., product not found, not eligible, already active claim)
      const errorMsg =
        error.response?.data?.message || "An unexpected error occurred.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClaimFormContainer>
      <Title>Submit a Warranty Claim</Title>
      <Subtitle>
        You are submitting a claim for: <strong>{productName}</strong>.
      </Subtitle>

      <StyledForm onSubmit={handleSubmit}>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <FormGroup>
          <Label htmlFor="issueDescription">
            Please describe the issue in detail:
          </Label>
          <TextArea
            id="issueDescription"
            rows="8"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="For example: The device is not turning on, there is a crack in the screen, etc."
            required
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Submitting Claim..." : "Submit Claim"}
        </SubmitButton>
      </StyledForm>
    </ClaimFormContainer>
  );
};

export default ClaimWarrantyPage;
