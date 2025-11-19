import { useCart } from "../context/cartContext";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useNotification } from "../context/notificationContext";
import "../styles/checkout.css";
import { useState } from "react";
import PaymentModal from "../components/PaymentModal";
import offers from "../assets/offers.png";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [payOpen, setPayOpen] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const { show } = useNotification();

  const handleSubmitOrder = async ({ method, paymentDetails }) => {
    try {
      const items = cart.map((i) => ({ productId: i._id, quantity: i.qty || 1 }));
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = stored ? JSON.parse(stored) : null;
      const payload = { userId: user?._id || "guest", items, total, paymentMethod: method, paymentDetails, shippingAddress: paymentDetails?.address || "" };

      if (method === "PayFast") {
        const orderResp = await API.post("/api/orders", payload);
        const orderId = orderResp?.data?._id;
        if (!orderId) throw new Error("Failed to create order for PayFast");
        const createResp = await API.post("/api/payments/payfast/create", {
          orderId,
          amount: Math.round(total),
          currency: "ZAR",
        });
        const redirectUrl = createResp?.data?.redirect_url;
        if (!redirectUrl) throw new Error("Failed to create PayFast redirect");
        window.location.href = redirectUrl;
        return;
      }

      await API.post("/api/orders", payload);
      clearCart();
      setPayOpen(false);
      show && show("Order placed. Invoice emailed.", { type: "success", timeout: 3500 });
      navigate("/orders");
    } catch (err) {
      show && show(err.response?.data?.msg || err.message || "Checkout failed", { type: "error", timeout: 4000 });
    }
  };

  return (
    <div className="p-6">
      <div className="checkout-banner" style={{ backgroundImage: `url(${offers})` }} />
      <h2 className="text-2xl mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <>
          {cart.map((i) => (
            <div key={i._id} className="flex justify-between border-b border-gray-700 py-2">
              <span>{i.title}</span>
              <span>USD {i.price * i.qty}</span>
            </div>
          ))}
          <p className="mt-4 font-bold text-amber-400">Total: USD {total}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button onClick={() => setPayOpen(true)} className="confirm-btn">Proceed to Payment</button>
            <button onClick={() => { clearCart(); show && show("Cart cleared", { type: "info", timeout: 2000 }); }} className="btn-cancel">Clear Cart</button>
          </div>
        </>
      )}
      <PaymentModal open={payOpen} onClose={() => setPayOpen(false)} total={total} onConfirm={handleSubmitOrder} />
    </div>
  );
}
