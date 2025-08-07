// src/pages/Admin/SystemLogsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // API Endpoint: GET /sm/admin/logs
        const response = await apiService.get("/admin/logs");
        setLogs(response.data.data.logs || []);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
          navigate("/login");
        } else {
          setMessage({ type: "error", text: "Failed to fetch system logs." });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [logout, navigate]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2>System Activity Logs</h2>
      {message && <AlertMessage message={message.text} type={message.type} />}

      {logs.length === 0 && !message ? (
        <p style={{ textAlign: "center", padding: "20px" }}>
          No system logs found.
        </p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.logId}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.actionType}</td>
                  <td>{log.entityType}</td>
                  <td>{log.entityId}</td>
                  <td>{log.ipAddress}</td>
                  <td>
                    {/* The <pre> tag is perfect for displaying formatted JSON */}
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        margin: 0,
                        fontSize: "0.8em",
                        backgroundColor: "#f9f9f9",
                        padding: "5px",
                      }}
                    >
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SystemLogsPage;
