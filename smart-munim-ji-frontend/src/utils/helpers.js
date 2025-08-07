// src/utils/helpers.js

/**
 * Formats a date string (e.g., "2023-12-25T10:00:00.000Z") into a readable US format.
 * This function is robust against timezone issues by using UTC methods.
 * @param {string} dateString - The date string from the API.
 * @returns {string} - The formatted date (e.g., "12/25/2023") or an empty string if invalid.
 */
export const formatDateForDisplay = (dateString) => {
  // Return an empty string if the date is null or undefined to avoid errors.
  if (!dateString) return "";

  const date = new Date(dateString);

  // The getTime() check is a reliable way to verify if the created date object is valid.
  if (date && !isNaN(date.getTime())) {
    // Using getUTC methods prevents the date from changing based on the user's local timezone.
    const year = date.getUTCFullYear();
    // getUTCMonth() is zero-based (0-11), so we add 1.
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${month}/${day}/${year}`;
  }

  // Return an empty string for any invalid date strings.
  return "";
};
