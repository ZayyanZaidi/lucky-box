import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image_url: { type: String },
  description: { type: String },
  category: { type: String, index: true },
  stock: { type: Number, default: 0 },
}, { collection: "products" });

const Product = mongoose.model("Product", productSchema);
export default Product;
