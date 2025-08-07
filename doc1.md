# Smart Munim Ji Frontend Documentation

## 1. Introduction

This document provides a comprehensive guide to the frontend architecture, development practices, and core functionalities of the 'Smart Munim Ji' web application. 'Smart Munim Ji' is a platform designed to simplify product warranty management and facilitate claims for both customers and sellers.

**Purpose:** This documentation serves as an official reference for developers involved in the maintenance, extension, and understanding of the Smart Munim Ji frontend.

**Key Technologies:**

- **React (with Vite):** A JavaScript library for building user interfaces.
- **React Router DOM:** For declarative routing and navigation within the application.
- **Axios:** A promise-based HTTP client for making API requests to the Node.js/Express.js backend.
- **Plain CSS:** For all styling, adhering to a clean, component-based approach without external UI frameworks.

**Design Principles:**

- **Clean & Simple UI:** Prioritizing clarity, usability, and a straightforward user experience. Minimalistic design without complex animations.
- **Theme:** Predominantly white background with purple accents for interactive elements, headers, and key information.
- **Responsiveness:** Basic usability across desktop, tablet, and mobile screen sizes.
- **Functionality First:** Core features are fully implemented before advanced styling or optimizations.
- **Component-Based:** UI broken down into logical, reusable React components.

## 2. Getting Started

This section guides you through setting up and running the Smart Munim Ji frontend development environment.

