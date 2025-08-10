// src/App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";

// --- Styling and Animation Imports ---
import { ThemeProvider } from "styled-components"; // Provides theme to all styled components
import { theme } from "./styles/theme.js"; // Your centralized theme object
import { GlobalStyles } from "./styles/GlobalStyles.js"; // Global CSS resets and base styles
import { AnimatePresence } from "framer-motion"; // Enables exit animations for components leaving the DOM
import AnimatedPage from "./components/animations/AnimatedPage.jsx"; // Our custom page transition component

// --- Context and Hooks ---
import { AuthProvider } from "./context/AuthContext.jsx"; // Provides authentication state globally
import { useAuth } from "./hooks/useAuth.js"; // Custom hook to consume AuthContext cleanly

// --- Shared Components ---
// Ensure all these components are correctly renamed to .jsx if they contain JSX
import CommonHeader from "./components/CommonHeader.jsx";
import CommonFooter from "./components/CommonFooter.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx"; // Used by ProtectedRoute

// --- Page Imports (All page files are assumed to be .jsx) ---
// General & Auth Pages
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterChoicePage from "./pages/Auth/RegisterChoicePage.jsx";
import CustomerRegisterPage from "./pages/Auth/CustomerRegisterPage.jsx";
import SellerRegisterPage from "./pages/Auth/SellerRegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Customer Pages
import CustomerDashboard from "./pages/Customer/CustomerDashboard.jsx";
import ProductRegistrationPage from "./pages/Customer/ProductRegistrationPage.jsx";
import RegisteredProductsPage from "./pages/Customer/RegisteredProductsPage.jsx";
import ClaimWarrantyPage from "./pages/Customer/ClaimWarrantyPage.jsx";
import ClaimStatusPage from "./pages/Customer/ClaimStatusPage.jsx";
import CustomerProfilePage from "./pages/Customer/CustomerProfilePage.jsx";
import MySellersPage from "./pages/Customer/MySellersPage.jsx";

// Seller Pages
import SellerDashboard from "./pages/Seller/SellerDashboard.jsx";
import SellerProfilePage from "./pages/Seller/SellerProfilePage.jsx";
import SellerProductsPage from "./pages/Seller/SellerProductsPage.jsx";
import SellerClaimsPage from "./pages/Seller/SellerClaimsPage.jsx";
import SellerClaimDetailPage from "./pages/Seller/SellerClaimDetailPage.jsx";
import SellerStatisticsPage from "./pages/Seller/SellerStatisticsPage.jsx";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import UserManagementPage from "./pages/Admin/UserManagementPage.jsx";
import SellerManagementPage from "./pages/Admin/SellerManagementPage.jsx";
import SellerCreateEditPage from "./pages/Admin/SellerCreateEditPage.jsx";
import SystemLogsPage from "./pages/Admin/SystemLogsPage.jsx";
import PlatformStatisticsPage from "./pages/Admin/PlatformStatisticsPage.jsx";

/**
 * `ProtectedRoute` component: Handles authentication and role-based authorization for routes.
 * It's essential for ensuring only authorized users access specific parts of the application.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth(); // Get auth state from context

  // 1. Show a loading spinner while the authentication status is being determined (e.g., checking localStorage).
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  // 2. If the user is not authenticated, redirect them to the login page.
  // `replace` prop ensures they can't go back to a protected page using the browser's back button.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If authenticated but the user's role is not among the allowed roles for this route,
  // display an "Access Denied" message within an animated page.
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <AnimatedPage>
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <h2>Access Denied</h2>
          <p>You do not have the necessary permissions to view this page.</p>
          <p>Please log in with an authorized account or contact support.</p>
        </div>
      </AnimatedPage>
    );
  }

  // 4. If authentication and authorization checks pass, render the child route components.
  // The <Outlet /> component renders the nested route's element.
  return <Outlet />;
};

/**
 * `AppRoutes` component: Separates the <Routes> logic to correctly use useLocation() hook
 * with <AnimatePresence>. This is crucial for framer-motion's exit animations to work.
 */
