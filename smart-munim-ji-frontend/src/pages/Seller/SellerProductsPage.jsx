// src/pages/Seller/SellerProductsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components ---
const PageContainer = styled.div`
  /* Inherits card styling via className="card" for consistency */
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.md};

  th,
  td {
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.small};
    white-space: nowrap; /* Keep content on one line unless forced */
  }

  th {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  tbody tr:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.accent};
  }
`;

const StatusSpan = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${(props) =>
    props.$isEligible ? props.theme.colors.success : props.theme.colors.error};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// --- Component Logic ---
const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        console.log("Fetching seller products from: /sm/seller/products");
        // API Endpoint: GET /sm/seller/products - Backend returns data directly under 'data'
        const response = await apiService.get("/seller/products");
        if (response.data.status === "success") {
          // --- FIX: Access data correctly ---
          setProducts(response.data.data || []); // Ensure it's an array
        } else {
          setMessage({
            type: "error",
            text: response.data.message || "Could not fetch products.",
          });
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text:
              error.response?.data?.message ||
              `An error occurred while fetching products. Status: ${
                error.response?.status || "N/A"
              }`,
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
    <PageContainer className="card">
      <HeaderContainer>
        <h2>Customer Registered Products</h2>
      </HeaderContainer>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {products.length === 0 ? (
        <EmptyState>
          No customers have registered products with your shop yet.
        </EmptyState>
      ) : (
        <div className="table-container">
          <StyledTable>
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
                  <td>{product.sellerOrderId}</td>
                  <td>{formatDateForDisplay(product.dateOfPurchase)}</td>
                  <td>
                    <StatusSpan $isEligible={product.isWarrantyEligible}>
                      {product.isWarrantyEligible ? "ACTIVE" : "EXPIRED"}
                    </StatusSpan>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </div>
      )}
    </PageContainer>
  );
};

export default SellerProductsPage;
