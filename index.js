require("dotenv").config();
const PogyClient = require("./Pogy");
const config = require("./config.json");
const logger = require("./src/utils/logger");
const Pogy = new PogyClient(config);

const color = require("./src/data/colors");
Pogy.color = color;

const emoji = require("./src/data/emoji");
Pogy.emoji = emoji;

let client = Pogy;
const jointocreate = require("./src/structures/jointocreate");
jointocreate(client);

Pogy.react = new Map();
Pogy.fetchforguild = new Map();

Pogy.start(process.env.TOKEN).catch(async (error) => {
  logger.error(`Bot startup failed: ${error.message}`, { label: "Startup" });
  await Pogy.database.close().catch((closeError) => {
    logger.error(`Database shutdown failed: ${closeError.message}`, {
      label: "Database",
    });
  });
  process.exitCode = 1;
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`Received ${signal}; shutting down.`, { label: "Shutdown" });

  if (Pogy.dashboardServer && Pogy.dashboardServer.listening) {
    try {
      await new Promise((resolve, reject) => {
        Pogy.dashboardServer.close((error) =>
          error ? reject(error) : resolve()
        );
      });
    } catch (error) {
      logger.error(`Dashboard shutdown failed: ${error.message}`, {
        label: "Shutdown",
      });
      process.exitCode = 1;
    }
  }

  try {
    Pogy.destroy();
  } catch (error) {
    logger.error(`Discord shutdown failed: ${error.message}`, {
      label: "Shutdown",
    });
    process.exitCode = 1;
  }

  try {
    await Pogy.database.close();
  } catch (error) {
    logger.error(`Database shutdown failed: ${error.message}`, {
      label: "Database",
    });
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason, p) => {
  logger.info(`[unhandledRejection] ${reason.message}`, { label: "ERROR" });
  console.log(reason, p);
});

process.on("uncaughtException", (err, origin) => {
  logger.info(`[uncaughtException] ${err.message}`, { label: "ERROR" });
  console.log(err, origin);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  logger.info(`[uncaughtExceptionMonitor] ${err.message}`, { label: "ERROR" });
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  logger.info(`[multipleResolves] MULTIPLE RESOLVES`, { label: "ERROR" });
  console.log(type, promise, reason);
});
