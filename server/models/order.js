import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, default: "pending" },
    paymentMethod: { type: String },
    paymentDetails: { type: mongoose.Schema.Types.Mixed },
    shippingAddress: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema, "orders");

export default Order;