const AppRoutes = () => {
  const location = useLocation(); // Gets the current location object from React Router.

  return (
    // `AnimatePresence` allows components to animate when they are removed from the React tree.
    // `mode="wait"` ensures that the old component's exit animation completes before the new component's enter animation begins.
    <AnimatePresence mode="wait">
      {/* The `key` prop on <Routes> is essential for AnimatePresence to detect route changes properly. */}
      <Routes location={location} key={location.pathname}>
        {/* --- Public Routes --- */}
        {/* Each public route is wrapped with AnimatedPage for entry/exit animations */}
        <Route
          path="/"
          element={
            <AnimatedPage>
              <HomePage />
            </AnimatedPage>
          }
        />
        <Route
          path="/login"
          element={
            <AnimatedPage>
              <LoginPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/register-choice"
          element={
            <AnimatedPage>
              <RegisterChoicePage />
            </AnimatedPage>
          }
        />
        <Route
          path="/register/customer"
          element={
            <AnimatedPage>
              <CustomerRegisterPage />
            </AnimatedPage>
          }
        />
        <Route
          path="/register/seller"
          element={
            <AnimatedPage>
              <SellerRegisterPage />
            </AnimatedPage>
          }
        />

        {/* --- Customer Protected Routes --- */}
        {/* The `element` prop of the parent Route renders ProtectedRoute, which then uses <Outlet /> */}
        <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
          <Route
            path="/customer/dashboard"
            element={
              <AnimatedPage>
                <CustomerDashboard />
              </AnimatedPage>
            }
          />
          <Route
            path="/customer/products"
            element={
              <AnimatedPage>
                <RegisteredProductsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/customer/products/register"
            element={
              <AnimatedPage>
                <ProductRegistrationPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/customer/claims"
            element={
              <AnimatedPage>
                <ClaimStatusPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/customer/claim/:registeredProductId"
            element={
              <AnimatedPage>
                <ClaimWarrantyPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <AnimatedPage>
                <CustomerProfilePage />
              </AnimatedPage>
            }
          />
          <Route
            path="/customer/my-sellers"
            element={
              <AnimatedPage>
                <MySellersPage />
              </AnimatedPage>
            }
          />
        </Route>

        {/* --- Seller Protected Routes --- */}
        <Route element={<ProtectedRoute allowedRoles={["SELLER"]} />}>
          <Route
            path="/seller/dashboard"
            element={
              <AnimatedPage>
                <SellerDashboard />
              </AnimatedPage>
            }
          />
          <Route
            path="/seller/profile"
            element={
              <AnimatedPage>
                <SellerProfilePage />
              </AnimatedPage>
            }
          />
          <Route
            path="/seller/products"
            element={
              <AnimatedPage>
                <SellerProductsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/seller/claims"
            element={
              <AnimatedPage>
                <SellerClaimsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/seller/claims/:claimId"
            element={
              <AnimatedPage>
                <SellerClaimDetailPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/seller/statistics"
            element={
              <AnimatedPage>
                <SellerStatisticsPage />
              </AnimatedPage>
            }
          />
        </Route>

        {/* --- Admin Protected Routes --- */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path="/admin/dashboard"
            element={
              <AnimatedPage>
                <AdminDashboard />
              </AnimatedPage>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AnimatedPage>
                <UserManagementPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <AnimatedPage>
                <SellerManagementPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/admin/sellers/create"
            element={
              <AnimatedPage>
                <SellerCreateEditPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/admin/sellers/edit/:sellerId"
            element={
              <AnimatedPage>
                <SellerCreateEditPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <AnimatedPage>
                <SystemLogsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <AnimatedPage>
                <PlatformStatisticsPage />
              </AnimatedPage>
            }
          />
        </Route>

        {/* --- 404 Not Found Route --- */}
        {/* This route catches any URL that doesn't match the defined paths. */}
        <Route
          path="*"
          element={
            <AnimatedPage>
              <NotFoundPage />
            </AnimatedPage>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

/**
 * Main App Component: Sets up global providers and the core layout.
 */
function App() {
  return (
    // ThemeProvider makes the 'theme' object accessible to all styled-components.
    <ThemeProvider theme={theme}>
      {/* GlobalStyles injects base CSS, resets, and typography based on the theme. */}
      <GlobalStyles />
      {/* BrowserRouter enables client-side routing. */}
      <Router>
        {/* AuthProvider manages the global authentication state. */}
        <AuthProvider>
          {/* Main layout container, set to take full viewport height */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <CommonHeader /> {/* Header with logo and navigation */}
            {/* Main content area; flex: 1 makes it grow to fill available space */}
            <main
              className="container"
              style={{ flex: 1, position: "relative" }}
            >
              <AppRoutes /> {/* All defined routes are rendered here */}
            </main>
            <CommonFooter /> {/* Footer with copyright and links */}
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
