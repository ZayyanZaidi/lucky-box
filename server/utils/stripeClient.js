import Stripe from 'stripe';

export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: process.env.STRIPE_CURRENCY || 'usd',
  };
}

export function createStripeClient() {
  const config = getStripeConfig();
  if (!config.secretKey) {
    throw new Error('Stripe secret key is not configured');
  }
  return new Stripe(config.secretKey);
}

export async function createStripeCheckoutSession({ orderId, amount, currency, successUrl, cancelUrl, customerEmail }) {
  const stripe = createStripeClient();
  const config = getStripeConfig();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: currency || config.currency,
        product_data: {
          name: `Order #${orderId}`,
          description: 'Mystery Loot Box Purchase',
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      orderId: orderId.toString(),
    },
  });

  return { url: session.url };
}

export async function constructEventFromPayload(signature, payload, secret) {
  const stripe = createStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, secret || getStripeConfig().webhookSecret);
}
