import React, { useMemo, useState } from "react";
import "../styles/profile.css";
import { useNavigate } from "react-router-dom";
import unboxing from "../assets/unboxing.jpg";

export default function Profile() {
  const saved = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = saved ? JSON.parse(saved) : null;
  const navigate = useNavigate();
  const phone = typeof window !== "undefined" ? localStorage.getItem("contactNumber") : null;

  const initials = useMemo(() => {
    const src = (user?.username || user?.name || user?.email || "").trim();
    if (!src) return "?";
    const parts = src.split(/\s+|@/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const last = parts[1]?.[0] || "";
    return (first + last).toUpperCase() || first.toUpperCase();
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [nameVal, setNameVal] = useState(user?.username || user?.name || "");
  const [emailVal, setEmailVal] = useState(user?.email || "");
  const [phoneVal, setPhoneVal] = useState(phone || "");

  const saveProfile = () => {
    const current = saved ? JSON.parse(saved) : {};
    const next = { ...current };
    if (nameVal) next.username = nameVal;
    if (emailVal) next.email = emailVal;
    try {
      localStorage.setItem("user", JSON.stringify(next));
      localStorage.setItem("contactNumber", phoneVal || "");
      setIsEditing(false);
      window.alert("Profile updated");
    } catch {}
  };

  const cancelEdit = () => {
    setNameVal(user?.username || user?.name || "");
    setEmailVal(user?.email || "");
    setPhoneVal(phone || "");
    setIsEditing(false);
  };

  return (
    <div className="profile-page page-centered">
      <h1 className="profile-title">Your Profile</h1>
      {user ? (
        <div className="profile-card profile-card-inline">
          <div className="profile-banner" style={{ backgroundImage: `url(${unboxing})` }} />
          <div className="profile-header">
            <div className="avatar" aria-label="Profile avatar">{initials}</div>
            <div className="profile-meta">
              <div className="profile-name">{user.username || user.name || "Unnamed User"}</div>
              <div className="profile-sub">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
            </div>
          </div>
          {!isEditing ? (
            <>
              <div className="profile-fields">
                <div className="field"><span className="label">Name</span><span className="value">{user.username || user.name || "-"}</span></div>
                <div className="field"><span className="label">Email</span><span className="value">{user.email || "-"}</span></div>
                <div className="field"><span className="label">Phone</span><span className="value">{phone || "-"}</span></div>
              </div>
              <div className="profile-actions">
                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                <button className="save-btn" onClick={() => navigate("/checkout")}>View Orders</button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-fields">
                <label className="field"><span className="label">Name</span><input value={nameVal} onChange={(e) => setNameVal(e.target.value)} /></label>
                <label className="field"><span className="label">Email</span><input type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)} /></label>
                <label className="field"><span className="label">Phone</span><input value={phoneVal} onChange={(e) => setPhoneVal(e.target.value)} /></label>
              </div>
              <div className="profile-actions">
                <button className="save-btn" onClick={saveProfile}>Save</button>
                <button className="logout-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            </>
          )}
        </div>
      ) : (
        <p>No profile data found. Please login or signup</p>
      )}
    </div>
  );
}
