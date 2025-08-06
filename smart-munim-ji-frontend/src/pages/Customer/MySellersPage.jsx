// src/pages/Customer/MySellersPage.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const MySellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMySellers = async () => {
      try {
        // API Endpoint: GET /sm/customer/my-sellers
        const response = await apiService.get("/customer/my-sellers");
        if (response.data.status === "success") {
          setSellers(response.data.data.sellers);
        } else {
          setMessage({ type: "error", text: "Could not fetch your sellers." });
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else {
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
  }, [logout, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card">
      <h2>My Sellers</h2>
      <p style={{ color: "var(--text-light)" }}>
        This is a list of sellers you have registered products with.
      </p>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {sellers.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px" }}>
          You haven't registered products with any sellers yet.
        </p>
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
