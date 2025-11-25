import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import MysteryBox from "../models/mysteryBox.js";
import { createStripeCheckoutSession, constructEventFromPayload, getStripeConfig } from "../utils/stripeClient.js";
import { sendMailjetEmail } from "../utils/mailjetClient.js";

const router = express.Router();

router.options("/stripe/create", (req, res) => res.sendStatus(204));
router.get("/stripe/create", (req, res) => res.status(405).json({ msg: "Use POST /api/payments/stripe/create" }));

router.post("/stripe/create", async (req, res) => {
  try {
    const { orderId, amount, currency = 'usd' } = req.body || {};
    
    if (!orderId || amount === undefined) {
      return res.status(400).json({ msg: "orderId and amount are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });
    
    order.paymentMethod = "Stripe";
    await order.save();
    
    const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    const buyerEmail = order?.userId?.email || undefined;
    
    const { url } = await createStripeCheckoutSession({
      orderId: order._id,
      amount: Number(amount || order.total || 0),
      currency: currency.toLowerCase(),
      successUrl: `${FRONTEND_BASE}/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${FRONTEND_BASE}/checkout`,
      customerEmail: buyerEmail,
    });

    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      stripe: {
        orderId: String(order._id),
        amount,
        currency,
        createdAt: new Date().toISOString(),
      },
    };
    
    await order.save();
    
    if (!url) {
      return res.status(502).json({ msg: "Failed to create Stripe checkout session" });
    }
    
    return res.status(200).json({ redirect_url: url });
  } catch (err) {
    console.error("stripe_create_error", err);
    const status = err?.statusCode || 500;
    const msg = err?.message || "Stripe error";
    return res.status(status).json({ msg, error: err });
  }
});

router.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = constructEventFromPayload(sig, req.body, getStripeConfig().webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.status = 'paid';
            order.paymentDetails = {
              ...(order.paymentDetails || {}),
              stripe: {
                ...(order.paymentDetails?.stripe || {}),
                paymentIntent: session.payment_intent,
                customer: session.customer,
                paymentStatus: session.payment_status,
                webhookReceivedAt: new Date().toISOString(),
              },
            };
            
            try {
              await order.populate({ path: "userId", select: "username email" });
              const toEmail = order.userId?.email;
              if (toEmail) {
                let itemDetails = [];
                let boxNames = [];
                for (const i of order.items || []) {
                  let product = null;
                  try {
                    product = await mongoose.model("Product").findById(i.productId).lean();
                  } catch {}
                  if (product) {
                    itemDetails.push(`${product.title || product.name} (Category: ${product.category || "N/A"}) x ${i.quantity || 1} @ Rs.${product.price}`);
                    if (product.category && !boxNames.includes(product.category)) {
                      boxNames.push(product.category);
                    }
                  } else {
                    let fallback = null;
                    try {
                      fallback = await MysteryBox.findById(i.productId).lean();
                    } catch {}
                    if (fallback) {
                      itemDetails.push(`${fallback.name} (Category: ${fallback.category || "N/A"}) x ${i.quantity || 1} @ Rs.${fallback.price}`);
                      if (fallback.category && !boxNames.includes(fallback.category)) {
                        boxNames.push(fallback.category);
                      }
                    } else {
                      itemDetails.push(`Item x ${i.quantity || 1}`);
                    }
                  }
                }
                const html = `<h3>Order ${String(order._id)}</h3><p>Total: Rs.${order.total}</p><p>Address: ${order.shippingAddress || ""}</p><p>Boxes: ${boxNames.length ? boxNames.join(", ") : "N/A"}</p><p>Items:<br/>${itemDetails.join("<br/>")}</p>`;
                await sendMailjetEmail({ toEmail, toName: order.userId?.username || toEmail, subject: "Order Confirmation", html });
              }
            } catch (emailErr) {
              console.error('Failed to send confirmation email:', emailErr);
            }
            
            await order.save();
          }
        }
        break;
      
      case 'payment_intent.succeeded':
        break;
        
      case 'payment_intent.payment_failed':
        break;
        
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
