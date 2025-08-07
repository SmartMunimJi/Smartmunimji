// src/pages/Customer/MySellersPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const MySellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMySellers = async () => {
      try {
        // API Endpoint: GET /sm/customer/my-sellers
        const response = await apiService.get("/customer/my-sellers");
        if (response.data.status === "success") {
          // Ensure that we always have an array, even if the API returns null/undefined
          setSellers(response.data.data.sellers || []);
        } else {
          setMessage({ type: "error", text: "Could not fetch your sellers." });
        }
      } catch (error) {
        // ** ROBUST ERROR HANDLING **
        // If the token is invalid or the user is not authorized, log them out.
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout();
          navigate("/login");
        } else {
          // For any other error, display a message to the user.
          setMessage({
            type: "error",
            text: "An error occurred while fetching your sellers.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMySellers();
  }, [logout, navigate]); // Dependencies for useEffect

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card">
      <h2>My Sellers</h2>
      <p style={{ color: "var(--text-light)" }}>
        This is a list of sellers from whom you have registered products.
      </p>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {sellers.length === 0 && !isLoading ? (
        <div style={{ textAlign: "center", padding: "30px" }}>
          <p>You haven't registered products with any sellers yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {sellers.map((seller) => (
            <div key={seller.sellerId} className="card" style={{ margin: "0" }}>
              <h3>{seller.shopName}</h3>
              <p>
                <strong>Business Email:</strong> {seller.businessEmail || "N/A"}
              </p>
              <p>
                <strong>Business Phone:</strong>{" "}
                {seller.businessPhoneNumber || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySellersPage;
