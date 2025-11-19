import crypto from "crypto";

export function getPayfastConfig() {
  return {
    merchantId: process.env.PAYFAST_MERCHANT_ID,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE || "",
    mode: (process.env.PAYFAST_MODE || "sandbox").toLowerCase(),
    returnUrl: process.env.PAYFAST_RETURN_URL,
    cancelUrl: process.env.PAYFAST_CANCEL_URL,
    notifyUrl: process.env.PAYFAST_NOTIFY_URL,
  };
}

function buildSignature(params, passphrase) {
  const ordered = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");

  const base = passphrase ? `${ordered}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}` : ordered;
  return crypto.createHash("md5").update(base).digest("hex");
}

export function createPayfastRedirect({ amount, itemName, itemDescription, paymentId, buyerEmail }) {
  const cfg = getPayfastConfig();
  const host = cfg.mode === "live" ? "https://www.payfast.co.za/eng/process" : "https://sandbox.payfast.co.za/eng/process";

  const params = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: cfg.returnUrl,
    cancel_url: cfg.cancelUrl,
    notify_url: cfg.notifyUrl,
    m_payment_id: paymentId,
    amount: Number(amount || 0).toFixed(2),
    item_name: itemName?.slice(0, 100) || "Mystery Loot Order",
    item_description: itemDescription?.slice(0, 255) || "Mystery Loot Box Purchase",
    email_address: buyerEmail,
  };

  const signature = buildSignature(params, cfg.passphrase);
  const query = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");

  return `${host}?${query}&signature=${signature}`;
}
