import "../styles/product-card.css";
import { fireConfetti } from "../utils/fx";
import fallbackImg from "../assets/unboxing.jpg";
import categoriesData from "../utils/categories";
import { useState, useMemo } from "react";
import API from "../utils/api";

export default function ProductCard({ id, title, price, image, category, description, discount = 0, rarity, inStock = true, onAddToCart }) {
  const [size, setSize] = useState("small");
  const [amount, setAmount] = useState(1);

  const unitPrice = useMemo(() => {
    const base = Number(price) || 0;
    const sized = size === "large" ? base * 1.4 : base;
    const withDiscount = discount ? Math.round(sized * (1 - discount / 100)) : Math.round(sized);
    return withDiscount;
  }, [price, size, discount]);

  const handleAdd = () => {
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.classList.add("opening");
      setTimeout(() => card.classList.remove("opening"), 500);
    }
    fireConfetti(24);
    const enriched = { _id: id, title, price: unitPrice, image, category, size, qty: Math.max(1, Number(amount) || 1) };
    if (onAddToCart) return onAddToCart(enriched);
    alert(`${title} added to cart`);
  };

  return (
    <div className="product-card solid-card" id={`card-${id}`} data-category={category || ''}>
      <img
        src={image || (categoriesData.find(c => c.name === category)?.image) || fallbackImg}
        alt={title}
        className="product-image"
      />
      <div className="product-info">
        <div className="product-head">
          <span className="product-badge">{category || "General"}</span>
          <h3 className="product-title">{title}</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0' }}>
          {rarity && <span className="product-badge" style={{ background: 'var(--primary)' }}>{rarity}</span>}
          <span className="product-badge" style={{ background: inStock ? '#2e7d32' : '#b71c1c' }}>{inStock ? 'In Stock' : 'Out of Stock'}</span>
        </div>
        {description && <p className="product-desc">{description}</p>}
        <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="small">Small</option>
            <option value="large">Large</option>
          </select>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
            style={{ width: 72 }}
          />
        </div>
        <p className="product-price">${unitPrice} <span style={{ color: 'var(--muted)', marginLeft: 6 }}>(each)</span></p>
        <p style={{ marginTop: 4 }}>Total: <strong>${unitPrice * (Math.max(1, Number(amount) || 1))}</strong></p>
        <button onClick={handleAdd}>Add to Cart</button>
      </div>
    </div>
  );
}
