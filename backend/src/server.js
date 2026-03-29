const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const aiRoutes = require("./routes/ai");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

const frontendPath = path.resolve(__dirname, "../../frontend/public");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/ai", aiRoutes);

app.use(express.static(frontendPath));

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`ShopGrid server running on http://localhost:${PORT}`);
});
