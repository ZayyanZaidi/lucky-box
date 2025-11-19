import { useState, useEffect } from "react";
import "../styles/carousel.css";
import slide1 from "../assets/slide1.png";
import offers from "../assets/offers.png";
import slide2 from "../assets/slide2.png";

export default function Carousel() {
  const slides = [
    { id: 1, title: "Unbox the Future", img: slide1 },
    { id: 2, title: "Limited-Time Offers", img: offers },
    { id: 3, title: "Trending Mystery Boxes", img: slide2 },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3000);
    return () => clearInterval(id);
  }, []);

  const goTo = (i) => setIndex(i);

  return (
    <div className="carousel container">
      <div className="carousel-inner" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`carousel-slide ${i === index ? "active" : ""}`}
            style={{ backgroundImage: `url(${s.img})`, height: "360px" }}
            role="img"
            aria-label={s.title}
          >
            <div className="carousel-overlay">
              <h2>{s.title}</h2>
              {s.title.includes("Offer") && <p>Save big on selected mystery boxes — limited time!</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
