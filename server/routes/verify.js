import express from "express";
import VerificationToken from "../models/verificationToken.js";
import User from "../models/user.js";
import { sendMailjetEmail } from "../utils/mailjetClient.js";

const router = express.Router();

router.get("/verify", async (req, res) => {
  try {
    const { token, uid } = req.query;
    if (!token || !uid) return res.status(400).send("Invalid link");
    const rec = await VerificationToken.findOne({ userId: uid, token, consumed: false, expiresAt: { $gt: new Date() } });
    if (!rec) return res.status(400).send("Invalid or expired");
    const user = await User.findById(uid);
    if (!user) return res.status(404).send("User not found");
    user.verified = true;
    await user.save();
    rec.consumed = true;
    await rec.save();
    const dest = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    return res.redirect(303, `${dest}/`);
  } catch (e) {
    return res.status(500).send("Error");
  }
});

router.post("/verify/resend", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ msg: "email required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "not found" });
    if (user.verified) return res.status(200).json({ msg: "already verified" });
    await VerificationToken.updateMany({ userId: user._id, consumed: false }, { $set: { consumed: true } });
    const raw = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const ttl = 1000 * 60 * 60 * 24;
    await VerificationToken.create({ userId: user._id, token: raw, expiresAt: new Date(Date.now() + ttl) });
    const backend = process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const link = `${backend}/api/auth/verify?token=${encodeURIComponent(raw)}&uid=${encodeURIComponent(String(user._id))}`;
    const subject = "Verify your email";
    const html = `<p>Verify your email:</p><p><a href="${link}">Verify</a></p>`;
    await sendMailjetEmail({ toEmail: user.email, toName: user.username || user.email, subject, html, templateId: process.env.MAILJET_TEMPLATE_VERIFY, variables: { link } });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ msg: "error" });
  }
});

export default router;
router.post("/otp/send", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ msg: "email required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "not found" });
    if (user.verified) return res.status(200).json({ ok: true });
    await VerificationToken.updateMany({ userId: user._id, consumed: false }, { $set: { consumed: true } });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = 1000 * 60 * 10;
    await VerificationToken.create({ userId: user._id, token: otp, expiresAt: new Date(Date.now() + ttl) });
    const subject = "Your verification code";
    const html = `<p>Your code is <b>${otp}</b>. It expires in 10 minutes.</p>`;
    await sendMailjetEmail({ toEmail: user.email, toName: user.username || user.email, subject, html });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ msg: "error" });
  }
});

router.post("/otp/verify", async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) return res.status(400).json({ msg: "email and otp required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "not found" });
    const rec = await VerificationToken.findOne({ userId: user._id, token: String(otp), consumed: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!rec) return res.status(400).json({ msg: "invalid or expired" });
    user.verified = true;
    await user.save();
    rec.consumed = true;
    await rec.save();
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ msg: "error" });
  }
});
