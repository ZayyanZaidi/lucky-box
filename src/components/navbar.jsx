import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "../styles/navbar.css";
import ThemeToggle from "./ThemeToggle";

const CardNav = ({
  logo,
  logoAlt = "Logo",
  items = [],
  className = "",
  ease = "power3.out",
  baseColor = "#0e0041ff",
  menuColor,
  buttonBgColor,
  buttonTextColor,
  onUserChange,
  user: appUser,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useLayoutEffect(() => {
    if (appUser) {
      setUser(appUser);
      try {
        localStorage.setItem("user", JSON.stringify(appUser));
      } catch {}
    } else {
      setUser(() => {
        try {
          const saved = localStorage.getItem("user");
          return saved ? JSON.parse(saved) : null;
        } catch {
          return null;
        }
      });
    }
  }, [appUser]);


  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    alert("You have been logged out.");
  if (typeof onUserChange === "function") onUserChange(null);
    navigate("/loginSignup");
  };

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content");
      if (contentEl) {
        const prev = {
          visibility: contentEl.style.visibility,
          pointerEvents: contentEl.style.pointerEvents,
          position: contentEl.style.position,
          height: contentEl.style.height,
        };
        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";
        contentEl.offsetHeight;
        const totalHeight = 60 + contentEl.scrollHeight + 16;
        Object.assign(contentEl.style, prev);
        return totalHeight;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, "-=0.1");

    tl.eventCallback("onStart", () => setIsAnimating(true));
    tl.eventCallback("onComplete", () => setIsAnimating(false));
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      const newTl = createTimeline();
      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        newTl.progress(1);
      }
      tlRef.current.kill();
      tlRef.current = newTl;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (isAnimating) return;

    if (!isExpanded) {
      tl.eventCallback("onReverseComplete", null);
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
      return;
    }

    const onReverseComplete = () => {
      setIsExpanded(false);
      setIsHamburgerOpen(false);
      setIsAnimating(false);
      tl.eventCallback("onReverseComplete", null);
    };
    setIsAnimating(true);
    tl.eventCallback("onReverseComplete", onReverseComplete);
    tl.reverse();
  };

  const openMenu = () => {
    const tl = tlRef.current;
    if (!tl || isAnimating || isExpanded) return;
    tl.eventCallback("onReverseComplete", null);
    setIsHamburgerOpen(true);
    setIsExpanded(true);
    tl.play(0);
  };

  const closeMenu = () => {
    const tl = tlRef.current;
    const navEl = navRef.current;
    if (!tl || isAnimating || !isExpanded) return;

    const onReverseComplete = () => {
      try {
        if (navEl) {
          navEl.style.height = "60px";
          navEl.style.overflow = "";
        }
        tl.pause(0);
        tl.progress(0);
      } catch (e) {
      }
      setIsExpanded(false);
      setIsHamburgerOpen(false);
      setIsAnimating(false);
      tl.eventCallback("onReverseComplete", null);
    };

    setIsAnimating(true);
    tl.eventCallback("onReverseComplete", onReverseComplete);
    tl.reverse();
  };

  const resetMenuStateImmediate = () => {
    const tl = tlRef.current;
    const navEl = navRef.current;
    try {
      if (navEl) {
        navEl.style.height = "60px";
        navEl.style.overflow = "";
      }
      if (tl) {
        tl.pause(0);
        tl.progress(0);
        tl.eventCallback("onReverseComplete", null);
      }
    } catch (e) {
    }
    setIsExpanded(false);
    setIsHamburgerOpen(false);
    setIsAnimating(false);
  };

  const ensureMenuClosed = () => {
    const tl = tlRef.current;
    if (tl && isExpanded) {
      closeMenu();
      setTimeout(() => {
        if (isExpanded) resetMenuStateImmediate();
      }, 500);
    } else {
      resetMenuStateImmediate();
    }
  };

  const handleLinkClick = async (lnk) => {
    try {
      if (typeof lnk.action === "function") {
        await Promise.resolve(lnk.action());
      } else {
        await Promise.resolve(handleNavClick(lnk.label));
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isExpanded) {
        ensureMenuClosed();
      }
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavClick = (label) => {
    switch (label) {
      case "New Arrivals":
      case "Best Sellers":
      case "Sale":
        scrollToSection("categories-section");
        break;
      case "About Us":
      case "Contact":
      case "Our Story":
        scrollToSection("footer");
        break;
      case "Profile":
        navigate("/profile");
        break;
      case "Cart":
        navigate("/cart");
        break;
      case "Checkout":
        navigate("/checkout");
        break;
      case "Login / Signup":
      case "Login/Signup":
        navigate("/loginSignup");
        break;
      case "Logout":
        logout();
        break;
      default:
        break;
    }
  };

  const setCardRef = (i) => (el) => {
    if (el) cardsRef.current[i] = el;
  };

  const updatedItems = items.map((item) => {
    if (item.label === "Account") {
      return {
        ...item,
        links: item.links.map((lnk) =>
          lnk.label === "Logout" || lnk.label === "Login / Signup"
            ? { ...lnk, label: user ? "Logout" : "Login / Signup" }
            : lnk
        ),
      };
    }
    return item;
  });

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? "open" : ""}`}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            tabIndex={0}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          

          <div className="top-buttons">
            <ThemeToggle />
            <button className="cart-btn" onClick={() => navigate(user ? "/cart" : "/loginSignup")}>
              🛒 Cart
            </button>
            <button
              type="button"
              className="card-nav-cta-button"
              onClick={() => navigate("/")}
            >
              Home
            </button>
          </div>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {updatedItems.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ ['--nav-card-bg']: item.bgColor || '', ['--nav-card-text']: item.textColor || '' }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <button
                    key={`${lnk.label || i}-${i}`}
                    className="nav-card-link"
                    onClick={() => handleLinkClick(lnk)}
                  >
                    {lnk.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
