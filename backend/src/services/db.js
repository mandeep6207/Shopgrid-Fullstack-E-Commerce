const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../data/database.json");
const DEFAULT_DB = {
  users: [],
  carts: {},
  orders: []
};

let writeQueue = Promise.resolve();

async function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    await fsp.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fsp.readFile(DB_PATH, "utf-8");

  try {
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      carts: parsed.carts && typeof parsed.carts === "object" ? parsed.carts : {},
      orders: Array.isArray(parsed.orders) ? parsed.orders : []
    };
  } catch {
    return { ...DEFAULT_DB };
  }
}

async function writeDb(data) {
  await ensureDbFile();

  writeQueue = writeQueue.then(async () => {
    await fsp.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  });

  return writeQueue;
}

async function updateDb(mutator) {
  const db = await readDb();
  const updated = (await mutator(db)) || db;
  await writeDb(updated);
  return updated;
}

module.exports = {
  readDb,
  writeDb,
  updateDb
};
