const postgres = require("../pgModel.js");

const warn = postgres.Schema({
  guildID: { type: String },
  memberID: { type: String },
  modType: { type: Array, default: [] },
  warnings: { type: Array, default: [] },
  warningID: { type: Array, default: [] },
  moderator: { type: Array, default: [] },
  date: { type: Array, default: [] },
});

module.exports = postgres.model("warn", warn);
