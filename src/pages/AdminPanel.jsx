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
        API.get("/api/boxes"),
        API.get("/api/orders"),
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
      await API.delete(`/api/boxes/${box._id}`);
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

      if (activeBoxId) {
        await API.put(`/api/boxes/${activeBoxId}`, payload);
      } else {
        throw new Error("Creating boxes via admin panel is not enabled");
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
    <div className="auth-container" style={{ alignItems: "stretch", paddingTop: 70 }}>
      <div className="auth-banner" style={{ backgroundImage: `url(${heroLogo})` }} />
      <div style={{ flex: 1, padding: 20, maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            borderBottom: "1px solid #eee",
            paddingBottom: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
            <p style={{ marginTop: 4, fontSize: 14, color: "#555" }}>
              Signed in as {user?.username || user?.email}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => navigate("/")}>
              View Storefront
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "8px 12px",
              borderRadius: 6,
              background: "#ffebee",
              color: "#b71c1c",
              fontSize: 14,
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
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  padding: 10,
                  background: "var(--card-bg)",
                  border: "1px solid var(--entry-border)",
                }}
              >
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#757575" }}>
                  Total Orders
                </div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{salesStats.totalOrders}</div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  padding: 10,
                  background: "var(--card-bg)",
                  border: "1px solid var(--entry-border)",
                }}
              >
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#757575" }}>
                  Items Sold
                </div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{salesStats.totalItems}</div>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  padding: 10,
                  background: "var(--card-bg)",
                  border: "1px solid var(--entry-border)",
                }}
              >
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#757575" }}>
                  Revenue
                </div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>${salesStats.totalRevenue.toFixed(2)}</div>
              </div>
            </div>
          )}
        </section>

        <section
          style={{
            padding: 16,
            borderRadius: 10,
            background: "#fafafa",
            border: "1px solid #eee",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Boxes</h3>
          {loading ? (
            <p>Loading boxes...</p>
          ) : boxes.length === 0 ? (
            <p>No boxes found.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                marginTop: 8,
              }}
            >
              {boxes.map((box) => (
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
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
