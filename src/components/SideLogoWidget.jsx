import React from "react";
import logoImg from "../assets/logo.jpg";
import "../styles/side-widgets.css";

export default function SideLogoWidget() {
  return (
    <div className="side-logo-widget" aria-hidden="false">
      <img src={logoImg} alt="Logo" className="side-logo-image" />
    </div>
  );
}
