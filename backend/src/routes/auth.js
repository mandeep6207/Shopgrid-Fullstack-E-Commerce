const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { readDb, writeDb } = require("../services/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

function buildToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      firstName: user.firstName
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );
}

function toPublicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt
  };
}

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body || {};

  if (!firstName || !email || !password) {
    return res.status(400).json({ message: "firstName, email and password are required" });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPhone = String(phone || "").trim();

  const db = await readDb();
  const exists = db.users.find((u) => u.email === normalizedEmail || (normalizedPhone && u.phone === normalizedPhone));

  if (exists) {
    return res.status(409).json({ message: "User already exists with this email or phone" });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = {
    id: randomUUID(),
    firstName: String(firstName).trim(),
    lastName: String(lastName || "").trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  await writeDb(db);

  const token = buildToken(user);
  return res.status(201).json({ user: toPublicUser(user), token });
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ message: "identifier and password are required" });
  }

  const input = String(identifier).trim().toLowerCase();
  const db = await readDb();
  const user = db.users.find((u) => u.email === input || u.phone === identifier);

  if (!user) {
    return res.status(404).json({ message: "Account not found" });
  }

  const isValid = await bcrypt.compare(String(password), user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = buildToken(user);
  return res.json({ user: toPublicUser(user), token });
});

router.get("/me", authRequired, async (req, res) => {
  const db = await readDb();
  const user = db.users.find((u) => u.id === req.user.sub);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: toPublicUser(user) });
});

module.exports = router;
