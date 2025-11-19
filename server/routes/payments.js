import express from "express";
import Order from "../models/order.js";
import { createPayfastRedirect } from "../utils/payfastClient.js";
import { sendMailjetEmail } from "../utils/mailjetClient.js";

const router = express.Router();

router.use((req, _res, next) => { try { console.log(`[payments] ${req.method} ${req.path}`); } catch (_) {} next(); });
router.options("/payfast/create", (req, res) => res.sendStatus(204));
router.get("/payfast/create", (req, res) => res.status(405).json({ msg: "Use POST /api/payments/payfast/create" }));

router.post("/payfast/create", async (req, res) => {
  try {
    try { console.log("/payfast/create", req.method, req.headers["origin"], req.headers["content-type"]); } catch (_) {}
    const { orderId, amount, currency = "ZAR" } = req.body || {};
    if (!orderId || !amount) return res.status(400).json({ msg: "orderId and amount are required" });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });
    order.paymentMethod = "PayFast";
    await order.save();
    const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    const buyerEmail = order?.userId?.email || undefined;
    const redirect = createPayfastRedirect({
      amount: Number(amount || order.total || 0),
      itemName: `Order ${String(order._id)}`,
      itemDescription: order.shippingAddress || "Mystery Loot Box Order",
      paymentId: String(order._id),
      buyerEmail,
    });
    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      payfast: {
        reference: String(order._id),
        amount,
        currency,
        redirect_url: redirect || null,
        frontend_after_success: `${FRONTEND_BASE}/orders`,
        frontend_after_cancel: `${FRONTEND_BASE}/checkout`,
        createdAt: new Date().toISOString(),
      },
    };
    await order.save();
    if (!redirect) return res.status(502).json({ msg: "Failed to create PayFast redirect" });
    return res.status(200).json({ redirect_url: redirect });
  } catch (err) {
    const status = err?.response?.status || 500;
    const msg = err?.response?.data?.message || err?.message || "PayFast error";
    const data = err?.response?.data;
    try { console.error("payfast_create_error", { status, msg, data }); } catch(_) {}
    return res.status(status).json({ msg, data });
  }
});

router.all("/payfast/return", async (req, res) => {
  const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  try {
    const q = req.query || {};
    const b = req.body || {};
    try { console.log("[payfast:return] query=", q, "body=", b); } catch (_) {}

    const reference = q.m_payment_id || b.m_payment_id || q.reference || b.reference;
    const statusRaw = q.payment_status || b.payment_status || "";
    const status = statusRaw.toString().toLowerCase();

    const isExplicitFail = status === "failed" || status === "cancelled";
    const ok = !isExplicitFail;
    const dest = ok ? "/orders" : "/checkout";

    if (reference) {
      try {
        const order = await Order.findById(reference);
        if (order) {
          order.status = ok ? "paid" : (order.status === "paid" ? "paid" : "failed");
          await order.save();
        }
      } catch (innerErr) {
        try { console.error("[payfast:return] failed to update order", innerErr?.message || innerErr); } catch (_) {}
      }
    }

    return res.redirect(303, `${FRONTEND_BASE}${dest}`);
  } catch (e) {
    try { console.error("[payfast:return] handler error", e?.message || e); } catch (_) {}
    return res.redirect(303, `${FRONTEND_BASE}/checkout`);
  }
});

router.post("/payfast/webhook", async (req, res) => {
  try {
    const { m_payment_id, payment_status } = req.body || {};
    const reference = m_payment_id || req.body.reference;
    if (!reference) return res.status(400).json({ msg: "reference required" });
    const order = await Order.findById(reference);
    if (!order) return res.status(404).json({ msg: "Order not found" });
    if (String(payment_status).toLowerCase() === "complete" || String(payment_status).toLowerCase() === "paid" || String(payment_status).toLowerCase() === "success") {
      order.status = "paid";
      try {
        await order.populate({ path: "userId", select: "username email" });
        const toEmail = order.userId?.email;
        if (toEmail) {
          const lines = (order.items || []).map(i => `${i.productId || "Item"} x ${i.quantity || 1}`).join("<br/>");
          const html = `<h3>Order ${String(order._id)}</h3><p>Total: ${order.total}</p><p>Address: ${order.shippingAddress || ""}</p><p>${lines}</p>`;
          await sendMailjetEmail({ toEmail, toName: order.userId?.username || toEmail, subject: "Order Invoice", html });
        }
      } catch (_) {}
    } else if (String(payment_status).toLowerCase() === "failed" || String(payment_status).toLowerCase() === "cancelled") {
      order.status = "failed";
    }
    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      payfast: {
        ...(order.paymentDetails?.payfast || {}),
        latestWebhook: {
          headers: req.headers,
          body: req.body,
          receivedAt: new Date().toISOString(),
        },
      },
    };
    await order.save();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

export default router;
