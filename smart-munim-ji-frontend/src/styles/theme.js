// src/styles/theme.js

/**
 * @typedef {object} ThemeColors
 * @property {string} primary - Main brand purple color.
 * @property {string} primaryLight - Lighter shade of primary for hover/disabled.
 * @property {string} accent - Light purple for accents and backgrounds.
 * @property {string} background - Global off-white background color.
 * @property {string} surface - White color for card backgrounds and elements.
 * @property {string} text - Dark color for primary text.
 * @property {string} textSecondary - Lighter color for secondary text, labels.
 * @property {string} success - Green for success states.
 * @property {string} error - Red for error states.
 * @property {string} border - Subtle grey for borders.
 */

/**
 * @typedef {object} ThemeFonts
 * @property {string} primary - Primary font family stack.
 */

/**
 * @typedef {object} ThemeFontSizes
 * @property {string} small - 14px.
 * @property {string} medium - 16px (base).
 * @property {string} large - 20px.
 * @property {string} xlarge - 24px.
 * @property {string} xxlarge - 32px.
 */

/**
 * @typedef {object} ThemeFontWeights
 * @property {number} light - 300.
 * @property {number} regular - 400.
 * @property {number} bold - 700.
 */

/**
 * @typedef {object} ThemeSpacing
 * @property {string} xs - 4px.
 * @property {string} sm - 8px.
 * @property {string} md - 16px.
 * @property {string} lg - 24px.
 * @property {string} xl - 32px.
 * @property {string} xxl - 48px.
 */

/**
 * @typedef {object} ThemeRadii
 * @property {string} sm - 4px.
 * @property {string} md - 8px.
 */

/**
 * @typedef {object} ThemeShadows
 * @property {string} card - Shadow for card elements.
 */

/**
 * @typedef {object} ThemeBreakpoints
 * @property {string} mobile - 576px.
 * @property {string} tablet - 768px.
 * @property {string} desktop - 992px.
 * @property {string} largeDesktop - 1200px.
 */

/**
 * @typedef {object} AppTheme
 * @property {ThemeColors} colors
 * @property {ThemeFonts} fonts
 * @property {ThemeFontSizes} fontSizes
 * @property {ThemeFontWeights} fontWeights
 * @property {ThemeSpacing} spacing
 * @property {ThemeRadii} radii
 * @property {ThemeShadows} shadows
 * @property {ThemeBreakpoints} breakpoints
 */

/** @type {AppTheme} */
export const theme = {
  // 1. Color Palette: The core of our visual identity.
  colors: {
    primary: "#6A0DAD", // A vibrant purple
    primaryLight: "#9b72b8", // A slightly lighter shade for hover/active states
    accent: "#E0BBE4", // A light purple for subtle accents, backgrounds
    background: "#F8F9FA", // A clean, off-white for the main body background
    surface: "#FFFFFF", // Pure white for card backgrounds, modals, etc.
    text: "#212529", // Very dark grey for main body text, ensuring high contrast
    textSecondary: "#6C757D", // Medium grey for secondary text, labels, subtle details
    success: "#198754", // A robust green for success messages/states
    error: "#DC3545", // A standard red for error messages/states
    border: "#DEE2E6", // A subtle light grey for borders around inputs, cards
  },

  // 2. Typography: Defining font families, sizes, and weights for consistency.
  fonts: {
    primary:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  },
  fontSizes: {
    small: "0.875rem", // Equivalent to 14px (based on 16px root font-size)
    medium: "1rem", // Equivalent to 16px (base font size)
    large: "1.25rem", // Equivalent to 20px
    xlarge: "1.5rem", // Equivalent to 24px
    xxlarge: "2rem", // Equivalent to 32px (for H1, main titles)
  },
  fontWeights: {
    light: 300,
    regular: 400,
    bold: 700,
  },

  // 3. Spacing Scale: Uniform spacing for margins, paddings, and gaps.
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    xxl: "3rem", // 48px
  },

  // 4. Border Radii: Consistent rounding for UI elements.
  radii: {
    sm: "4px", // Small rounding for inputs, buttons
    md: "8px", // Medium rounding for cards, larger containers
  },

  // 5. Shadows: Standardized box shadows for depth and hierarchy.
  shadows: {
    card: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)", // Subtle, layered shadow
    // You could add more: button: '0 2px 4px rgba(0,0,0,0.1)', elevation2: '...'
  },

  // 6. Breakpoints for Responsive Design: Crucial for media queries.
  // These values are the 'max-width' for the respective device category.
  breakpoints: {
    mobile: "576px", // For small phones
    tablet: "768px", // For tablets and larger phones
    desktop: "992px", // For small laptops and larger tablets
    largeDesktop: "1200px", // For standard desktop screens
  },
};
