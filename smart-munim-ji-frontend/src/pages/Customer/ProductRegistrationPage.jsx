// src/pages/Customer/ProductRegistrationPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import AlertMessage from "../../components/AlertMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

const ProductRegistrationPage = () => {
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSellers, setIsFetchingSellers] = useState(true);
  const [message, setMessage] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch the list of sellers when the component mounts
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await apiService.get("/customer/sellers");
        if (response.data.status === "success") {
          setSellers(response.data.data.sellers || []); // Ensure sellers is always an array
        } else {
          setMessage({
            type: "error",
            text: "Could not fetch the list of sellers.",
          });
        }
      } catch (error) {
        // Handle authentication errors gracefully
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: "An error occurred while fetching sellers.",
          });
        }
      } finally {
        setIsFetchingSellers(false);
      }
    };

    fetchSellers();
  }, [logout, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedSellerId || !orderId || !purchaseDate) {
      setMessage({ type: "error", text: "Please fill out all fields." });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.post("/customer/products/register", {
        sellerId: Number(selectedSellerId),
        orderId,
        purchaseDate,
      });

      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: "Product registered successfully! Redirecting to your products list...",
        });
        setTimeout(() => navigate("/customer/products"), 2000);
      } else {
        // This case is for non-2xx responses that are not exceptions (less common with axios)
        setMessage({
          type: "error",
          text: response.data.message || "Failed to register product.",
        });
      }
    } catch (error) {
      if (error.response) {
        // Special handling for 424 Failed Dependency (External Seller API failed)
        if (error.response.status === 424) {
          setMessage({
            type: "error",
            text: `Registration failed: ${error.response.data.message}`,
          });
        }
        // Handle auth errors that might occur during the POST request itself
        else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          logout();
          navigate("/login");
        }
        // Handle all other API errors
        else {
          setMessage({
            type: "error",
            text:
              error.response.data.message || "An unexpected error occurred.",
          });
        }
      } else {
        // Handle network errors (server is down, etc.)
        setMessage({
          type: "error",
          text: "Network error or server is unreachable.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show a loading spinner while fetching the initial list of sellers
  if (isFetchingSellers) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h2>Register a New Product</h2>
      <p style={{ color: "var(--text-light)" }}>
        Select the seller, enter your order ID, and the date of purchase to add
        a new product to your account.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="seller">Select Seller</label>
          <select
            id="seller"
            value={selectedSellerId}
            onChange={(e) => setSelectedSellerId(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Please choose a seller --
            </option>
            {sellers.map((seller) => (
              <option key={seller.sellerId} value={seller.sellerId}>
                {seller.shopName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="orderId">Order ID</label>
          <input
            type="text"
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            placeholder="e.g., ORD-12345"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="purchaseDate">Date of Purchase</label>
          <input
            type="date"
            id="purchaseDate"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
          {isLoading ? "Registering..." : "Register Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductRegistrationPage;
