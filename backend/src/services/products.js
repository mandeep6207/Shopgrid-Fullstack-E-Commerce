const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA_JS_PATH = path.resolve(__dirname, "../../../frontend/public/data.js");

let cache = null;

function loadProducts() {
  if (cache) {
    return cache;
  }

  if (!fs.existsSync(DATA_JS_PATH)) {
    return [];
  }

  const source = fs.readFileSync(DATA_JS_PATH, "utf-8");
  const context = {};
  vm.createContext(context);

  vm.runInContext(`${source}\n;globalThis.__products = products;`, context, {
    timeout: 1000
  });

  cache = Array.isArray(context.__products) ? context.__products : [];
  return cache;
}

module.exports = {
  loadProducts
};
