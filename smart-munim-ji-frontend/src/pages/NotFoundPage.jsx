// src/pages/NotFoundPage.jsx

import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div
      className="card"
      style={{
        textAlign: "center",
        maxWidth: "600px",
        margin: "80px auto",
        padding: "40px",
      }}
    >
      <h1
        style={{
          fontSize: "8em",
          lineHeight: "1",
          margin: "0",
          color: "var(--primary-purple)",
        }}
      >
        404
      </h1>
      <h2
        style={{
          marginTop: "10px",
          color: "var(--text-dark)",
          fontSize: "2em",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: "var(--text-light)",
          fontSize: "1.2em",
          marginTop: "15px",
        }}
      >
        Sorry, the page you are looking for does not exist, has been removed, or
        is temporarily unavailable.
      </p>
      <Link to="/">
        <button
          style={{
            marginTop: "30px",
            padding: "12px 30px",
            fontSize: "16px",
          }}
        >
          Go to Homepage
        </button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
