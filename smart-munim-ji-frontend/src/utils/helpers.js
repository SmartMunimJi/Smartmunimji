// src/utils/helpers.js

/**
 * Formats a date string into a user-friendly MM/DD/YYYY format.
 * This function accounts for potential timezone issues by using UTC methods
 * to correctly parse YYYY-MM-DD strings from the backend, ensuring the date
 * displayed is the one intended, regardless of client's local timezone.
 *
 * @param {string|Date|null|undefined} dateString - The date value to format.
 *   Can be a YYYY-MM-DD string, an ISO string, or a Date object.
 * @returns {string} - The formatted date (e.g., "01/15/2024") or an empty string
 *   if the input is null/undefined, or "Invalid Date" if the input cannot be parsed.
 */
export const formatDateForDisplay = (dateString) => {
  // Handle null or undefined inputs gracefully
  if (!dateString) {
    return "";
  }

  // Attempt to create a Date object
  const date = new Date(dateString);

  // Check if the Date object is valid (NaN for invalid dates)
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Return a clear message for unparseable dates
  }

  // Use UTC methods to construct the date parts.
  // This is critical if your backend sends YYYY-MM-DD without timezones
  // as new Date('YYYY-MM-DD') might interpret it as YYYY-MM-DD 00:00:00 UTC
  // or local time, which can shift the day. UTC methods ensure consistency.
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${month}/${day}/${year}`;
};

// You can add other helper functions here as needed in the future.
// For example:
// export const formatCurrency = (amount) => { ... };
// export const validateEmail = (email) => { ... };
