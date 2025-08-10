// src/pages/Customer/MySellersPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components ---

const PageHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SellerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SellerCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SellerName = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SellerInfo = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  strong {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const StyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

// --- Component Logic ---

const MySellersPage = () => {
  const [sellers, setSellers] = useState([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth(); // Use the custom hook
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMySellers = async () => {
      try {
        // API Endpoint: GET /sm/customer/my-sellers
        const response = await apiService.get("/customer/my-sellers");
        if (response.data.status === "success") {
          setSellers(response.data.data.sellers || []); // Ensure data.sellers is an array
        } else {
          setMessage({ type: "error", text: "Could not fetch your sellers." });
        }
      } catch (error) {
        // Robust Error Handling for Authentication
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout(); // Log out if token is invalid/expired
          navigate("/login"); // Redirect to login page
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
  }, [logout, navigate]); // Dependencies for useEffect

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageHeader>
        <h2>My Sellers</h2>
        <p>
          This is a list of sellers you have registered products with, along
          with their business contact information.
        </p>
      </PageHeader>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {sellers.length === 0 ? (
        <EmptyStateContainer>
          <p>You haven't registered products with any sellers yet.</p>
          <Link to="/customer/products/register">
            <StyledButton>Register Your First Product</StyledButton>
          </Link>
        </EmptyStateContainer>
      ) : (
        <SellerGrid>
          {sellers.map((seller) => (
            <SellerCard key={seller.sellerId}>
              <SellerName>{seller.shopName}</SellerName>
              <div>
                <SellerInfo>
                  <strong>Business Email:</strong>{" "}
                  {seller.businessEmail || "N/A"}
                </SellerInfo>
                <SellerInfo>
                  <strong>Business Phone:</strong>{" "}
                  {seller.businessPhoneNumber || "N/A"}
                </SellerInfo>
              </div>
            </SellerCard>
          ))}
        </SellerGrid>
      )}
    </>
  );
};

export default MySellersPage;
