const postgres = require("../../pgModel.js");

let applied = postgres.Schema({
  guildID: { type: String },
  userID: { type: String },
  appID: { type: Array, default: [] },
  hasApplied: { type: Boolean, default: true },
});

module.exports = postgres.model("applied", applied);
