const express = require("express");
const { readDb, writeDb } = require("../services/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

function sanitizeCartItem(item) {
  return {
    id: Number(item.id),
    title: String(item.title || ""),
    price: Number(item.price || 0),
    was: item.was ? Number(item.was) : null,
    seller: String(item.seller || ""),
    cat: String(item.cat || ""),
    prime: Boolean(item.prime),
    inStock: item.inStock !== false,
    img: String(item.img || ""),
    qty: Math.max(1, Number(item.qty || 1))
  };
}

router.get("/", authRequired, async (req, res) => {
  const db = await readDb();
  const cart = db.carts[req.user.sub] || [];
  return res.json({ data: cart });
});

router.put("/", authRequired, async (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "items must be an array" });
  }

  const sanitized = items.map(sanitizeCartItem).filter((item) => item.id && item.title);

  const db = await readDb();
  db.carts[req.user.sub] = sanitized;
  await writeDb(db);

  return res.json({ data: sanitized });
});

module.exports = router;
