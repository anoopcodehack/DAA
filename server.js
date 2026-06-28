// ============================================================
// DAA VIVA VAULT — LOGIN LOGGER BACKEND
// Verifies Google ID token + saves every login to MongoDB
// ============================================================

try {
  require("dotenv").config();
} catch (e) {
  console.warn("dotenv not installed — skipping .env load");
}
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = process.env.PORT || 5500;

// ---------- CONFIG ----------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;       // same Client ID as frontend
const MONGODB_URI = process.env.MONGODB_URI;                  // MongoDB Atlas connection string
const ADMIN_KEY = process.env.ADMIN_KEY || "changeme123";      // simple key to view login logs
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
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

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

    if (!credential) {
      return res.status(400).json({ success: false, message: "No credential provided" });
    }

    // Verify the token directly with Google — this is the real security check
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Upsert user — create if new, update login info if existing
    let user = await User.findOne({ googleId });

    if (user) {
      user.lastLoginAt = new Date();
      user.loginCount += 1;
      user.loginHistory.push(new Date());
      await user.save();
    } else {
      user = await User.create({
        googleId,
        email,
        name,
        picture,
        loginHistory: [new Date()],
      });
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