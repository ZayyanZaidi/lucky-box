import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/loginSignup.css";
import API from "../utils/api";
import { useNotification } from "../context/notificationContext";
import slide1 from "../assets/slide1.png";

export default function LoginSignup({ setUser, user }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { show } = useNotification();
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !password) return show && show("Please enter email and password", { type: "error" });
      if (/^\$2[aby]\$/.test(password)) {
        show && show("It looks like you pasted a hashed password. Enter your plain-text password instead.", { type: "error", timeout: 5000 });
        return;
      }
      const res = await API.post("/auth/login", { email, password });
      const data = res.data;
      if (setUser) setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      show && show("Logged in successfully", { type: "success" });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Login failed";
      show && show(msg, { type: "error" });
    }
  };

  const handleSignup = async () => {
    try {
      if (!name || !email || !password) return show && show("Please fill all fields", { type: "error" });
      const res = await API.post("/auth/signup", { username: name, email, password });
      const data = res.data;
      if (setUser) setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      try {
        await API.post("/auth/otp/send", { email });
        setIsOtpOpen(true);
      } catch (_) {}
      show && show("Account created. Enter the code sent to your email.", { type: "success" });
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Signup failed";
      show && show(msg, { type: "error" });
    }
  };

  const handleLogout = () => {
    if (setUser) setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const handleReset = async () => {
    try {
      if (!resetEmail || !resetPassword) return show && show("Please provide email and new password", { type: "error" });
      const res = await API.post("/auth/reset", { email: resetEmail, newPassword: resetPassword });
      const data = res.data;
      show && show(data.msg || "Password reset", { type: "success" });
      setIsResetOpen(false);
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Reset failed";
      show && show(msg, { type: "error" });
    }
  };

  return (
    <div className="auth-container">
      {!user ? (
        <>
          <div className="auth-banner" style={{ backgroundImage: `url(${slide1})` }} />
          <h2>{isSignup ? "Create an Account" : "Login to Your Account"}</h2>

          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="auth-buttons">
            {isSignup ? (
              <>
                <button onClick={handleSignup}>Sign Up</button>
                <p>
                  Already have an account?{" "}
                  <span onClick={() => setIsSignup(false)}>Login</span>
                </p>
              </>
            ) : (
              <>
                <button onClick={handleLogin}>Login</button>
                <p>
                  Don’t have an account?{" "}
                  <span onClick={() => setIsSignup(true)}>Sign Up</span>
                </p>
                <p style={{ marginTop: 8 }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsResetOpen(true); setResetEmail(email); }}>Forgot password?</a>
                </p>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <h2>Welcome, {user.username || user.email}</h2>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
      {isOtpOpen && (
        <div className="popup-overlay" onClick={() => setIsOtpOpen(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsOtpOpen(false)}>✖</button>
            <h3>Email Verification</h3>
            <p>Enter the 6-digit code sent to {email}</p>
            <input type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button onClick={async () => {
                try {
                  await API.post("/auth/otp/verify", { email, otp: otpValue });
                  const saved = localStorage.getItem("user");
                  const u = saved ? JSON.parse(saved) : null;
                  if (u) {
                    u.verified = true;
                    localStorage.setItem("user", JSON.stringify(u));
                    if (setUser) setUser(u);
                  }
                  show && show("Email verified", { type: "success" });
                  setIsOtpOpen(false);
                  navigate("/");
                } catch (err) {
                  const msg = err.response?.data?.msg || err.message || "Invalid code";
                  show && show(msg, { type: "error" });
                }
              }}>Verify</button>
              <button className="btn-cancel" style={{ marginLeft: 8 }} onClick={async () => {
                try { await API.post("/auth/otp/send", { email }); show && show("Code resent", { type: "info" }); } catch (_) {}
              }}>Resend Code</button>
            </div>
          </div>
        </div>
      )}
      {isResetOpen && (
        <div className="popup-overlay" onClick={() => setIsResetOpen(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsResetOpen(false)}>✖</button>
            <h3>Reset Password</h3>
            <input type="email" placeholder="Email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            <input type="password" placeholder="New Password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button onClick={handleReset}>Reset Password</button>
              <button className="btn-cancel" style={{ marginLeft: 8 }} onClick={() => setIsResetOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
