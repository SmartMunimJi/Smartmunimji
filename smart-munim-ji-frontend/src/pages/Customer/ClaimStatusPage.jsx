// src/pages/Customer/ClaimStatusPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const ClaimStatusPage = () => {
  const [claims, setClaims] = useState([]); // Initialized as an empty array
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        // API Endpoint: GET /sm/customer/claims
        const response = await apiService.get("/customer/claims");
        if (response.data.status === "success") {
          // Ensure we set an array, even if the API returns null/undefined
          setClaims(response.data.data.claims || []);
        } else {
          setMessage({ type: "error", text: "Could not fetch your claims." });
        }
      } catch (error) {
        // ROBUST ERROR HANDLING
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: "An error occurred while fetching your claims.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, [logout, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
      case "RESOLVED":
        return "var(--success-green)";
      case "DENIED":
        return "var(--error-red)";
      case "IN_PROGRESS":
        return "#007bff"; // A standard blue
      case "REQUESTED":
      default:
        return "var(--text-light)";
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card">
      <h2>My Warranty Claims</h2>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {claims.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px" }}>
          <p>You have not submitted any warranty claims yet.</p>
          <Link to="/customer/products">
            <button>View My Products to Start a Claim</button>
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Issue Description</th>
                <th>Claimed On</th>
                <th>Status</th>
                <th>Seller's Response</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.claimId}>
                  <td>{claim.productName}</td>
                  <td style={{ whiteSpace: "pre-wrap", minWidth: "200px" }}>
                    {claim.issueDescription}
                  </td>
                  <td>{formatDateForDisplay(claim.claimedAt)}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: getStatusColor(claim.claimStatus),
                      }}
                    >
                      {claim.claimStatus}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "pre-wrap", minWidth: "200px" }}>
                    {claim.sellerResponseNotes || "No response yet."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClaimStatusPage;
