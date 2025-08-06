// src/pages/Seller/SellerProductsPage.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // API Endpoint: GET /sm/seller/products
        const response = await apiService.get("/seller/products");
        if (response.data.status === "success") {
          setProducts(response.data.data.products);
        } else {
          setMessage({ type: "error", text: "Could not fetch products." });
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: "An error occurred while fetching products.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [logout, navigate]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2>Customer Registered Products</h2>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {products.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px" }}>
          No customers have registered products with your shop yet.
        </p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Customer Phone</th>
                <th>Product Name</th>
                <th>Order ID</th>
                <th>Purchase Date</th>
                <th>Warranty Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.registeredProductId}>
                  <td>{product.customerName}</td>
                  <td>{product.customerPhoneNumber}</td>
                  <td>{product.productName}</td>
                  <td>{product.orderId}</td>
                  <td>{formatDateForDisplay(product.purchaseDate)}</td>
                  <td>
                    <span
                      style={{
                        color: product.isWarrantyEligible
                          ? "var(--success-green)"
                          : "var(--error-red)",
                        fontWeight: "bold",
                      }}
                    >
                      {product.isWarrantyEligible ? "Active" : "Expired"}
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

export default SellerProductsPage;
