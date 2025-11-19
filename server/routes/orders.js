import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import User from "../models/user.js";
import { sendMailjetEmail } from "../utils/mailjetClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let orders = await Order.find()
      .populate({ path: "items.productId", select: "title price image_url" })
      .populate({ path: "userId", select: "username email" })
      .lean();

    const needsPopulate = orders.filter(
      (o) => o.userId && typeof o.userId === "string" && /^[0-9a-fA-F]{24}$/.test(o.userId)
    );
    if (needsPopulate.length) {
      const ids = needsPopulate.map((o) => mongoose.Types.ObjectId(o.userId));
      const users = await User.find({ _id: { $in: ids } }).select("username email").lean();
      const usersById = users.reduce((acc, u) => ({ ...acc, [String(u._id)]: u }), {});
      orders = orders.map((o) => {
        if (o.userId && typeof o.userId === "string" && usersById[o.userId]) {
          return { ...o, userId: usersById[o.userId] };
        }
        return o;
      });
    }

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let uid = userId;
    try {
      uid = mongoose.Types.ObjectId(userId);
    } catch (e) {
    }

    const orders = await Order.find({ $or: [{ userId: uid }, { userId }] })
      .sort({ createdAt: -1 })
      .populate({ path: "items.productId", select: "title price image_url" })
      .populate({ path: "userId", select: "username email" });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let order = await Order.findById(req.params.id)
      .populate({ path: "items.productId", select: "title price image_url" })
      .populate({ path: "userId", select: "username email" })
      .lean();
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.userId && typeof order.userId === "string" && /^[0-9a-fA-F]{24}$/.test(order.userId)) {
      const user = await User.findById(order.userId).select("username email").lean();
      if (user) order.userId = user;
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.userId) {
      try {
        body.userId = mongoose.Types.ObjectId(body.userId);
      } catch (e) {
      }
    }

    const newOrder = await Order.create(body);
    const populated = await Order.findById(newOrder._id)
      .populate({ path: "items.productId", select: "title price image_url" })
      .populate({ path: "userId", select: "username email" });
    if ((body.paymentMethod || "").toLowerCase() === "cash on delivery") {
      try {
        const toEmail = populated.userId?.email;
        if (toEmail) {
          const lines = (populated.items || []).map(i => `${i.productId?.title || "Item"} x ${i.quantity || 1}`).join("<br/>");
          const html = `<h3>Order ${String(populated._id)}</h3><p>Total: ${populated.total}</p><p>Address: ${populated.shippingAddress || ""}</p><p>${lines}</p>`;
          await sendMailjetEmail({ toEmail, toName: populated.userId?.username || toEmail, subject: "Order Invoice", html });
        }
      } catch (_) {}
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;
