// src/App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"; // Note the .jsx
import { useAuth } from "./hooks/useAuth.js";
// ... (all page imports as before) ...
import CommonHeader from "./components/CommonHeader";
import CommonFooter from "./components/CommonFooter";
import LoadingSpinner from "./components/LoadingSpinner";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
//... all other page imports

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
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
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="container card" style={{ textAlign: "center" }}>
        <h2>Access Denied</h2>
      </div>
    );
  }
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
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              {/* ... other public routes */}

              {/* Customer Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
                {/* All customer routes go here */}
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

              {/* Seller Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["SELLER"]} />}>
                {/* All seller routes go here */}
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

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                {/* All admin routes go here */}
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

              {/* 404 Not Found Route */}
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
