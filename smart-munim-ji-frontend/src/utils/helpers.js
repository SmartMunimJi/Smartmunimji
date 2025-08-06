// src/utils/helpers.js

/**
 * Formats a date string (e.g., "2023-12-25") into a more readable format.
 * @param {string} dateString - The date string from the API.
 * @returns {string} - The formatted date (e.g., "12/25/2023") or "Invalid Date".
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // The getTime() check is a robust way to see if the date is valid.
  // Adding 1 to getMonth() because it's zero-based (0 for January).
  if (date && !isNaN(date.getTime())) {
    // Adding a time zone offset correction by getting date parts in UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${month}/${day}/${year}`;
  }

  return "Invalid Date";
};
