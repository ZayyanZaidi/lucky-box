import { useState, useEffect } from "react";
import "../styles/pages.css";
import ProductCard from "../components/productCard";
import { useCart } from "../context/cartContext";
import { useNotification } from "../context/notificationContext";
import API from "../utils/api";
import Carousel from "../components/Carousel";
import heroBg from "../assets/hero-boxes.jpg";

export default function Home() {
  const [popup, setPopup] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { show } = useNotification();

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await API.get("/boxes");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching boxes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-in');
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const openPopup = (type) => setPopup(type);
  const closePopup = () => setPopup(null);
  const contactNumber = typeof window !== "undefined" ? localStorage.getItem("contactNumber") : null;

  return (
    <div className="home">
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="overlay">
          <h1>Welcome to Mystery Loot</h1>
          <p>Unlock exclusive deals and mystery rewards!</p>
          <button
            className="explore-btn"
            onClick={() => {
              const section = document.getElementById("categories-section");
              if (section) section.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Boxes
          </button>
        </div>
      </section>
      <section id="features" className="section">
        <h2>Why Mystery Loot?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Curated Surprises</h3>
            <p>Each box is carefully curated to deliver delight for your favorite category.</p>
          </div>
          <div className="feature-card">
            <h3>Best Value</h3>
            <p>Get premium items at a fraction of the cost—exclusive deals inside.</p>
          </div>
          <div className="feature-card">
            <h3>Fast Shipping</h3>
            <p>Track your order and unbox excitement faster than ever.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section">
        <h2>How It Works</h2>
        <ol className="how-list">
          <li>Select a box category</li>
          <li>Add to cart and checkout</li>
          <li>Unbox and enjoy the surprise!</li>
        </ol>
      </section>

      <section id="testimonials" className="section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          <blockquote>“The tech box blew my mind—amazing value!” <span>— Alex</span></blockquote>
          <blockquote>“Anime goodies I didn’t expect. 10/10!” <span>— Rina</span></blockquote>
          <blockquote>“Perfect gift idea. Super fun unboxing!” <span>— Umar</span></blockquote>
        </div>
      </section>

      <section id="cta-buy" className="section cta-section">
        <h2>Ready to Unbox?</h2>
        <p>Choose your category and grab a box now—limited stock available.</p>
        <button className="confirm-btn" onClick={() => {
          const section = document.getElementById('categories-section');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }}>Browse Boxes</button>
      </section>

      <section id="about" className="section muted-section">
        <h2>About</h2>
        <p>Mystery Loot delivers curated boxes across gaming, tech, anime and more.</p>
      </section>
      <section id="contact" className="section muted-section">
        <h2>Contact</h2>
        <p>📞 <strong>{contactNumber || "+1 (555) 012-3456"}</strong></p>
        <p>✉️ {process.env.VITE_CONTACT_EMAIL || "support@mysteryloot.com"}</p>
      </section>
      <section id="terms" className="section muted-section">
        <h2>Terms</h2>
        <p>All sales are subject to our standard terms and conditions.</p>
      </section>

  <Carousel />

      <section id="categories-section" className="categories-section">
        <h2>Choose Your Box</h2>
        <div className="categories-grid">
          {loading ? (
            <p>Loading boxes...</p>
          ) : products.length > 0 ? (
            products.map((box) => (
              <ProductCard
                key={box._id || box.id}
                id={box._id}
                title={box.name}
                category={box.category}
                price={box.price}
                image={box.image_url}
                description={box.description}
                rarity={box.rarity}
                discount={box.discount}
                inStock={box.inStock}
                createdAt={box.createdAt}
                onAddToCart={(enriched) => {
                  addToCart(enriched);
                  const t = (box.category || "info").toLowerCase();
                  if (show) show(`${enriched.title} (${enriched.size}) x${enriched.qty} added`, { type: t, timeout: 3000 });
                }}
              />
            ))
          ) : (
            <p>No boxes available.</p>
          )}
        </div>
      </section>
      {popup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closePopup}>
              ✖
            </button>

            {popup === "about" && (
              <>
                <h3>About Mystery Loot</h3>
                <p>
                  Mystery Loot brings you exclusive mystery boxes packed with
                  gaming, tech, and collector’s items — surprises delivered
                  straight to your door!
                </p>
              </>
            )}

            {popup === "contact" && (
              <>
                <h3>Contact Us</h3>
                        <p>
                          Have questions or need support? Reach out anytime!
                          <br />
                          📞 <strong id="contact-number">{contactNumber || "Not provided"}</strong>
                        </p>
                        {contactNumber ? (
                          <button
                            className="copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(contactNumber);
                              alert("Number copied to clipboard!");
                            }}
                          >
                            Copy Number
                          </button>
                        ) : (
                          <p style={{ fontSize: 12, color: "var(--muted)" }}>Contact info not set.</p>
                        )}
              </>
            )}

            {popup === "privacy" && (
              <>
                <h3>Privacy Policy</h3>
                <p>
                  We respect your privacy. All user data is encrypted and
                  securely stored. We never share personal information with
                  third parties.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
