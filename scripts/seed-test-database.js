require("dotenv").config();

const database = require("../src/database/pgModel");
const Guild = require("../src/database/schemas/Guild");
const Logging = require("../src/database/schemas/logging");
const Maintenance = require("../src/database/schemas/maintenance");

async function seedIfMissing(Model, filter, document) {
  const existing = await Model.findOne(filter);
  if (existing) return false;
  await Model.create(document);
  return true;
}

async function main() {
  const guildId = process.env.TEST_GUILD_ID;
  if (!/^\d{17,20}$/.test(guildId || "")) {
    throw new Error(
      "Set TEST_GUILD_ID to the ID of a Discord test server before seeding."
    );
  }

  await database.init();
  try {
    const seeded = {
      guild: await seedIfMissing(
        Guild,
        { guildId },
        { guildId, language: "english" }
      ),
      logging: await seedIfMissing(
        Logging,
        { guildId },
        { guildId }
      ),
      maintenance: await seedIfMissing(
        Maintenance,
        { maintenance: "maintenance" },
        { maintenance: "maintenance", toggle: "false" }
      ),
    };

    console.log(
      `Test database ready for guild ${guildId}. Created: ${Object.entries(seeded)
        .filter(([, created]) => created)
        .map(([name]) => name)
        .join(", ") || "nothing (records already existed)"}`
    );
  } finally {
    await database.close();
  }
}

main().catch((error) => {
  console.error(`Test database seed failed: ${error.message}`);
  process.exitCode = 1;
});
