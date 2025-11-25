import React from "react";
import "../styles/cart.css";
import cartBg from "../assets/hero-boxes.jpg";
import collectibles from "../assets/collectibles.jpg";
import { useCart } from "../context/cartContext";
import { useNotification } from "../context/notificationContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { show } = useNotification();
  const navigate = useNavigate();

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    const item = cart.find((c) => c._id === id);
    if (!item) return;
    const newQty = qty;
    removeFromCart(id);
    for (let i = 0; i < newQty; i++) addToCart(item);
    show && show("Cart updated", { type: "info", timeout: 2000 });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div
      className="cart-container"
      style={{ backgroundImage: `url(${cartBg})`, padding: 24 }}
    >
      <div className="cart-banner" style={{ backgroundImage: `url(${collectibles})` }} />
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p className="empty">Your cart is empty 😢</p>
      ) : (
        <div className="cart-list">
          {cart.map((item) => (
            <div className="cart-item" key={item._id}>
              <div className="item-info">
                <h4>{item.title}</h4>
                <p>Rs. {item.price}</p>
              </div>
              <div className="item-controls">
                <button onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                <button className="remove-btn" onClick={() => { removeFromCart(item._id); show && show("Item removed", { type: "info", timeout: 2000 }); }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-total">
        <h3>Total: Rs. {total}</h3>
        <button
          className="checkout-btn"
          onClick={() => navigate("/checkout")}
        >
          Checkout
        </button>
        <button
          className="btn-cancel"
          style={{ marginLeft: 12 }}
          onClick={() => { clearCart(); show && show("Cart cleared", { type: "info", timeout: 2000 }); }}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
