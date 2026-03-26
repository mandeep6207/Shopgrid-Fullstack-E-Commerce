const express = require("express");
const { randomUUID } = require("crypto");
const { readDb, writeDb } = require("../services/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  const db = await readDb();
  const orders = db.orders
    .filter((o) => o.userId === req.user.sub)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({ data: orders });
});

router.post("/", authRequired, async (req, res) => {
  const { items = [], address = {}, payment = "COD" } = req.body || {};

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "Order items are required" });
  }

  if (!address.name || !address.phone || !address.fullAddress) {
    return res.status(400).json({ message: "Address fields are incomplete" });
  }

  const computedTotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);

  const order = {
    id: `SG-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`,
    internalId: randomUUID(),
    userId: req.user.sub,
    items,
    address,
    payment,
    total: computedTotal,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  const db = await readDb();
  db.orders.push(order);
  db.carts[req.user.sub] = [];
  await writeDb(db);

  return res.status(201).json({ data: order });
});

module.exports = router;
