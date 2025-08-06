// src/pages/NotFoundPage.js

import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div
      className="card"
      style={{ textAlign: "center", maxWidth: "600px", margin: "60px auto" }}
    >
      <h1
        style={{ fontSize: "6em", margin: "0", color: "var(--primary-purple)" }}
      >
        404
      </h1>
      <h2 style={{ marginTop: "0", color: "var(--text-dark)" }}>
        Page Not Found
      </h2>
      <p style={{ color: "var(--text-light)", fontSize: "1.2em" }}>
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <button style={{ marginTop: "20px" }}>Go to Homepage</button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
