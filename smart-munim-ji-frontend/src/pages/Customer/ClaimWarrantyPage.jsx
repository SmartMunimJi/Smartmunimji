// src/pages/Customer/ClaimWarrantyPage.js

import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import apiService from "../../api/apiService";
import AlertMessage from "../../components/AlertMessage";

const ClaimWarrantyPage = () => {
  const { registeredProductId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve product name passed from the previous page for a better UI
  const productName = location.state?.productName || "this product";

  const [issueDescription, setIssueDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        setTimeout(() => navigate("/customer/products"), 3000); // Redirect back to products list
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to submit claim.",
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "An unexpected error occurred.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "700px", margin: "40px auto" }}>
      <h2>Submit a Warranty Claim</h2>
      <p style={{ color: "var(--text-light)" }}>
        You are submitting a claim for: <strong>{productName}</strong>.
      </p>

      <form onSubmit={handleSubmit}>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="issueDescription">
            Please describe the issue in detail:
          </label>
          <textarea
            id="issueDescription"
            rows="8"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="For example: The device is not turning on, there is a crack in the screen, etc."
            required
          />
        </div>

        <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
          {isLoading ? "Submitting Claim..." : "Submit Claim"}
        </button>
      </form>
    </div>
  );
};

export default ClaimWarrantyPage;
