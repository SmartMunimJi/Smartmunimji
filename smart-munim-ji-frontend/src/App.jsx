// src/App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";
// --- Shared Components ---
import CommonHeader from "./components/CommonHeader";
import CommonFooter from "./components/CommonFooter";
import LoadingSpinner from "./components/LoadingSpinner";

// --- Page Components ---
// Auth & General
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterChoicePage from "./pages/Auth/RegisterChoicePage";
import CustomerRegisterPage from "./pages/Auth/CustomerRegisterPage";
import SellerRegisterPage from "./pages/Auth/SellerRegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

// Customer Pages
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import ProductRegistrationPage from "./pages/Customer/ProductRegistrationPage";
import RegisteredProductsPage from "./pages/Customer/RegisteredProductsPage";
import ClaimWarrantyPage from "./pages/Customer/ClaimWarrantyPage";
import ClaimStatusPage from "./pages/Customer/ClaimStatusPage";
import CustomerProfilePage from "./pages/Customer/CustomerProfilePage";
import MySellersPage from "./pages/Customer/MySellersPage";

// Seller Pages
import SellerDashboard from "./pages/Seller/SellerDashboard";
import SellerProfilePage from "./pages/Seller/SellerProfilePage";
import SellerProductsPage from "./pages/Seller/SellerProductsPage";
import SellerClaimsPage from "./pages/Seller/SellerClaimsPage";
import SellerClaimDetailPage from "./pages/Seller/SellerClaimDetailPage";
import SellerStatisticsPage from "./pages/Seller/SellerStatisticsPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import SellerManagementPage from "./pages/Admin/SellerManagementPage";
import SellerCreateEditPage from "./pages/Admin/SellerCreateEditPage";
import SystemLogsPage from "./pages/Admin/SystemLogsPage";
import PlatformStatisticsPage from "./pages/Admin/PlatformStatisticsPage";

/**
 * A component to protect routes based on authentication and user roles.
 * It uses the modern "Outlet" pattern from React Router v6.
 * @param {object} props
 * @param {Array<string>} props.allowedRoles - An array of roles permitted to access the routes.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  // 1. Show a spinner while the app checks for an existing session.
  if (loading) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  // 2. If not authenticated, redirect to the login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If the user's role is not in the allowed list, show an access denied message.
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="container card" style={{ textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You do not have the necessary permissions to view this page.</p>
      </div>
    );
  }

  // 4. If all checks pass, render the child routes via the <Outlet /> component.
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <CommonHeader />
          <main className="container" style={{ flex: 1 }}>
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register-choice" element={<RegisterChoicePage />} />
              <Route
                path="/register/customer"
                element={<CustomerRegisterPage />}
              />
              <Route path="/register/seller" element={<SellerRegisterPage />} />

              {/* --- Customer Protected Routes --- */}
              <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
                <Route
                  path="/customer/dashboard"
                  element={<CustomerDashboard />}
                />
                <Route
                  path="/customer/products"
                  element={<RegisteredProductsPage />}
                />
                <Route
                  path="/customer/products/register"
                  element={<ProductRegistrationPage />}
                />
                <Route path="/customer/claims" element={<ClaimStatusPage />} />
                <Route
                  path="/customer/claim/:registeredProductId"
                  element={<ClaimWarrantyPage />}
                />
                <Route
                  path="/customer/profile"
                  element={<CustomerProfilePage />}
                />
                <Route
                  path="/customer/my-sellers"
                  element={<MySellersPage />}
                />
              </Route>

              {/* --- Seller Protected Routes --- */}
              <Route element={<ProtectedRoute allowedRoles={["SELLER"]} />}>
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/seller/profile" element={<SellerProfilePage />} />
                <Route
                  path="/seller/products"
                  element={<SellerProductsPage />}
                />
                <Route path="/seller/claims" element={<SellerClaimsPage />} />
                <Route
                  path="/seller/claims/:claimId"
                  element={<SellerClaimDetailPage />}
                />
                <Route
                  path="/seller/statistics"
                  element={<SellerStatisticsPage />}
                />
              </Route>

              {/* --- Admin Protected Routes --- */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route
                  path="/admin/sellers"
                  element={<SellerManagementPage />}
                />
                <Route
                  path="/admin/sellers/create"
                  element={<SellerCreateEditPage />}
                />
                <Route
                  path="/admin/sellers/edit/:sellerId"
                  element={<SellerCreateEditPage />}
                />
                <Route path="/admin/logs" element={<SystemLogsPage />} />
                <Route
                  path="/admin/statistics"
                  element={<PlatformStatisticsPage />}
                />
              </Route>

              {/* --- 404 Not Found Route --- */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <CommonFooter />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
