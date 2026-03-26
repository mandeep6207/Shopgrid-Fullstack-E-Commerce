function ok(res, data, meta) {
  if (meta) {
    return res.json({ data, meta });
  }
  return res.json({ data });
}

module.exports = {
  ok
};
