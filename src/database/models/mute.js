const postgres = require("../pgModel.js");

const mute = postgres.Schema({
  guildID: { type: String },
  memberID: { type: String },
  length: { type: Date, default: Date.now() },
  memberRoles: { type: Array, default: [] },
});

module.exports = postgres.model("mute", mute);
