// src/pages/Admin/SystemLogsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AlertMessage from "../../components/AlertMessage.jsx";

// --- Styled Components ---
const PageContainer = styled.div`
  /* Inherits card styling via className="card" for consistency */
`;

const HeaderControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  gap: ${({ theme }) => theme.spacing.md}; /* Spacing between elements */

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: white;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  cursor: pointer;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.md};

  th,
  td {
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.small};
  }

  th {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    white-space: nowrap; /* Prevent headers from wrapping */
  }

  /* Dynamic background for log entries based on action/entity type */
  tbody tr {
    transition: background-color 0.2s ease-in-out;
    &:hover {
      background-color: ${({ theme }) => theme.colors.accent};
    }
    &.log-admin {
      background-color: #e6ffe6;
    } /* Light green for Admin */
    &.log-customer {
      background-color: #e6f7ff;
    } /* Light blue for Customer */
    &.log-seller {
      background-color: #fffbe6;
    } /* Light yellow for Seller */
    &.log-system {
      background-color: #f0f0f0;
    } /* Light grey for System */

    /* Ensure border doesn't get overridden by background */
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const LogDetailsPre = styled.pre`
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-size: 0.75em;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.sm};
  max-height: 100px; /* Limit height for readability */
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border}; /* Added border for clarity */
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoadMoreButton = styled.button`
  display: block;
  width: fit-content;
  margin: ${({ theme }) => theme.spacing.lg} auto 0 auto;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

// Helper to render log details
const renderLogDetails = (details) => {
  if (!details) return "N/A";
  if (typeof details === "object") {
    return (
      <LogDetailsPre>
        {/* Render each key-value pair on a new line */}
        {Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong>{" "}
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </div>
        ))}
      </LogDetailsPre>
    );
  }
  return String(details);
};

// Helper to determine row class for coloring based on entity type or action
const getLogRowClass = (log) => {
  if (
    log.entityType === "ADMIN" ||
    (log.actionType && log.actionType.includes("ADMIN"))
  ) {
    return "log-admin";
  }
  if (
    log.entityType === "CUSTOMER" ||
    (log.actionType && log.actionType.includes("CUSTOMER"))
  ) {
    return "log-customer";
  }
  if (
    log.entityType === "SELLER" ||
    log.entityType === "CLAIM" ||
    (log.actionType && log.actionType.includes("SELLER"))
  ) {
    return "log-seller";
  }
  // Default for system-level actions not directly tied to a specific user role
  return "log-system";
};

// --- Component Logic ---
const SystemLogsPage = () => {
  const [allLogs, setAllLogs] = useState([]); // Stores all fetched logs
  const [displayedCount, setDisplayedCount] = useState(20); // Number of logs currently displayed
  const [filterRole, setFilterRole] = useState("ALL"); // 'ALL', 'ADMIN', 'CUSTOMER', 'SELLER'

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const PAGE_SIZE = 20; // Number of logs to load per click

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        // Backend API currently returns ALL logs.
        // If pagination were supported by the backend, this would be:
        // const response = await apiService.get(`/admin/logs?page=1&limit=${INITIAL_LOAD_SIZE}`);
        const response = await apiService.get("/admin/logs");
        if (response.data.status === "success") {
          setAllLogs(response.data.data || []); // Access 'data' directly
          setDisplayedCount(PAGE_SIZE); // Reset displayed count for new data
        } else {
          setMessage({
            type: "error",
            text: response.data.message || "Failed to fetch system logs.",
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
              "An error occurred while fetching system logs.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [logout, navigate]);

  // Filter logs based on selected role
  const filteredLogs = allLogs.filter((log) => {
    if (filterRole === "ALL") return true;

    // Check entityType first, then actionType if entityType is generic (like 'USER')
    if (
      filterRole === "ADMIN" &&
      (log.entityType === "ADMIN" ||
        (log.entityType === "USER" &&
          (log.actionType?.includes("ADMIN") ||
            log.userName === "Smart Munim Ji Admin")))
    ) {
      return true;
    }
    if (
      filterRole === "CUSTOMER" &&
      (log.entityType === "CUSTOMER" ||
        (log.entityType === "USER" && log.actionType?.includes("CUSTOMER")))
    ) {
      return true;
    }
    if (
      filterRole === "SELLER" &&
      (log.entityType === "SELLER" ||
        log.entityType === "CLAIM" ||
        (log.entityType === "USER" && log.actionType?.includes("SELLER")))
    ) {
      return true;
    }
    return false;
  });

  // Determine logs to display based on pagination
  const logsToDisplay = filteredLogs.slice(0, displayedCount);
  const hasMoreLogs = displayedCount < filteredLogs.length;

  const handleLoadMore = () => {
    setDisplayedCount((prevCount) => prevCount + PAGE_SIZE);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageContainer className="card">
      <HeaderControls>
        <h2>System Activity Logs</h2>
        <FilterSelect
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setDisplayedCount(PAGE_SIZE); // Reset pagination on filter change
          }}
        >
          <option value="ALL">All Logs</option>
          <option value="ADMIN">Admin Logs</option>
          <option value="CUSTOMER">Customer Logs</option>
          <option value="SELLER">Seller Logs</option>
        </FilterSelect>
      </HeaderControls>

      {message && <AlertMessage message={message.text} type={message.type} />}

      {allLogs.length === 0 && !message ? (
        <EmptyState>No system logs available.</EmptyState>
      ) : logsToDisplay.length === 0 && message ? (
        <EmptyState>No logs found matching the current filter.</EmptyState>
      ) : (
        <div className="table-container">
          <StyledTable>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Type</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>User Name</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logsToDisplay.map((log) => (
                <tr key={log.logId} className={getLogRowClass(log)}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.actionType}</td>
                  <td>{log.entityType || "N/A"}</td>
                  <td>{log.entityId || "N/A"}</td>
                  <td>{log.userName || "System"}</td>
                  <td>{log.ipAddress || "N/A"}</td>
                  <td>{renderLogDetails(log.details)}</td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          {hasMoreLogs && (
            <LoadMoreButton onClick={handleLoadMore}>
              Load More ({filteredLogs.length - displayedCount} remaining)
            </LoadMoreButton>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default SystemLogsPage;
