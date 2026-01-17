import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import boxesRoutes from "./routes/boxes.js";
import User from "./models/user.js";
import ordersRoutes from "./routes/orders.js";
import verifyRoutes from "./routes/verify.js";
import paymentsRoutes from "./routes/payments.js";
import VerificationToken from "./models/verificationToken.js";
import { sendMailjetEmail } from "./utils/mailjetClient.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Configure CORS to allow requests from deployed frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Build allowed origins from environment variables
    const allowedOrigins = [];
    
    // Add frontend base URL from environment
    if (process.env.FRONTEND_BASE_URL) {
      allowedOrigins.push(process.env.FRONTEND_BASE_URL);
    }
    
    // Add additional allowed origins from env (comma-separated)
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
    }
    
    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
    }
    
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  try {
    res.removeHeader('X-Powered-By');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Expires');
    res.setHeader('Cache-Control', 'no-store');
    const ct = res.getHeader('Content-Type');
    if (typeof ct === 'string') {
      if (!/;\s*charset=/i.test(ct)) res.setHeader('Content-Type', ct + '; charset=utf-8');
    }
    if (!res.getHeader('Content-Security-Policy')) {
      res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    }
  } catch (_) {}
  next();
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash, verified: false });
    const token = generateToken(user);
    try {
      const raw = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const ttl = 1000 * 60 * 60 * 24;
      await VerificationToken.create({ userId: user._id, token: raw, expiresAt: new Date(Date.now() + ttl) });
      const backend = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;
      const link = `${backend}/api/auth/verify?token=${encodeURIComponent(raw)}&uid=${encodeURIComponent(String(user._id))}`;
      const subject = "Verify your email";
      const html = `<p>Hi ${username || ""}, verify your email:</p><p><a href="${link}">Verify</a></p>`;
      await sendMailjetEmail({ toEmail: email, toName: username || email, subject, html, templateId: process.env.MAILJET_TEMPLATE_VERIFY, variables: { link } });
    } catch (e) {
      console.error("mailjet_send_error", e?.response?.data || e?.message || e);
    }
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: "error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    let isMatch = false;
    if (/^\$2[aby]\$/.test(user.password)) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
      if (isMatch) {
        try {
          const newHash = await bcrypt.hash(password, 10);
          user.password = newHash;
          if (!user.username) user.username = user.name || user.email.split("@")[0];
          await user.save();
        } catch (e) {
        }
      }
    }
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (err) {
    console.error("/api/auth/login error", err.message);
    res.status(500).json({ msg: "error" });
  }
});

app.post("/api/auth/loginSignup", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      let isMatch = false;
      if (/^\$2[aby]\$/.test(user.password)) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = password === user.password;
        if (isMatch) {
          try {
            const newHash = await bcrypt.hash(password, 10);
            user.password = newHash;
            if (!user.username) user.username = user.name || user.email.split("@")[0];
            await user.save();
          } catch (e) {
          }
        }
      }
      if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

      const token = generateToken(user);
      return res.status(200).json({ token, user, action: "login" });
    }

    const hash = await bcrypt.hash(password, 10);
    user = await User.create({
      username: email.split("@")[0],
      email,
      password: hash,
    });
    const token = generateToken(user);
    res.status(201).json({ token, user, action: "signup" });
  } catch (err) {
    res.status(500).json({ msg: "error" });
  }
});

// Serve static files from frontend build
const frontendDistPath = path.join(__dirname, "../dist");
app.use(express.static(frontendDistPath));

app.use("/api/boxes", boxesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/auth", verifyRoutes);
app.use("/api/payments", paymentsRoutes);
app.post("/api/auth/reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ msg: "Email and newPassword required" });

    const existing = await User.findOne({ email });
    const hash = await bcrypt.hash(newPassword, 10);
    if (existing) {
      if (!existing.username) existing.username = existing.name || email.split("@")[0];
      existing.password = hash;
      await existing.save();
      return res.status(200).json({ msg: "Password updated" });
    }

    const username = email.split("@")[0];
    const user = await User.create({ username, email, password: hash });
    const token = generateToken(user);
    return res.status(201).json({ msg: "User created", token, user });
  } catch (err) {
    console.error('/api/auth/reset error', err);
    res.status(500).json({ msg: err.message });
  }
});

// SPA fallback - serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
 })
  .catch((err) => console.error("MongoDB connection error:", err));
