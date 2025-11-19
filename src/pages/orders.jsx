import boxTiers from "../assets/box-tiers.jpg";
import "../styles/pages.css";

export default function OrderConfirm() {
  return (
    <div className="order-confirm-page text-center mt-16">
      <div className="orders-banner" style={{ backgroundImage: `url(${boxTiers})` }} />
      <div className="order-fx" aria-hidden="true">
        <span className="fx fx-1" />
        <span className="fx fx-2" />
        <span className="fx fx-3" />
        <span className="fx fx-4" />
        <span className="fx fx-5" />
        <span className="fx fx-6" />
      </div>
      <h1 className="text-3xl text-amber-400 font-bold">Order Confirmed 🎉</h1>
      <p className="text-gray-400 mt-2">Your mystery loot is on its way!</p>
    </div>
  );
}
