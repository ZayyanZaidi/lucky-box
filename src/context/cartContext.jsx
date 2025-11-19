import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);

  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find((p) => p._id === item._id && (p.size || "small") === (item.size || "small"));
      const addQty = Math.max(1, Number(item.qty) || 1);
      if (exist) return prev.map((p) => (p._id === item._id && (p.size || "small") === (item.size || "small") ? { ...p, qty: (p.qty || 1) + addQty } : p));
      return [...prev, { ...item, qty: addQty }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i._id !== id));

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
