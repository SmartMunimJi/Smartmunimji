// src/pages/Customer/RegisteredProductsPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";
import { useAuth } from "../../hooks/useAuth";

const RegisteredProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.get("/customer/products");
        if (response.data.status === "success") {
          // Ensure products is always an array, even if the API returns null/undefined
          setProducts(response.data.data.products || []);
        } else {
          setMessage({ type: "error", text: "Could not fetch your products." });
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
            text: "An error occurred while fetching your products.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [logout, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>My Registered Products</h2>
        <button onClick={() => navigate("/customer/products/register")}>
          Register New Product
        </button>
      </div>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {/* Handle the case where the user has no products yet */}
      {!isLoading && products.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            border: "2px dashed var(--border-color)",
            borderRadius: "8px",
          }}
        >
          <h3>No Products Found</h3>
          <p>
            You have not registered any products yet. Click the button above to
            get started!
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Shop Name</th>
                <th>Purchase Date</th>
                <th>Warranty Until</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.registeredProductId}>
                  <td>{product.productName}</td>
                  <td>{product.shopName}</td>
                  <td>{formatDateForDisplay(product.purchaseDate)}</td>
                  <td>{formatDateForDisplay(product.warrantyValidUntil)}</td>
                  <td>
                    <span
                      style={{
                        color: product.isWarrantyEligible
                          ? "var(--success-green)"
                          : "var(--error-red)",
                        fontWeight: "bold",
                      }}
                    >
                      {product.isWarrantyEligible ? "Eligible" : "Expired"}
                    </span>
                  </td>
                  <td>
                    {product.isWarrantyEligible ? (
                      // Pass the product name in state to the claim page for a better UX
                      <Link
                        to={`/customer/claim/${product.registeredProductId}`}
                        state={{ productName: product.productName }}
                      >
                        <button
                          style={{ padding: "8px 12px", fontSize: "14px" }}
                        >
                          Claim Warranty
                        </button>
                      </Link>
                    ) : (
                      <button
                        style={{ padding: "8px 12px", fontSize: "14px" }}
                        disabled
                      >
                        Claim Warranty
                      </button>
                    )}
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

export default RegisteredProductsPage;
