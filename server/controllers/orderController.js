import Order from "../models/order.js";

export const createOrder = async (req, res) => {
  try {
    const { userId, items, total } = req.body;
    const order = await Order.create({ userId, items, total });
    res.json({ msg: "Order placed!", order });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
