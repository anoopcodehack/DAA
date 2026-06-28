// ============================================================
// DAA VIVA VAULT — LOGIN LOGGER BACKEND
// Verifies Google ID token + saves every login to MongoDB
// ============================================================

const path = require("path");
try {
  const envPath = path.join(__dirname, ".env");
  require("dotenv").config({ path: envPath });
  console.log("Loaded .env from", envPath);
} catch (e) {
  console.warn("dotenv not installed — skipping .env load");
}
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 5500;

// Debug: indicate whether MONGODB_URI was loaded (do NOT print secrets)
if (process.env.MONGODB_URI) {
  const ok =
    process.env.MONGODB_URI.startsWith("mongodb://") ||
    process.env.MONGODB_URI.startsWith("mongodb+srv://");
  console.log(`MONGODB_URI loaded: ${ok ? "looks valid" : "present but invalid scheme"}`);
} else {
  console.log("MONGODB_URI not found in environment");
}

// ---------- CONFIG ----------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;       // same Client ID as frontend
const MONGODB_URI = process.env.MONGODB_URI;                  // MongoDB Atlas connection string
const ADMIN_KEY = process.env.ADMIN_KEY || "changeme123";      // simple key to view login logs
console.log(`ADMIN_KEY: ${ADMIN_KEY === 'changeme123' ? 'default' : 'custom (hidden)'}`);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*").split(",");

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(
  cors({
    origin: ALLOWED_ORIGINS[0] === "*" ? "*" : ALLOWED_ORIGINS,
  })
);

// ---------- MONGODB CONNECTION ----------
if (!MONGODB_URI) {
  console.warn(
    "❌ MONGODB_URI not set — skipping MongoDB connection. Set MONGODB_URI in .env to enable DB."
  );
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));
}

// ---------- USER SCHEMA ----------
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  picture: { type: String },
  firstLoginAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 1 },
  loginHistory: [{ type: Date }], // every timestamp they ever logged in
});

const User = mongoose.model("User", userSchema);

// ============================================================
// ROUTE: POST /api/auth/google
// Frontend sends the Google credential (JWT) here after sign-in
// ============================================================
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    console.log("POST /api/auth/google — credential present:", !!credential);

    if (!credential) {
      return res.status(400).json({ success: false, message: "No credential provided" });
    }

    // Verify the token directly with Google — this is the real security check
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload || {};
    console.log("Token payload:", {
      googleId: googleId ? googleId.slice(-6) : null,
      email: email ? `[${email.split("@")[0]}@...]` : null,
    });

    // Upsert user — create if new, update login info if existing
    let user = await User.findOne({ googleId });

    if (user) {
      user.lastLoginAt = new Date();
      user.loginCount += 1;
      user.loginHistory.push(new Date());
      await user.save();
      console.log("Updated user:", { googleId: googleId ? googleId.slice(-6) : null, email: user.email, loginCount: user.loginCount });
    } else {
      user = await User.create({
        googleId,
        email,
        name,
        picture,
        loginHistory: [new Date()],
      });
      console.log("Created user:", { googleId: googleId ? googleId.slice(-6) : null, email: user.email });
    }

    return res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        loginCount: user.loginCount,
      },
    });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid Google token" });
  }
});

// ============================================================
// ROUTE: GET /api/auth/users
// View all logged-in users — protected by a simple admin key
// Usage: /api/auth/users?key=YOUR_ADMIN_KEY
// ============================================================
app.get("/api/auth/users", async (req, res) => {
  const { key } = req.query;

  if (key !== ADMIN_KEY) {
    return res.status(403).json({ success: false, message: "Unauthorized — wrong admin key" });
  }

  const users = await User.find().sort({ lastLoginAt: -1 });
  return res.json({ success: true, count: users.length, users });
});

// ---------- HEALTH CHECK ----------
app.get("/", (req, res) => {
  res.send("DAA Viva Vault backend is running 🔥");
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ----------------- DEV: create test user (no Google verification) -----------------
// Use only in development to seed/test the DB.
app.post("/__dev/create-user", async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;
    if (!googleId || !email) return res.status(400).json({ success: false, message: "googleId and email required" });

    let user = await User.findOne({ googleId });
    if (user) {
      user.lastLoginAt = new Date();
      user.loginCount += 1;
      user.loginHistory.push(new Date());
      await user.save();
      console.log("DEV: updated user", { googleId: googleId.slice(-6), email: user.email });
      return res.json({ success: true, action: "updated", user });
    }

    user = await User.create({ googleId, email, name, picture, loginHistory: [new Date()] });
    console.log("DEV: created user", { googleId: googleId.slice(-6), email: user.email });
    return res.json({ success: true, action: "created", user });
  } catch (err) {
    console.error("DEV create-user error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});