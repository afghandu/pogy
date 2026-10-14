const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");

const models = [
  "Afk",
  "altDetector",
  "cc",
  "warn",
  "mute",
  "EcoRob",
  "ShortUrl",
  "ticketSchema",
  "Paste",
  "autoResponse",
  "Blacklist",
  "customCommand",
  "edit-snipe",
  "guild",
  "premium-guild",
  "leave",
  "logging",
  "maintenance",
  "Nickname",
  "PogyNews",
  "snipe",
  "sticky",
  "Temp Vc",
  "User",
  "Username",
  "welcome-module",
  "appID",
  "app",
  "applied",
  "ecoanimal",
  "balance",
  "equippedItem",
  "ecoitems",
  "reaction",
];

function tableName(modelName) {
  return `pogy_${modelName
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;
}

function normalizeExtendedJson(value) {
  if (Array.isArray(value)) return value.map(normalizeExtendedJson);
  if (!value || typeof value !== "object") return value;

  const keys = Object.keys(value);
  if (keys.length === 1 && keys[0] === "$oid") return value.$oid;
  if (keys.length === 1 && keys[0] === "$date") {
    const dateValue =
      value.$date && typeof value.$date === "object"
        ? value.$date.$numberLong
        : value.$date;
    const date = new Date(Number.isNaN(Number(dateValue)) ? dateValue : Number(dateValue));
    if (Number.isNaN(date.getTime())) {
      throw new TypeError("The Mongo export contains an invalid BSON date.");
    }
    return date.toISOString();
  }
  if (keys.length === 1 && keys[0] === "$numberInt") {
    return Number(value.$numberInt);
  }
  if (keys.length === 1 && keys[0] === "$numberLong") {
    const number = Number(value.$numberLong);
    return Number.isSafeInteger(number) ? number : value.$numberLong;
  }
  if (keys.length === 1 && keys[0] === "$numberDouble") {
    return Number(value.$numberDouble);
  }
  if (keys.length === 1 && keys[0] === "$numberDecimal") {
    return value.$numberDecimal;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      normalizeExtendedJson(child),
    ])
  );
}

function parseArgs(args) {
  const [directory, ...options] = args;
  const mappings = new Map();
  for (const option of options) {
    if (!option.startsWith("--map=")) {
      throw new Error(`Unknown argument: ${option}`);
    }
    const mapping = option.slice("--map=".length);
    const separator = mapping.indexOf("=");
    if (separator < 1 || separator === mapping.length - 1) {
      throw new Error(`Invalid mapping "${mapping}". Use collection=modelName.`);
    }
    const collection = mapping.slice(0, separator);
    const modelName = mapping.slice(separator + 1);
    if (!models.includes(modelName)) {
      throw new Error(
        `Unknown model "${modelName}". Use --list-models to see valid model names.`
      );
    }
    if (mappings.has(collection)) {
      throw new Error(`Collection "${collection}" was mapped more than once.`);
    }
    mappings.set(collection, modelName);
  }
  return { directory, mappings };
}

async function readExport(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (arrayError) {
    const documents = [];
    for (const [index, line] of text.split(/\r?\n/).entries()) {
      if (!line.trim()) continue;
      try {
        documents.push(JSON.parse(line));
      } catch (error) {
        throw new Error(
          `Invalid JSON in ${path.basename(filePath)} at line ${index + 1}: ${error.message}`,
          { cause: arrayError }
        );
      }
    }
    if (!documents.length && text.trim()) throw arrayError;
    return documents;
  }
}

async function importFile(pool, filePath, modelName) {
  const table = tableName(modelName);
  const documents = await readExport(filePath);
  const connection = await pool.connect();
  let inserted = 0;
  try {
    await connection.query("BEGIN");
    for (const [index, source] of documents.entries()) {
      const document = normalizeExtendedJson(source);
      if (!document || typeof document !== "object" || Array.isArray(document)) {
        throw new TypeError(
          `${path.basename(filePath)} document ${index + 1} is not an object.`
        );
      }
      if (document._id === undefined || document._id === null) {
        throw new Error(
          `${path.basename(filePath)} document ${index + 1} has no _id; refusing to skip it.`
        );
      }
      const id =
        typeof document._id === "string"
          ? document._id
          : JSON.stringify(document._id);
      await connection.query(
        `INSERT INTO "${table}" (id, document) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET document = EXCLUDED.document`,
        [id, JSON.stringify(document)]
      );
      inserted += 1;
    }
    await connection.query("COMMIT");
  } catch (error) {
    await connection.query("ROLLBACK");
    throw new Error(
      `Failed importing ${path.basename(filePath)} into ${table} after ${inserted} document(s): ${error.message}`,
      { cause: error }
    );
  } finally {
    connection.release();
  }
  return inserted;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--list-models") {
    for (const modelName of models) {
      console.log(`${modelName}\t${tableName(modelName)}`);
    }
    return;
  }

  const { directory, mappings } = parseArgs(args);
  if (!directory) {
    throw new Error(
      "Usage: node scripts/migrate-mongo-to-postgres.js <export-directory> --map=<collection>=<modelName> [--map=...]"
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must point to the PostgreSQL database.");
  }

  const exportDirectory = path.resolve(directory);
  const files = (await fs.readdir(exportDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(exportDirectory, entry.name));
  if (!files.length) {
    throw new Error(`No .json Mongo export files found in ${exportDirectory}.`);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    let total = 0;
    for (const filePath of files) {
      const collection = path.basename(filePath, ".json");
      const modelName = mappings.get(collection);
      if (!modelName) {
        throw new Error(
          `No model mapping was provided for collection "${collection}". Add --map=${collection}=<modelName>; use --list-models for valid models.`
        );
      }
      const imported = await importFile(pool, filePath, modelName);
      total += imported;
      console.log(
        `Imported ${imported} document(s) from ${collection} into ${tableName(modelName)}.`
      );
    }
    console.log(`Migration completed: ${total} document(s) imported.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
