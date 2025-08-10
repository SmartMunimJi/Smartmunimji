// src/pages/Seller/SellerClaimDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components (as previously defined, included for completeness) ---
const DetailContainer = styled.div`
  max-width: 900px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  position: relative; /* For modal positioning */
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr; /* Stack on mobile */
  }
`;

const InfoBlock = styled.div`
  h4 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  p {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
    strong {
      color: ${({ theme }) => theme.colors.textSecondary};
      margin-right: ${({ theme }) => theme.spacing.xs};
    }
  }
`;

const DescriptionBlock = styled(InfoBlock)`
  grid-column: 1 / -1; /* Spans all columns in the grid */
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const StatusSpan = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${(props) => {
    switch (props.$status) {
      case "ACCEPTED":
      case "RESOLVED":
        return props.theme.colors.success;
      case "DENIED":
        return props.theme.colors.error;
      case "IN_PROGRESS":
        return "#007bff"; // Standard blue
      case "REQUESTED":
      default:
        return props.theme.colors.textSecondary;
    }
  }};
`;

const UpdateForm = styled.form`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.xl};
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

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  background-color: white;
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  min-height: 100px;
  resize: vertical;
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

const QuickActionButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const QuickActionButton = styled(SubmitButton)`
  background-color: ${(props) =>
    props.$type === "accept"
      ? props.theme.colors.success
      : props.theme.colors.error};
  width: auto;
  margin-top: 0;
  &:hover {
    background-color: ${(props) =>
      props.$type === "accept"
        ? props.theme.colors.success + "D0"
        : props.theme.colors.error + "D0"};
  }
`;

// --- Modal Styled Components ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ModalButton = styled(SubmitButton)`
  width: auto;
  margin-top: 0;
  background-color: ${(props) =>
    props.$primary
      ? props.theme.colors.primary
      : props.theme.colors.textSecondary};
  &:hover {
    background-color: ${(props) =>
      props.$primary
        ? props.theme.colors.primaryLight
        : props.theme.colors.textSecondary + "D0"};
  }
