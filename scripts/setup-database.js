require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required in your .env file.");
  }

  const schema = await fs.readFile(
    path.join(__dirname, "..", "database.sql"),
    "utf8"
  );
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(schema);
    console.log("PostgreSQL schema applied successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`PostgreSQL schema setup failed: ${error.message}`);
  process.exitCode = 1;
});
