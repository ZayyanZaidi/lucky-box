
import React from "react";
import "../styles/footer.css";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const go = (id) => (e) => {
    e.preventDefault();
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <footer className="footer" id="footer">
      <p>Mystery Loot Box © {new Date().getFullYear()}</p>
      <div className="footer-links">
        <a href="#about" onClick={go("about")}>About</a>
        <span> | </span>
        <a href="#contact" onClick={go("contact")}>Contact</a>
        <span> | </span>
        <a href="#terms" onClick={go("terms")}>Terms</a>
      </div>
      <small>All rights reserved.</small>
    </footer>
  );
}

