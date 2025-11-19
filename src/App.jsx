import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/navbar";
import SideLogoWidget from "./components/SideLogoWidget";
import RightSidebar from "./components/RightSidebar";
import Footer from "./components/footer";
import Home from "./pages/home";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import LoginSignup from "./pages/loginSignup";
import Profile from "./pages/profile";
import Orders from "./pages/orders";
import AdminPanel from "./pages/AdminPanel";
import heroLogo from "./assets/logo.jpg";

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const existing = localStorage.getItem("contactNumber");
    if (!existing) localStorage.setItem("contactNumber", "+1 (555) 012-3456");
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/loginSignup");
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    {
      label: "Explore",
      bgColor: "#e8f5e9",
      textColor: "#1b5e20",
      links: [
        { label: "Home", action: () => navigate("/") },
        {
          label: "New Arrivals",
          action: () => {
            navigate("/");
            setTimeout(() => scrollToSection("categories-section"), 150);
          },
        },
        {
          label: "Best Sellers",
          action: () => {
            navigate("/");
            setTimeout(() => scrollToSection("categories-section"), 150);
          },
        },
        {
          label: "Sale",
          action: () => {
            navigate("/");
            setTimeout(() => scrollToSection("categories-section"), 150);
          },
        },
      ],
    },
    {
      label: "Company",
      bgColor: "#e3f2fd",
      textColor: "#0d47a1",
      links: [
        {
          label: "About Us",
          action: () => {
            navigate("/");
            setTimeout(() => scrollToSection("about"), 150);
          },
        },
        {
          label: "Contact",
          action: () => {
            navigate("/");
            setTimeout(() => scrollToSection("contact"), 150);
          },
        },
        {
          label: "Our Story",
          action: () => {
            navigate("/");
            setTimeout(() => scrollToSection("terms"), 150);
          },
        },
      ],
    },
    {
      label: "Account",
      bgColor: "#fff3e0",
      textColor: "#e65100",
      links: user
        ? [
            { label: "Profile", action: () => navigate("/profile") },
            { label: "Cart", action: () => navigate("/cart") },
            { label: "Checkout", action: () => navigate("/checkout") },
            ...(user?.email === "zayyanzaidi57@gmail.com"
              ? [{ label: "Admin Panel", action: () => navigate("/admin") }]
              : []),
            { label: "Logout", action: logout },
          ]
        : [{ label: "Login / Signup", action: () => navigate("/loginSignup") }],
    },
  ];

  return (
    <>
  <Navbar logo={heroLogo} items={navItems} onUserChange={setUser} user={user} />
  <SideLogoWidget />
  <RightSidebar user={user} onLogout={logout} />

      <div className="content-wrapper">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/cart"
          element={user ? <Cart /> : <Navigate to="/loginSignup" />}
        />
        <Route
          path="/checkout"
          element={user ? <Checkout /> : <Navigate to="/loginSignup" />}
        />
        <Route
          path="/loginSignup"
          element={<LoginSignup setUser={setUser} user={user} />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/loginSignup" />}
        />
        <Route
          path="/orders"
          element={user ? <Orders /> : <Navigate to="/loginSignup" />}
        />
        <Route
          path="/admin"
          element={user?.email === "zayyanzaidi57@gmail.com" ? <AdminPanel user={user} /> : <Navigate to="/" />}
        />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
