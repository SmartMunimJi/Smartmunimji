// src/pages/Customer/ProductRegistrationPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiService from "../../api/apiService";
import AlertMessage from "../../components/AlertMessage.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { useAuth } from "../../hooks/useAuth.js";

// --- Styled Components ---
const RegisterContainer = styled.div`
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: bold;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// --- Component Logic ---
const ProductRegistrationPage = () => {
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [isFetchingSellers, setIsFetchingSellers] = useState(true); // For initial seller fetch
  const [message, setMessage] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellers = async () => {
      setIsFetchingSellers(true);
      setMessage(null);
      try {
        // API Endpoint: GET /sm/customer/sellers
        const response = await apiService.get("/customer/sellers");
        if (response.data.status === "success") {
          // --- FIX: Access data correctly based on backend response ---
          setSellers(response.data.data || []);
          if (response.data.data && response.data.data.length > 0) {
            setSelectedSellerId(response.data.data[0].sellerId); // Pre-select first seller for convenience
          }
        } else {
          setMessage({
            type: "error",
            text:
              response.data.message || "Could not fetch the list of sellers.",
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
              "An error occurred while fetching sellers.",
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
      // API Endpoint: POST /sm/customer/products/register
      const response = await apiService.post("/customer/products/register", {
        sellerId: Number(selectedSellerId),
        orderId,
        purchaseDate,
      });

      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: "Product registered successfully! Redirecting to your products...",
        });
        setTimeout(() => navigate("/customer/products"), 2000);
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to register product.",
        });
      }
    } catch (error) {
      // --- ROBUST ERROR HANDLING for 424 Failed Dependency ---
      if (error.response?.status === 424) {
        setMessage({
          type: "error",
          text: `Registration failed: ${error.response.data.message}`,
        });
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        logout();
        navigate("/login");
      } else {
        setMessage({
          type: "error",
          text:
            error.response?.data?.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingSellers) {
    return <LoadingSpinner />;
  }

  return (
    <RegisterContainer>
      <Title>Register a New Product</Title>
      <Subtitle>
        Select the seller, enter your order ID, and the date of purchase to add
        a new product to your account.
      </Subtitle>

      <StyledForm onSubmit={handleSubmit}>
        {message && <AlertMessage message={message.text} type={message.type} />}

        <FormGroup>
          <Label htmlFor="seller">Select Seller</Label>
          <Select
            id="seller"
            value={selectedSellerId}
            onChange={(e) => setSelectedSellerId(e.target.value)}
            required
            disabled={sellers.length === 0} // Disable if no sellers available
          >
            {sellers.length === 0 ? (
              <option value="" disabled>
                No active sellers available
              </option>
            ) : (
              <>
                <option value="" disabled>
                  -- Please choose a seller --
                </option>
                {sellers.map((seller) => (
                  <option key={seller.sellerId} value={seller.sellerId}>
                    {seller.shopName}
                  </option>
                ))}
              </>
            )}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="orderId">Order ID</Label>
          <Input
            type="text"
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            placeholder="e.g., ORD-12345"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="purchaseDate">Date of Purchase</Label>
          <Input
            type="date"
            id="purchaseDate"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </FormGroup>

        <SubmitButton
          type="submit"
          disabled={isLoading || sellers.length === 0}
        >
          {isLoading ? "Registering..." : "Register Product"}
        </SubmitButton>
      </StyledForm>
    </RegisterContainer>
  );
};

export default ProductRegistrationPage;