### 2.1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js:** Version 14.18+ or 16+ (LTS versions are recommended).
  - You can download it from [nodejs.org](https://nodejs.org/).
- **npm (Node Package Manager):** Typically installed with Node.js.
- **Git:** For cloning the repository (if applicable in a real scenario).

### 2.2. Project Setup

1.  **Clone the Repository (if applicable):**

    ```bash
    git clone <repository-url> smart-munim-ji-frontend
    cd smart-munim-ji-frontend
    ```

    (Or if starting from scratch, you would have used `npm create vite@latest smart-munim-ji-frontend -- --template react` as initially instructed.)

2.  **Navigate to Project Directory:**

    ```bash
    cd smart-munim-ji-frontend
    ```

3.  **Install Dependencies:**
    This command installs all required packages (React, React Router DOM, Axios, etc.) as listed in `package.json`.
    ```bash
    npm install
    ```

### 2.3. Running the Application

To start the development server:

```bash
npm run dev
```

This will typically start the application on `http://localhost:5173` (or another available port). The console will provide the exact URL. The application will automatically reload in the browser as you make code changes.

## 3. Core Architecture

### 3.1. React Fundamentals

The application is built using modern React functional components and hooks.

- **Components:** Reusable UI pieces (e.g., `Button`, `CommonHeader`, `LoginPage`).
- **Props:** Data passed from parent to child components (read-only).
- **State (`useState`):** Manages component-specific data that can change over time (e.g., form input values, loading indicators).
- **Side Effects (`useEffect`):** Handles operations like data fetching, subscriptions, and DOM manipulation, often triggered on component mount or state/prop changes.

### 3.2. Routing (`react-router-dom`)

The application uses `react-router-dom` (v6) for client-side routing.

- **`BrowserRouter`:** Wraps the entire application in `src/App.jsx` to enable routing.
- **`Routes`:** A container that holds all individual `Route` definitions.
- **`Route`:** Defines a path-to-component mapping.
  - `path`: The URL path (e.g., `/login`, `/customer/dashboard`).
  - `element`: The React component to render.
  - **Nested Routes:** Used extensively, especially for protected areas (Customer, Seller, Admin), where a parent `Route` wraps child `Route`s and renders an `<Outlet />`.
- **`Link` / `NavLink`:** Used for navigation within the app, preventing full page reloads. `NavLink` provides `active` styling.
- **`useNavigate`:** A hook for programmatic navigation (e.g., redirecting after login/logout).
- **`useParams`:** A hook for accessing URL parameters (e.g., `claimId` in `/seller/claims/:claimId`).

#### Protected Routes (`ProtectedRoute` component)

The `ProtectedRoute` component (defined directly in `src/App.jsx`) is central to access control.

- It checks `isAuthenticated` status and `userRole` from `AuthContext`.
- If not authenticated, it redirects to `/login`.
- If authenticated but the `userRole` is not in the `allowedRoles` prop, it displays an "Access Denied" message.
- It renders its child routes via `<Outlet />` only if the user is authenticated and authorized.

### 3.3. Global State Management (`React Context API`)

Authentication status, user role, and ID are managed globally using React Context.

- **`AuthContext.jsx`:** (Located in `src/context/`)
  - Created using `createContext()`.
  - Provides `isAuthenticated` (boolean), `userRole` (string), `userId` (number), `jwtToken` (string), and `loading` (boolean) state.
  - Offers `login(token, userId, role)` and `logout()` methods to modify authentication state and `localStorage`.
- **`AuthProvider`:** A component that wraps the entire application in `src/App.jsx`, making the `AuthContext` available to all descendant components.
- **`useAuth` Hook:** (Located in `src/hooks/useAuth.js`)
  - A custom hook (`export const useAuth = () => useContext(AuthContext);`).
  - Simplifies consumption of the `AuthContext` within any functional component (`const { isAuthenticated, userRole, logout } = useAuth();`).

### 3.4. API Integration (`Axios`)

All HTTP requests to the backend API are handled using `Axios`.

- **`apiService.js`:** (Located in `src/api/`)
  - Creates a pre-configured `axios` instance with the `API_BASE_URL` (`http://localhost:3000/sm`).
  - **Request Interceptor:** Automatically attaches the `Authorization: Bearer <jwtToken>` header to every outgoing request if a token exists in `localStorage`. This removes boilerplate from individual API calls.
  - **Response Interceptor:** Catches global errors (e.g., 401 Unauthorized, 403 Forbidden). It logs these errors, but the actual `logout()` action is handled in the individual page components where the API call is made. This allows `useContext` to be used correctly in the component's scope.
- **API Response Structure:** All backend responses adhere to:
  ```json
  {
    "status": "success" | "fail" | "error",
    "message": "A human-readable message",
    "data": { /* actual payload */ }
  }
  ```
  Frontend components always check the `status` field for logical success.

### 3.5. Styling (Plain CSS)

The application uses plain CSS for all styling, prioritizing simplicity and control.

- **`src/index.css`:** Defines global CSS variables for the color palette (`--primary-purple`, `--white`, etc.), typography, and default styles for common HTML elements (buttons, inputs, tables, containers).
- **Component-Specific CSS:** Smaller `.css` files (e.g., `CommonHeader.css`, `Navbar.css`, `AlertMessage.css`) are used for styling individual components, imported directly into their respective `.jsx` files.
- **Responsiveness:** Achieved using relative units, Flexbox, CSS Grid, and basic media queries for adapting layouts (e.g., horizontal scroll for tables on small screens).

## 4. Project Structure

The project follows a modular and logical directory structure:

```
smart-munim-ji-frontend/
├── public/                     # Static assets (e.g., index.html, favicon)
│
├── src/                        # All source code
│   ├── App.jsx                 # Main application component, defines all routes
│   ├── index.js                # Entry point for React app (renders App.jsx)
│   ├── index.css               # Global styles and theme variables
│   │
│   ├── assets/                 # Images, icons, fonts (e.g., logo.png)
│   │
│   ├── components/             # Reusable UI components used across the app
│   │   ├── CommonHeader.jsx
│   │   ├── CommonHeader.css
│   │   ├── CommonFooter.jsx
│   │   ├── CommonFooter.css
│   │   ├── Navbar.jsx
│   │   ├── Navbar.css
│   │   ├── LoadingSpinner.jsx
│   │   ├── LoadingSpinner.css
│   │   ├── AlertMessage.jsx
│   │   └── AlertMessage.css
│   │
│   ├── pages/                  # Top-level components for each unique route/view, organized by role
│   │   ├── Auth/               # Login, Registration pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterChoicePage.jsx
│   │   │   ├── CustomerRegisterPage.jsx
│   │   │   └── SellerRegisterPage.jsx
│   │   │
│   │   ├── Customer/           # Customer-specific pages
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── ProductRegistrationPage.jsx
│   │   │   ├── RegisteredProductsPage.jsx
│   │   │   ├── MySellersPage.jsx
│   │   │   ├── ClaimWarrantyPage.jsx
│   │   │   ├── ClaimStatusPage.jsx
│   │   │   └── CustomerProfilePage.jsx
│   │   │
│   │   ├── Seller/             # Seller-specific pages
│   │   │   ├── SellerDashboard.jsx
│   │   │   ├── SellerProductsPage.jsx
│   │   │   ├── SellerClaimsPage.jsx
│   │   │   ├── SellerClaimDetailPage.jsx
│   │   │   ├── SellerProfilePage.jsx
│   │   │   └── SellerStatisticsPage.jsx
│   │   │
│   │   ├── Admin/              # Admin-specific pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserManagementPage.jsx
│   │   │   ├── SellerManagementPage.jsx
│   │   │   ├── SellerCreateEditPage.jsx
│   │   │   ├── SystemLogsPage.jsx
│   │   │   └── PlatformStatisticsPage.jsx
│   │   │
│   │   ├── HomePage.jsx        # Static landing page
│   │   └── NotFoundPage.jsx    # 404 page
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuth.js          # (Note: .js extension as it contains no JSX)
│   │
│   ├── context/                # React Context for global state
│   │   └── AuthContext.jsx     # (Note: .jsx extension as it contains JSX)
│   │
│   ├── api/                    # API service layer (Axios instance, specific functions)
│   │   └── apiService.js       # (Note: .js extension as it contains no JSX)
│   │
│   └── utils/                  # Utility functions
│       ├── helpers.js          # (e.g., date formatting)
│       └── termsAndConditions.js # (T&C string constants)
└── package.json                # Project metadata and dependencies
```

## 5. Key Features & Modules

The application's functionality is broken down by user role and covers all core requirements.

### 5.1. Shared/Public Access

- **`HomePage.jsx` (`/`)**:
  - Static landing page describing Smart Munim Ji's purpose.
  - "Get Started" button navigates to `/login`.
- **`LoginPage.jsx` (`/login`)**:
  - User authentication form (email, password).
  - Handles `POST /sm/auth/login` API call.
  - On success, stores JWT and redirects to role-specific dashboard.
  - Links to `/register-choice`.
- **`RegisterChoicePage.jsx` (`/register-choice`)**:
  - Provides options to register as a Customer (`/register/customer`) or Seller (`/register/seller`).
- **`NotFoundPage.jsx` (`*`)**:
  - Generic 404 page displayed for unmatched routes.

### 5.2. Customer Role (`CUSTOMER`)

Access via `/customer/*` routes, protected by `ProtectedRoute`.

- **`CustomerDashboard.jsx` (`/customer/dashboard`)**:
  - Landing page after customer login.
  - Provides prominent navigation buttons to key customer features.
- **`ProductRegistrationPage.jsx` (`/customer/products/register`)**:
  - Form for new product registration: Select Seller (fetched from `GET /sm/customer/sellers`), Order ID, Purchase Date.
  - Handles `POST /sm/customer/products/register`.
  - **Special Error Handling:** Explicitly displays backend messages for `424 Failed Dependency` errors (e.g., "Order not found," "API key invalid").
- **`RegisteredProductsPage.jsx` (`/customer/products`)**:
  - Displays a list/table of all products registered by the customer (`GET /sm/customer/products`).
  - Shows Product Name, Shop Name, Purchase Date, Warranty Valid Until, and Eligibility Status (color-coded).
  - "Claim Warranty" button (enabled only if eligible) navigates to `ClaimWarrantyPage`.
- **`ClaimWarrantyPage.jsx` (`/customer/claim/:registeredProductId`)**:
  - Allows submission of a warranty claim for a specific product.
  - Uses `useParams` for `registeredProductId`.
  - Form: Issue Description (textarea).
  - Handles `POST /sm/customer/claims` API call.
- **`ClaimStatusPage.jsx` (`/customer/claims`)**:
  - Lists all warranty claims submitted by the customer (`GET /sm/customer/claims`).
  - Displays Product Name, Issue, Claim Status, and Seller Response Notes.
- **`CustomerProfilePage.jsx` (`/customer/profile`)**:
  - Displays current customer profile details (`GET /sm/customer/profile`).
  - Form to update `name` and `address` (`PUT /sm/customer/profile`). Email and Phone are read-only.
- **`MySellersPage.jsx` (`/customer/my-sellers`)**:
  - Lists sellers with whom the customer has registered products (`GET /sm/customer/my-sellers`).
  - Displays basic seller contact information.

### 5.3. Seller Role (`SELLER`)

Access via `/seller/*` routes, protected by `ProtectedRoute`.

- **`SellerDashboard.jsx` (`/seller/dashboard`)**:
  - Landing page after seller login.
  - Provides quick links to seller-specific management features.
- **`SellerProfilePage.jsx` (`/seller/profile`)**:
  - Displays current shop profile details (`GET /sm/seller/profile`).
  - Form to update shop name, business name, business email, business phone, and address (`PUT /sm/seller/profile`).
  - Button to "Request Account Deactivation" (`POST /sm/seller/deactivate-request`).
- **`SellerProductsPage.jsx` (`/seller/products`)**:
  - Lists all products customers have registered with this seller's shop (`GET /sm/seller/products`).
  - Displays Customer Name, Product Name, Order ID, Purchase Date, and Warranty Status.
- **`SellerClaimsPage.jsx` (`/seller/claims`)**:
  - Lists all warranty claims submitted for this seller's products (`GET /sm/seller/claims`).
  - Clickable rows navigate to `SellerClaimDetailPage`.
- **`SellerClaimDetailPage.jsx` (`/seller/claims/:claimId`)**:
  - Displays detailed information for a specific claim.
  - Form to update `Claim Status` (dropdown) and `Seller Response Notes` (textarea) (`PUT /sm/seller/claims/:claimId`).
- **`SellerStatisticsPage.jsx` (`/seller/statistics`)**:
  - Displays key statistics for the seller's operations (`GET /sm/seller/statistics`), such as total products, claims by status, etc.

### 5.4. Admin Role (`ADMIN`)

Access via `/admin/*` routes, protected by `ProtectedRoute`.

- **`AdminDashboard.jsx` (`/admin/dashboard`)**:
  - Landing page after admin login.
  - Provides quick links to all platform management tools.
- **`UserManagementPage.jsx` (`/admin/users`)**:
  - Lists all users (customers and potentially sellers, though dedicated seller management exists) (`GET /sm/admin/users`).
  - Ability to toggle user `status` (ACTIVE/INACTIVE) (`PUT /sm/admin/users/:userId/status`).
- **`SellerManagementPage.jsx` (`/admin/sellers`)**:
  - Lists all registered sellers (`GET /sm/admin/sellers`).
  - Ability to change seller `contractStatus` (PENDING, ACTIVE, DEACTIVATED, SUSPENDED) (`PUT /sm/admin/sellers/:sellerId/status`).
  - Buttons to "Create New Seller" (`/admin/sellers/create`) and "Edit" existing sellers (`/admin/sellers/edit/:sellerId`).
- **`SellerCreateEditPage.jsx` (`/admin/sellers/create` and `/admin/sellers/edit/:sellerId`)**:
  - Reusable form for creating a new seller (`POST /sm/admin/sellers`) or editing an existing one (`PUT /sm/admin/sellers/:sellerId`).
  - Includes fields for shop details, business contact, and API configuration (Base URL, API Key).
- **`SystemLogsPage.jsx` (`/admin/logs`)**:
  - Displays a tabular list of system activity logs (`GET /sm/admin/logs`).
  - Shows Timestamp, Action Type, Entity Type, Entity ID, IP Address, and Details.
- **`PlatformStatisticsPage.jsx` (`/admin/statistics`)**:
  - Displays platform-wide aggregated statistics (`GET /sm/admin/statistics`).
  - Examples: Total customers, total sellers by status, total products registered, total claims by status.

## 6. Design & Styling Guidelines

The UI adheres to the following principles for a consistent and user-friendly experience:

- **Color Palette:**
  - Primary: `--primary-purple` (`#6A0DAD`)
  - Accent/Light: `--light-purple` (`#E0BBE4`)
  - Neutral Backgrounds: `--white` (`#FFFFFF`), `--off-white` (`#F8F8F8`)
  - Text: `--text-dark` (`#333333`), `--text-light` (`#666666`)
  - Feedback: `--success-green` (`#28a745`), `--error-red` (`#dc3545`)
- **Typography:** Simple, readable sans-serif font (`Arial, sans-serif` or system defaults).
- **Layout:**
  - `max-width: 1200px` for main content using `.container` class.
  - `card` class for distinct content blocks with `box-shadow`.
  - Extensive use of CSS Flexbox and Grid for flexible and responsive layouts.
- **Buttons:**
  - Consistent styling (purple background, white text, rounded corners).
  - **Hover:** Slight opacity reduction.
  - **Disabled:** Faded background (`--disabled-purple`), reduced opacity, `cursor: not-allowed;`.
  - **Loading State:** Button text changes (e.g., "Submitting...", "Registering...") and the button is disabled.
- **Form Inputs:**
  - Standardized padding, borders, and `border-radius`.
  - `box-sizing: border-box` for predictable width calculations.
  - **Validation Errors:** Red border (`.input-error` class) on the input field **AND** small red error text (`.error-message` class) directly below the input for clear, specific feedback.
- **Data Tables:**
  - `border-collapse` for clean borders.
  - `padding` for readability.
  - **Alternating Row Colors:** Subtle background color on `nth-child(even)` rows for improved readability.
  - **Hover Effect:** Light purple background on row hover.
  - **Responsiveness:** `overflow-x: auto;` on a `.table-container` wraps the table, enabling horizontal scrolling on smaller screens to prevent layout breakage.
- **Loading Indicators:** Simple CSS spinner (`LoadingSpinner.jsx`) for page-level loading states.
- **Alert Messages:** `AlertMessage.jsx` provides consistent visual feedback for success, error, or info messages, styled with appropriate background/text colors.
- **Icons:** Minimalist SVG icons are acceptable to enhance clarity for common actions (e.g., checkmarks, edit pencils), directly embedded or imported as React components, without external icon libraries.

## 7. Error Handling & User Feedback

Robust error handling is critical for a smooth user experience.

- **API Response Structure:** Frontend always checks `response.data.status` (`"success"`, `"fail"`, `"error"`) to determine logical outcomes.
- **HTTP Status Codes:**
  - **`401 Unauthorized` / `403 Forbidden`:** These are handled globally by `AuthContext` and `ProtectedRoute`. When detected by a `catch` block in an API call (usually in `useEffect`), the `logout()` function is triggered, clearing the session and redirecting the user to the `/login` page.
  - **`424 Failed Dependency` (Product Registration):** This specific status code from the backend indicates an issue with the external seller API. The frontend explicitly extracts and displays `error.response.data.message` directly to the user for clarity.
  - **Other Errors (400, 404, 409, 500):** The `AlertMessage.jsx` component is used to display `error.response.data.message` (if available) or a generic "An unexpected error occurred" message.
- **Loading States:** `isLoading` state variables and `LoadingSpinner.jsx` (for full page loads) or button text changes (for form submissions) provide immediate visual feedback to the user that an action is in progress.
- **Form Validation Errors:** Specific error messages (red text) directly below input fields, accompanied by a red border on the input, guide the user to correct their input.

## 8. Development Workflow & Best Practices

- **Component-Driven Development:** Focus on building isolated components before integrating them into pages.
- **Controlled Components:** All form inputs are controlled by React state for predictable data flow and easier validation.
- **Modular CSS:** Component-specific CSS files keep styles organized and prevent global conflicts.
- **Reusable Hooks:** Custom hooks (`useAuth`) encapsulate common logic.
- **Clear Naming Conventions:** Consistent naming for files, components, variables, and functions.
- **Environment Variables:** (Future consideration) For managing API base URLs and other configuration settings across different environments.

## 9. Future Enhancements

This initial build provides a strong functional foundation. Potential future enhancements include:

- **Advanced Form Validation:** Integration with form libraries like Formik or React Hook Form for more sophisticated validation patterns.
- **Centralized State Management (for larger apps):** Introduction of libraries like Redux, Zustand, or Recoil if global state complexity grows beyond what React Context efficiently handles.
- **Accessibility (A11y):** Adding ARIA attributes and focusing on keyboard navigation.
- **Performance Optimization:** Memoization (`React.memo`, `useMemo`, `useCallback`), lazy loading components.
- **Testing:** Unit tests (Jest, React Testing Library) for components and integration tests.
- **UI Component Library:** Transition to a full-fledged UI library (e.g., Material-UI, Ant Design, Chakra UI) for accelerated development and polished components, should the project scale.
- **Advanced Responsiveness:** Implementing more complex responsive patterns for tables (e.g., converting to cards on mobile) and more dynamic layouts.
- **Notifications:** A global toast notification system for more ephemeral messages.
- **Real-time Updates:** Using WebSockets for instant updates on claims or product status.

---
