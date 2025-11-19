import express from "express";
import MysteryBox from "../models/mysteryBox.js";
import Product from "../models/product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const boxes = await MysteryBox.find();
    res.status(200).json(boxes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const size = (req.query.size || "small").toLowerCase();
    const box = await MysteryBox.findById(req.params.id);
    if (!box) return res.status(404).json({ message: "Box not found" });

    const sampleSize = size === "large" ? 10 : 5;
    const items = await Product.aggregate([
      { $match: { category: box.category } },
      { $sample: { size: sampleSize } },
    ]);

    const base = Number(box.price) || 0;
    const sized = size === "large" ? base * 1.4 : base;
    const finalPrice = box.discount ? Math.round(sized * (1 - box.discount / 100)) : Math.round(sized);

    res.json({ box, items, finalPrice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = (({ name, description, category, rarity, discount, inStock, price }) => ({
      name,
      description,
      category,
      rarity,
      discount,
      inStock,
      price,
    }))(req.body || {});

    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] === "undefined") delete updates[key];
    });

    const box = await MysteryBox.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!box) return res.status(404).json({ message: "Box not found" });
    res.json(box);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const box = await MysteryBox.findByIdAndDelete(req.params.id);
    if (!box) return res.status(404).json({ message: "Box not found" });
    res.json({ message: "Box deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
