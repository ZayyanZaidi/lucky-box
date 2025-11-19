import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/cartContext";
import { NotificationProvider } from "./context/notificationContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </CartProvider>
  </React.StrictMode>
);