`;

// --- Component Logic ---
const SellerClaimDetailPage = () => {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [responseNotes, setResponseNotes] = useState(""); // State for manual form
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  // Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'ACCEPT' or 'DENY'
  const [modalNotes, setModalNotes] = useState(""); // State for modal notes
  const [modalError, setModalError] = useState(null); // Error for modal validation

  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const claimStatusOptions = [
    "REQUESTED",
    "ACCEPTED",
    "DENIED",
    "IN_PROGRESS",
    "RESOLVED",
  ];

  useEffect(() => {
    if (!claimId) {
      setMessage({
        type: "error",
        text: "Error: Claim ID is missing from the URL. Please go back and select a valid claim.",
      });
      setIsLoading(false);
      return;
    }

    const fetchClaimDetails = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const response = await apiService.get(
          `/seller/claims/${Number(claimId)}`
        );

        if (response.data.status === "success") {
          const fetchedClaim = response.data.data;
          setClaim(fetchedClaim);
          setNewStatus(fetchedClaim.claimStatus);
          setResponseNotes(fetchedClaim.sellerResponseNotes || ""); // Initialize notes for manual form
        } else {
          setMessage({
            type: "error",
            text: response.data.message || "Could not fetch claim details.",
          });
          setClaim(null);
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else if (error.response?.status === 404) {
          setMessage({
            type: "error",
            text: `Claim with ID ${claimId} not found on this server. It might not exist or might not belong to your shop.`,
          });
          setClaim(null);
        } else {
          setMessage({
            type: "error",
            text:
              error.response?.data?.message ||
              "An error occurred while fetching claim details.",
          });
          setClaim(null);
        }
        console.error(
          "API Response Error:",
          error.response?.status,
          error.response?.data?.message || error.message
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaimDetails();
  }, [claimId, logout, navigate]);

  const handleSubmit = async (statusToSubmit, notesToSubmit) => {
    setIsUpdating(true);
    setMessage(null);
    setModalError(null);

    if (statusToSubmit === "DENIED" && !notesToSubmit.trim()) {
      setModalError("Response notes are required when denying a claim.");
      setIsUpdating(false);
      return;
    }

    try {
      const response = await apiService.put(
        `/seller/claims/${Number(claimId)}`,
        {
          claimStatus: statusToSubmit,
          sellerResponseNotes: notesToSubmit, // Always send the notes, even if empty string
        }
      );

      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: "Claim updated successfully! Navigating back to claims list...",
        });
        setClaim((prevClaim) => ({
          ...prevClaim,
          claimStatus: statusToSubmit,
          sellerResponseNotes: notesToSubmit,
        }));
        setShowActionModal(false);
        setModalNotes("");

        setTimeout(() => navigate("/seller/claims"), 1500);
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to update claim.",
        });
        setModalError(response.data.message || "Failed to update claim.");
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        navigate("/login");
      } else if (error.response?.status === 404) {
        setMessage({
          type: "error",
          text: `Failed to update: Claim with ID ${claimId} not found or not accessible.`,
        });
      } else {
        setMessage({
          type: "error",
          text:
            error.response?.data?.message ||
            "An unexpected error occurred during update.",
        });
      }
      setModalError(
        error.response?.data?.message ||
          "An unexpected error occurred during update."
      );
      console.error(
        "API Response Error:",
        error.response?.status,
        error.response?.data?.message || error.message
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const openActionModal = (type) => {
    setActionType(type);
    setModalNotes(claim?.sellerResponseNotes || ""); // Pre-fill with existing notes
    setModalError(null);
    setShowActionModal(true);
  };

  const handleModalSubmit = () => {
    const status = actionType === "ACCEPT" ? "ACCEPTED" : "DENIED";
    handleSubmit(status, modalNotes); // Pass modal notes
  };

  if (isLoading) return <LoadingSpinner />;

  if (!claim) {
    return (
      <DetailContainer>
        <Title>Claim Details</Title>
        {message && <AlertMessage message={message.text} type={message.type} />}
        {!message && (
          <AlertMessage
            message="Claim details could not be loaded or claim not found."
            type="info"
          />
        )}
      </DetailContainer>
    );
  }

  const showQuickActions = claim.claimStatus === "REQUESTED";

  return (
    <DetailContainer>
      <Title>Claim Details for {claim.productName}</Title>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {/* Claim Information Section */}
      <InfoGrid>
        <InfoBlock>
          <h4>Customer Information</h4>
          <p>
            <strong>Name:</strong> {claim.customerName || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {claim.customerPhoneNumber || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {claim.customerEmail || "N/A"}
          </p>
        </InfoBlock>
        <InfoBlock>
          <h4>Product Information</h4>
          <p>
            <strong>Product:</strong> {claim.productName || "N/A"}
          </p>
          <p>
            <strong>Order ID:</strong> {claim.sellerOrderId || "N/A"}
          </p>
          <p>
            <strong>Purchase Date:</strong>{" "}
            {formatDateForDisplay(claim.dateOfPurchase) || "N/A"}
          </p>
          <p>
            <strong>Warranty Ends:</strong>{" "}
            {formatDateForDisplay(claim.warrantyValidUntil) || "N/A"}
          </p>
        </InfoBlock>
        <DescriptionBlock>
          <h4>Issue Description</h4>
          <p>{claim.issueDescription || "No description provided."}</p>{" "}
          {/* Use issueDescription */}
        </DescriptionBlock>
        <InfoBlock>
          <h4>Current Status</h4>
          <p>
            <strong>Status:</strong>{" "}
            <StatusSpan $status={claim.claimStatus}>
              {claim.claimStatus}
            </StatusSpan>
          </p>
          <p>
            <strong>Claimed On:</strong>{" "}
            {formatDateForDisplay(claim.claimedAt) || "N/A"}
          </p>
        </InfoBlock>
        <InfoBlock>
          <h4>Seller's Notes (Previous)</h4>
          <p>{claim.sellerResponseNotes || "No previous notes."}</p>
        </InfoBlock>
      </InfoGrid>

      {/* Quick Action Buttons (for REQUESTED claims only) */}
      {showQuickActions && (
        <QuickActionButtonContainer>
          <QuickActionButton
            $type="accept"
            onClick={() => openActionModal("ACCEPT")}
            disabled={isUpdating}
          >
            Accept Claim
          </QuickActionButton>
          <QuickActionButton
            $type="deny"
            onClick={() => openActionModal("DENY")}
            disabled={isUpdating}
          >
            Deny Claim
          </QuickActionButton>
        </QuickActionButtonContainer>
      )}

      {/* Full Status Update Form (always available for granular control) */}
      <UpdateForm
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(newStatus, responseNotes);
        }}
      >
        <h3>Change Status (Advanced)</h3>
        <FormGroup>
          <Label htmlFor="claimStatus">Change Status To:</Label>
          <Select
            id="claimStatus"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {claimStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="responseNotes">
            Your Response Notes (Visible to Customer)
          </Label>
          <TextArea
            id="responseNotes"
            rows="5"
            value={responseNotes}
            onChange={(e) => setResponseNotes(e.target.value)}
            placeholder="e.g., Please bring the item to our service center for inspection. Or reason for denial."
          />
        </FormGroup>
        <SubmitButton type="submit" disabled={isUpdating}>
          {isUpdating ? "Updating Status..." : "Update Status Manually"}
        </SubmitButton>
      </UpdateForm>

      {/* Action Modal */}
      {showActionModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>
              {actionType === "ACCEPT"
                ? "Accept Warranty Claim?"
                : "Deny Warranty Claim?"}
            </h3>
            {modalError && <AlertMessage message={modalError} type="error" />}

            <p>
              {actionType === "ACCEPT"
                ? `Are you sure you want to ACCEPT this claim for "${claim.productName}"?`
                : `Are you sure you want to DENY this claim for "${claim.productName}"?`}
            </p>

            <FormGroup>
              <Label htmlFor="modalResponseNotes">
                Response Notes {actionType === "DENY" && "(Required)"}:
              </Label>
              <TextArea
                id="modalResponseNotes"
                rows="4"
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder={
                  actionType === "DENY"
                    ? "Reason for denial, e.g., 'Out of warranty period', 'Physical damage not covered'."
                    : "Optional notes for customer, e.g., 'Please bring it to service center.'"
                }
                required={actionType === "DENY"}
              />
            </FormGroup>

            <ModalActions>
              <ModalButton
                onClick={() => setShowActionModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </ModalButton>
              <ModalButton
                $primary
                onClick={handleModalSubmit}
                disabled={
                  isUpdating || (actionType === "DENY" && !modalNotes.trim())
                }
              >
                {isUpdating
                  ? "Processing..."
                  : actionType === "ACCEPT"
                  ? "Confirm Accept"
                  : "Confirm Deny"}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </DetailContainer>
  );
};

export default SellerClaimDetailPage;
