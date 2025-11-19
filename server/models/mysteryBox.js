import mongoose from "mongoose";

const mysteryBoxSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, index: true },
    rarity: { type: String },
    discount: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    price: { type: Number, required: true },
    image_url: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true }, collection: "mystery_boxes" }
);

const MysteryBox = mongoose.model("MysteryBox", mysteryBoxSchema);
export default MysteryBox;
