const express = require("express");
const { loadProducts } = require("../services/products");

const router = express.Router();

router.get("/", (req, res) => {
  const products = loadProducts();

  const {
    q = "",
    cat,
    minPrice,
    maxPrice,
    sort = "featured",
    page = "1",
    limit = "100"
  } = req.query;

  let list = products.filter((p) => {
    const query = String(q).trim().toLowerCase();
    const searchOk =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.seller.toLowerCase().includes(query) ||
      p.cat.toLowerCase().includes(query);

    const catOk = !cat || String(cat).toLowerCase() === "all" || p.cat === cat;
    const minOk = !minPrice || p.price >= Number(minPrice);
    const maxOk = !maxPrice || p.price <= Number(maxPrice);

    return searchOk && catOk && minOk && maxOk;
  });

  if (sort === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === "discount") {
    list.sort((a, b) => (b.was ? b.was - b.price : 0) - (a.was ? a.was - a.price : 0));
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
  const start = (pageNumber - 1) * pageSize;
  const paged = list.slice(start, start + pageSize);

  res.json({
    data: paged,
    meta: {
      total: list.length,
      page: pageNumber,
      limit: pageSize
    }
  });
});

router.get("/:id", (req, res) => {
  const products = loadProducts();
  const product = products.find((p) => p.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ data: product });
});

module.exports = router;
