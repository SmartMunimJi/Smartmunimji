// src/pages/Customer/RegisteredProductsPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    white-space: nowrap; /* Prevent content from wrapping unless necessary */
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

const ActionButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.fontSizes.small};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NewProductButton = styled(Link)`
  text-decoration: none; /* Override Link default styling */
  ${ActionButton} {
    /* Apply button styles to the button inside the link */
    width: auto;
    display: inline-block; /* Adjust if Link wrapper causes block behavior */
  }
`;

// --- Component Logic ---
const RegisteredProductsPage = () => {
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
        // API Endpoint: GET /sm/customer/products - Backend returns data directly under 'data'
        const response = await apiService.get("/customer/products");
        if (response.data.status === "success") {
          setProducts(response.data.data || []); // Ensure it's an array
        } else {
          setMessage({
            type: "error",
            text: response.data.message || "Could not fetch your products.",
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
              "An error occurred while fetching your products.",
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
    <PageContainer className="card">
      <HeaderContainer>
        <h2>My Registered Products</h2>
      </HeaderContainer>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {products.length === 0 ? (
        <EmptyState>
          <p>You have not registered any products yet.</p>
          <NewProductButton to="/customer/products/register">
            <ActionButton>Register Your First Product</ActionButton>
          </NewProductButton>
        </EmptyState>
      ) : (
        <div className="table-container">
          <StyledTable>
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
                  <td>{formatDateForDisplay(product.dateOfPurchase)}</td>{" "}
                  {/* Use dateOfPurchase */}
                  <td>{formatDateForDisplay(product.warrantyValidUntil)}</td>
                  <td>
                    <StatusSpan $isEligible={product.isWarrantyEligible}>
                      {product.isWarrantyEligible ? "Eligible" : "Expired"}
                    </StatusSpan>
                  </td>
                  <td>
                    {product.isWarrantyEligible ? (
                      <Link
                        to={`/customer/claim/${product.registeredProductId}`}
                        state={{ productName: product.productName }}
                      >
                        <ActionButton>Claim Warranty</ActionButton>
                      </Link>
                    ) : (
                      <ActionButton disabled>Claim Warranty</ActionButton>
                    )}
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

export default RegisteredProductsPage;
