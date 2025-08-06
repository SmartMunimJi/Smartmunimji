// src/pages/Seller/SellerClaimsPage.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SellerClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        // API Endpoint: GET /sm/seller/claims
        const response = await apiService.get("/seller/claims");
        if (response.data.status === "success") {
          setClaims(response.data.data.claims);
        } else {
          setMessage({ type: "error", text: "Could not fetch claims." });
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: "An error occurred while fetching claims.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, [logout, navigate]);

  const handleRowClick = (claimId) => {
    navigate(`/seller/claims/${claimId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
      case "RESOLVED":
        return "var(--success-green)";
      case "DENIED":
        return "var(--error-red)";
      case "IN_PROGRESS":
        return "#007bff";
      default:
        return "var(--text-light)";
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2>Manage Warranty Claims</h2>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {claims.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px" }}>
          You have no warranty claims to manage at this time.
        </p>
      ) : (
        <div className="table-container">
          <table style={{ cursor: "pointer" }}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Product Name</th>
                <th>Claimed On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr
                  key={claim.claimId}
                  onClick={() => handleRowClick(claim.claimId)}
                  title="Click to view details"
                >
                  <td>{claim.customerName}</td>
                  <td>{claim.productName}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerClaimsPage;
