const postgres = require("../pgModel.js");

const afkSchema = postgres.Schema({
  userID: { type: String },
  serverID: { type: String },
  reason: { type: String, default: " " },
  oldNickname: { type: String },
  time: { type: String, default: Date.now() },
});

module.exports = postgres.model("Afk", afkSchema);
