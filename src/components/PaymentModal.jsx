import { useState } from "react";
import "../styles/payment-modal.css";

export default function PaymentModal({ open, onClose, onConfirm, total }) {
  const [method, setMethod] = useState("Cash on Delivery");
  const [address, setAddress] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const paymentDetails = { address };
    onConfirm({ method, paymentDetails });
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-card" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>✖</button>
        <h3>Payment</h3>
        <p className="muted">Total: USD {total}</p>
        <form onSubmit={handleSubmit} className="pm-form">
          <label>
            Method
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Cash on Delivery</option>
              <option>PayFast</option>
            </select>
          </label>

          <label>
            Shipping Address
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / Street / City / Postal Code" required />
          </label>

          <div className="pm-actions">
            <button type="submit" className="confirm">{method === "PayFast" ? "Continue to PayFast" : "Place Order"}</button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
