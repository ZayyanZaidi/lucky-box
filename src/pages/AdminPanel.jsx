import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import heroLogo from "../assets/logo.jpg";
import "../styles/loginSignup.css";
import AdminProductCard from "../components/AdminProductCard";

const ADMIN_EMAIL = "zayyanzaidi57@gmail.com";

export default function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeBoxId, setActiveBoxId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "gaming",
    rarity: "common",
    price: 0,
    discount: 0,
    inStock: true,
  });

  const categories = [
    "gaming",
    "tech",
    "collectibles",
    "snacks",
    "books",
    "jewelery",
    "anime",
  ];

  const rarities = ["common", "rare", "epic", "legendary"];

  const isAdmin = user?.email === ADMIN_EMAIL;

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [boxesRes, ordersRes] = await Promise.all([
        API.get("/boxes"),
        API.get("/orders"),
      ]);
      setBoxes(boxesRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.msg || err.message || "Failed to load admin data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const resetForm = () => {
    setActiveBoxId(null);
    setForm({
      name: "",
      description: "",
      category: "gaming",
      rarity: "common",
      price: 0,
      discount: 0,
      inStock: true,
    });
  };

  const handleEditClick = (box) => {
    setActiveBoxId(box._id);
    setForm({
      name: box.name || "",
      description: box.description || "",
      category: box.category || "gaming",
      rarity: box.rarity || "common",
      price: box.price ?? 0,
      discount: box.discount ?? 0,
      inStock: box.inStock ?? true,
    });
  };

  const handleDelete = async (box) => {
    if (!window.confirm(`Delete box "${box.name}"?`)) return;
    try {
      setSaving(true);
      await API.delete(`/boxes/${box._id}`);
      await loadData();
      if (activeBoxId === box._id) resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.msg || err.message || "Failed to delete box"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = { ...form };
      if (!payload.name) throw new Error("Name is required");

      if (activeBoxId && activeBoxId !== "new") {
        await API.put(`/boxes/${activeBoxId}`, payload);
      } else if (activeBoxId === "new") {
        await API.post(`/boxes`, payload);
      } else {
        throw new Error("No box selected to save");
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.msg || err.message || "Failed to save box"
      );
    } finally {
      setSaving(false);
    }
  };

  const salesStats = useMemo(() => {
    const totalOrders = orders.length;
    let totalRevenue = 0;
    let totalItems = 0;
    orders.forEach((o) => {
      totalRevenue += Number(o.total || 0);
      (o.items || []).forEach((i) => {
        totalItems += Number(i.quantity || 1);
      });
    });
    return {
      totalOrders,
      totalRevenue,
      totalItems,
    };
  }, [orders]);

  if (!isAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-banner" style={{ backgroundImage: `url(${heroLogo})` }} />
        <div className="auth-content-card">
          <h2>Admin Panel</h2>
          <p style={{ marginTop: 8 }}>You do not have access to this page.</p>
          <button style={{ marginTop: 16 }} onClick={() => navigate("/")}>
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1, padding: 20, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            borderBottom: "1px solid var(--entry-border)",
            paddingBottom: 16,
            paddingTop: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "var(--text)" }}>Admin Dashboard</h2>
            <p style={{ marginTop: 4, fontSize: 14, color: "var(--muted)" }}>
              Signed in as {user?.username || user?.email}
            </p>
          </div>
          <button type="button" onClick={() => navigate("/") }>
            View Storefront
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              borderRadius: 8,
              background: "rgba(211, 47, 47, 0.1)",
              color: "#ef5350",
              fontSize: 14,
              border: "1px solid rgba(211, 47, 47, 0.3)",
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--entry-border)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Sales Overview</h3>
          {loading ? (
            <p>Loading sales data...</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  padding: 16,
                  background: "var(--card-bg)",
                  border: "1px solid var(--entry-border)",
                }}
              >
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>
                  Total Orders
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>{salesStats.totalOrders}</div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  padding: 16,
                  background: "var(--card-bg)",
                  border: "1px solid var(--entry-border)",
                }}
              >
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>
                  Items Sold
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{salesStats.totalItems}</div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  padding: 16,
                  background: "var(--card-bg)",
                  border: "1px solid var(--entry-border)",
                }}
              >
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>
                  Revenue
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>${Math.round(salesStats.totalRevenue)}</div>
              </div>
            </div>
          )}
        </section>

        <section id="boxes-section" className="categories-section" style={{ marginTop: 32 }}>
          <h2>Boxes Management</h2>
          <div className="categories-grid">
            {loading ? (
              <p>Loading boxes...</p>
            ) : boxes.length > 0 ? (
              boxes.map((box) => (
                <AdminProductCard
                  key={box._id}
                  box={box}
                  isActive={activeBoxId === box._id}
                  form={form}
                  categories={categories}
                  rarities={rarities}
                  saving={saving}
                  onEditClick={handleEditClick}
                  onChangeForm={setForm}
                  onSave={handleSave}
                  onCancel={resetForm}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <p>No boxes available.</p>
            )}
          </div>
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--entry-border)" }}>
            <button
              type="button"
              onClick={() => { resetForm(); setActiveBoxId("new"); }}
              style={{ padding: "12px 24px", fontSize: 16 }}
            >
              Add New Box
            </button>
          </div>
          {activeBoxId === "new" && (
            <div className="categories-grid" style={{ marginTop: 24 }}>
              <AdminProductCard
                key="__new__"
                box={{ _id: "__new__", name: "New Box", category: form.category }}
                isActive={true}
                form={form}
                categories={categories}
                rarities={rarities}
                saving={saving}
                onEditClick={() => {}}
                onChangeForm={setForm}
                onSave={handleSave}
                onCancel={resetForm}
                onDelete={() => {}}
              />
            </div>
          )}
        </section>
      </div>
      <footer style={{ 
        backgroundColor: "var(--card-bg)", 
        textAlign: "center", 
        padding: "2rem 0", 
        color: "var(--text)", 
        borderTop: "1px solid var(--entry-border)",
        marginTop: "auto"
      }}>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>© 2025 Mystery Loot Admin. All rights reserved.</p>
      </footer>
    </div>
  );
}
