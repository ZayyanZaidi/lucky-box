import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image_url: { type: String },
  description: { type: String },
  category: { type: String },
  stock: { type: Number, default: 0 },
});

const Box = mongoose.model("Product", productSchema, "products");

export default Box;
