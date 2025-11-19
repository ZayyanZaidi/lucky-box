import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/side-widgets.css";

export default function RightSidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      <button
        className="rs-toggle"
        type="button"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        {collapsed ? "☰" : "✕"}
      </button>

      <aside className={`right-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="rs-section rs-header">Profile</div>
      {user ? (
        <div className="rs-content">
          <div className="rs-user">{user?.name || "User"}</div>
          <button className="rs-btn" onClick={() => navigate("/profile")}>View Profile</button>
          <button className="rs-btn" onClick={() => navigate("/checkout")}>Orders</button>
          <button className="rs-btn" onClick={() => navigate("/cart")}>Cart</button>
          <button className="rs-btn danger" onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <div className="rs-content">
          <div className="rs-user">Guest</div>
          <button className="rs-btn primary" onClick={() => navigate("/loginSignup")}>Login / Signup</button>
        </div>
      )}
      <div className="rs-section rs-header">Settings</div>
      <div className="rs-content">
        <button className="rs-btn" onClick={() => navigate("/")}>Home</button>
      </div>
      </aside>
    </>
  );
}
