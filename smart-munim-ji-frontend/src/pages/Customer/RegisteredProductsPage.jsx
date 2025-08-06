// src/pages/Customer/RegisteredProductsPage.js

import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const RegisteredProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // API Endpoint: GET /sm/customer/products
        const response = await apiService.get("/customer/products");
        if (response.data.status === "success") {
          setProducts(response.data.data.products);
        } else {
          setMessage({ type: "error", text: "Could not fetch your products." });
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        }
        setMessage({
          type: "error",
          text: "An error occurred while fetching your products.",
        });
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
      <h2>My Registered Products</h2>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px" }}>
          <p>You have not registered any products yet.</p>
          <Link to="/customer/products/register">
            <button>Register Your First Product</button>
          </Link>
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
