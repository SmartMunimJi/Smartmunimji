// src/pages/Admin/SystemLogsPage.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { AuthContext } from "../../context/AuthContext";
import { formatDateForDisplay } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // API Endpoint: GET /sm/admin/logs
        const response = await apiService.get("/admin/logs");
        setLogs(response.data.data.logs);
      } catch (error) {
        if (error.response?.status === 401) logout();
        setMessage({ type: "error", text: "Failed to fetch system logs." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [logout]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="card">
      <h2>System Activity Logs</h2>
      {message && <AlertMessage message={message.text} type={message.type} />}
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
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      margin: 0,
                      fontSize: "0.8em",
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
    </div>
  );
};

export default SystemLogsPage;
