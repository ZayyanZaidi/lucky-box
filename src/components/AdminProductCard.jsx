import "../styles/product-card.css";
import fallbackImg from "../assets/unboxing.jpg";
import categoriesData from "../utils/categories";

export default function AdminProductCard({
  box,
  isActive,
  form,
  categories,
  rarities,
  saving,
  onEditClick,
  onChangeForm,
  onSave,
  onCancel,
  onDelete,
}) {
  const image = box.image_url || (categoriesData.find((c) => c.name === box.category)?.image) || fallbackImg;

  if (isActive) {
    return (
      <div className="product-card solid-card" id={`admin-card-${box._id}`} data-category={box.category || ""}>
        <img src={image} alt={box.name} className="product-image" />
        <div className="product-info">
          <h4 className="product-title" style={{ margin: "0 0 6px" }}>Edit {box.name}</h4>
          <form onSubmit={onSave}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, fontSize: 13 }}>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onChangeForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => onChangeForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Rarity</label>
                <select
                  value={form.rarity}
                  onChange={(e) => onChangeForm({ ...form, rarity: e.target.value })}
                >
                  {rarities.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Price</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => onChangeForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.discount}
                  onChange={(e) => onChangeForm({ ...form, discount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label>In Stock</label>
                <select
                  value={form.inStock ? "true" : "false"}
                  onChange={(e) => onChangeForm({ ...form, inStock: e.target.value === "true" })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <label>Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => onChangeForm({ ...form, description: e.target.value })}
              />
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" className="btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className="btn-cancel" onClick={() => onDelete(box)}>
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="product-card solid-card" id={`admin-card-${box._id}`} data-category={box.category || ""}>
      <img src={image} alt={box.name} className="product-image" />
      <div className="product-info">
        <div className="product-head">
          <span className="product-badge">{box.category || "General"}</span>
          <h4 className="product-title">{box.name}</h4>
        </div>
        <p style={{ margin: "4px 0", fontSize: 13 }}>
          ${box.price} {box.discount ? `(−${box.discount}% )` : ""}
        </p>
        <p
          style={{
            margin: "4px 0",
            fontSize: 12,
            color: box.inStock ? "#4ade80" : "#fb7185",
          }}
        >
          {box.inStock ? "In Stock" : "Out of Stock"}
        </p>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button type="button" onClick={() => onEditClick(box)}>
            Edit
          </button>
          <button type="button" className="btn-cancel" onClick={() => onDelete(box)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
