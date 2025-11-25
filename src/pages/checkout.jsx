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

  const USD_TO_PKR = 278;
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalInRupees = Math.round(total * USD_TO_PKR);
  const { show } = useNotification();

  const handleSubmitOrder = async ({ method, paymentDetails }) => {
    try {
      const items = cart.map((i) => ({ productId: i._id, quantity: i.qty || 1 }));
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = stored ? JSON.parse(stored) : null;
      const payload = { 
        userId: user?._id || "guest", 
        items, 
        total: totalInRupees, 
        paymentMethod: method, 
        paymentDetails, 
        shippingAddress: paymentDetails?.address || "" 
      };

      if (method === "Credit Card (Stripe)") {
        const orderResp = await API.post("/api/orders", { ...payload, paymentMethod: "Stripe" });
        const orderId = orderResp?.data?._id;
        
        if (!orderId) throw new Error("Failed to create order for payment");
        
        const createResp = await API.post("/api/payments/stripe/create", {
          orderId,
          amount: totalInRupees,
          currency: "pkr",
        });
        
        const redirectUrl = createResp?.data?.redirect_url;
        if (!redirectUrl) throw new Error("Failed to create payment session");
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
              <span>Rs. {Math.round(i.price * i.qty * USD_TO_PKR)}</span>
            </div>
          ))}
          <p className="mt-4 font-bold text-amber-400">Total: Rs. {totalInRupees}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button onClick={() => setPayOpen(true)} className="confirm-btn">Proceed to Payment</button>
            <button onClick={() => { clearCart(); show && show("Cart cleared", { type: "info", timeout: 2000 }); }} className="btn-cancel">Clear Cart</button>
          </div>
        </>
      )}
      <PaymentModal open={payOpen} onClose={() => setPayOpen(false)} total={totalInRupees} onConfirm={handleSubmitOrder} />
    </div>
  );
}
