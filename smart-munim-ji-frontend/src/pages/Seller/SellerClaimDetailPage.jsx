// src/pages/Seller/SellerClaimDetailPage.js

import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SellerClaimDetailPage = () => {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [responseNotes, setResponseNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const claimStatusOptions = [
    "REQUESTED",
    "ACCEPTED",
    "DENIED",
    "IN_PROGRESS",
    "RESOLVED",
  ];

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        // API Endpoint: GET /sm/seller/claims/:claimId
        const response = await apiService.get(`/seller/claims/${claimId}`);
        if (response.data.status === "success") {
          const fetchedClaim = response.data.data.claim;
          setClaim(fetchedClaim);
          setNewStatus(fetchedClaim.claimStatus);
          setResponseNotes(fetchedClaim.sellerResponseNotes || "");
        } else {
          setMessage({ type: "error", text: "Could not fetch claim details." });
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: "An error occurred while fetching details.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaimDetails();
  }, [claimId, logout, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    try {
      // API Endpoint: PUT /sm/seller/claims/:claimId
      const response = await apiService.put(`/seller/claims/${claimId}`, {
        claimStatus: newStatus,
        sellerResponseNotes: responseNotes,
      });

      if (response.data.status === "success") {
        setMessage({ type: "success", text: "Claim updated successfully!" });
        // Optionally re-fetch data or update local state
        setClaim(response.data.data.updatedClaim);
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Update failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data.message || "An error occurred.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!claim) return <AlertMessage message="Claim not found." type="error" />;

  return (
    <div className="card" style={{ maxWidth: "900px", margin: "40px auto" }}>
      <h2>Claim Details</h2>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {/* Claim Information Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h4>Customer Information</h4>
          <p>
            <strong>Name:</strong> {claim.customerName}
          </p>
          <p>
            <strong>Phone:</strong> {claim.customerPhoneNumber}
          </p>
          <p>
            <strong>Email:</strong> {claim.customerEmail}
          </p>
        </div>
        <div>
          <h4>Product Information</h4>
          <p>
            <strong>Product:</strong> {claim.productName}
          </p>
          <p>
            <strong>Order ID:</strong> {claim.orderId}
          </p>
          <p>
            <strong>Purchase Date:</strong>{" "}
            {formatDateForDisplay(claim.purchaseDate)}
          </p>
          <p>
            <strong>Warranty Ends:</strong>{" "}
            {formatDateForDisplay(claim.warrantyValidUntil)}
          </p>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <h4>Issue Description</h4>
          <p
            style={{
              whiteSpace: "pre-wrap",
              backgroundColor: "#f9f9f9",
              padding: "15px",
              borderRadius: "4px",
            }}
          >
            {claim.issueDescription}
          </p>
        </div>
      </div>

      {/* Update Form Section */}
      <form
        onSubmit={handleSubmit}
        style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "20px",
        }}
      >
        <h3>Update Claim Status</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <label htmlFor="claimStatus">Claim Status</label>
            <select
              id="claimStatus"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {claimStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: "20px" }}>
          <label htmlFor="responseNotes">
            Your Response Notes (visible to customer)
          </label>
          <textarea
            id="responseNotes"
            rows="5"
            value={responseNotes}
            onChange={(e) => setResponseNotes(e.target.value)}
            placeholder="e.g., Please bring the item to our store for inspection."
          />
        </div>
        <button
          type="submit"
          disabled={isUpdating}
          style={{ width: "100%", marginTop: "20px" }}
        >
          {isUpdating ? "Updating..." : "Update Claim Status"}
        </button>
      </form>
    </div>
  );
};

export default SellerClaimDetailPage;
